"""Install Bandevi-only API routes and operational timers on the existing VPS."""
from pathlib import Path
import os
import shutil
import subprocess
import time

def deploy():
    if not hasattr(os,'geteuid') or os.geteuid()!=0:raise SystemExit('Run in the authenticated Bandevi VPS root console.')
    root=Path('/srv/bandeviglobalgroup/app')
    config=Path('/etc/nginx/sites-enabled/bandeviglobalgroup.com').resolve()
    text=config.read_text()
    if 'bandeviglobalgroup.com' not in text or 'root /srv/bandeviglobalgroup/app;' not in text:
        raise SystemExit('Bandevi production root could not be verified. No configuration changed.')
    if not Path('/etc/bandevi-enquiries.env').is_file():raise SystemExit('Set up the existing enquiry service and administrator first.')
    if '127.0.0.1:8766' not in text:raise SystemExit('Existing Bandevi enquiry routing could not be verified.')
    marker='    location / {'
    if marker not in text:raise SystemExit('Routing differs from the saved baseline. No configuration changed.')
    stamp=str(int(time.time()));backup=Path('/srv/bandeviglobalgroup')/('upgrade-rollback-'+stamp);backup.mkdir(mode=0o700)
    shutil.copy2(config,backup/'nginx.conf')
    with __import__('sqlite3').connect('/var/lib/bandevi-enquiries/inbox.sqlite3') as db,__import__('sqlite3').connect(backup/'inbox-before.sqlite3') as copy:db.backup(copy)
    new=text
    if '# Bandevi demo reservations' not in text:
        new=text.replace(marker,'''    # Bandevi demo reservations
    location ^~ /api/demo/ {
        client_max_body_size 8k;
        proxy_pass http://127.0.0.1:8766;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_connect_timeout 3s;
        proxy_read_timeout 20s;
    }
    location = /demo-booking/ {
        add_header X-Robots-Tag "noindex, nofollow, noarchive" always;
        add_header Referrer-Policy "no-referrer" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'" always;
        try_files /demo-booking/index.html =404;
    }
'''+marker,1)
    names=('bandevi-backup.service','bandevi-backup.timer','bandevi-monitor.service','bandevi-monitor.timer')
    for name in names:
        installed=Path('/etc/systemd/system')/name
        if installed.exists():shutil.copy2(installed,backup/name)
    try:
        config.write_text(new)
        subprocess.run(['nginx','-t'],check=True)
        subprocess.run(['systemctl','restart','bandevi-enquiries'],check=True)
        for _ in range(10):
            result=subprocess.run(['curl','--fail','--silent','http://127.0.0.1:8766/health'],capture_output=True)
            if result.returncode==0:break
            time.sleep(1)
        else:raise RuntimeError('Bandevi enquiry service health check failed.')
        for name in names:shutil.copy2(root/'server'/name,Path('/etc/systemd/system')/name)
        subprocess.run(['systemctl','daemon-reload'],check=True)
        subprocess.run(['systemctl','start','bandevi-backup.service'],check=True)
        subprocess.run(['systemctl','enable','--now','bandevi-backup.timer','bandevi-monitor.timer'],check=True)
        subprocess.run(['systemctl','reload','nginx'],check=True)
    except Exception:
        shutil.copy2(backup/'nginx.conf',config)
        for name in names:
            installed=Path('/etc/systemd/system')/name
            if (backup/name).exists():shutil.copy2(backup/name,installed)
            else:
                if name.endswith('.timer'):subprocess.run(['systemctl','disable','--now',name],check=False)
                installed.unlink(missing_ok=True)
        subprocess.run(['systemctl','daemon-reload'],check=False)
        subprocess.run(['nginx','-t'],check=False)
        raise
    print('Bandevi routes and timers installed. Rollback configuration:',backup)
    print('Publish supported demo times and staff access through /team-inbox/. Configure an HTTPS MONITOR_WEBHOOK for external alerts. Existing mail configuration is preserved.')

if __name__=='__main__':deploy()
