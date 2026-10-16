"""Structured website sales preferences; no appointments or quoted prices created."""
import datetime
import re
from zoneinfo import ZoneInfo,ZoneInfoNotFoundError

COUNTRIES={'GB':('United Kingdom','GBP'),'US':('United States','USD'),'IN':('India','INR'),'other':('Other','')}
ZONES={'Europe/London','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','America/Phoenix','America/Anchorage','Pacific/Honolulu','Asia/Kolkata','Asia/Dubai','Asia/Singapore','UTC'}


def validate(value,enquiry):
    if not isinstance(value,dict) or set(value)!={'version','country','currency','budget','contact'} or value['version']!=1: raise ValueError('Invalid enquiry preferences.')
    country=value['country'];currency=value['currency'];budget=value['budget'];contact=value['contact']
    if country not in COUNTRIES or currency not in ['GBP','USD','INR','EUR',''] or (COUNTRIES[country][1] and currency!=COUNTRIES[country][1]): raise ValueError('Check the country and currency.')
    if not isinstance(budget,str) or len(budget)>120 or any(ord(c)<32 for c in budget): raise ValueError('Check the optional budget preference.')
    if not isinstance(contact,dict) or set(contact)!={'channel','date','time','timezone'}: raise ValueError('Invalid contact preferences.')
    if contact['channel'] not in ['Discuss','Email','Phone','WhatsApp'] or contact['timezone'] not in ZONES: raise ValueError('Choose a contact method and time zone.')
    if contact['channel']=='Email' and not enquiry['email']: raise ValueError('Add an email address for email contact.')
    if contact['channel'] in ['Phone','WhatsApp'] and (not re.fullmatch(r'\+?[0-9 () .-]+',enquiry['phone']) or not 7<=len(re.sub(r'\D','',enquiry['phone']))<=15): raise ValueError('Add a valid phone number for phone or WhatsApp contact.')
    day=contact['date'];clock=contact['time']
    if not isinstance(day,str) or not isinstance(clock,str) or bool(day)!=bool(clock): raise ValueError('Provide both a preferred date and time, or leave both blank.')
    if day:
        if not re.fullmatch(r'\d{4}-\d{2}-\d{2}',day) or not re.fullmatch(r'\d{2}:\d{2}',clock): raise ValueError('Invalid preferred contact time.')
        selected=datetime.datetime.fromisoformat(day+'T'+clock)
        zone=ZoneInfo(contact['timezone'])
        if not any(selected.replace(tzinfo=zone,fold=fold).astimezone(datetime.timezone.utc).astimezone(zone).replace(tzinfo=None)==selected for fold in [0,1]): raise ValueError('That local time does not exist. Choose another time.')
    return dict(version=1,country=country,currency=currency,budget=budget.strip(),contact=dict(contact))


def check_future(value,now=None):
    contact=value['contact']
    if not contact['date']: return
    current=now or datetime.datetime.now(datetime.timezone.utc)
    selected=datetime.datetime.fromisoformat(contact['date']+'T'+contact['time']).replace(tzinfo=ZoneInfo(contact['timezone']))
    if selected<=current or selected>current+datetime.timedelta(days=180): raise ValueError('Choose a future contact time within 180 days, or leave it blank.')
