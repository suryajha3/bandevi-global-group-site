"""Consent-aware CRM qualification export. Collection and delivery default OFF."""
import hashlib
import json
import re
import secrets
import os
import logging
import time
import urllib.error
import urllib.parse
import urllib.request

POLICY = 'crm-analytics-v1'
MAX_LINK_AGE = 30 * 86400
MAX_EVENT_AGE = 72 * 3600
SERVICES = {'CRM & ERP Package': 'crm_erp', 'Travel ERP Package': 'travel_erp',
            'Travel CRM Package': 'travel_crm', 'Website / App Development Package': 'website_app',
            'Travel Technology Planning': 'travel_technology', 'Need guidance': 'guidance',
            'Complete Travel Website Package':'travel_website','White-label Travel Website Package':'white_label_website',
            'B2B Travel Portal Package':'b2b_portal','Customer Portal Package':'customer_portal',
            'E-Commerce Package':'ecommerce','Automation Package':'automation'}
CHANNELS = {'organic_search', 'paid', 'campaign', 'referral', 'direct_unknown', 'unknown'}
CONFIRMATIONS = {'version', 'service_fit', 'real_requirement', 'agreed_next_step', 'genuine_business_enquiry'}


def initialize(db):
    db.executescript('''
    CREATE TABLE IF NOT EXISTS ga4_crm_revocations(grant_hash TEXT PRIMARY KEY,created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS ga4_crm_limits(fingerprint TEXT NOT NULL,created INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS ga4_crm_limits_created ON ga4_crm_limits(created);
    CREATE TABLE IF NOT EXISTS ga4_crm_grants(
      grant_hash TEXT PRIMARY KEY, client_id TEXT NOT NULL,
      captured INTEGER NOT NULL, expires INTEGER NOT NULL, policy TEXT NOT NULL,
      state TEXT NOT NULL CHECK(state IN ('granted','withdrawn','expired')),
      qa INTEGER NOT NULL, dnt INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS ga4_crm_links(
      enquiry_id TEXT PRIMARY KEY, grant_hash TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS ga4_crm_exports(
      enquiry_id TEXT PRIMARY KEY, sales_event_id INTEGER NOT NULL UNIQUE,
      qualified_at INTEGER NOT NULL, confirmation TEXT NOT NULL,
      status TEXT NOT NULL, reason TEXT NOT NULL, updated INTEGER NOT NULL);
    ''')


def _hash(token):
    if not isinstance(token, str) or not re.fullmatch(r'[A-Za-z0-9_-]{40,100}', token):
        raise ValueError('Invalid private consent capability')
    return hashlib.sha256(token.encode()).hexdigest()


def grant(db, context, now, token=None):
    """Proposed private intake adapter. Unknown/malformed optional context is ignored.

    Caller must establish same-origin, JSON, size/rate limits and an explicit new
    offline-analytics consent action. Existing website opt-in alone is insufficient.
    Never put this object in enquiries.payload or email notifications.
    """
    expected = {'version', 'analytics', 'offline_analytics', 'policy', 'client_id',
                'expires', 'qa', 'dnt'}
    if not isinstance(context, dict) or set(context) != expected:
        return None
    if (type(context['version']) is not int or context['version'] != 1 or
        context['analytics'] is not True or context['offline_analytics'] is not True or
        context['policy'] != POLICY or context['qa'] is not False or context['dnt'] is not False):
        return None
    if not isinstance(context['client_id'], str) or not re.fullmatch(r'\d{1,20}\.\d{1,20}', context['client_id']):
        return None
    expires = context['expires']
    if type(expires) is not int or not now < expires <= now + MAX_LINK_AGE:
        return None
    token = token or secrets.token_urlsafe(32)
    grant_hash = _hash(token)
    if db.execute('SELECT 1 FROM ga4_crm_revocations WHERE grant_hash=?', (grant_hash,)).fetchone():
        return None
    if db.execute('SELECT 1 FROM ga4_crm_grants WHERE grant_hash=?', (grant_hash,)).fetchone():
        return None
    db.execute('INSERT INTO ga4_crm_grants VALUES(?,?,?,?,?,\'granted\',0,0)',
               (_hash(token), context['client_id'], now, expires, POLICY))
    return token


