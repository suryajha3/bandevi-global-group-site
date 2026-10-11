(() => {
  'use strict';
  const zones = new Set(['Europe/London','America/New_York','America/Chicago','America/Denver','America/Los_Angeles','Asia/Dubai','Asia/Singapore','Asia/Kolkata']);
  const parts = (instant, zone) => {
    const values = new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(instant));
    const get = name => values.find(p => p.type === name).value;
    return {date:`${get('year')}-${get('month')}-${get('day')}`,time:`${get('hour')}:${get('minute')}`};
  };
  const planner = document.getElementById('international-meeting-planner');
  if (planner) {
    const output = document.getElementById('meeting-result'), link = document.getElementById('meeting-request');
    const clear = () => {output.textContent=''; link.hidden=true; link.href='/demo-request/';};
    const minimum = () => {planner.elements.date.min=parts(Date.now(),planner.elements.zone.value).date; clear();};
    planner.elements.zone.addEventListener('change',minimum);
    planner.addEventListener('input',clear); planner.addEventListener('change',clear); minimum();
    planner.addEventListener('submit', event => {
      event.preventDefault(); clear();
      const {date,time,zone}=planner.elements;
      if(!planner.reportValidity() || !zones.has(zone.value)) return;
      const [y,m,d]=date.value.split('-').map(Number),[hour,minute]=time.value.split(':').map(Number);
      const wall=Date.UTC(y,m-1,d,hour,minute), matches=[];
      // Match IANA-zone clock values; never guess a missing or repeated daylight-saving hour.
      for(let offset=-720;offset<=840;offset+=15){const instant=wall-offset*60000;const local=parts(instant,zone.value);if(local.date===date.value&&local.time===time.value)matches.push(instant);}
      if(matches.length===0){output.textContent='That local time does not exist because the clocks change. Choose another time.';return;}
      if(matches.length!==1){output.textContent='That local time occurs twice because the clocks change. Choose a time outside the repeated hour.';return;}
      const instant=matches[0];
      if(instant<=Date.now()){output.textContent='Choose a future meeting time.';return;}
      if(instant>Date.now()+180*86400000){output.textContent='Choose a time within the next 180 days, or email the team to discuss a later meeting.';return;}
      const ist=parts(instant,'Asia/Kolkata');
      output.textContent=`Your proposed time: ${date.value} at ${time.value} (${zone.value}). India Standard Time: ${ist.date} at ${ist.time} IST (UTC+05:30). Availability will be confirmed by the team.`;
      const next = new URL('/demo-request/',location.origin);next.searchParams.set('preferred_date_ist',ist.date);next.searchParams.set('preferred_time_ist',ist.time);next.hash='demo-form';
      link.href=next.pathname+next.search+next.hash;link.hidden=false;
    });
  }
  const demo = document.getElementById('demo-date')?.form;
  if (demo?.elements.demoDate && demo.elements.demoTime) {
    const query=new URL(location.href).searchParams,date=query.get('preferred_date_ist'),time=query.get('preferred_time_ist');
    if(/^\d{4}-\d{2}-\d{2}$/.test(date||'') && /^\d{2}:\d{2}$/.test(time||'') && !demo.elements.demoDate.value && !demo.elements.demoTime.value){
      const parsed=Date.parse(`${date}T${time}:00+05:30`),v=Number.isFinite(parsed)?parts(parsed,'Asia/Kolkata'):null;
      if(v?.date===date && v.time===time && parsed>Date.now() && parsed<=Date.now()+180*86400000){demo.elements.demoDate.value=date;demo.elements.demoTime.value=time;demo.elements.demoDate.dispatchEvent(new Event('input',{bubbles:true}));demo.elements.demoTime.dispatchEvent(new Event('input',{bubbles:true}));}
    }
  }
})();
