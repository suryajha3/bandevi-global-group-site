"""Isolated public enquiry validation and retry tests. No real email worker."""
import copy
import datetime
import json
import unittest
import uuid
import test_dashboard as isolated
import enquiries
import lead_qualification as qualification


class QualificationTests(unittest.TestCase):
    request=isolated.DashboardTests.request

    def payload(self,country='GB'):
        currency={'GB':'GBP','US':'USD','IN':'INR','other':'EUR'}[country]
        zone={'GB':'Europe/London','US':'America/Chicago','IN':'Asia/Kolkata','other':'UTC'}[country]
        return dict(type='contact',name='Synthetic enquiry',email='synthetic@example.test',phone='',interest='Website development',message='Synthetic project requirements',source='/contact-us/',qualification=dict(version=1,country=country,currency=currency,budget='To discuss',contact=dict(channel='Email',date='',time='',timezone=zone)))

    def test_01_three_markets_preserve_structured_fields_and_deduplicate(self):
        for code in ['GB','US','IN','other']:
            p=self.payload(code);key=str(uuid.uuid4())
            status,data,_=self.request('/api/enquiries',p,key=key);self.assertEqual(status,201)
            status,repeat,_=self.request('/api/enquiries',p,key=key);self.assertEqual(status,200);self.assertEqual(data['reference'],repeat['reference'])
            with enquiries.connect() as c: saved=json.loads(c.execute('SELECT payload FROM enquiries WHERE id=?',(data['reference'],)).fetchone()[0])
            self.assertEqual(saved['country'],code);self.assertEqual(saved['qualification'],p['qualification'])
            p['qualification']['budget']='Changed';self.assertEqual(self.request('/api/enquiries',p,key=key)[0],409)

    def test_02_invalid_country_currency_channels_lengths_and_time(self):
        bad=[]
        for field,value in [('country',''),('currency','INR'),('budget','x'*121),('version',2)]:
            p=self.payload();p['qualification'][field]=value;bad.append(p)
        for field,value in [('channel','Unknown'),('timezone','Invalid/Zone'),('date','2026-99-99'),('time','25:00')]:
            p=self.payload();p['qualification']['contact'][field]=value;bad.append(p)
        p=self.payload();p['qualification']['contact']['channel']='Phone';bad.append(p)
        for p in bad:self.assertEqual(self.request('/api/enquiries',p)[0],400)

    def test_03_dst_and_future_preference_are_not_confirmed_bookings(self):
        p=self.payload('US');contact=p['qualification']['contact'];contact.update(date='2027-03-14',time='02:30',timezone='America/New_York')
        with self.assertRaises(ValueError):enquiries.validate(p)
        contact.update(date='2000-01-01',time='10:00');self.assertEqual(self.request('/api/enquiries',p)[0],400)
        day=(datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(days=2)).date().isoformat();contact.update(date=day,time='11:00')
        status,data,_=self.request('/api/enquiries',p);self.assertEqual(status,201);self.assertIsNone(data['appointment'])

    def test_04_legacy_payload_remains_compatible(self):
        p=self.payload();p.pop('qualification');self.assertEqual(self.request('/api/enquiries',p)[0],201)


if __name__=='__main__':unittest.main(verbosity=2);isolated.server.shutdown()