def link(db, enquiry_id, token, now):
    """Called only alongside a NEW accepted enquiry in its existing transaction."""
    try:
        grant_hash = _hash(token)
    except ValueError:
        return False
    g = db.execute('SELECT * FROM ga4_crm_grants WHERE grant_hash=?', (grant_hash,)).fetchone()
    e = db.execute('SELECT created,email_status FROM enquiries WHERE id=?', (enquiry_id,)).fetchone()
    if (not g or not e or g['state'] != 'granted' or g['qa'] or g['dnt'] or
        g['expires'] <= now or e['email_status'] == 'qa-verified' or
        not g['captured'] <= e['created'] <= now or now - e['created'] > 300):
        return False
    db.execute('INSERT OR IGNORE INTO ga4_crm_links VALUES(?,?)', (enquiry_id, grant_hash))
    saved = db.execute('SELECT grant_hash FROM ga4_crm_links WHERE enquiry_id=?', (enquiry_id,)).fetchone()
    return saved['grant_hash'] == grant_hash


def withdraw(db, token, now):
    """Capability-authenticated, idempotent revocation; clear identifiers immediately.

    A withdrawal endpoint must always give a generic response to prevent enumeration.
    The adapter must queue withdrawal locally until acknowledged, including offline.
    """
    try:
        grant_hash = _hash(token)
    except ValueError:
        return
    _withdraw_hash(db,grant_hash,now)


def _withdraw_hash(db,grant_hash,now):
    db.execute('INSERT OR IGNORE INTO ga4_crm_revocations VALUES(?,?)', (grant_hash,now))
    db.execute("UPDATE ga4_crm_grants SET state='withdrawn',client_id='' WHERE grant_hash=?", (grant_hash,))
    db.execute("UPDATE ga4_crm_exports SET status='suppressed',reason='withdrawn',updated=? "
               "WHERE status='pending' AND enquiry_id IN (SELECT enquiry_id FROM ga4_crm_links WHERE grant_hash=?)",
               (now, grant_hash))


def prune(db, now):
    db.execute('DELETE FROM ga4_crm_revocations WHERE created<?', (now-34*86400,))
    db.execute('DELETE FROM ga4_crm_limits WHERE created<?', (now-3600,))
    db.execute("UPDATE ga4_crm_grants SET state='expired',client_id='' WHERE state='granted' AND expires<=?", (now,))
    db.execute("UPDATE ga4_crm_exports SET status='suppressed',reason='expired',updated=? "
               "WHERE status='pending' AND enquiry_id IN (SELECT l.enquiry_id FROM ga4_crm_links l "
               "JOIN ga4_crm_grants g USING(grant_hash) WHERE g.state='expired')", (now,))


def _eligibility(db, enquiry_id, qualified_at, now):
    e = db.execute('SELECT * FROM enquiries WHERE id=?', (enquiry_id,)).fetchone()
    if not e:
        return 'deleted', None
    if e['email_status'] == 'qa-verified':
        return 'qa', None
    g = db.execute('SELECT g.* FROM ga4_crm_links l JOIN ga4_crm_grants g USING(grant_hash) '
                   'WHERE l.enquiry_id=?', (enquiry_id,)).fetchone()
    if not g:
        return 'missing_consent_context', None
    if g['state'] != 'granted':
        return g['state'], None
    if g['policy'] != POLICY or g['qa'] or g['dnt']:
        return 'ineligible_context', None
    if not g['captured'] <= e['created'] <= qualified_at <= now:
        return 'invalid_time', None
    if now >= g['expires']:
        return 'expired', None
    if now - qualified_at >= MAX_EVENT_AGE:
        return 'stale_event', None
    if not re.fullmatch(r'\d{1,20}\.\d{1,20}', g['client_id']):
        return 'missing_identifier', None
    return '', (e, g)


