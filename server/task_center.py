"""Private staff follow-ups, always linked to an accessible enquiry."""
import datetime
import json
import secrets
import time
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

ASSETS=Path(__file__).parent/'tasks'

class Problem(Exception):
    def __init__(self,status,message):self.status,self.message=status,message

def initialize(db):
    db.executescript('''
    CREATE TABLE IF NOT EXISTS followup_tasks(
      id TEXT PRIMARY KEY, reference TEXT NOT NULL, link_type TEXT NOT NULL, proposal_id TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL, owner TEXT NOT NULL, due TEXT NOT NULL, priority TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open', notes TEXT NOT NULL DEFAULT '', completion TEXT NOT NULL DEFAULT '',
      version INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL, updated INTEGER NOT NULL, actor TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS followup_tasks_reference ON followup_tasks(reference);
    CREATE INDEX IF NOT EXISTS followup_tasks_due ON followup_tasks(status,due);
    ''')

def text(data,key,limit,required=True):
    v=data.get(key,'')
    if not isinstance(v,str) or len(v)>limit or any(ord(c)<32 and c not in '\n\t' for c in v):raise Problem(400,'Check '+key+'.')
    v=v.strip()
    if required and not v:raise Problem(400,'Enter '+key+'.')
    return v

def owners(db,identity):
    from dashboard import USER
    if identity['role']=='agent':return [{'email':identity['actor'],'name':'Me'}]
    result=[{'email':USER,'name':'Sales administrator'}]
    result += [dict(r) for r in db.execute('SELECT email,name FROM team_users WHERE active=1 AND email!=? ORDER BY name,email',(USER,))]
    return result

def linked(db,ref,kind,proposal,identity):
    from dashboard import lead_access
    if not lead_access(db,ref,identity):raise Problem(404,'Enquiry not available.')
    if kind not in ('enquiry','project','proposal'):raise Problem(400,'Choose a valid task link.')
    if kind in ('project','proposal') and not db.execute('SELECT 1 FROM client_projects WHERE reference=?',(ref,)).fetchone():raise Problem(404,'Project not available.')
    if kind=='proposal':
        if not db.execute('SELECT 1 FROM client_proposals WHERE id=? AND reference=?',(proposal,ref)).fetchone():raise Problem(404,'Proposal not available for this enquiry.')
    elif proposal:raise Problem(400,'Only proposal tasks can have a proposal revision.')

def get(handler,connect,identity):
    parsed=urlsplit(handler.path);route=parsed.path
    assets={'/team-inbox/tasks/':'index.html','/team-inbox/tasks/app.js':'app.js','/team-inbox/tasks/styles.css':'styles.css'}
    if route in assets:
        from client_workflow import send_file
        name=assets[route];send_file(handler,(ASSETS/name).read_bytes(),{'index.html':'text/html; charset=utf-8','app.js':'application/javascript; charset=utf-8','styles.css':'text/css; charset=utf-8'}[name]);return True
    if route not in ('/api/admin/tasks','/api/admin/tasks/owners','/api/admin/tasks/targets'):return False
    if not identity:handler.respond(401,{'error':'Sign in to view tasks.'});return True
    try:
        q=parse_qs(parsed.query);search=q.get('q',[''])[0][:120]
        with connect() as db:
            db.execute('BEGIN')
            if route.endswith('/owners'):handler.respond(200,{'owners':owners(db,identity)});return True
            base="e.email_status!='qa-verified'";args=[]
            if identity['role']=='agent':base+=' AND w.owner=?';args=[identity['actor']]
            if route.endswith('/targets'):
                rows=db.execute("SELECT e.id AS reference,e.payload,p.title AS projectTitle FROM enquiries e LEFT JOIN enquiry_workflow w ON w.id=e.id LEFT JOIN client_projects p ON p.reference=e.id WHERE "+base+" AND (e.id LIKE ? OR e.payload LIKE ? OR p.title LIKE ?) ORDER BY e.created DESC,e.id LIMIT 25",args+['%'+search+'%']*3).fetchall()
                targets=[]
                for row in rows:
                    payload=json.loads(row['payload']);item={'reference':row['reference'],'name':payload.get('name','Customer'),'projectTitle':row['projectTitle'],'proposals':[]}
                    item['proposals']=[dict(r) for r in db.execute('SELECT id,title,revision FROM client_proposals WHERE reference=? ORDER BY revision DESC LIMIT 50',(row['reference'],))];targets.append(item)
                handler.respond(200,{'targets':targets,'limit':25});return True
            bucket=q.get('bucket',['open'])[0];mine=q.get('mine',[''])[0];priority=q.get('priority',[''])[0]
            today=datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=5,minutes=30))).date();week=today+datetime.timedelta(days=7)
            buckets={'open':"t.status='Open'",'overdue':"t.status='Open' AND t.due<?",'today':"t.status='Open' AND t.due=?",'upcoming':"t.status='Open' AND t.due>? AND t.due<=?",'completed':"t.status='Completed'",'all':'1=1'}
            try:offset=int(q.get('offset',['0'])[0])
            except ValueError:raise Problem(400,'Invalid page.')
            if bucket not in buckets or mine not in ('','me') or priority not in ('','Low','Normal','High') or not 0<=offset<=1000000:raise Problem(400,'Choose valid task filters.')
            join=' FROM followup_tasks t JOIN enquiries e ON e.id=t.reference LEFT JOIN enquiry_workflow w ON w.id=e.id LEFT JOIN client_projects p ON p.reference=t.reference LEFT JOIN client_proposals cp ON cp.id=t.proposal_id AND cp.reference=t.reference '
            if mine:base+=' AND t.owner=?';args.append(identity['actor'])
            if priority:base+=' AND t.priority=?';args.append(priority)
            def params(key):return [today.isoformat(),week.isoformat()] if key=='upcoming' else [today.isoformat()] if key in ('today','overdue') else []
            counts={key:db.execute('SELECT COUNT(*)'+join+'WHERE '+base+' AND '+clause,args+params(key)).fetchone()[0] for key,clause in buckets.items()}
            where=base+' AND '+buckets[bucket];values=args+params(bucket)
            if search:where+=' AND (t.title LIKE ? OR t.reference LIKE ? OR t.owner LIKE ?)';values+=['%'+search+'%']*3
            total=db.execute('SELECT COUNT(*)'+join+'WHERE '+where,values).fetchone()[0]
            items=[dict(r) for r in db.execute('SELECT t.*,p.title AS projectTitle,cp.title AS proposalTitle,cp.revision AS proposalRevision'+join+'WHERE '+where+" ORDER BY CASE t.status WHEN 'Open' THEN 0 ELSE 1 END,t.due,CASE t.priority WHEN 'High' THEN 0 WHEN 'Normal' THEN 1 ELSE 2 END,t.created,t.id LIMIT 25 OFFSET ?",values+[offset])]
            handler.respond(200,{'items':items,'counts':counts,'total':total,'offset':offset,'limit':25,'today':today.isoformat(),'timezone':'Asia/Kolkata'})
    except Problem as e:handler.respond(e.status,{'error':e.message})
    return True

