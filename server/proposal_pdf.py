"""Branded PDF of a recorded proposal revision; never invent commercial terms."""
import datetime
from io import BytesIO
from decimal import Decimal
from pathlib import Path
import threading
from xml.sax.saxutils import escape
import reportlab
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether

INDIA=datetime.timezone(datetime.timedelta(hours=5,minutes=30))
LOCK=threading.Lock()

def fonts():
    with LOCK:
        if 'Bandevi' not in pdfmetrics.getRegisteredFontNames():
            root=Path(reportlab.__file__).parent/'fonts'
            pdfmetrics.registerFont(TTFont('Bandevi',str(root/'Vera.ttf')))
            pdfmetrics.registerFont(TTFont('BandeviBold',str(root/'VeraBd.ttf')))

def status(p,now):
    if p['status']=='accepted':return 'Accepted record'
    if p['status']=='published':return 'Expired' if p['expires']<=now else 'Awaiting acceptance'
    if p['status']=='draft':return 'Draft - not published'+(' (expired)' if p['expires']<=now else '')
    return {'withdrawn':'Withdrawn - historical record','superseded':'Superseded - historical record'}[p['status']]

def stamp(n):
    return datetime.datetime.fromtimestamp(n,INDIA).strftime('%d %b %Y, %H:%M IST')

def generate(project,p,now):
    fonts();buffer=BytesIO();width,height=A4;ink=colors.HexColor('#17292e');teal=colors.HexColor('#087177');gold=colors.HexColor('#d2ae60')
    normal=ParagraphStyle('body',fontName='Bandevi',fontSize=10,leading=15,textColor=ink,spaceAfter=8,splitLongWords=True)
    heading=ParagraphStyle('heading',parent=normal,fontName='BandeviBold',fontSize=13,leading=18,spaceBefore=15,spaceAfter=8)
    title=ParagraphStyle('title',parent=heading,fontSize=21,leading=28,spaceBefore=0)
    label=ParagraphStyle('label',parent=normal,fontSize=9,textColor=teal)
    def para(value,style=normal):return Paragraph(escape(str(value)).replace('\n','<br/>'),style)
    values=[project['title'],project['email'],p['title'],p['scope'],p['terms'],p['accepted_by'] or '']
    # Refuse an incomplete export rather than silently substitute unreadable glyphs.
    glyphs=pdfmetrics.getFont('Bandevi').face.charToGlyph
    if any(ord(c) not in glyphs for value in values for c in value if c not in '\n\t'):
        raise ValueError('PDF export does not support some characters in this revision. The full original text remains available in the workspace.')
    state=status(p,now)
    doc=SimpleDocTemplate(buffer,pagesize=A4,leftMargin=44,rightMargin=44,topMargin=110,bottomMargin=55,title='Bandevi proposal '+project['reference']+' revision '+str(p['revision']),author='Bandevi Global Group')
    def page(canvas,document):
        canvas.saveState();canvas.setFillColor(ink);canvas.rect(0,height-85,width,85,fill=1,stroke=0)
        canvas.setFillColor(gold);canvas.setFont('BandeviBold',25);canvas.drawString(44,height-43,'BG')
        canvas.setFillColor(colors.white);canvas.setFont('BandeviBold',12);canvas.drawString(98,height-35,'BANDEVI GLOBAL GROUP');canvas.setFont('Bandevi',9);canvas.drawString(98,height-53,'Project proposal | bandeviglobalgroup.com')
        canvas.setStrokeColor(gold);canvas.setLineWidth(3);canvas.line(0,height-85,width,height-85)
        canvas.setFillColor(ink);canvas.setFont('Bandevi',8);canvas.drawString(44,30,project['reference']+' | Revision '+str(p['revision']));canvas.drawRightString(width-44,30,'Page '+str(document.page));canvas.restoreState()
    story=[para('PROJECT PROPOSAL',label),para(p['title'],title),para(state,heading)]
    rows=[['Project',project['title']],['Client',project['email']],['Enquiry reference',project['reference']],['Revision',str(p['revision'])],['Created',stamp(p['created'])],['Valid until',stamp(p['expires'])],['Recorded value',p['currency']+' '+format(Decimal(p['minor_units'])/100,',.2f')]]
    if p['published']:rows.append(['Published',stamp(p['published'])])
    table=Table([[para(k,label),para(v)] for k,v in rows],colWidths=[115,width-88-115],hAlign='LEFT')
    table.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(-1,-1),colors.HexColor('#edf6f4')),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),6),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    story += [table,Spacer(1,10)]
    for name,content in [('Scope and deliverables',p['scope']),('Commercial terms',p['terms'])]:
        paragraphs=content.split('\n\n')
        story.append(KeepTogether([para(name,heading),para(paragraphs[0])]))
        story.extend(para(part) for part in paragraphs[1:])
    if p['status']=='accepted':story += [para('Recorded acceptance',heading),para('Accepted '+stamp(p['accepted'])+' by '+p['accepted_by']),para('This export preserves the recorded revision and acceptance. It is not a payment receipt.')]
    else:story += [para('Next steps',heading),para('Review this revision in your private client workspace. Acceptance is available there only for a current, published and unexpired proposal. This PDF does not record acceptance or payment.')]
    story += [para('Status at export: '+state+' | '+stamp(now),label)]
    doc.build(story,onFirstPage=page,onLaterPages=page);return buffer.getvalue()