def qualify(db, sales_event_id, confirmation, now, *, activated_at=None):
    """Prepare one event per enquiry; default disabled and no historical backfill.

    Caller first checks authenticated role/ownership/CSRF/version and records a
    real Qualified transition. Call this inside that SAME BEGIN IMMEDIATE txn.
    activated_at is a future server-controlled rollout timestamp, never client input.
    """
    if type(activated_at) is not int or activated_at <= 0:
        return 'disabled'
    if (not isinstance(confirmation, dict) or set(confirmation) != CONFIRMATIONS or
        type(confirmation['version']) is not int or confirmation['version'] != 1 or
        any(confirmation[k] is not True for k in CONFIRMATIONS - {'version'})):
        return 'staff_confirmation_required'
    event = db.execute('SELECT * FROM sales_events WHERE id=?', (sales_event_id,)).fetchone()
    if not event or event['stage'] != 'Qualified' or not event['actor'].strip():
        return 'not_staff_qualified'
    if event['created'] < activated_at:
        return 'historical_event'
    first = db.execute("SELECT id FROM sales_events WHERE enquiry_id=? AND stage='Qualified' ORDER BY created,id LIMIT 1",
                       (event['enquiry_id'],)).fetchone()
    if first['id'] != sales_event_id:
        return 'repeated_qualification'
    old = db.execute('SELECT status FROM ga4_crm_exports WHERE enquiry_id=?', (event['enquiry_id'],)).fetchone()
    if old:
        return old['status']
    reason, _ = _eligibility(db, event['enquiry_id'], event['created'], now)
    status = 'suppressed' if reason else 'pending'
    db.execute('INSERT INTO ga4_crm_exports VALUES(?,?,?,?,?,?,?)',
               (event['enquiry_id'], sales_event_id, event['created'],
                json.dumps(confirmation, sort_keys=True), status, reason, now))
    return status


def payload(db, enquiry_id, now, *, allowed_pages):
    """Construct from fresh consent/QA state, never reuse a persisted payload.

    Business country stays project_market; it must never override GA geography.
    Original acquisition is a custom CRM dimension, NOT a GA session/source override.
    No stale website session_id or fabricated engagement duration is supplied.
    """
    row = db.execute('SELECT * FROM ga4_crm_exports WHERE enquiry_id=?', (enquiry_id,)).fetchone()
    if not row or row['status'] != 'pending':
        return None
    reason, source = _eligibility(db, enquiry_id, row['qualified_at'], now)
    if reason:
        db.execute("UPDATE ga4_crm_exports SET status='suppressed',reason=?,updated=? WHERE enquiry_id=?",
                   (reason, now, enquiry_id))
        return None
    e, g = source
    try:
        data = json.loads(e['payload'])
    except (ValueError, TypeError):
        return None
    if not isinstance(data, dict):
        return None
    attribution = data.get('attribution')
    attribution = attribution if isinstance(attribution, dict) else {}
    preferences = data.get('qualification')
    preferences = preferences if isinstance(preferences, dict) else {}
    params = {'lead_source': 'website_crm', 'qualification_method': 'staff_confirmed',
              'service_interest': SERVICES.get(data.get('interest'), 'other'),
              'acquisition_channel': attribution.get('channel') if attribution.get('channel') in CHANNELS else 'unknown',
              'project_market': preferences.get('country') if preferences.get('country') in {'US', 'GB', 'IN', 'other'} else 'unknown'}
    landing = attribution.get('landing_page')
    if isinstance(landing, str) and landing in allowed_pages and len(landing) <= 100:
        params['landing_page'] = landing
    return {'client_id': g['client_id'], 'timestamp_micros': row['qualified_at'] * 1000000,
            'consent': {'ad_user_data': 'DENIED', 'ad_personalization': 'DENIED'},
            'events': [{'name': 'qualify_lead', 'params': params}]}