def post(handler,connect,identity,data):
    if urlsplit(handler.path).path!='/api/admin/tasks':return False
    try:
        from dashboard import valid_follow_up
        key=text(data,'id',80);ref=text(data,'reference',30);kind=text(data,'link_type',20);proposal=text(data,'proposal_id',80,False)
        title=text(data,'title',200);owner=text(data,'owner',254);due=text(data,'due',10);priority=text(data,'priority',10);status=text(data,'status',20);notes=text(data,'notes',2000,False);completion=text(data,'completion',2000,False);version=data.get('version')
        if not 16<=len(key)<=80 or type(version) is not int or version<0 or not valid_follow_up(due) or priority not in ('Low','Normal','High') or status not in ('Open','Completed'):raise Problem(400,'Check the task date, priority, status and version.')
        if status=='Completed' and not completion:raise Problem(400,'Record the follow-up outcome before completing the task.')
        if status=='Open' and completion:raise Problem(400,'Open tasks cannot have a completion outcome.')
        values={'reference':ref,'link_type':kind,'proposal_id':proposal,'title':title,'owner':owner,'due':due,'priority':priority,'status':status,'notes':notes,'completion':completion}
        with connect() as db:
            db.execute('BEGIN IMMEDIATE');old=db.execute('SELECT * FROM followup_tasks WHERE id=?',(key,)).fetchone()
            if old:linked(db,old['reference'],old['link_type'],old['proposal_id'],identity)
            linked(db,ref,kind,proposal,identity)
            if owner not in {o['email'] for o in owners(db,identity)}:raise Problem(400,'Choose an active permitted team member.')
            member=db.execute('SELECT role FROM team_users WHERE email=? AND active=1',(owner,)).fetchone()
            if member and member['role']=='agent' and not db.execute('SELECT 1 FROM enquiry_workflow WHERE id=? AND owner=?',(ref,owner)).fetchone():raise Problem(400,'Assign this enquiry to that agent in the inbox first, or choose another task owner.')
            if old:
                if any(old[k]!=values[k] for k in ('reference','link_type','proposal_id')):raise Problem(400,'A saved task keeps its original link. Create a new task to use another link.')
                if all(old[k]==v for k,v in values.items()):handler.respond(200,{'ok':True,'version':old['version']});return True
                if old['version']!=version:raise Problem(409,'This task changed. Refresh and review it before saving.')
                # Completed records remain immutable; create a new follow-up instead.
                if old['status']=='Completed':raise Problem(409,'Completed tasks are preserved. Create a new follow-up instead.')
                db.execute('UPDATE followup_tasks SET '+','.join(k+'=?' for k in values)+',version=version+1,updated=?,actor=? WHERE id=?',list(values.values())+[int(time.time()),identity['actor'],key]);version+=1
            else:
                if version!=0 or status!='Open':raise Problem(400,'Create a new open task first.')
                db.execute('INSERT INTO followup_tasks(id,'+','.join(values)+',created,updated,actor) VALUES('+','.join('?' for _ in range(len(values)+4))+')',[key]+list(values.values())+[int(time.time()),int(time.time()),identity['actor']])
            action='Task completed' if status=='Completed' else 'Task updated' if old else 'Task created'
            body=action+': '+title+'\nOwner: '+owner+'\nDue: '+due+' (India time)\nPriority: '+priority
            if notes:body+='\nNotes: '+notes
            if completion:body+='\nOutcome: '+completion
            if old and status=='Open':body+='\nPrevious owner: '+old['owner']+'; previous due: '+old['due']+'; previous priority: '+old['priority']
            db.execute('INSERT INTO lead_activity VALUES(?,?,?,?,?,?)',(secrets.token_hex(16),ref,int(time.time()),identity['actor'],'task',body))
        handler.respond(200,{'ok':True,'version':version})
    except Problem as e:handler.respond(e.status,{'error':e.message})
    return True
