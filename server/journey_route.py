"""Install only BANDEVI's exact anonymous measurement route, with rollback."""
from pathlib import Path
import shutil,subprocess,time
MARKER='    # Bandevi enquiry API\n'
ROUTE='''    # BANDEVI anonymous enquiry measurement
    location = /api/measurement {
        access_log off;
        client_max_body_size 2k;
        proxy_pass http://127.0.0.1:8766;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_set_header Cookie "";
        proxy_connect_timeout 3s;
        proxy_read_timeout 5s;
    }

'''
def updated_config(original):
    if 'root /srv/bandeviglobalgroup/app;' not in original or original.count(MARKER)!=1 or 'location = /api/enquiries {' not in original:
        raise ValueError('Unexpected BANDEVI routing; left unchanged.')
    if ROUTE in original:return original
    if 'location = /api/measurement' in original:raise ValueError('Unexpected existing measurement route.')
    return original.replace(MARKER,ROUTE+MARKER,1)
def main():
    config=Path('/etc/nginx/sites-available/bandeviglobalgroup.com');original=config.read_text();updated=updated_config(original)
    if original==updated:subprocess.run(['nginx','-t'],check=True);return
    backup=Path('/srv/bandeviglobalgroup')/('nginx-before-journey-'+str(time.time_ns())+'.conf');shutil.copy2(config,backup);backup.chmod(0o600)
    try:
        config.write_text(updated);subprocess.run(['nginx','-t'],check=True);subprocess.run(['systemctl','reload','nginx'],check=True)
    except Exception:
        shutil.copy2(backup,config);subprocess.run(['nginx','-t'],check=True);subprocess.run(['systemctl','reload','nginx'],check=True);raise
    print('Exact measurement route installed; backup: '+str(backup))
if __name__=='__main__':main()