def dispatch(db, enquiry_id, now, *, allowed_pages, transport=None, enabled=False, clock=None):
    """Injected transport; the production adapter below pins the Google endpoint.

    At-most-once attempt, not exactly-once delivery: persist 'attempting' BEFORE
    invoking transport. On crash/timeout retain 'uncertain', never auto retry.
    Commit claim before IO, then serialize fresh eligibility/send with withdrawal
    using a second BEGIN IMMEDIATE. A future transport MUST have a short timeout.
    Requires no open CRM transaction and deliberately blocks missing adapters.
    """
    if not enabled or transport is None:
        return 'disabled'
    if db.in_transaction:
        raise ValueError('Commit CRM changes before dispatch')
    db.execute('BEGIN IMMEDIATE')
    try:
        body = payload(db, enquiry_id, now, allowed_pages=allowed_pages)
        if body is None:
            db.commit()
            return 'not_eligible'
        db.execute("UPDATE ga4_crm_exports SET status='attempting',reason='',updated=? WHERE enquiry_id=? AND status='pending'",
                   (now, enquiry_id))
        db.commit()
    except Exception:
        db.rollback()
        raise
    # Durable claim survives crash. Recheck after claim, holding a write lock so
    # withdrawal/QA changes committed before this point win. An acknowledgement of
    # withdrawal cannot race a later dispatch. No long-lived background retry.
    db.execute('BEGIN IMMEDIATE')
    try:
        if clock is not None:now=int(clock())
        db.execute("UPDATE ga4_crm_exports SET status='pending' WHERE enquiry_id=? AND status='attempting'", (enquiry_id,))
        body = payload(db, enquiry_id, now, allowed_pages=allowed_pages)
        if body is None:
            db.commit()
            return 'not_eligible'
        db.execute("UPDATE ga4_crm_exports SET status='attempting' WHERE enquiry_id=?", (enquiry_id,))
        try:
            response = transport(body)
            status = 'submitted' if type(response) is int and 200 <= response < 300 else 'review_required'
        except Exception:
            status = 'uncertain'
        db.execute('UPDATE ga4_crm_exports SET status=?,updated=? WHERE enquiry_id=?', (status, now, enquiry_id))
        db.commit()
    except Exception:
        db.rollback()  # Durable attempting claim remains; startup marks uncertain.
        raise
    return status


def recover_uncertain(db, now):
    """Startup recovery never retries an attempt with unknown delivery outcome."""
    db.execute("UPDATE ga4_crm_exports SET status='uncertain',reason='interrupted_attempt',updated=? WHERE status='attempting'", (now,))


def forget(db, enquiry_id):
    """Scrub link data; keep a no-replay local tombstone while the CRM ID exists.

    Full CRM deletion/backup retention and prior Google events require their own
    deletion workflow. This is not a replacement for those operations.
    """
    linked = db.execute('SELECT grant_hash FROM ga4_crm_links WHERE enquiry_id=?', (enquiry_id,)).fetchone()
    db.execute("UPDATE ga4_crm_exports SET status='deleted',reason='deleted',confirmation='{}' WHERE enquiry_id=?", (enquiry_id,))
    db.execute('DELETE FROM ga4_crm_links WHERE enquiry_id=?', (enquiry_id,))
    if linked and not db.execute('SELECT 1 FROM ga4_crm_links WHERE grant_hash=?', (linked['grant_hash'],)).fetchone():
        db.execute('DELETE FROM ga4_crm_grants WHERE grant_hash=?', (linked['grant_hash'],))


MEASUREMENT_ID = 'G-TGK7Z8VNJX'


def activation():
    try:
        value=int(os.environ.get('GA4_CRM_ACTIVATED_AT','0'))
        return value if 0<value<=int(time.time()) else None
    except ValueError:
        return None


def enabled():
    return os.environ.get('GA4_CRM_ENABLED')=='1' and activation() is not None


def capture_optional(db, reference, context, headers, now):
    """Optional metadata never changes business validation, retry digest or mail."""
    if not enabled() or headers.get('DNT')=='1' or not isinstance(context,dict):
        return
    # Client QA flags can only suppress, never establish that an enquiry is genuine.
    if headers.get('X-Bandevi-QA')=='1' or len(json.dumps(context))>2048:
        return
    db.execute('SAVEPOINT ga4_optional_capture')
    try:
        value=dict(context)
        token=value.pop('token',None)
        _hash(token)
        accepted=grant(db,value,now,token=token)
        if accepted:link(db,reference,accepted,now)
    except Exception:
        db.execute('ROLLBACK TO ga4_optional_capture')
    finally:
        db.execute('RELEASE ga4_optional_capture')


def qualify_optional(db,event_id,confirmation,now):
    if not enabled():return 'disabled'
    db.execute('SAVEPOINT ga4_optional_qualification')
    try:
        result=qualify(db,event_id,confirmation,now,activated_at=activation())
    except Exception:
        db.execute('ROLLBACK TO ga4_optional_qualification')
        result='unavailable'
    finally:
        db.execute('RELEASE ga4_optional_qualification')
    return result


def handle_get(handler):
    if handler.path!='/api/analytics-consent/config':return False
    handler.respond(200,{'enabled':enabled(),'policy':POLICY,'maxAgeSeconds':MAX_LINK_AGE})
    return True


