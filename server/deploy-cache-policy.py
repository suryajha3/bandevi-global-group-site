"""Require revalidation for the existing static-site route; preserve other locations."""
from pathlib import Path
import shutil, subprocess, time

CONFIG = Path('/etc/nginx/sites-enabled/bandeviglobalgroup.com').resolve()
OLD = '    location / {\n        try_files $uri $uri/ =404;\n    }'
NEW = '    location / {\n        # Revalidate static pages after website deployments.\n        expires -1;\n        try_files $uri $uri/ =404;\n    }'

def updated_config(text):
    if 'root /srv/bandeviglobalgroup/app;' not in text:
        raise ValueError('Unexpected document root; left unchanged.')
    if NEW in text:
        return text
    if text.count(OLD) != 1:
        raise ValueError('Unexpected static routing; left unchanged.')
    return text.replace(OLD, NEW, 1)

def main():
    original = CONFIG.read_text()
    updated = updated_config(original)
    if original == updated:
        subprocess.run(['nginx', '-t'], check=True)
        print('Static page revalidation already configured.')
        return
    backup = Path('/srv/bandeviglobalgroup') / ('nginx-before-page-revalidation-' + str(time.time_ns()) + '.conf')
    shutil.copy2(CONFIG, backup)
    backup.chmod(0o600)
    try:
        CONFIG.write_text(updated)
        subprocess.run(['nginx', '-t'], check=True)
        subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
    except Exception:
        shutil.copy2(backup, CONFIG)
        subprocess.run(['nginx', '-t'], check=True)
        subprocess.run(['systemctl', 'reload', 'nginx'], check=True)
        raise
    print('Static page revalidation installed. Backup:', backup)

if __name__ == '__main__':
    main()
