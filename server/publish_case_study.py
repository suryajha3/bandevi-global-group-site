"""Generate a reviewable case study from explicit client-approved evidence."""
import argparse
import html
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

def render(data):
    required=('slug','client','title','scope','delivered','period','evidenceUrl','approvedBy','approvalRecord')
    if data.get('clientApproved') is not True or any(not isinstance(data.get(k),str) or not data[k].strip() for k in required):
        raise ValueError('Client permission, evidence and delivery details are required before publication.')
    if not re.fullmatch('[a-z0-9]+(?:-[a-z0-9]+)*',data['slug']):raise ValueError('Use a safe case study slug.')
    url=urlsplit(data['evidenceUrl'])
    if url.scheme!='https' or not url.netloc:raise ValueError('Use an HTTPS evidence link.')
    outcomes=data.get('outcomes',[])
    for item in outcomes:
        if any(not isinstance(item.get(k),str) or not item[k].strip() for k in ('result','source','period')):raise ValueError('Every measured outcome needs its source and measurement period.')
    esc=html.escape
    content=''.join('<article><h2>'+esc(item['result'])+'</h2><p>Source: '+esc(item['source'])+' · Period: '+esc(item['period'])+'</p></article>' for item in outcomes)
    return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(data['title'])+' | Bandevi Global Group</title><meta name="description" content="'+esc(data['scope'],quote=True)+'"><link rel="canonical" href="https://bandeviglobalgroup.com/projects/'+data['slug']+'/"><link rel="stylesheet" href="/assets/upgrade.css"></head><body class="booking-page"><main><a href="/">BANDEVI GLOBAL GROUP</a><p>Client-approved project reference</p><h1>'+esc(data['title'])+'</h1><p>Client: '+esc(data['client'])+' · Delivery period: '+esc(data['period'])+'</p><h2>Our delivery scope</h2><p>'+esc(data['scope'])+'</p><h2>Delivered work</h2><p>'+esc(data['delivered'])+'</p><a href="'+esc(data['evidenceUrl'],quote=True)+'" rel="noopener noreferrer">Review the approved evidence</a>'+content+'<p><a href="/project-brief/">Discuss a similar project</a></p></main></body></html>'

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--input',required=True);parser.add_argument('--output',required=True)
    args=parser.parse_args();data=json.loads(Path(args.input).read_text(encoding='utf-8'));result=render(data)
    destination=Path(args.output);destination.parent.mkdir(parents=True,exist_ok=True);destination.write_text(result,encoding='utf-8')
    print('Generated case study for review. Review client permission and update navigation/sitemap before deploying.')
