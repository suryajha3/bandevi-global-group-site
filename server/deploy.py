"""Run as root on the existing Ubuntu VPS after pulling this release."""
import pathlib
import secrets
import shutil
import subprocess
import time

ROOT = pathlib.Path('/srv/bandeviglobalgroup/app')
CONFIG = pathlib.Path('/etc/nginx/sites-enabled/bandeviglobalgroup.com').resolve()
backup = pathlib.Path('/srv/bandeviglobalgroup') / ('nginx-before-enquiries-' + str(int(time.time())) + '.conf')
shutil.copy2(CONFIG, backup)
env = pathlib.Path('/etc/bandevi-enquiries.env')
if not env.exists():
    env.write_text('ENQUIRY_DB=/var/lib/bandevi-enquiries/inbox.sqlite3\nRATE_LIMIT_SALT=' + secrets.token_hex(32) + '\nSMTP_TO=sales@bandeviglobalgroup.com\n')
    env.chmod(0o600)
shutil.copy2(ROOT / 'server/bandevi-enquiries.service', '/etc/systemd/system/bandevi-enquiries.service')
text = CONFIG.read_text()
if '# Bandevi enquiry API' not in text:
    routing = '''
    # Bandevi enquiry API
    location = /api/enquiries {
        client_max_body_size 16k;
        proxy_pass http://127.0.0.1:8766;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_connect_timeout 3s;
        proxy_read_timeout 20s;
    }
    location ^~ /server/ { return 404; }
    location ~ /\\. { deny all; }

'''
    marker = '    location / {'
    if marker not in text:
        raise SystemExit('Routing pattern changed; config left untouched.')
    CONFIG.write_text(text.replace(marker, routing + marker, 1))
text = CONFIG.read_text()
if '# Bandevi private dashboard' not in text:
    routing = '''
    # Bandevi private dashboard
    location = /team-inbox { return 302 /team-inbox/; }
    location ^~ /team-inbox/ {
        proxy_pass http://127.0.0.1:8766;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_read_timeout 20s;
    }
    location ^~ /api/admin/ {
        client_max_body_size 8k;
        proxy_pass http://127.0.0.1:8766;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_read_timeout 20s;
    }

'''
    marker = '    location / {'
    if marker not in text:
        raise SystemExit('Routing pattern changed; config left untouched.')
    CONFIG.write_text(text.replace(marker, routing + marker, 1))
try:
    subprocess.run(['nginx', '-t'], check=True)
    subprocess.run(['systemctl', 'daemon-reload'], check=True)
    subprocess.run(['systemctl', 'enable', '--now', 'bandevi-enquiries'], check=True)
    subprocess.run(['systemctl', 'restart', 'bandevi-enquiries'], check=True)
    time.sleep(1)
    subprocess.run(['curl', '--fail', '--silent', 'http://127.0.0.1:8766/health'], check=True)
    subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
except Exception:
    shutil.copy2(backup, CONFIG)
    raise
print('\nEnquiry API deployed. Nginx backup:', backup)
