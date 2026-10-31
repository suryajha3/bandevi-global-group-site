"""Inspect only fictional browser-generated QA PDFs; never customer documents."""
import json,pathlib,re
from pypdf import PdfReader
root=pathlib.Path(__file__).resolve().parents[1]/'qa-results/project-brief-preview'
expected=json.loads((root/'expected-pdf-text.json').read_text())
compact=lambda value:re.sub(r'\s+','',value)
checks=[]
for name in ['brief-standard.pdf','brief-maximum.pdf']:
    reader=PdfReader(root/name);assert 1<=len(reader.pages)<=4
    text='\n'.join(page.extract_text() or '' for page in reader.pages)
    assert expected['label'] in text and 'BANDEVI GLOBAL GROUP' in text and 'Project Brief' in text
    assert 'PRIVATE-CONTACT' not in text and 'private-contact@example.test' not in text and '+19995550123' not in text
    assert 'Send project brief' not in text and 'WhatsApp' not in text and 'Analytics preferences' not in text
    if name=='brief-maximum.pdf':
        for field in ['problem','features']:assert compact(expected[field]) in compact(text),'Truncated '+field
    else:
        for value in ['USD 4,000 to 6,000 (preference)','USD (to agree)','2032-05-20']:assert value in text
    for page in reader.pages:
        assert abs(float(page.mediabox.width)-595.28)<2 and abs(float(page.mediabox.height)-841.89)<2
    checks.append(dict(file=name,pages=len(reader.pages),completeText=True,contactExcluded=True,pageChromeExcluded=True))
(root/'pdf-checks.json').write_text(json.dumps(checks,indent=2))
print(json.dumps(checks))
