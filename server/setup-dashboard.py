"""The site owner runs this interactively; never put a password in shell history."""
import getpass
import hmac
import os
from pathlib import Path
import sqlite3
import subprocess
import tempfile
from dashboard import password_hash

if os.geteuid() != 0:
    raise SystemExit('Run from your authenticated Hostinger root console.')
print('Create a private dashboard password for sales@bandeviglobalgroup.com.')
print('Use a unique password, different from your email password. Input is hidden.')
config = Path('/etc/bandevi-enquiries.env')
existing = config.read_text()
if 'DASHBOARD_PASSWORD_HASH=' in existing:
    if input('Replace the existing password and sign out all sessions? Type REPLACE: ') != 'REPLACE':
        raise SystemExit('No changes made.')
password = getpass.getpass('New dashboard password (at least 14 characters): ')
if not 14 <= len(password) <= 128:
    raise SystemExit('Use 14–128 characters. No changes made.')
if not hmac.compare_digest(password.encode(), getpass.getpass('Repeat dashboard password: ').encode()):
    raise SystemExit('Passwords did not match. No changes made.')
value = password_hash(password)
del password
lines = [line for line in existing.splitlines() if not line.startswith('DASHBOARD_PASSWORD_HASH=')]
lines.append('DASHBOARD_PASSWORD_HASH=' + value)
with tempfile.NamedTemporaryFile('w', dir=config.parent, prefix='.bandevi-env-', delete=False) as file:
    file.write('\n'.join(lines) + '\n')
    temporary = Path(file.name)
temporary.chmod(0o600)
temporary.replace(config)
with sqlite3.connect('/var/lib/bandevi-enquiries/inbox.sqlite3') as db:
    db.execute('DELETE FROM inbox_sessions')
subprocess.run(['systemctl', 'restart', 'bandevi-enquiries'], check=True)
print('Password saved as a hash. Open https://bandeviglobalgroup.com/team-inbox/ to sign in.')
