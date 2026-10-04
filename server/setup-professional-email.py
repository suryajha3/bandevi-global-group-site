"""Owner-operated setup for GoDaddy Professional Email/Titan, not Microsoft 365.

Passwords are entered privately in the authenticated VPS console, never in Git.
"""
import getpass
import os
from pathlib import Path
import shutil
import smtplib
import ssl
import subprocess
import tempfile
import time
from email.message import EmailMessage

MAILBOX = 'sales@bandeviglobalgroup.com'

def env_quote(value):
    if any(ord(c)<32 for c in value):
        raise ValueError('Control characters are not supported.')
    return '"'+value.replace('\\','\\\\').replace('"','\\"')+'"'

def main():
    if not hasattr(os,'geteuid') or os.geteuid()!=0:
        raise SystemExit('Run personally in your authenticated Hostinger root console.')
    print('Only for GoDaddy Professional Email or Professional Email powered by Titan.')
    print('For Microsoft 365, stop and use an approved OAuth-capable sender integration.')
    if input('Confirm your mailbox product. Type PROFESSIONAL: ')!='PROFESSIONAL':
        raise SystemExit('No changes made.')
    config=Path('/etc/bandevi-enquiries.env')
    existing=config.read_text()
    if any(line.startswith('SMTP_PASSWORD=') for line in existing.splitlines()):
        if input('Replace existing mail configuration? Type REPLACE: ')!='REPLACE':
            raise SystemExit('No changes made.')
    print('This authenticates '+MAILBOX+' and sends a setup test to the same mailbox.')
    print('Once connected, the enquiry worker will send pending website enquiry notifications there.')
    if input('Continue with this sender and recipient? Type CONNECT: ')!='CONNECT':
        raise SystemExit('No changes made.')
    password=getpass.getpass('Existing mailbox password (hidden): ')
    if not password:
        raise SystemExit('No password entered. No changes made.')
    encoded=env_quote(password)
    message=EmailMessage()
    message['From']=MAILBOX;message['To']=MAILBOX
    message['Subject']='BANDEVI website enquiry notification setup test'
    message.set_content('This is a setup test from the BANDEVI website server. No customer data is included. Confirm receipt before relying on email notifications.')
    try:
        with smtplib.SMTP_SSL('smtpout.secureserver.net',465,timeout=20,context=ssl.create_default_context()) as smtp:
            smtp.login(MAILBOX,password)
            smtp.send_message(message)
    except Exception:
        raise SystemExit('Authentication or test delivery was not accepted. No settings changed. Check the mailbox product and approved SMTP access; do not disable account security.')
    del password
    if input('Did the setup test arrive in your mailbox? Type RECEIVED: ')!='RECEIVED':
        raise SystemExit('Test sent; settings not changed. Confirm delivery before connecting.')
    backup=config.with_name('bandevi-enquiries.before-mail-'+str(time.time_ns())+'.env')
    shutil.copy2(config,backup);backup.chmod(0o600)
    lines=[line for line in existing.splitlines() if not line.startswith(('SMTP_HOST=','SMTP_PORT=','SMTP_TLS=','SMTP_USER=','SMTP_PASSWORD=','SMTP_FROM=','SMTP_TO='))]
    lines+=['SMTP_HOST=smtpout.secureserver.net','SMTP_PORT=465','SMTP_TLS=ssl','SMTP_USER='+MAILBOX,'SMTP_FROM='+MAILBOX,'SMTP_TO='+MAILBOX,'SMTP_PASSWORD='+encoded]
    with tempfile.NamedTemporaryFile('w',dir=config.parent,prefix='.bandevi-mail-',delete=False) as file:
        file.write('\n'.join(lines)+'\n');temporary=Path(file.name)
    temporary.chmod(0o600);temporary.replace(config)
    try:
        subprocess.run(['systemctl','restart','bandevi-enquiries'],check=True)
        time.sleep(1)
        subprocess.run(['curl','--fail','--silent','http://127.0.0.1:8766/health'],check=True)
    except Exception:
        shutil.copy2(backup,config)
        subprocess.run(['systemctl','restart','bandevi-enquiries'],check=True)
        raise
    print('\nMail sender connected after a received setup test. Monitor individual notification statuses in the private inbox.')

if __name__=='__main__':
    main()
