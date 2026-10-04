"""Add crawlable noindex headers to company data/submission files only.

Run as root after pulling the indexing release. Does not change enquiry services.
"""
import pathlib
import shutil
import subprocess
import time

CONFIG = pathlib.Path('/etc/nginx/sites-enabled/bandeviglobalgroup.com').resolve()
MARKER = '    # Bandevi supporting-file indexing policy'
ROUTING = r'''
    # Bandevi supporting-file indexing policy
    location ~* ^/assets/bandevi-global-group-[^/]+\.(json|txt|csv)$ {
        add_header X-Robots-Tag "noindex" always;
        try_files $uri =404;
    }
    location = /llms.txt {
        add_header X-Robots-Tag "noindex" always;
        try_files $uri =404;
    }

'''

def updated_config(text):
    if MARKER in text:
        return text
    anchor = '    location / {'
    if text.count(anchor) != 1:
        raise ValueError('Expected one static-site location; configuration left untouched.')
    if 'root /srv/bandeviglobalgroup/app;' not in text:
        raise ValueError('Unexpected document root; configuration left untouched.')
    return text.replace(anchor, ROUTING + anchor, 1)

def main():
    original = CONFIG.read_text()
    updated = updated_config(original)
    if updated == original:
        subprocess.run(['nginx', '-t'], check=True)
        print('Supporting-file indexing policy already installed.')
        return
    backup = pathlib.Path('/srv/bandeviglobalgroup') / ('nginx-before-indexing-' + str(time.time_ns()) + '.conf')
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
    print('Supporting-file indexing policy installed. Backup:', backup)

if __name__ == '__main__':
    main()
