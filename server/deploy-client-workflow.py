"""Install client-only routing on the verified existing Bandevi server."""
from pathlib import Path
import os
import shutil
import subprocess
import time

def deploy():
    if not hasattr(os,'geteuid') or os.geteuid()!=0:raise SystemExit('Use the authenticated Bandevi root console.')
    config=Path('/etc/nginx/sites-enabled/bandeviglobalgroup.com').resolve();text=config.read_text()
    if not all(marker in text for marker in ('bandeviglobalgroup.com','root /srv/bandeviglobalgroup/app;','127.0.0.1:8766','location ^~ /server/','location ^~ /api/admin/','    location / {')):
        raise SystemExit('Existing Bandevi routing could not be verified. No configuration changed.')
    if '# Bandevi client workspace' in text:raise SystemExit('Client workspace routing already installed; verify the existing configuration.')
    backup=Path('/srv/bandeviglobalgroup')/('client-routing-rollback-'+str(int(time.time())));backup.mkdir(mode=0o700);shutil.copy2(config,backup/'nginx.conf')
    block='''    # Bandevi client workspace
    location = /client-workspace { return 302 /client-workspace/; }
    location = /team-inbox/workspace { return 302 /team-inbox/workspace/; }
    location ^~ /client-workspace/ {
        proxy_pass http://127.0.0.1:8766;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_read_timeout 20s;
    }
    location ^~ /api/client/ {
        client_max_body_size 1m;
        proxy_pass http://127.0.0.1:8766;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_read_timeout 20s;
    }
    location ^~ /api/admin/workspace/ {
        client_max_body_size 1m;
        proxy_pass http://127.0.0.1:8766;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_read_timeout 20s;
    }
'''
    try:
        config.write_text(text.replace('    location / {',block+'    location / {',1))
        subprocess.run(['nginx','-t'],check=True)
        subprocess.run(['systemctl','restart','bandevi-enquiries'],check=True)
        for _ in range(10):
            response=subprocess.run(['curl','--fail','--silent','http://127.0.0.1:8766/health'],capture_output=True)
            if response.returncode==0:break
            time.sleep(1)
        else:raise RuntimeError('Enquiry service failed its health check.')
        subprocess.run(['systemctl','start','bandevi-backup.service'],check=True)
        subprocess.run(['systemctl','reload','nginx'],check=True)
    except Exception:
        shutil.copy2(backup/'nginx.conf',config);subprocess.run(['nginx','-t'],check=False);raise
    print('Client routes installed; previous routing:',backup)

if __name__=='__main__':deploy()
