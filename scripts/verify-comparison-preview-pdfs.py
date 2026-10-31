"""Verify actual Chromium-generated comparison PDFs; no production/customer data."""
import hashlib, json, re, sys
from pathlib import Path
from pypdf import PdfReader

root = Path(__file__).resolve().parents[1]
refs = json.loads((root / 'scripts/public-project-comparison.json').read_text(encoding='utf-8'))
output = Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'qa-results/project-comparison-preview'
label = 'Public project references — not a quotation.'
compact = lambda text: re.sub(r'\s+', '', text)
reports = []
for count, name in [(2, 'comparison-two.pdf'), (3, 'comparison-three.pdf')]:
    path = output / name
    reader = PdfReader(path)
    assert 1 <= len(reader.pages) <= 3, (name, len(reader.pages))
    texts = [page.extract_text() or '' for page in reader.pages]
    text = compact('\n'.join(texts))
    assert 'PRIVATE-CONTACT-EXCLUDED-XYZ' not in text
    links, images = set(), set()
    for page, page_text in zip(reader.pages, texts):
        assert 835 < float(page.mediabox.width) < 850 and 590 < float(page.mediabox.height) < 600
        assert compact(label) in compact(page_text), (name, 'Missing repeated label')
        for annotation in page.get('/Annots', []):
            action = annotation.get_object().get('/A', {})
            if action.get('/URI'):
                links.add(str(action['/URI']))
        for image in page.images:
            images.add(hashlib.sha256(image.data).hexdigest())
    expected = set()
    for item in refs[:count]:
        for field in ['title', 'kind', 'scope', 'workflow', 'attribution', 'limitations', 'captured']:
            assert compact(item[field]) in text, (name, field, item['title'])
        expected.update('https://bandeviglobalgroup.com' + item[k] for k in ['url', 'image'])
        assert compact('https://bandeviglobalgroup.com' + item['url']) in text
    assert links == expected, (name, links, expected)
    assert len(images) == count, (name, 'Screenshot count', len(images))
    reports.append(dict(file=name, pages=len(reader.pages), references=count, publicLinks=len(links), screenshots=len(images), bytes=path.stat().st_size))
(output / 'pdf-checks.json').write_text(json.dumps(reports, indent=2), encoding='utf-8')
print(json.dumps(dict(status='PASS', pdfs=reports)))
