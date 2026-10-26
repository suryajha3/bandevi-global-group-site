"""Isolated browser fixture. Synthetic records; no notification worker or uploads."""
import json
import mimetypes
import os
from pathlib import Path
import re
import secrets
import threading
import time
from urllib.parse import urlsplit
import test_dashboard as fixture
import ads_measurement as ads

root=Path(__file__).resolve().parent.parent
class Preview(fixture.enquiries.Handler):
    def handle(self):
        try:return super().handle()
        except (BrokenPipeError,ConnectionAbortedError,ConnectionResetError):return

    def do_GET(self):
        route=urlsplit(self.path).path
        if route.startswith(('/api/','/team-inbox/')) or route=='/health':return super().do_GET()
        path=(root/route.lstrip('/')).resolve()
        if path.is_dir():path=path/'index.html'
        if not path.is_relative_to(root) or not path.is_file():return self.send_error(404)
        data=path.read_bytes()
        if path.suffix=='.html' and 'source=1' in self.path:data=re.sub(r'<body([^>]*)>[\s\S]*?</body>',r'<body\1><div id="site"></div><script src="/assets/site.js" defer></script></body>',data.decode()).encode()
        self.send_response(200);self.send_header('Content-Type',mimetypes.guess_type(path)[0] or 'application/octet-stream');self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)

fixture.server.RequestHandlerClass=Preview;fixture.enquiries.ORIGINS.add(fixture.base)
password='Synthetic-recovery-only-20261021';os.environ['DASHBOARD_PASSWORD_HASH']=fixture.dashboard.password_hash(password)
now=int(time.time());admin=fixture.dashboard.USER;agent='agent@recovery.example'
with fixture.enquiries.connect() as db:
    db.execute('INSERT INTO team_users VALUES(?,?,?,?,1)',(agent,'Synthetic recovery agent','agent',fixture.dashboard.password_hash(password)))
    for market in ads.MARKETS:db.execute('INSERT INTO ads_market_settings VALUES(?,?,?,?,1,1,?,?)',(market,'1234567890','BANDEVI CRM Qualified Lead','BANDEVI CRM Won Customer',now,admin))
    for number,name,country,owner,outcome,stage,qa in [
        (1,'Synthetic US unbooked','US',admin,'','New',False),
        (2,'Synthetic UK missed demo','GB',agent,'No show','Contacted',False),
        (3,'Synthetic India proposal','IN',admin,'','Proposal',False),
        (4,'Synthetic US outcome missing','US',admin,'Not recorded','Contacted',False),
        (5,'Synthetic hidden QA','US',admin,'','New',True),
        (6,'Synthetic closed lead','IN',admin,'','Won',False),
        (7,'Synthetic Ads qualified','US',admin,'','Qualified',False)]:
        ref='BG-'+f'{number:016X}';market=country;created=now-6*86400
        payload=dict(type='contact',name=name,email='synthetic@example.test',phone='',interest='CRM & ERP Package',message='Synthetic requirements',source='/'+ads.MARKETS[market][1]+'/travel-agency-crm/',qualification=dict(version=1,country=country,currency=ads.MARKETS[market][2],budget='',contact=dict(channel='Discuss',date='',time='',timezone='UTC')))
        db.execute('INSERT INTO enquiries(id,created,payload,email_status) VALUES(?,?,?,?)',(ref,created,json.dumps(payload),'qa-verified' if qa else 'sent'))
        db.execute('INSERT INTO enquiry_workflow(id,stage,owner,next_action,follow_up_date) VALUES(?,?,?,?,?)',(ref,stage,owner,'Review synthetic next step',''))
        if outcome:
            slot=secrets.token_hex(12);starts=now-7200-number*3600
            db.execute('INSERT INTO demo_slots VALUES(?,?,30,?,1)',(slot,starts,owner));db.execute('INSERT INTO demo_bookings VALUES(?,?,?,\'confirmed\',0)',(ref,slot,secrets.token_hex(32)))
            event=db.execute("INSERT INTO appointment_events(enquiry_id,slot_id,event,starts,duration,actor,created) VALUES(?,?,'confirmed',?,30,?,?)",(ref,slot,starts,owner,created)).lastrowid
            db.execute('INSERT INTO sales_demo_records VALUES(?,?,?,?,0,?,?)',(ref,'Synthetic requirements',outcome,event,now,owner))
        if number==3:db.execute("INSERT INTO client_proposals(id,reference,revision,title,scope,terms,minor_units,currency,expires,status,created,actor,published) VALUES(?,?,1,'Synthetic proposal','Synthetic scope','Synthetic terms',123456,'INR',?,'published',?,?,?)",(secrets.token_hex(12),ref,now+86400,created,admin,created))
        if number==7:
            ads.capture(db,ref,dict(gclid='Synthetic_Existing_Click'),payload,True,created)
            db.execute("INSERT INTO sales_events(enquiry_id,stage,actor,created) VALUES(?,'Qualified',?,?)",(ref,admin,now-3600))
print(fixture.server.server_port,flush=True)
try:threading.Event().wait()
finally:fixture.server.shutdown();fixture.server.server_close();fixture.temporary.cleanup()
