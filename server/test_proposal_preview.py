"""Proposal browser fixture; disposable data, no mail worker/live settings."""
import json
import os
from pathlib import Path
import tempfile
import time
temporary=tempfile.TemporaryDirectory()
os.environ['ENQUIRY_TEST']='1';os.environ['ENQUIRY_DB']=str(Path(temporary.name)/'proposal.sqlite3');os.environ['RATE_LIMIT_SALT']='proposal-browser-fixture'
for key in ('SMTP_HOST','SMTP_USER','SMTP_PASSWORD','SMTP_FROM'):os.environ.pop(key,None)
import dashboard
password='Synthetic-dashboard-only-20261010'
os.environ['DASHBOARD_PASSWORD_HASH']=dashboard.password_hash(password)
import enquiries
enquiries.initialize();now=int(time.time())
with enquiries.connect() as db:
    db.execute('INSERT INTO team_users VALUES(?,?,?,?,1)',('agent@qa.example','Synthetic agent','agent',dashboard.password_hash(password)))
    db.execute('INSERT INTO client_accounts VALUES(?,?,1)',('client@qa.example',dashboard.password_hash(password)))
    for ref,email,title,owner in [('BG-PDF-OWN','client@qa.example','Synthetic CRM delivery','agent@qa.example'),('BG-PDF-OTHER','other@qa.example','Other client project',dashboard.USER)]:
        payload={'type':'contact','name':'Synthetic client','email':email,'interest':'CRM','message':'Synthetic request','source':'/contact-us/'}
        db.execute('INSERT INTO enquiries(id,created,payload,email_status) VALUES(?,?,?,?)',(ref,now,json.dumps(payload),'sent'))
        db.execute('INSERT INTO enquiry_workflow(id,owner,notes) VALUES(?,?,?)',(ref,owner,'PRIVATE INTERNAL NOTE - never export'))
        db.execute('INSERT INTO client_projects(reference,email,title,created) VALUES(?,?,?,?)',(ref,email,title,now))
    rows=[('draft',now+86400,0),('published',now+86400,now-100),('published',now-100,now-200),('accepted',now-100,now-200),('superseded',now+86400,now-100),('withdrawn',now+86400,0),('withdrawn',now+86400,now-100)]+[('draft',now+86400,0)]*26
    for i,(status,expiry,published) in enumerate(rows):
        scope=('Recorded scope for review. Customer portal, enquiry workflows and project handover.\n\n'*20) if status=='accepted' else 'Deliver recorded customer workflow.\n\nAcceptance checks: review the agreed scope and handover.'
        db.execute('INSERT INTO client_proposals(id,reference,revision,title,scope,terms,minor_units,currency,expires,status,created,actor,accepted,accepted_by,published) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',(f'{i+1:024x}','BG-PDF-OWN',i+1,'Synthetic proposal '+str(i+1),scope,'Recorded commercial terms only.\n\nPayment milestones: as agreed in this revision.',123456,'INR',expiry,status,now-i,dashboard.USER,now-50 if status=='accepted' else None,'Synthetic client <client@qa.example>' if status=='accepted' else None,published))
    db.execute('INSERT INTO client_proposals(id,reference,revision,title,scope,terms,minor_units,currency,expires,status,created,actor,published) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',('f'*24,'BG-PDF-OTHER',1,'Other private proposal','Other scope','Other terms',500,'USD',now+86400,'published',now,dashboard.USER,now))
server=enquiries.ThreadingHTTPServer(('127.0.0.1',0),enquiries.Handler);server.daemon_threads=True;enquiries.ORIGINS.add('http://127.0.0.1:'+str(server.server_port))
print(server.server_port,flush=True)
try:server.serve_forever()
finally:server.server_close();temporary.cleanup()
