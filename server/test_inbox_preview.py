"""Synthetic browser fixture. No notification worker or live credentials."""
import json
import os
from pathlib import Path
import tempfile
import time

temporary=tempfile.TemporaryDirectory()
os.environ['ENQUIRY_TEST']='1'
os.environ['ENQUIRY_DB']=str(Path(temporary.name)/'inbox.sqlite3')
os.environ['RATE_LIMIT_SALT']='inbox-browser-fixture'
for key in ('SMTP_HOST','SMTP_USER','SMTP_PASSWORD','SMTP_FROM'):os.environ.pop(key,None)
import dashboard
os.environ['DASHBOARD_PASSWORD_HASH']=dashboard.password_hash('Synthetic-dashboard-only-20261010')
import enquiries
enquiries.initialize()
with enquiries.connect() as db:
    db.execute('INSERT INTO team_users VALUES(?,?,?,?,1)',('agent@qa.example','Synthetic agent','agent',dashboard.password_hash('Synthetic-dashboard-only-20261010')))
    for index,(ref,name,stage,owner,due) in enumerate([
        ('BG-QA-NEW','New synthetic enquiry','New','',''),
        ('BG-QA-TODAY','Due today synthetic enquiry','Qualified','agent@qa.example',dashboard.business_today().isoformat()),
        ('BG-QA-WON','Closed synthetic enquiry','Won','sales@bandeviglobalgroup.com','')]):
        payload={'type':'contact','name':name,'email':ref.lower()+'@qa.example','phone':'','interest':'CRM','message':'Synthetic browser enquiry.','source':'/contact-us/','campaign':''}
        db.execute('INSERT INTO enquiries(id,created,payload,email_status) VALUES(?,?,?,?)',(ref,int(time.time())+index,json.dumps(payload),'sent'))
        db.execute('INSERT INTO enquiry_workflow(id,stage,owner,notes,version,updated,follow_up_date) VALUES(?,?,?,?,0,?,?)',(ref,stage,owner,'',int(time.time()),due))
    db.execute('INSERT INTO client_projects(reference,email,title,created) VALUES(?,?,?,?)',('BG-QA-TODAY','bg-qa-today@qa.example','Correct enquiry project',int(time.time())))
    db.execute('INSERT INTO client_projects(reference,email,title,created) VALUES(?,?,?,?)',('BG-QA-WON','bg-qa-won@qa.example','Different enquiry project',int(time.time())+1))
server=enquiries.ThreadingHTTPServer(('127.0.0.1',0),enquiries.Handler)
server.daemon_threads=True
enquiries.ORIGINS.add('http://127.0.0.1:'+str(server.server_port))
print(server.server_port,flush=True)
try:server.serve_forever()
finally:server.server_close();temporary.cleanup()