def handle_post(handler,connect,origins,salt):
    if handler.path!='/api/analytics-consent/withdraw':return False
    if handler.headers.get('Origin') not in origins:
        handler.respond(403,{'error':'Use the website.'});return True
    if handler.headers.get('Content-Type','').split(';')[0].strip()!='application/json':
        handler.respond(415,{'error':'JSON required.'});return True
    try:
        length=int(handler.headers.get('Content-Length','0'))
        if not 0<length<=8192:raise ValueError()
        body=json.loads(handler.rfile.read(length))
        if not isinstance(body,dict) or set(body)!={'tokens'} or not isinstance(body['tokens'],list) or not 1<=len(body['tokens'])<=50:
            raise ValueError()
        for token in body['tokens']:_hash(token)
    except (ValueError,TypeError,UnicodeError):
        handler.respond(400,{'error':'Invalid withdrawal.'});return True
    now=int(time.time())
    fingerprint=hashlib.sha256((salt+handler.headers.get('X-Real-IP',handler.client_address[0])).encode()).hexdigest()
    with connect() as db:
        db.execute('BEGIN IMMEDIATE')
        prune(db,now)
        if (db.execute('SELECT COUNT(*) FROM ga4_crm_limits WHERE fingerprint=?',(fingerprint,)).fetchone()[0]>=60 or
            db.execute('SELECT COUNT(*) FROM ga4_crm_limits').fetchone()[0]>=20000):
            handler.respond(429,{'error':'Please retry withdrawal shortly.'});return True
        db.execute('INSERT INTO ga4_crm_limits VALUES(?,?)',(fingerprint,now))
        for token in body['tokens']:withdraw(db,token,now)
    # Also tombstones tokens not yet captured, so a late intake cannot revive them.
    handler.respond(200,{'ok':True});return True


def report(db):
    return {'collectionEnabled':enabled(),'sendingEnabled':sending_enabled(),
            'states':{row['status']:row['n'] for row in db.execute('SELECT status,COUNT(*) n FROM ga4_crm_exports GROUP BY status')},
            'suppressionReasons':{row['reason']:row['n'] for row in db.execute("SELECT reason,COUNT(*) n FROM ga4_crm_exports WHERE status='suppressed' GROUP BY reason")},
            'basis':'Consented first staff-qualified events only. Submitted means HTTP receipt, not GA4 processing. No customer or analytics identifiers are returned.'}


def sending_enabled():
    secret=os.environ.get('GA4_CRM_API_SECRET','')
    return enabled() and os.environ.get('GA4_CRM_SEND_ENABLED')=='1' and bool(re.fullmatch(r'[A-Za-z0-9_-]{1,200}',secret))


class NoRedirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs):return None


def send_google(body):
    """Private bounded transport; never log URL, secret, client ID or error text."""
    if not sending_enabled() or os.environ.get('ENQUIRY_TEST')=='1':raise RuntimeError('Analytics delivery disabled')
    query=urllib.parse.urlencode({'measurement_id':MEASUREMENT_ID,'api_secret':os.environ['GA4_CRM_API_SECRET']})
    request=urllib.request.Request('https://region1.google-analytics.com/mp/collect?'+query,
                                  data=json.dumps(body).encode(),headers={'Content-Type':'application/json'},method='POST')
    try:
        with urllib.request.build_opener(NoRedirects()).open(request,timeout=5) as response:
            return response.status
    except urllib.error.HTTPError as error:
        return error.code
    except Exception:
        raise RuntimeError('Analytics delivery outcome uncertain') from None


def process_queue(connect):
    """No sends by default; maintenance/withdrawal remain effective when disabled."""
    now=int(time.time())
    with connect() as db:
        prune(db,now)
        recover_uncertain(db,now)
        if not sending_enabled():return
        pending=[r[0] for r in db.execute("SELECT enquiry_id FROM ga4_crm_exports WHERE status='pending' ORDER BY qualified_at LIMIT 5")]
    # Public paths only; no arbitrary URLs or query strings accepted from CRM data.
    from journey_measurement import PAGES
    for reference in pending:
        if not sending_enabled():break
        with connect() as db:
            dispatch(db,reference,int(time.time()),allowed_pages=PAGES,transport=send_google,enabled=True,clock=time.time)


def worker(connect):
    # Initial recovery happens before any worker dispatch. No automatic uncertain retries.
    while True:
        try:process_queue(connect)
        except Exception:logging.getLogger('enquiries').warning('Qualified analytics maintenance unavailable')
        time.sleep(30)
