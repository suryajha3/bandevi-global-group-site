"""Consistent SQLite backups with a restore verification and bounded retention."""
import argparse
import datetime
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import time

def backup(database, destination, keep=14):
    destination=Path(destination).resolve();destination.mkdir(parents=True,exist_ok=True,mode=0o700)
    if not 2<=keep<=90:raise ValueError('Keep between 2 and 90 backups.')
    source=Path(database).resolve()
    if not source.is_file():raise ValueError('Inbox database not found.')
    name='inbox-'+datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S')+'-'+os.urandom(4).hex()+'.sqlite3'
    target=destination/name
    with sqlite3.connect(source) as db,sqlite3.connect(target) as copy:
        db.backup(copy)
        if copy.execute('PRAGMA integrity_check').fetchone()[0]!='ok':raise ValueError('Backup integrity check failed.')
        # Reopen the completed copy and query the application schema as a restore check.
    with sqlite3.connect('file:'+target.as_posix()+'?mode=ro',uri=True) as copy:
        count=copy.execute('SELECT COUNT(*) FROM enquiries').fetchone()[0]
        if copy.execute('PRAGMA integrity_check').fetchone()[0]!='ok':raise ValueError('Restore verification failed.')
    target.chmod(0o600)
    digest=hashlib.sha256(target.read_bytes()).hexdigest()
    metadata=target.with_suffix('.json');metadata.write_text(json.dumps({'sha256':digest,'verified':True,'created':int(time.time()),'enquiries':count}),encoding='utf-8');metadata.chmod(0o600)
    with sqlite3.connect(source) as db:
        db.execute('INSERT INTO recovery_checks(created,backup_name,verified) VALUES(?,?,1)',(int(time.time()),name))
    old=sorted(destination.glob('inbox-*.sqlite3'),key=lambda p:p.stat().st_mtime,reverse=True)[keep:]
    for item in old:
        if item.resolve().parent!=destination or item.is_symlink():raise ValueError('Unexpected backup path.')
        item.unlink();item.with_suffix('.json').unlink(missing_ok=True)
    return {'backup':name,'verified':True,'sha256':digest}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--database',default=os.environ.get('ENQUIRY_DB','/var/lib/bandevi-enquiries/inbox.sqlite3'));parser.add_argument('--destination',default='/var/lib/bandevi-enquiries/backups');parser.add_argument('--keep',type=int,default=14)
    args=parser.parse_args();print(json.dumps(backup(args.database,args.destination,args.keep)))
