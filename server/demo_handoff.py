"""Time-limited enquiry-to-demo capability; no new lead or public reference lookup."""
import hashlib
import hmac
import json
import re
import time
from urllib.parse import urlsplit
import operations

TOKEN=re.compile(r'review\.(BG-[A-F0-9]{16})\.([a-f0-9]{64})')
LIFETIME=7*86400


def signature(reference,salt,purpose='review'):
    return hmac.new(salt.encode(),(purpose+':'+reference).encode(),hashlib.sha256).hexdigest()


def offer(db,reference,salt):
    row=db.execute('SELECT created,payload,email_status FROM enquiries WHERE id=?',(reference,)).fetchone()
    if not row or row['email_status']=='qa-verified' or row['created']<int(time.time())-LIFETIME:return None
    payload=json.loads(row['payload'])
    if payload['type']!='contact' or not payload.get('email'):return None
    return '/demo-booking/#review.'+reference+'.'+signature(reference,salt)


def post(handler,connect,origins,salt):
    if urlsplit(handler.path).path!='/api/demo/handoff':return False
    if handler.headers.get('Origin') not in origins:
        handler.respond(403,{'error':'Use the website to book your review.'});return True
    from dashboard import read_json
    try:
        data=read_json(handler)
        token=data.get('token','');match=TOKEN.fullmatch(token) if isinstance(token,str) else None
        if not match or not hmac.compare_digest(match[2],signature(match[1],salt)):
            handler.respond(404,{'error':'This private booking link is not available.'});return True
        reference=match[1];action=data.get('action','view')
        if action not in ('view','book'):raise ValueError('Choose a valid booking action.')
        now=int(time.time());management=signature(reference,salt,'review-management')
        with connect() as db:
            db.execute('BEGIN IMMEDIATE' if action=='book' else 'BEGIN')
            row=db.execute('SELECT created,payload,email_status FROM enquiries WHERE id=?',(reference,)).fetchone()
            if not row or row['email_status']=='qa-verified':
                handler.respond(404,{'error':'This private booking link is not available.'});return True
            payload=json.loads(row['payload'])
            if payload['type']!='contact' or not payload.get('email'):
                handler.respond(404,{'error':'This private booking link is not available.'});return True
            booking=db.execute('SELECT * FROM demo_bookings WHERE enquiry_id=?',(reference,)).fetchone()
            if not booking and row['created']<now-LIFETIME:
                handler.respond(410,{'error':'This booking link has expired. Contact the team with your enquiry reference.'});return True
            workflow=db.execute('SELECT stage FROM enquiry_workflow WHERE id=?',(reference,)).fetchone()
            closed=bool(workflow and workflow['stage'] in ('Won','Lost'))
            own_booking=bool(booking and hmac.compare_digest(booking['token_digest'],hashlib.sha256(management.encode()).hexdigest()))
            if action=='book':
                slot_id=data.get('slotId')
                if not isinstance(slot_id,str) or not re.fullmatch('[a-f0-9]{24}',slot_id):raise ValueError('Choose an available demo slot.')
                if booking:
                    if not (own_booking and booking['state']=='confirmed' and booking['slot_id']==slot_id):
                        handler.respond(409,{'error':'An appointment already exists. Refresh this page and use its management link or your confirmation email.'});return True
                else:
                    if closed:
                        handler.respond(409,{'error':'This enquiry is closed. Contact the team before arranging another review.'});return True
                    slot=db.execute('SELECT 1 FROM demo_slots WHERE id=? AND active=1 AND starts>? AND starts<?',(slot_id,now,now+180*86400)).fetchone()
                    if not slot:
                        handler.respond(409,{'error':'That demo slot is no longer available. Refresh available times.'});return True
                    try:operations.create_booking(db,reference,slot_id,management)
                    except ValueError as error:
                        handler.respond(409,{'error':str(error)});return True
                    own_booking=True
            qualification=payload.get('qualification') or {}
            slots=[] if booking or closed or action=='book' else [dict(s) for s in db.execute('SELECT s.id,s.starts,s.duration FROM demo_slots s LEFT JOIN demo_bookings b ON b.slot_id=s.id WHERE s.active=1 AND b.slot_id IS NULL AND s.starts>? AND s.starts<? ORDER BY s.starts LIMIT 100',(now,now+180*86400))]
            result={'reference':reference,'service':payload['interest'],'country':qualification.get('country','unknown'),
                    'currency':qualification.get('currency',''),'closed':closed,'slots':slots,
                    'appointment':operations.receipt(db,reference,management if own_booking else None)}
        handler.respond(200,result)
    except (ValueError,TypeError,UnicodeError,AttributeError) as error:
        handler.respond(400,{'error':str(error) if isinstance(error,ValueError) else 'Check your booking details.'})
    return True
