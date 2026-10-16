"""Prepare static form markup from the same component as the browser source."""
import hashlib
import re
from pathlib import Path
from bs4 import BeautifulSoup

root=Path(__file__).resolve().parents[1]
source=(root/'assets/site.js').read_text(encoding='utf-8')
template=source.split('box.innerHTML=`',1)[1].split('`;',1)[0]
routes=['contact-us/index.html','contact.html','index.html','demo-request/index.html','demo-request.html','project-brief/index.html','uk/software-development/index.html','us/software-development/index.html']
for route in routes:
    p=root/route;html=p.read_text(encoding='utf-8')
    match=re.search(r'<form[^>]*data-form="(?:contact|demo|home)"[\s\S]*?</form>',html)
    assert match,route
    form=BeautifulSoup(match[0],'html.parser').form
    if form.select_one('[data-lead-qualification]'):continue
    old=form.select_one('[name=projectCountry]');regional=''
    if old:
        selected=old.select_one('[selected]');regional=selected.get('value','') if selected else ''
    for name in ['projectCountry','projectBudget','quoteCurrency']:
        old=form.select_one('[name="'+name+'"]')
        if old:old.find_parent(class_='field').decompose()
    markup=template.replace('${id}','qualification-'+(form.get('id') or form['data-form']))
    for code in ['GB','US']:markup=markup.replace("${regional==='"+code+"'?'selected':''}",'selected' if regional==code else '')
    fieldset=BeautifulSoup('<fieldset class="field full enquiry-qualification" data-lead-qualification="1">'+markup+'</fieldset>','html.parser').fieldset
    if form.get('id')=='project-brief':
        fieldset.select_one('[name=projectBudget]').find_parent(class_='field').decompose()
        form.select_one('[data-brief-step="3"] .form-grid').append(fieldset)
    else:
        form.select_one('[name=message]').find_parent(class_='field').insert_before(fieldset)
        interest=form.select_one('[name=interest]')
        for title in ['Website development','Mobile app development','Custom CRM development','ERP & business software','E-commerce development','Custom software & integrations','Maintenance & support']:
            if not any(o.get('value',o.text)==title for o in interest.select('option')):
                option=BeautifulSoup('<option></option>','html.parser').option;option['value']=title;option.string=title;interest.append(option)
    html=html[:match.start()]+str(form)+html[match.end():]
    html=html.replace('Your name, an email or phone number, and a short project description are enough to begin. Service and project details are optional.','Share your name, country, contact details and project requirements. Budget and contact-time preferences are optional.')
    version=hashlib.sha256((root/'assets/client.js').read_bytes()).hexdigest()[:12]
    html=re.sub(r'/assets/client\.js\?v=[^"\s]+','/assets/client.js?v='+version,html)
    html=re.sub(r'/assets/styles\.css\?v=[^"\s]+','/assets/styles.css?v=20261016-enquiries',html)
    p.write_text(html,encoding='utf-8')
print('Prepared '+str(len(routes))+' static enquiry forms')
