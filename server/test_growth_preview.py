"""Temporary browser fixture; synthetic data and no mail worker."""
import datetime as dt
import json
import os
import time
import test_dashboard as fixture

dashboard=fixture.dashboard;enquiries=fixture.enquiries
password='Synthetic-growth-only-20261017'
os.environ['DASHBOARD_PASSWORD_HASH']=dashboard.password_hash(password)
now=int(time.time());today=dt.datetime.now(dt.timezone.utc).date()
with enquiries.connect() as db:
    for email,role in [('agent@growth.example','agent'),('manager@growth.example','manager')]:db.execute('INSERT INTO team_users VALUES(?,?,?,?,1)',(email,'Synthetic '+role,role,dashboard.password_hash(password)))
    for ref,country,stage,owner,campaign,review,qa,landing in [
        ('BG-GROWTH-US','US','Won',dashboard.USER,'growth_pilot_us',True,False,'/us/software-development/'),
        ('BG-GROWTH-UNASSIGNED','US','New','','growth_pilot_us',True,False,'/crm-demo/'),
        ('BG-GROWTH-UK','GB','Contacted','agent@growth.example','growth_pilot_uk',True,False,'/uk/software-development/'),
        ('BG-GROWTH-IN','IN','New',dashboard.USER,'growth_pilot_india',True,False,'/india/software-development/'),
        ('BG-GROWTH-QA','US','New','','growth_pilot_us',True,True,'/us/software-development/')]:
        source='/'+dict(US='us',GB='uk',IN='india')[country]+'/software-development/'
        data=dict(type='contact',name='Synthetic '+ref,email='qa@example.test',phone='',interest='CRM & ERP Package',message='Synthetic request only.',source=source,
                  qualification=dict(version=1,country=country,currency=dict(US='USD',GB='GBP',IN='INR')[country],budget='',contact=dict(channel='Email',date='',time='',timezone='Asia/Kolkata')),
                  attribution=dict(channel='paid',utm_source='google',utm_medium='cpc',utm_campaign=campaign,landing_page=landing,referrer_domain=''))
        if review:data['crmReview']=dict(version=1,tools='Synthetic spreadsheets',teamSize='6-20',challenge='Synthetic missed follow-ups',integrations='Synthetic accounting tool')
        data=enquiries.validate(data);created=int(dt.datetime.combine(today-dt.timedelta(days=3),dt.time(12),dt.timezone.utc).timestamp())
        db.execute('INSERT INTO enquiries(id,created,payload,email_status) VALUES(?,?,?,?)',(ref,created,json.dumps(data),'qa-verified' if qa else 'sent'))
        db.execute('INSERT INTO enquiry_workflow(id,owner,stage,next_action,follow_up_date) VALUES(?,?,?,?,?)',(ref,owner,stage,'Review synthetic workflow' if country=='GB' else '',(today+dt.timedelta(days=7)).isoformat() if country=='GB' else ''))
        if stage!='New':db.execute('INSERT INTO sales_events(enquiry_id,stage,actor,created) VALUES(?,?,?,?)',(ref,stage,owner,created+1))
    db.execute("INSERT INTO sales_events(enquiry_id,stage,actor,created) VALUES('BG-GROWTH-US','Qualified',?,?)",(dashboard.USER,now))
    db.execute("INSERT INTO deal_values VALUES('BG-GROWTH-US',99000,'GBP')")
    for pid,country,campaign,currency,zone in [('synthetic-us','US','growth_pilot_us','USD','UTC'),('synthetic-uk','GB','growth_pilot_uk','GBP','Europe/London')]:
        db.execute('INSERT INTO campaign_cost_profiles VALUES(?,?,?,?,?,?,?,?,?,?)',(pid,country,campaign,'google','cpc',currency,zone,'Synthetic account',now,dashboard.USER))
    for offset in range(1,8):db.execute('INSERT INTO campaign_daily_costs VALUES(?,?,100,1,?,?)',('synthetic-us',(today-dt.timedelta(days=offset)).isoformat(),now,dashboard.USER))
enquiries.ORIGINS.add(fixture.base)
print(fixture.server.server_port,flush=True)
try:
    import threading
    threading.Event().wait()
finally:fixture.server.shutdown();fixture.server.server_close();fixture.temporary.cleanup()
