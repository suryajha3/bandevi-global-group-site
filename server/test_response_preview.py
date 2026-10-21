"""Loopback-only workspace fixture. Temporary synthetic records; no mail worker."""
import datetime as dt
import json
import os
import secrets
import threading
import time
from zoneinfo import ZoneInfo
import test_dashboard as fixture

fixture.enquiries.ORIGINS.add(fixture.base)
password='Synthetic-response-only-20261021';os.environ['DASHBOARD_PASSWORD_HASH']=fixture.dashboard.password_hash(password)
now=int(time.time());admin=fixture.dashboard.USER;agent='agent@response.example'
with fixture.enquiries.connect() as db:
    db.execute('INSERT INTO team_users VALUES(?,?,?,?,1)',(agent,'Synthetic response agent','agent',fixture.dashboard.password_hash(password)))
    for number,name,market,owner,stage,kind,delay in [
      (1,'Synthetic US waiting','US',admin,'New','',0),
      (2,'Synthetic UK stage only','GB',agent,'Qualified','',0),
      (3,'Synthetic India contacted','IN',admin,'Contacted','email-sent',3600),
      (4,'Synthetic India unassigned','IN','','New','',0),
      (5,'Synthetic US closed','US',admin,'Won','',0),
      (6,'Synthetic hidden QA','US',admin,'New','',0),
      (7,'Synthetic UK contacted','GB',agent,'Contacted','call-connected',7200),
      (8,'Synthetic country missing','unknown',admin,'New','',0),
      (9,'Synthetic US unanswered call','US',admin,'New','call-no-answer',30)]:
        ref='BG-'+f'{number:016X}';created=now-3*86400
        payload=dict(type='contact',name=name,email='synthetic@example.test',phone='',interest='CRM & ERP Package',message='Synthetic requirements',source='/us/travel-agency-crm/')
        if market!='unknown':payload['qualification']=dict(version=1,country=market)
        db.execute('INSERT INTO enquiries(id,created,payload,email_status) VALUES(?,?,?,?)',(ref,created,json.dumps(payload),'qa-verified' if number==6 else 'sent'))
        db.execute('INSERT INTO enquiry_workflow(id,stage,owner,next_action) VALUES(?,?,?,?)',(ref,stage,owner,'Review synthetic requirements'))
        if kind:db.execute('INSERT INTO lead_activity VALUES(?,?,?,?,?,?)',(secrets.token_hex(16),ref,created+delay,owner,kind,'Synthetic contact evidence'))
        if number==2:db.execute("INSERT INTO sales_events(enquiry_id,stage,actor,created) VALUES(?,'Qualified',?,?)",(ref,agent,created+60))
    for zone_name in ('America/New_York','Asia/Kolkata'):
        zone=ZoneInfo(zone_name);date=dt.datetime.fromtimestamp(now,zone).date()+dt.timedelta(days=1)
        while date.weekday()>=5:date+=dt.timedelta(days=1)
        starts=int(dt.datetime.combine(date,dt.time(11),zone).timestamp())
        db.execute('INSERT INTO demo_slots VALUES(?,?,30,?,1)',(secrets.token_hex(12),starts,admin))
print(fixture.server.server_port,flush=True)
try:threading.Event().wait()
finally:fixture.server.shutdown();fixture.server.server_close();fixture.temporary.cleanup()
