/* Browser-generated public company profile. Explicit preview and printing only. */
(() => {
  'use strict';
  function init() {
    const host=document.querySelector('[data-company-profile-preview]');
    if(document.body.dataset.page!=='profile'||!host||host.dataset.ready)return;
    const launch=host.querySelector('[data-company-profile-open]');if(!launch)return;
    const label='Public company information — not a quotation.';
    const identity=Object.freeze([
      ['Legal name','BANDEVI GLOBAL GROUP PRIVATE LIMITED'],
      ['CIN','U79110HR2026PTC152314'],['Incorporation date','30 October 2026'],
      ['GSTIN','06AAPCB2996N1ZU'],['GST registration effective','31 October 2026'],
      ['Udyam registration number','UDYAM-HR-05-0214531'],['Udyam registration date','1 November 2026'],
      ['Recorded enterprise classification','Micro, 2026–27; classification dated 1 November 2026']
    ].map(Object.freeze));
    const links=Object.freeze([
      ['BGG company registration record','https://bandeviglobalgroup.com/trust-licences-certifications/#company-registration'],
      ['Ministry of Corporate Affairs','https://www.mca.gov.in/'],
      ['GST taxpayer search','https://services.gst.gov.in/services/searchtp'],
      ['Udyam verification','https://udyamregistration.gov.in/Udyam_Verify.aspx']
    ].map(Object.freeze));
    const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
    const button=(text,key)=>{const n=el('button',text);n.type='button';n.dataset[key]='';return n;};
    function documentFor(paper=false) {
      const article=el('article',undefined,'company-profile-document');
      article.append(el('p','BANDEVI GLOBAL GROUP','profile-document-brand'),el(paper?'h1':'h3','Company profile'),el('p',label,'profile-document-label'));
      const records=el('section');records.append(el(paper?'h2':'h4','Company identity and registrations'));
      const dl=el('dl');for(const [name,value] of identity){dl.append(el('dt',name),el('dd',value));}records.append(dl);article.append(records);
      const address=el('section');address.append(el(paper?'h2':'h4','Business address on supplied records'),el('p','SCO 63, First Floor, Sector 23/23A, behind petrol pump, Palam Vihar, Gurugram, Haryana 122017, India. Arrange an appointment before visiting.'));article.append(address);
      const services=el('section');services.append(el(paper?'h2':'h4','Services and delivery'));
      const list=el('ul');for(const text of ['Websites and apps: customer-facing pages, enquiry journeys and portals.','CRM and ERP: sales, operational records, responsibilities and reporting.','Travel technology: travel websites, quotations, booking handover and provider-dependent integrations.'])list.append(el('li',text));
      services.append(list,el('p','Remote delivery from Gurugram, India. International service coverage does not imply a staffed overseas office. Agree project scope, price, milestones, approvals, acceptance, ownership and support separately.'));article.append(services);
      const contact=el('section');contact.append(el(paper?'h2':'h4','Published business contacts'));
      for(const [title,url] of [['bandeviglobalgroup.com','https://bandeviglobalgroup.com/'],['sales@bandeviglobalgroup.com','mailto:sales@bandeviglobalgroup.com'],['+91 70110 40474','tel:+917011040474'],['Office landline: 0124 476 3671','tel:+911244763671']]){const p=el('p'),a=el('a',title);a.href=url;p.append(a);contact.append(p);}article.append(contact);
      const verification=el('section');verification.append(el(paper?'h2':'h4','Sources and official verification'));
      const ul=el('ul');for(const [title,url] of links){const li=el('li'),a=el('a',title);a.href=url;a.target='_blank';a.rel='noopener noreferrer';li.append(a,el('span',url,'profile-document-url'));ul.append(li);}verification.append(ul,el('p','Incorporation and GST fields were transcribed from company-supplied certificates reviewed 31 October 2026. Udyam fields were transcribed from the supplied certificate reviewed 2 November 2026. Check current issuer records using the identifiers above; live registry status and digital signatures have not been independently validated.'));article.append(verification);
      article.append(el('p','Generated in this browser from published business information. This profile does not establish ISO certification, sector permissions, workforce totals, audited finances or customer results. BANDEVI and The Holidays Group are separate sister brands; this does not establish a shared legal entity or licence.','profile-document-note'));
      return article;
    }
    const panel=el('section',undefined,'company-profile-preview-panel');panel.hidden=true;panel.setAttribute('aria-labelledby','company-profile-preview-heading');
    const heading=el('h2','Public Company Profile Preview');heading.id='company-profile-preview-heading';heading.tabIndex=-1;
    const content=el('div',undefined,'company-profile-preview-content'),status=el('p',undefined,'company-profile-preview-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    const print=button('Print / Save as PDF','companyProfilePrint'),refresh=button('Refresh preview','companyProfileRefresh'),close=button('Close preview','companyProfileClose');print.disabled=true;refresh.hidden=true;
    const actions=el('div',undefined,'company-profile-preview-actions');actions.append(print,refresh,close);
    panel.append(heading,el('p','Review the company details below, then choose Print / Save as PDF. The browser will let you choose a printer or Save as PDF.','company-profile-preview-help'),content,status,actions);
    host.append(panel);
    const paper=el('article');paper.id='bgg-company-profile-print';paper.hidden=true;document.body.append(paper);
    let signature=null,printing=false;
    const current=()=>signature!==null&&host.isConnected&&document.body.dataset.page==='profile'&&!panel.hidden&&content.innerHTML===signature;
    function invalidate(){
      if(signature===null||current())return;
      print.disabled=true;refresh.hidden=false;status.textContent='The preview changed. Choose Refresh preview and review it again before printing.';
      if(printing)paper.replaceChildren(el('h1','Company profile preview changed'),el('p',label),el('p','Close this print window, refresh the preview and review it again before printing.'));
    }
    function finish(){
      if(!printing)return;
      printing=false;document.body.removeAttribute('data-bgg-company-profile-print');paper.replaceChildren();
      print.disabled=!current()||typeof window.print!=='function';launch.disabled=false;
      if(current()){status.textContent='Print window closed. You can review or print this profile again.';print.focus({preventScroll:true});}else invalidate();
    }
    function show(){
      if(printing||!host.isConnected)return;
      content.replaceChildren(documentFor());signature=content.innerHTML;panel.hidden=false;refresh.hidden=true;
      print.disabled=typeof window.print!=='function';
      status.textContent=print.disabled?'Printing is unavailable in this browser. You can still review the public company profile.':'Preview ready. Review the public details before choosing Print / Save as PDF.';
      heading.focus({preventScroll:true});panel.scrollIntoView({block:'start',behavior:'instant'});
    }
    function reset(){
      if(printing)return;
      signature=null;panel.hidden=true;content.replaceChildren();paper.replaceChildren();print.disabled=true;refresh.hidden=true;status.textContent='';launch.focus({preventScroll:true});
    }
    launch.addEventListener('click',show);refresh.addEventListener('click',show);close.addEventListener('click',reset);
    panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();reset();}});
    print.addEventListener('click',()=>{
      if(printing||!current()){invalidate();return;}
      if(typeof window.print!=='function'){print.disabled=true;status.textContent='Printing is unavailable in this browser. You can still review the public company profile.';return;}
      try{
        paper.replaceChildren(documentFor(true));printing=true;print.disabled=true;launch.disabled=true;document.body.dataset.bggCompanyProfilePrint='true';status.textContent='Use the browser print window to print or save a PDF.';window.print();
      }catch(_){finish();status.textContent='The print window could not open. Your preview is unchanged. You can try again or use another browser.';}
    });
    new MutationObserver(invalidate).observe(content,{subtree:true,childList:true,attributes:true,characterData:true});
    window.addEventListener('beforeprint',()=>{if(printing)invalidate();});window.addEventListener('afterprint',finish);window.addEventListener('pagehide',finish);
    window.matchMedia?.('print')?.addEventListener?.('change',e=>{if(!e.matches)finish();});
    host.dataset.ready='true';launch.disabled=false;
  }
  if(document.readyState==='complete')init();else document.addEventListener('DOMContentLoaded',init,{once:true});
})();
