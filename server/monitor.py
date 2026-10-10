"""Private health checks; optional HTTPS alert webhook carries no customer data."""
import json
import os
import sqlite3
import time
import urllib.request

def check(database):
    problems=[];now=int(time.time())
    with sqlite3.connect('file:'+database+'?mode=ro',uri=True) as db:
        if db.execute('PRAGMA quick_check').fetchone()[0]!='ok':problems.append('Database integrity check failed.')
        pending=db.execute("SELECT COUNT(*) FROM notification_outbox WHERE status='pending' AND created<?",(now-1800,)).fetchone()[0]
        legacy=db.execute("SELECT COUNT(*) FROM enquiries WHERE email_status='pending' AND created<?",(now-1800,)).fetchone()[0]
        if pending+legacy:problems.append('Notifications have been pending for more than 30 minutes.')
        backup=db.execute('SELECT MAX(created) FROM recovery_checks WHERE verified=1').fetchone()[0]
        if not backup or backup<now-36*3600:problems.append('No verified backup within 36 hours.')
    return problems

if __name__=='__main__':
    try:
        with urllib.request.urlopen('http://127.0.0.1:'+os.environ.get('ENQUIRY_PORT','8766')+'/health',timeout=5) as response:
            if response.status!=200:raise ValueError('Health check failed')
        problems=check(os.environ.get('ENQUIRY_DB','/var/lib/bandevi-enquiries/inbox.sqlite3'))
    except Exception:problems=['Enquiry service or private database is unavailable.']
    # Alert only when the state changes. Store no URLs, credentials or customer records here.
    state=os.environ.get('MONITOR_STATE','/var/lib/bandevi-enquiries/monitor-state.json')
    from pathlib import Path
    file=Path(state);previous=json.loads(file.read_text()) if file.exists() else None
    status={'ok':not problems,'alerts':problems}
    webhook=os.environ.get('MONITOR_WEBHOOK','')
    if status!=previous and webhook:
        if not webhook.startswith('https://'):raise SystemExit('Alert webhook must use HTTPS.')
        request=urllib.request.Request(webhook,data=json.dumps({'service':'bandevi-enquiries',**status}).encode(),headers={'Content-Type':'application/json'},method='POST')
        with urllib.request.urlopen(request,timeout=10):pass
    file.write_text(json.dumps(status));file.chmod(0o600)
    print(json.dumps(status));raise SystemExit(0 if status['ok'] else 1)
