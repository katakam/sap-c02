/* The integration movie: an auto-playing, looping, narrated film. No clicks needed. */
(function(){
'use strict';
var NS='http://www.w3.org/2000/svg';
function S(t,a,p,x){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(x!=null)e.textContent=x;if(p)p.appendChild(e);return e}
function cl(x){return x<0?0:x>1?1:x}
function ramp(u,a,b){return cl((u-a)/(b-a))}
function ez(x){return x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2}
var K={teal:['var(--accent-soft)','var(--accent)'],amber:['var(--amber-bg)','var(--amber)'],coral:['var(--coral-bg)','var(--coral)'],indigo:['var(--indigo-bg)','var(--indigo)'],gray:['var(--gray-bg)','var(--gray)']};
var INK={teal:'var(--accent)',amber:'var(--amber)',coral:'var(--coral)',indigo:'var(--indigo)',gray:'var(--muted)'};

function Ctx(g){
  var it=[],c={};
  c.upd=function(u){for(var i=0;i<it.length;i++)it[i](u)};
  c.fn=function(f){it.push(f)};
  c.show=function(n,a,b){b=b||a+.07;n.style.opacity=0;it.push(function(u){var r=ez(ramp(u,a,b));n.style.opacity=r;n.style.transform='translateY('+((1-r)*10)+'px)'});return n};
  c.txt=function(x,y,s,sz,o){o=o||{};var t=S('text',{x:x,y:y,'text-anchor':o.an||'middle','font-size':Math.max(sz||16,14),'font-weight':o.w||400,'font-family':o.mono?'var(--f-mono)':(o.d?'var(--f-display)':'var(--f-body)')},g,s);t.style.fill=o.fill||'var(--ink)';if(o.a!=null)c.show(t,o.a);return t};
  c.box=function(x,y,w,h,k,ti,su,a){var gr=S('g',{},g),r=S('rect',{x:x,y:y,width:w,height:h,rx:12},gr);r.style.fill=K[k][0];r.style.stroke=K[k][1];r.style.strokeWidth=2;
    var t=S('text',{x:x+w/2,y:su?y+h/2-3:(h>100?y+30:y+h/2+6),'text-anchor':'middle','font-size':18,'font-weight':700,'font-family':'var(--f-display)'},gr,ti);t.style.fill='var(--ink)';
    if(su){var s=S('text',{x:x+w/2,y:y+h/2+17,'text-anchor':'middle','font-size':15,'font-family':'var(--f-body)'},gr,su);s.style.fill='var(--muted)'}
    if(a!=null)c.show(gr,a);gr.rect=r;return gr};
  c.line=function(x1,y1,x2,y2,a,b,k){b=b||a+.08;var L=Math.hypot(x2-x1,y2-y1),p=S('path',{d:'M'+x1+' '+y1+'L'+x2+' '+y2,'stroke-width':3,fill:'none','stroke-linecap':'round'},g),ang=Math.atan2(y2-y1,x2-x1)*180/Math.PI,hd=S('polygon',{points:'0,0 -11,-6 -11,6',transform:'translate('+x2+','+y2+') rotate('+ang+')'},g);
    p.style.stroke=hd.style.fill=INK[k||'gray'];p.setAttribute('stroke-dasharray',L);p.style.strokeDashoffset=L;hd.style.opacity=0;
    it.push(function(u){var r=ramp(u,a,b);p.style.strokeDashoffset=L*(1-r);hd.style.opacity=r>.97?1:0});return p};
  c.type=function(x,y,s,sz,a,b,o){o=o||{};o.mono=1;o.an=o.an||'start';var t=c.txt(x,y,'',sz,o);it.push(function(u){t.textContent=s.slice(0,Math.round(s.length*ramp(u,a,b)))});return t};
  c.pulse=function(n,a,b){it.push(function(u){var r=ramp(u,a,b);n.rect.style.strokeWidth=(r>0&&r<1)?2+4*Math.abs(Math.sin(r*Math.PI*3)):2})};
  c.cyl=function(cx,cy,w,h,k,label,a){var gr=S('g',{},g),e2=S('ellipse',{cx:cx,cy:cy+h/2,rx:w/2,ry:14},gr),rc=S('rect',{x:cx-w/2,y:cy-h/2,width:w,height:h},gr),e1=S('ellipse',{cx:cx,cy:cy-h/2,rx:w/2,ry:14},gr);
    [e1,e2,rc].forEach(function(e){e.style.fill=K[k][0];e.style.stroke=K[k][1];e.style.strokeWidth=2});var t=S('text',{x:cx,y:cy+6,'text-anchor':'middle','font-size':19,'font-weight':700,'font-family':'var(--f-display)'},gr,label);t.style.fill='var(--ink)';if(a!=null)c.show(gr,a);return gr};
  c.icon=function(x,y,ch,sz,a){var t=S('text',{x:x,y:y,'text-anchor':'middle','font-size':sz||34},g,ch);if(a!=null)c.show(t,a);return t};
  return c;
}
function seg(pts,r){var n=pts.length-1,f=cl(r)*n,i=Math.min(n-1,Math.floor(f)),k=f-i;return [pts[i][0]+(pts[i+1][0]-pts[i][0])*k,pts[i][1]+(pts[i+1][1]-pts[i][1])*k]}

var FILMS={};
FILMS.integration=[
{t:"The big picture",tr:"the plan",s:"Think of a Mumbai dabbawala. Lunch leaves the kitchen, gets sorted, packed, labelled, and carried by train to the office. A Workday integration is the same run. Data leaves Workday, becomes a report, gets packed, reshaped, named, and delivered. Let's ride along.",
 rem:[["Outbound = data leaves Workday","teal"],["Inbound = data comes in","gray"]],
 build:function(c){
  c.txt(300,28,"An integration is a lunch-box run",22,{w:700,d:1,a:.02});
  var B=[[20,54,'teal',"Data in Workday","the home kitchen",.08],[215,54,'teal',"Custom report","sorting the food",.18],[410,54,'indigo',"Integration","packing the tiffin",.28],[410,170,'amber',"Transform","the dish they like",.42],[215,170,'amber',"File name","label on the lid",.54],[20,170,'coral',"SFTP delivery","train to the office",.66]];
  B.forEach(function(b){c.box(b[0],b[1],170,64,b[2],b[3],b[4],b[5])});
  c.line(190,86,215,86,.14,.18);c.line(385,86,410,86,.24,.28);c.line(495,118,495,170,.36,.42);c.line(410,202,385,202,.5,.54);c.line(215,202,190,202,.62,.66);
  var p=c.icon(0,0,"📦",34);var path=[[105,92],[300,92],[495,92],[495,208],[300,208],[105,208]];
  c.fn(function(u){var q=seg(path,ramp(u,.1,.9));p.setAttribute('transform','translate('+q[0]+','+(q[1]-34)+')');p.style.opacity=u>.06?1:0});
  c.txt(300,282,"Outbound: Workday to vendor. Inbound is the same road in reverse.",16,{fill:'var(--muted)',a:.8});
 }},
{t:"The kitchen: business objects",tr:"records",s:"First, the kitchen. Workday keeps everything as business objects: worker, position, organization. Every object has IDs, and a robot can only find an object by its ID, never by its name. The Workday ID is long and different in every tenant. A Reference ID is a type plus a value, and travels between tenants.",
 rem:[["Business object","teal"],["Workday ID (WID)","gray"],["Reference ID","indigo"],["External ID","amber"]],
 build:function(c){
  var g=c.g,cy=S('g',{},g),e2=S('ellipse',{cx:90,cy:150,rx:62,ry:16},cy),rc=S('rect',{x:28,y:70,width:124,height:80},cy),e1=S('ellipse',{cx:90,cy:70,rx:62,ry:16},cy);
  [e1,e2,rc].forEach(function(e){e.style.fill=K.teal[0];e.style.stroke=K.teal[1];e.style.strokeWidth=2});c.show(cy,.03);
  c.txt(90,118,"Workday",20,{w:700,d:1,a:.05});
  [[18,"Worker"],[86,"Position"],[154,"Organization"]].forEach(function(b,i){c.box(240,b[0],170,50,'teal',b[1],null,.12+i*.07);c.line(152,110,240,b[0]+25,.14+i*.07,.2+i*.07)});
  var wk=c.box(240,18,170,50,'teal',"Worker",null,.12);c.pulse(wk,.45,.7);
  c.icon(438,52,"🔍",30,.45);c.txt(458,58,"Vendor needs it",15,{an:'start',fill:'var(--muted)',a:.48});
  c.box(10,232,180,58,'gray',"Workday ID","long, unique, auto",.6);c.box(210,232,180,58,'indigo',"Reference ID","type + value",.7);c.box(410,232,180,58,'amber',"External ID","system + value",.8);
 }},
{t:"Sorting: custom report and RaaS",tr:"report rows",s:"Next, sorting. You build a custom report with only the columns the vendor wants. Give every column an XML alias, because the outside world reads tags, not column titles. Then switch on Enable as Web Service. Now your report is a service. That is RaaS: report as a service.",
 rem:[["Custom report","teal"],["XML alias","indigo"],["RaaS","amber"],["Advanced or Search report only","gray"]],
 build:function(c){
  [[20,"Employee ID"],[215,"Name"],[410,"Hire date"]].forEach(function(b,i){c.box(b[0],10,170,40,'gray',b[1],null,.04+i*.04)});
  [[20,"<Employee_ID>"],[215,"<Name>"],[410,"<Hire_Date>"]].forEach(function(b,i){var x=c.box(b[0],64,170,36,'indigo',b[1],null,.22+i*.06)});
  c.txt(300,118,"XML alias on every column (example names)",14,{fill:'var(--muted)',a:.3});
  c.txt(20,152,"Enable as Web Service",18,{an:'start',w:700,a:.45});
  var tr=S('rect',{x:250,y:132,width:64,height:30,rx:15},c.g),kn=S('circle',{cx:266,cy:147,r:11},c.g);kn.style.fill='#fff';tr.style.stroke='var(--accent)';tr.style.strokeWidth=2;c.show(tr,.45);c.show(kn,.45);
  c.fn(function(u){var r=ez(ramp(u,.52,.62));tr.style.fill=r>.5?'var(--accent)':'var(--gray-bg)';kn.setAttribute('cx',266+32*r)});
  c.txt(300,196,"Related action: View URLs shows",15,{fill:'var(--muted)',a:.64});
  [[10,"Workday XML"],[160,"XSD"],[310,"WSDL"],[455,"Other formats"]].forEach(function(b,i){c.box(b[0],206,135,40,'teal',b[1],null,.68+i*.05)});
  c.box(180,260,240,38,'amber',"Max response: 2 GB",null,.9);
 }},
{t:"Packing: choose the tool",tr:"tool + robot",s:"Now choose how to pack it. EIB is the simple tiffin: one source, one destination, no fancy logic. A Core Connector is the ready-made steel tiffin, with change detection built in. Studio is a custom kitchen for complex jobs. Whichever you choose, it runs as an integration system user, a robot with only the permissions it needs.",
 rem:[["EIB","gray"],["Core Connector","teal"],["Workday Studio","indigo"],["ISU = Integration System User","coral"],["Get / Put access","amber"]],
 build:function(c){
  c.box(10,12,180,64,'gray',"EIB","simple",.05);c.txt(100,100,"1 source, 1 endpoint",14,{fill:'var(--muted)',a:.1});
  var cc=c.box(210,12,180,64,'teal',"Core Connector","ready-made",.15);c.txt(300,100,"change detection built in",14,{fill:'var(--muted)',a:.2});c.pulse(cc,.4,.62);
  c.box(410,12,180,64,'indigo',"Studio","fully custom",.25);c.txt(500,100,"complex, many files",14,{fill:'var(--muted)',a:.3});
  c.line(300,112,300,160,.5,.58,'teal');
  c.icon(110,214,"🤖",40,.58);
  c.box(150,166,300,64,'coral',"Integration System User","a robot account, not a person",.58);
  c.txt(300,268,"Its security group gives Get / Put access",16,{fill:'var(--muted)',a:.78});
 }},
{t:"Launch: the recipe card",tr:"running",s:"Time to launch. Run it now, or schedule it. Workday follows a recipe card called the integration process event. Step one, initiation. Step two, fire the integration. Then, if you want, transformation. Finally, document delivery. When it finishes, a notification can tell you.",
 rem:[["Launch / Schedule","teal"],["Integration Process Event","indigo"],["Fire Integration","amber"],["Document Delivery","coral"]],
 build:function(c){
  c.icon(40,52,"⏰",34,.04);c.txt(70,58,"Run now, or schedule it",18,{an:'start',w:700,a:.06});
  c.txt(300,98,"Integration Process Event: the recipe card",17,{w:700,fill:'var(--accent)',a:.18});
  var X=[10,160,310,455],B=[['teal',"1 Initiation","starts it"],['indigo',"2 Fire","Fire Integration"],['amber',"3 Transform","optional"],['coral',"4 Delivery","sends the file"]],bx=[];
  B.forEach(function(b,i){bx.push(c.box(X[i],112,135,70,b[0],b[1],b[2],.2+i*.07))});
  [145,295,445].forEach(function(x,i){c.line(x,147,x+15,147,.3+i*.07,.34+i*.07)});
  var p=c.icon(0,0,"📦",30);var ctr=[[77,100],[227,100],[377,100],[522,100]];
  c.fn(function(u){var r=ramp(u,.3,.88),a=Math.min(3,Math.floor(r*4));bx.forEach(function(b,i){b.rect.style.strokeWidth=(u>.3&&i===a)?6:2});var q=seg(ctr,r);p.setAttribute('transform','translate('+q[0]+','+(q[1]-68)+')');p.style.opacity=u>.28?1:0});
  c.icon(40,246,"🔔",32,.82);c.txt(70,252,"A notification tells people the status",17,{an:'start',a:.84});
 }},
{t:"Change detection and the XML file",tr:"XML file",s:"Here is the clever part. A Core Connector watches the transaction log, like a diary of everything that changed. It compares this run with the last successful run, and writes only what changed. Want everything instead? Turn on full file. The result is a plain XML file in Workday's own format.",
 rem:[["Transaction log","gray"],["Last successful run","indigo"],["Full file","amber"],["Worker eligibility (true/false)","teal"]],
 build:function(c){
  c.box(10,14,175,150,'gray',"Transaction log",null,.04);["Hire","Change Job","Email changed"].forEach(function(s,i){c.txt(26,86+i*28,"• "+s,16,{an:'start',a:.1+i*.06})});
  c.line(185,89,213,89,.26,.3);
  c.box(215,14,170,150,'indigo',"Compare",null,.28);c.txt(300,80,"this run",16,{a:.34});c.txt(300,104,"versus",14,{fill:'var(--muted)',a:.38});c.txt(300,128,"last good run",16,{a:.42});c.txt(300,150,"= changes only",14,{fill:'var(--indigo)',w:700,a:.48});
  c.line(385,89,413,89,.5,.54);
  c.box(415,14,175,150,'teal',"worker.xml",null,.52);c.type(428,84,"<Worker>",14,.58,.64);c.type(428,106,"<Employee_ID>E9001",13,.64,.74);c.type(428,128,"</Worker>",14,.74,.8);
  c.box(30,192,250,46,'teal',"Changed file (default)",null,.82);c.box(320,192,250,46,'amber',"Full file (everything)",null,.86);
  c.txt(300,272,"One true/false field decides who is in",16,{fill:'var(--muted)',a:.9});
 }},
{t:"Re-shaping: Document Transformation",tr:"CSV file",s:"The vendor rarely wants Workday's XML. So we add a Document Transformation. An XSLT file is the recipe that turns XML into CSV, fixed length, or other formats. Special Workday helpers, called ETV and XTT, handle dates, padding and truncation. And remember, Workday will not check your XSLT for mistakes. You must test it.",
 rem:[["XSLT","indigo"],["ETV","amber"],["XTT","amber"],["Document tag","teal"],["Workday does not validate XSLT","coral"]],
 build:function(c){
  c.box(10,20,200,130,'gray',"XML",null,.04);c.type(22,76,"<Name>Priya</Name>",13,.1,.28);c.type(22,100,"<Hire>2024-01-15</Hire>",13,.28,.46);
  c.line(210,85,255,85,.4,.46);
  var gear=c.icon(0,0,"⚙️",56);c.fn(function(u){var r=u>.42?(u*900):0;gear.setAttribute('transform','translate(300,102) rotate('+r+' 0 -20)');gear.style.opacity=u>.38?1:0});
  c.txt(300,140,"XSLT",16,{w:700,fill:'var(--indigo)',a:.42});
  c.line(345,85,390,85,.5,.56);
  c.box(390,20,200,130,'teal',"CSV",null,.52);c.type(402,76,"id,name,hire",13,.58,.68);c.type(402,100,"E9001,PRIYA,15-01-2024",12,.68,.88);
  [[10,"XSLT",'indigo'],[160,"ETV",'amber'],[310,"XTT",'amber'],[455,"Document tag",'teal']].forEach(function(b,i){c.box(b[0],184,135,44,b[2],b[1],null,.72+i*.05)});
  c.txt(300,268,"Workday does not check your XSLT. Test it.",17,{w:700,fill:'var(--coral)',a:.92});
 }},
{t:"The label: file name sequence",tr:"named file",s:"Now the label on the lid. A sequence generator builds a new file name every run: a fixed word, the date, and a counter that goes up by one. Pad it with zeros. Once a sequence generator exists, Workday ignores the plain output filename. No more overwritten files.",
 rem:[["Sequence generator","indigo"],["Padding with 0","gray"],["Restart every...","amber"],["Ignores static filename","coral"]],
 build:function(c){
  var P=[[20,"HCM_Workers_",'var(--muted)',"fixed word",128],[236,"20261108",'var(--amber)',"date",308],[380,"_001",'var(--indigo)',"counter",416],[452,".csv",'var(--accent)',"extension",488]];
  P.forEach(function(p,i){var a=.08+i*.14;c.type(p[0],110,p[1],30,a,a+.1,{fill:p[2],w:700});c.txt(p[4],140,p[3],14,{fill:'var(--muted)',a:a+.1})});
  c.txt(300,184,"next run",16,{fill:'var(--muted)',a:.68});
  c.txt(20,224,"HCM_Workers_",30,{an:'start',mono:1,fill:'var(--muted)',w:700,a:.7});c.txt(236,224,"20261109",30,{an:'start',mono:1,fill:'var(--amber)',w:700,a:.7});c.txt(380,224,"_002",30,{an:'start',mono:1,fill:'var(--indigo)',w:700,a:.74});c.txt(452,224,".csv",30,{an:'start',mono:1,fill:'var(--accent)',w:700,a:.7});
  c.txt(300,272,"Padding with 0:  1  becomes  001",16,{fill:'var(--muted)',a:.88});
 }},
{t:"The train: SFTP delivery",tr:"sent",s:"Now the train. Document Delivery sends the file to an SFTP server both sides can reach. You enter the address, the folder, and how to log in. If the vendor needs it, lock the file first with PGP. Use Test Transport: connect, list files, deliver a test file, before you trust it.",
 rem:[["SFTP","indigo"],["Document Delivery step","coral"],["PGP","amber"],["Test Transport","teal"],["Output document tag","gray"]],
 build:function(c){
  c.icon(40,98,"📄",40,.04);c.icon(130,98,"🔒",34,.14);c.txt(130,124,"PGP, if needed",13,{fill:'var(--muted)',a:.16});
  c.line(170,86,230,86,.2,.26);
  c.box(232,30,170,100,'indigo',"SFTP server","shared folder",.24);
  c.line(402,80,436,80,.34,.4);
  c.box(438,30,152,100,'teal',"Vendor","picks it up",.38);
  c.box(10,160,285,130,'gray',"Transport settings",null,.5);
  c.txt(24,218,"Address: vendor SFTP host",14,{an:'start',a:.56});c.txt(24,242,"Directory: /inbound/",14,{an:'start',a:.62});c.txt(24,266,"Login: user ID + password",14,{an:'start',a:.68});
  c.box(315,160,275,36,'teal',"✓ Connect",null,.7);c.box(315,204,275,36,'teal',"✓ List Files",null,.78);c.box(315,248,275,36,'teal',"✓ Deliver File",null,.86);
 }},
{t:"Receipt: monitor and notify",tr:"checked",s:"When the run finishes, check three things. The background process says Completed. The audit files tell you what happened, including a diagnostic file for errors. And notifications reach the right people. But remember, completed does not mean delivered. Check both.",
 rem:[["Integration event","teal"],["Audit files","gray"],["Notifications","indigo"],["Completed is not delivered","coral"]],
 build:function(c){
  c.box(10,14,280,66,'teal',"Background process","Status: Completed",.04);
  c.box(10,96,280,70,'indigo',"Notification","email or inbox, with a link",.5);
  [["Data changes audit",'gray'],["Diagnostic audit",'coral'],["Schema XSD",'gray'],["Messages audit (zip)",'gray']].forEach(function(b,i){c.box(312,14+i*44,278,38,b[1],b[0],null,.16+i*.08)});
  c.box(10,200,580,76,'amber',"Completed is not delivered","Also check the SFTP folder and the vendor's receipt",.78);
 }},
{t:"Inbound: the same road, backwards",tr:"inbound",s:"Inbound is the same road, backwards. Retrieve the file from SFTP, transform it if needed, then hand it to a Workday web service that loads the data. The file must match what the web service expects, or the transformation fixes it first.",
 rem:[["Document Retrieval","coral"],["Web service operation","indigo"],["Inbound = retrieve, transform, load","teal"]],
 build:function(c){
  c.txt(300,28,"Same road, opposite direction",20,{w:700,d:1,a:.03});
  var X=[10,160,310,455],B=[['coral',"Vendor file","on SFTP"],['amber',"Transform","if needed"],['indigo',"Web service","the loader"],['teal',"Workday","data loaded"]];
  B.forEach(function(b,i){c.box(X[i],86,135,70,b[0],b[1],b[2],.1+i*.1)});
  [145,295,445].forEach(function(x,i){c.line(x,121,x+15,121,.2+i*.1,.25+i*.1)});
  var p=c.icon(0,0,"📦",30),ctr=[[77,80],[227,80],[377,80],[522,80]];
  c.fn(function(u){var q=seg(ctr,ramp(u,.15,.85));p.setAttribute('transform','translate('+q[0]+','+(q[1]-22)+')');p.style.opacity=u>.12?1:0});
  c.txt(300,214,"The file must look like the web service request,",16,{fill:'var(--muted)',a:.8});c.txt(300,238,"or the transformation fixes it first.",16,{fill:'var(--muted)',a:.84});
 }},
{t:"Recap",tr:"done",s:"That's the whole journey. Business objects, report, integration system, launch, change detection, transformation, file name, delivery, and monitoring. Remember the stickers, and you can explain any integration out loud. Press play again, or go test yourself in the quiz.",
 rem:[["Now try the Quiz","teal"]],
 build:function(c){
  var T=["Business objects","Custom report","Integration tool","Launch + events","Change detection","Transformation","File name","SFTP delivery","Audit + notify"],K2=['teal','teal','indigo','indigo','amber','amber','amber','coral','gray'];
  T.forEach(function(t,i){c.box(10+(i%3)*195,14+Math.floor(i/3)*72,185,58,K2[i],(i+1)+". "+t,null,.05+i*.08)});
  c.txt(300,266,"Now test yourself in the Quiz",20,{w:700,fill:'var(--accent)',a:.9});
 }}
];

FILMS.refresh=[
{t:"What a refresh does",tr:"Production",s:"Imagine photocopying a whole shop into a practice shop, including the phone numbers on the speed dial. That is a sandbox refresh. Production is copied into the sandbox, and your integrations come along, including where they deliver.",
 rem:[["Tenant refresh","teal"],["Production","coral"],["Sandbox","amber"]],
 build:function(c){
  c.txt(300,24,"A refresh copies Production into the sandbox",20,{w:700,d:1,a:.02});
  c.cyl(80,150,120,90,'coral',"Production",.06);c.cyl(520,150,120,90,'amber',"Sandbox",.12);
  c.line(150,150,450,150,.2,.3,'gray');
  ["data","settings","integrations"].forEach(function(t,i){var b=c.box(150+i*125,50,116,34,'gray',t,null,.34+i*.1)});
  c.txt(300,232,"Integrations come along: endpoints, schedules, notifications",17,{fill:'var(--muted)',a:.7});
  c.txt(300,266,"Workday also offers Sandbox Preview tenants",15,{fill:'var(--muted)',a:.82});
 }},
{t:"The danger",tr:"risk",s:"Here is the danger. If the sandbox still points to the real vendor, a test run sends test files to a real server. And if notifications still go to real people, they get test emails. Same settings as Production means real people see test data.",
 rem:[["Integration endpoint","coral"],["Scheduled processes","amber"],["Notifications","indigo"]],
 build:function(c){
  c.box(10,110,150,70,'amber',"Sandbox","a test run",.05);c.icon(85,96,"⚠️",34,.3);
  c.line(160,135,262,68,.2,.34,'coral');c.line(160,155,262,222,.34,.48,'coral');
  c.box(266,34,170,64,'coral',"Real vendor SFTP","gets a test file",.3);c.box(266,192,170,64,'coral',"Real employees","get test emails",.46);
  c.txt(300,282,"Same settings as Production = real people see test data",16,{fill:'var(--coral)',w:700,a:.7});
 }},
{t:"Fix 1: the endpoint",tr:"endpoint",s:"Fix one. After every refresh, open the delivery step and change the endpoint to a test server. The guide says to change integration endpoints in the refreshed tenant. Then use Test Transport with the small test file. Connect, list files, deliver.",
 rem:[["Change endpoint after refresh","coral"],["Document Delivery step","indigo"],["Test Transport","teal"]],
 build:function(c){
  c.box(10,24,300,170,'gray',"Document Delivery step",null,.04);
  var a1=c.txt(26,92,"Address: vendor PRODUCTION host",15,{an:'start',fill:'var(--coral)',a:.08}),a2=c.txt(26,92,"Address: vendor TEST host",15,{an:'start',fill:'var(--accent)',w:700});
  c.fn(function(u){var r=ramp(u,.35,.5);a1.style.opacity=u<.08?0:1-r;a2.style.opacity=r});
  c.txt(26,124,"Directory: test folder",15,{an:'start',a:.14});c.txt(26,156,"Login: test account",15,{an:'start',a:.2});
  c.box(330,24,260,40,'teal',"1 Connect",null,.5);c.box(330,74,260,40,'teal',"2 List Files",null,.6);c.box(330,124,260,40,'teal',"3 Deliver File (10 KB test)",null,.7);
  c.txt(300,244,"Never test with a real full file on the real address",16,{fill:'var(--muted)',a:.82});
 }},
{t:"Fix 2: scheduled runs",tr:"schedules",s:"Fix two. Scheduled runs come across too. A nightly integration will fire in the sandbox at the same time as Production. Use Edit Environment Restrictions on the scheduled process, so it runs only in the environment you choose. There is even a Preview Only box.",
 rem:[["Scheduled process","amber"],["Edit Environment Restrictions","indigo"],["Preview Only","gray"]],
 build:function(c){
  c.icon(40,52,"⏰",34,.04);c.txt(70,58,"Scheduled runs copied from Production",18,{an:'start',w:700,a:.06});
  [["Daily 02:10  worker file",.14],["Weekly  payroll file",.24],["Monthly  benefits file",.34]].forEach(function(r,i){c.box(10,84+i*54,360,44,'gray',r[0],null,r[1])});
  [0,1,2].forEach(function(i){c.box(390,84+i*54,200,44,'indigo',"Production only",null,.5+i*.1)});
  c.txt(300,262,"Related action: Edit Environment Restrictions",16,{w:700,fill:'var(--indigo)',a:.84});
 }},
{t:"Fix 3: notifications",tr:"emails",s:"Fix three. Notifications. Add an email restriction to disable them, or to redirect them to a test mailbox. One warning from the guide: do this when nothing is running, or a message can slip out to the real person. A neat trick is to set the restriction in Production, then refresh.",
 rem:[["Disable or redirect email","indigo"],["Nothing running when you change it","coral"]],
 build:function(c){
  c.icon(50,70,"✉️",40,.04);c.txt(90,76,"Email restriction",20,{an:'start',w:700,a:.06});
  c.box(10,110,270,60,'indigo',"Disable","no emails at all",.2);c.box(310,110,280,60,'teal',"Redirect","to a test mailbox",.3);
  c.txt(300,214,"Change it when nothing is running",18,{w:700,fill:'var(--coral)',a:.55});
  c.txt(300,246,"Tip: set the restriction in Production, then refresh",15,{fill:'var(--muted)',a:.75});
 }},
{t:"Fix 4: credentials and IDs",tr:"logins",s:"Fix four. Logins and IDs. Workday does not let Production credentials work in the sandbox. The guide says this for eSignature, so reconfigure after each refresh, and check your own integration logins too. And IDs: a Workday ID is the same in Sandbox as Production, but different in other tenants. Use Reference IDs, and your integration travels well.",
 rem:[["Reconfigure credentials","coral"],["WID vs Reference ID","indigo"],["Reference ID travels","teal"]],
 build:function(c){
  c.icon(40,60,"🔑",34,.04);c.box(70,34,240,56,'coral',"Credentials","re-enter after refresh",.06);
  c.txt(20,118,"Guide names eSignature. Check yours too.",14,{an:'start',fill:'var(--muted)',a:.3});
  c.box(330,34,260,56,'gray',"WID","differs in other tenants",.45);
  c.box(330,110,260,56,'teal',"Reference ID","same in every tenant",.6);
  c.txt(300,224,"Use Reference IDs in integrations",18,{w:700,fill:'var(--accent)',a:.8});
 }},
{t:"Fix 5: last run and counters",tr:"state",s:"Fix five. A Core Connector compares this run with the last successful run, and the file name counter keeps counting. After a refresh, check those launch defaults before the first run. If you are unsure, run a full file once as a clean baseline, and look at the sequence number.",
 rem:[["Last successful run","indigo"],["Full File baseline","amber"],["Sequence generator","gray"]],
 build:function(c){
  c.box(10,20,280,70,'indigo',"Last successful run","the launch default date",.05);
  c.box(310,20,280,70,'gray',"File name counter","_001, _002, ...",.15);
  c.txt(300,128,"Check both before the first run",18,{w:700,a:.4});
  c.box(10,156,280,56,'amber',"Run Full File once","a clean baseline",.55);
  c.txt(300,252,"Confirm the defaults in your own tenant",15,{fill:'var(--muted)',a:.8});
 }},
{t:"Before the refresh: save your work",tr:"save",s:"One more thing. A refresh overwrites the sandbox. So before it happens, save the work you built there. The guide suggests a configuration package in Configuration Change Tracker, extract it, and reload it into the refreshed tenant afterwards.",
 rem:[["Configuration Change Tracker","indigo"],["Configuration Extract","teal"]],
 build:function(c){
  c.box(10,90,170,76,'indigo',"1 Save","package + extract",.06);c.box(215,90,170,76,'coral',"2 Refresh","sandbox overwritten",.3);c.box(420,90,170,76,'teal',"3 Reload","package back in",.54);
  c.line(180,128,215,128,.2,.28);c.line(385,128,420,128,.44,.52);
  c.txt(300,226,"Work done only in the sandbox is lost without this",16,{fill:'var(--coral)',w:700,a:.8});
 }},
{t:"After-refresh checklist",tr:"done",s:"So after every refresh, run the checklist. Endpoints. Scheduled runs. Notifications. Credentials. Reference IDs. Last run and counters. And before the refresh, save your work. Do these, and no real vendor ever gets a test file.",
 rem:[["Safe sandbox","teal"]],
 build:function(c){
  ["1. Change endpoints","2. Restrict scheduled runs","3. Disable or redirect emails","4. Reconfigure credentials","5. Use Reference IDs","6. Check last run + counters"].forEach(function(t,i){c.box(10+(i%2)*300,16+Math.floor(i/2)*66,280,54,['coral','indigo','indigo','coral','teal','amber'][i],t,null,.05+i*.1)});
  c.txt(300,244,"Before the refresh: save your work",17,{w:700,fill:'var(--accent)',a:.8});
 }}
];

FILMS.xslt=[
{t:"Why we need a translator",tr:"XML in",s:"Workday speaks XML. Your vendor reads CSV. It is like a Hindi speaker and a Tamil speaker who need someone in the middle. That translator is called XSLT, and its rule book is called a stylesheet.",
 rem:[["XML","teal"],["XSLT = the translator","indigo"],["Stylesheet = the rule book","amber"]],
 build:function(c){
  c.box(10,40,170,100,'teal',"Workday XML","tags and tree",.05);
  c.box(215,40,170,100,'indigo',"XSLT","rule book",.3);
  c.box(420,40,170,100,'amber',"Vendor CSV","commas and rows",.55);
  c.line(180,90,215,90,.2,.28);c.line(385,90,420,90,.45,.53);
  c.icon(300,34,"🗣️",30,.3);
  c.txt(300,200,"Same facts. Different shape.",20,{w:700,d:1,a:.7});
  c.txt(300,240,"Hindi speaker  +  translator  +  Tamil speaker",16,{fill:'var(--muted)',a:.8});
 }},
{t:"XML is a family tree",tr:"the tree",s:"First, understand the input. XML is a family tree. At the top is the root. Under it, one entry for each worker. Under each entry, the fields: employee ID, name, hire date. And an XPath is just the address of a field in that tree.",
 rem:[["Element","teal"],["Parent and child","gray"],["XPath = the address","indigo"],["Namespace prefix wd:","amber"]],
 build:function(c){
  c.box(210,8,180,40,'teal',"Report_Data","the root",.04);c.box(210,78,180,40,'indigo',"Report_Entry","one per worker",.14);
  c.line(300,48,300,78,.1,.14);
  [[10,"Employee_ID","E9001"],[215,"Legal_Name","Priya Nair"],[420,"Hire_Date","2024-01-15"]].forEach(function(b,i){c.box(b[0],146,170,56,'gray',b[1],b[2],.26+i*.08);c.line(300,118,b[0]+85,146,.22+i*.08,.28+i*.08)});
  c.txt(300,236,"XPath:",15,{fill:'var(--muted)',a:.6});c.type(240,262,"Report_Entry/Legal_Name",18,.62,.82,{fill:'var(--indigo)',w:700,an:'middle'});
  c.txt(300,286,"(the wd: prefix is hidden here to keep it simple)",13,{fill:'var(--muted)',a:.86});
 }},
{t:"XSLT is a rule book",tr:"the rules",s:"Now the rule book. Every rule says, when you see this, do that. When you see a report entry, write one line. Pick the name. Write a comma. That's all. A few small instructions, repeated.",
 rem:[["xsl:template match","indigo"],["xsl:for-each","amber"],["xsl:value-of","teal"],["xsl:text","gray"]],
 build:function(c){
  c.txt(300,26,"Each rule: when you see THIS, do THAT",20,{w:700,d:1,a:.03});
  [["WHEN you see Report_Entry","WRITE one line",'xsl:template / for-each',.12],["PICK the Legal_Name","COPY its value",'xsl:value-of',.34],["WRITE a comma","between the values",'xsl:text',.56]].forEach(function(r,i){var y=54+i*72;c.box(10,y,250,56,'gray',r[0],null,r[3]);c.line(260,y+28,330,y+28,r[3]+.04,r[3]+.1,'indigo');c.box(330,y,260,56,'teal',r[1],r[2],r[3]+.06)});
  c.txt(300,282,"Just a few small instructions, repeated for every entry",16,{fill:'var(--muted)',a:.82});
 }},
{t:"Watch it work: XML to CSV",tr:"CSV file",s:"Watch it work. The engine reads the first entry. It picks the employee ID, writes a comma, picks the name, writes a comma, picks the date, and ends the line. Then the same rules run for the next entry, and the next. Three entries, three lines, plus a header on top.",
 rem:[["for-each repeats the rules","amber"],["value-of picks a value","teal"],["Header line","gray"]],
 build:function(c){
  c.box(10,10,250,150,'gray',"Workday XML",null,.04);
  ["<Report_Entry>","  <Employee_ID>E9001","  <Legal_Name>Priya Nair","  <Hire_Date>2024-01-15","</Report_Entry>"].forEach(function(l,i){c.txt(22,68+i*20,l,13,{an:'start',mono:1,a:.08+i*.03})});
  var gear=c.icon(300,86,"⚙️",44,.2),cn=c.txt(300,128,"",14,{fill:'var(--amber)',w:700});
  c.fn(function(u){gear.style.transformOrigin='300px 76px';cn.textContent=u<.3?'':(u<.5?1:u<.7?2:3)+' of 3'});
  c.box(340,10,250,150,'teal',"CSV",null,.3);
  c.type(352,68,"Employee ID,Name,Hire Date",12,.32,.4,{});c.type(352,90,"E9001,Priya Nair,2024-01-15",12,.42,.52,{});c.type(352,112,"E9002,Arun Menon,2023-06-01",12,.56,.66,{});c.type(352,134,"E9003,Meera Iyer,2025-03-10",12,.7,.8,{});
  c.txt(300,200,"value-of picks a value.  text writes a comma.",17,{w:700,a:.55});
  c.txt(300,232,"for-each repeats the same rules for every entry.",16,{fill:'var(--muted)',a:.66});
  c.txt(300,266,"A header line goes in before the for-each.",16,{fill:'var(--muted)',a:.78});
 }},
{t:"Text out, or XML out",tr:"output choice",s:"One setting decides the shape of the result. Output method text gives you plain text, like CSV, with no tags left. Output method xml gives you another XML, shaped the way the next system likes it.",
 rem:[["xsl:output method=text","teal"],["xsl:output method=xml","indigo"]],
 build:function(c){
  c.box(10,24,280,60,'teal','method="text"',"plain text, CSV, pipe file",.05);c.box(310,24,280,60,'indigo','method="xml"',"another XML",.15);
  c.box(10,106,280,114,'gray',"Result",null,.35);c.txt(24,156,"E9001,Priya Nair",14,{an:'start',mono:1,a:.38});c.txt(24,180,"E9002,Arun Menon",14,{an:'start',mono:1,a:.42});c.txt(24,204,"E9003,Meera Iyer",14,{an:'start',mono:1,a:.46});
  c.box(310,106,280,114,'gray',"Result",null,.45);c.txt(324,156,'<Worker id="E9001">',13,{an:'start',mono:1,a:.5});c.txt(324,180,"  <Name>Priya Nair</Name>",13,{an:'start',mono:1,a:.54});c.txt(324,204,"</Worker>",13,{an:'start',mono:1,a:.58});
  c.txt(300,250,"One line in the stylesheet picks the result type",16,{fill:'var(--muted)',a:.8});
 }},
{t:"XML to XML: rename, filter, reorder",tr:"new XML",s:"You can also go from XML to XML. Rename the tags to the names the receiver expects. Filter, so only some workers go through. And reorder, so the list comes out sorted. Same idea: rules, applied to a tree.",
 rem:[["Rename","teal"],["Filter: xsl:if","amber"],["Sort: xsl:sort","indigo"]],
 build:function(c){
  c.box(10,14,260,110,'gray',"Before",null,.04);c.txt(24,76,"<Legal_Name>Priya Nair",13,{an:'start',mono:1,a:.1});c.txt(24,98,"<Org>Payroll Team",13,{an:'start',mono:1,a:.14});
  c.line(270,70,330,70,.3,.38,'indigo');
  c.box(330,14,260,110,'teal',"After",null,.36);c.txt(344,76,"<Name>Priya Nair",13,{an:'start',mono:1,a:.42});c.txt(344,98,"<Department>Payroll",13,{an:'start',mono:1,a:.46});
  c.box(10,160,180,60,'teal',"Rename","Legal_Name to Name",.54);c.box(210,160,180,60,'amber',"Filter","only some workers",.64);c.box(410,160,180,60,'indigo',"Sort","by hire date",.74);
  c.txt(300,262,"Rules applied to a tree, again",16,{fill:'var(--muted)',a:.86});
 }},
{t:"Workday's helpers: ETV and XTT",tr:"ETV + XTT",s:"Workday adds two helpers inside the stylesheet. ETV keeps the output as XML, and validates, formats and maps values. XTT turns the output into text, with delimiters, fixed length and truncation, and strips the tags for you. Keep them in separate steps. Chain the Document Transformation after your Core Connector, and the file flows through.",
 rem:[["ETV = XML out","indigo"],["XTT = text out","amber"],["Separate steps","gray"],["Chain after Core Connector","teal"]],
 build:function(c){
  c.box(10,14,285,86,'indigo',"ETV","XML out: validate, format, map",.04);c.box(305,14,285,86,'amber',"XTT","text out: delimiters, fixed length",.14);
  c.box(10,150,150,64,'teal',"Core Connector","XML file",.4);c.box(178,150,244,64,'indigo',"Document Transformation","XSLT + XTT",.52);c.box(440,150,150,64,'amber',"Vendor file","CSV or fixed",.64);
  c.line(160,182,178,182,.46,.52);c.line(422,182,440,182,.58,.64);
  c.txt(300,252,"Best practice: keep ETV and XTT in two separate steps",16,{fill:'var(--muted)',a:.8});
 }},
{t:"You may not write it, but you must read it",tr:"review",s:"These days you may not write a stylesheet from scratch. A template or a helper gives you a draft. Your job is to read it, test it with a small sample, and catch the usual mistakes. The wrong namespace. A missing tag. A date in the wrong order. And remember, Workday does not check your XSLT for you.",
 rem:[["Namespace must match","coral"],["Well-formed XML","gray"],["Test with a small file","teal"],["Workday does not validate XSLT","coral"]],
 build:function(c){
  c.box(10,14,180,60,'teal',"1 Read it","what does each rule do?",.04);c.box(210,14,180,60,'indigo',"2 Test it","small sample first",.16);c.box(410,14,180,60,'amber',"3 Spot mistakes","the usual suspects",.28);
  ["Wrong namespace: no output at all","Missing tag: empty column","Date format: 15-01 vs 01-15","Extra space or blank line","Special character in a name"].forEach(function(t,i){c.box(60,100+i*34,480,28,'gray',t,null,.4+i*.08)});
  c.txt(300,286,"Workday does not check your XSLT. You must.",16,{w:700,fill:'var(--coral)',a:.88});
 }},
{t:"Recap",tr:"done",s:"So that is XSLT. XML goes in. A few rules say when you see this, write that. Text or XML comes out. Workday's helpers ETV and XTT add the formatting. Now open the XSLT playground in the labs, change a rule, and watch the output change.",
 rem:[["Try the XSLT playground in Labs","teal"]],
 build:function(c){
  c.box(10,40,170,80,'teal',"XML in",null,.05);c.box(215,40,170,80,'indigo',"Rules (XSLT)",null,.2);c.box(420,40,170,80,'amber',"CSV or XML out",null,.35);
  c.line(180,80,215,80,.12,.2);c.line(385,80,420,80,.27,.35);
  c.txt(300,184,"Open Labs, then XSLT playground",20,{w:700,fill:'var(--accent)',a:.7});
  c.txt(300,220,"Change a rule. Watch the output change.",16,{fill:'var(--muted)',a:.8});
 }}
];
FILMS.xmlobj=[
{t:"A worker is not a flat row",tr:"objects",s:"In Excel, a worker is one flat row. In Workday XML, a worker is more like a Russian doll. The worker holds a job. The job points to a position, a location and a supervisory organization. And that organization points to its own parent. Objects inside objects inside objects. That is the hierarchy your stylesheet must walk.",
 rem:[["Objects inside objects","indigo"],["Related business object","teal"],["Walk the path","amber"]],
 build:function(c){
  c.box(210,6,180,40,'teal',"Worker",null,.04);c.box(210,66,180,40,'indigo',"Worker_Job",null,.14);c.line(300,46,300,66,.1,.14);
  [["Position",10],["Location",210],["Supervisory Org",410]].forEach(function(b,i){c.box(b[1],136,180,40,'gray',b[0],null,.26+i*.08);c.line(300,106,b[1]+90,136,.22+i*.08,.28+i*.08)});
  c.box(410,196,180,40,'amber',"Superior Org","the parent",.55);c.line(500,176,500,196,.5,.55);
  c.txt(200,230,"Worker > Job > Org > Parent org",17,{w:700,fill:'var(--accent)',a:.7});
  c.txt(300,290,"Like a Russian doll, or folders inside folders",15,{fill:'var(--muted)',a:.82});
 }},
{t:"Anatomy of a related object",tr:"descriptor + IDs",s:"Every related object looks the same. It has a Descriptor, which is the name a human reads. And it has IDs. The same object can carry several IDs, and a type label tells them apart. The W I D is Workday's own internal key. Location ID or Organization Reference ID are the ones you can recognise. Vendors usually want a stable ID, not the descriptor.",
 rem:[["Descriptor = readable name","teal"],["ID + type label","indigo"],["WID = internal key","gray"],["Send a stable ID, not the name","coral"]],
 build:function(c){
  c.box(10,14,580,60,'teal',"Location",'Descriptor = "Dallas"',.04);
  c.box(30,100,170,56,'indigo',"WID","long internal key",.2);c.box(215,100,170,56,'indigo',"Location_ID","DALLAS",.32);c.box(400,100,170,56,'gray',"Other type","another system",.44);
  c.line(300,74,115,100,.15,.2);c.line(300,74,300,100,.25,.32);c.line(300,74,485,100,.35,.44);
  c.txt(300,196,"Same object. Many labels.",20,{w:700,a:.6});
  c.txt(300,232,"Pick by type: wd:ID[@wd:type='Location_ID']",16,{fill:'var(--indigo)',w:700,a:.75});
  c.txt(300,268,"Descriptors can be renamed. IDs rarely change.",15,{fill:'var(--muted)',a:.85});
 }},
{t:"One worker, many jobs",tr:"1 to many",s:"Some fields hold one object. Others hold many. A worker can have two jobs, three emails, two phones. Each repeats inside the worker. If your stylesheet picks a field without a loop, it silently takes only the first one. The second job just vanishes. And test data usually has one job per person, so nobody notices until production.",
 rem:[["1-to-1 vs 1-to-many","indigo"],["Repeats need a loop","teal"],["Only the first is shown otherwise","coral"],["Test with 2+ jobs","amber"]],
 build:function(c){
  c.box(10,60,140,60,'teal',"Worker","Arun",.04);
  c.box(230,14,170,50,'indigo',"Job 1","primary job",.16);c.box(230,78,170,50,'indigo',"Job 2","Data Mentor",.28);c.box(230,142,170,50,'gray',"Email 1",null,.4);
  c.line(150,90,230,40,.12,.18);c.line(150,90,230,103,.2,.3);c.line(150,90,230,167,.3,.42);
  c.box(450,14,140,50,'teal',"CSV line 1",null,.55);c.box(450,78,140,50,'coral',"CSV line 2?","lost without a loop",.65);
  c.line(400,40,450,40,.5,.55);c.line(400,103,450,103,.6,.65);
  c.txt(300,250,"Loop over the repeating group, one line per item",16,{w:700,fill:'var(--accent)',a:.8});
 }},
{t:"Going up the org tree",tr:"hierarchy",s:"Organizations form a tree of their own. A team sits under a department, which sits under a division. In the XML, each level is nested inside the one below, or listed as a separate parent reference. Your stylesheet must walk up to level one, two, three. If a team is only one level deep, the higher levels are simply empty. Decide what the vendor should get then.",
 rem:[["Org tree: level 1, 2, 3","indigo"],["Walk up with nested paths","teal"],["Missing level = empty","coral"]],
 build:function(c){
  c.box(210,10,180,44,'indigo',"Technology","level 1",.04);c.box(210,80,180,44,'indigo',"Data Team","level 2",.16);c.box(210,150,180,44,'amber',"Analytics Pod","level 3",.28);
  c.line(300,54,300,80,.1,.16);c.line(300,124,300,150,.22,.28);
  c.box(10,150,160,44,'teal',"Worker's org",null,.4);c.line(170,172,210,172,.34,.4);
  c.box(430,80,160,44,'coral',"No parent?","level 1 is empty",.56);
  c.txt(300,240,"Superior_Organization/Superior_Organization/...",15,{w:700,fill:'var(--indigo)',a:.7});
  c.txt(300,276,"Each ../ or nested step goes one level up",15,{fill:'var(--muted)',a:.85});
 }},
{t:"Three flavours of Workday XML",tr:"formats",s:"The same report can come out in different flavours. Workday XML keeps everything: descriptors, IDs, nested objects. Simple XML is flatter. It keeps only the descriptors, drops the IDs, joins repeating values into one string with semicolons, and drops the time zone from dates. A stylesheet written for one flavour breaks on the other. And web service responses use yet another shape, with ID elements and a type attribute.",
 rem:[["Workday XML = full","teal"],["Simple XML = flat","amber"],["Stylesheet matches ONE flavour","coral"]],
 build:function(c){
  [[10,'teal',"Workday XML",["descriptors + IDs","nested objects","repeats kept"],.05],[210,'amber',"Simple XML",["descriptors only","repeats joined with ;","no time zone"],.2],[410,'indigo',"Web service",["ID + type attribute","Worker_Data shape","ask for descriptors"],.35]].forEach(function(b){c.box(b[0],20,185,130,b[1],b[2],null,b[4]);b[3].forEach(function(t,i){c.txt(b[0]+92,80+i*24,t,13,{a:b[4]+.1})})});
  c.txt(300,196,"Change the format = rewrite the paths",18,{w:700,fill:'var(--coral)',a:.6});
  c.txt(300,236,"Always ask: which flavour is this stylesheet for?",15,{fill:'var(--muted)',a:.8});
 }},
{t:"How the stylesheet walks it",tr:"the toolkit",s:"Here is the toolkit. A loop inside a loop for repeating groups. A variable to remember the worker, because inside the inner loop you are standing in the job. A filter in square brackets to pick the primary job, or the ID of a given type. Choose and when for mapping codes. A key for grouping and counting. Count and sum for a trailer. And the identity copy, which copies everything and changes only one thing.",
 rem:[["for-each inside for-each","teal"],["variable","indigo"],["[filter]","amber"],["choose / when","gray"],["key, count, sum","teal"],["identity copy","indigo"]],
 build:function(c){
  [["Nested loop","jobs per worker"],["Variable","remember the worker"],["[ filter ]","primary job, ID type"],["choose / when","map codes"],["key","group and count"],["count / sum","trailer totals"]].forEach(function(b,i){var x=10+(i%3)*198,y=14+Math.floor(i/3)*84;c.box(x,y,184,70,['teal','indigo','amber','gray','teal','indigo'][i],b[0],b[1],.04+i*.09)});
  c.box(10,190,580,56,'amber',"Identity copy","copy everything, change one thing",.62);
  c.txt(300,290,"All 15 are in the XSLT playground",16,{w:700,fill:'var(--accent)',a:.85});
 }},
{t:"Why an XSLT goes wrong, part 1",tr:"reasons 1-6",s:"Now the reasons it goes wrong, and most give no error at all. One. The namespace address does not match. Two. The path misses a level, for example the position sits inside the job. Three. An attribute is written like an element. Four. Only the first of many jobs shows. Five. The ID type is wrong, so the lookup finds nothing. Six. The report definition changed, so element names changed.",
 rem:[["Namespace mismatch","coral"],["Missed a level","coral"],["@attribute vs element","coral"],["Many values, first only","coral"],["Wrong ID type","coral"],["Report alias changed","coral"]],
 build:function(c){
  ["1  Namespace address differs","2  Path misses a level","3  Attribute written as element","4  Many jobs: only the first shows","5  ID type does not match","6  Report alias renamed upstream"].forEach(function(t,i){c.box(40,12+i*46,520,38,'gray',t,null,.04+i*.1)});
  c.txt(300,300,"No error. Just wrong or empty output.",16,{w:700,fill:'var(--coral)',a:.8});
 }},
{t:"Why an XSLT goes wrong, part 2",tr:"reasons 7-13",s:"Seven. The sample has data the production file does not, or the other way round. A missing optional object, like a person with no gender, leaves a blank, or a total that says N a N. Eight. The date still carries a time zone. Nine. A comma or quote inside a name breaks the CSV. Ten. Text is too long for a fixed width field and gets cut, or a number is not padded. Eleven. A filter drops every row. Twelve. Wrong flavour: Simple instead of Workday XML. Thirteen. Encoding, for example accents turning into question marks.",
 rem:[["Missing optional object","coral"],["Time zone on date","coral"],["Comma or quote in value","coral"],["Truncate / pad","coral"],["Filter drops all","coral"],["Wrong XML flavour","coral"],["Encoding","coral"]],
 build:function(c){
  ["7  Optional object missing, blank or NaN","8  Date has a time zone suffix","9  Comma or quote breaks the CSV","10  Fixed width: cut or not padded","11  A filter removes every row","12  Wrong XML flavour (Simple vs Workday)","13  Encoding: accents become ?"].forEach(function(t,i){c.box(40,8+i*40,520,33,'gray',t,null,.04+i*.09)});
  c.txt(300,300,"Test with messy data: 2 jobs, no email, a comma, an accent",15,{w:700,fill:'var(--accent)',a:.85});
 }},
{t:"Recap",tr:"done",s:"So remember. A worker is a tree of objects. Each related object has a descriptor and typed IDs. Repeats need loops. Know which flavour of XML you have. And test with messy data. Now open the XML tree explorer, click around, and then try the nested examples in the XSLT playground.",
 rem:[["XML tree explorer in Labs","teal"],["Nested examples in the playground","indigo"]],
 build:function(c){
  c.box(10,40,170,80,'teal',"Tree of objects",null,.05);c.box(215,40,170,80,'indigo',"Descriptor + typed IDs",null,.2);c.box(420,40,170,80,'amber',"Loop the repeats",null,.35);
  c.txt(300,184,"Labs: XML tree explorer, XSLT playground",20,{w:700,fill:'var(--accent)',a:.7});
  c.txt(300,220,"Test with messy data, not the happy path.",16,{fill:'var(--muted)',a:.8});
 }}
];


function words(s){return s.split(/\s+/).length}
function sentences(s){return s.match(/[^.!?]+[.!?]+/g)||[s]}

function mount(host,key){
  var SC=FILMS[key||'integration'];function dur(i){return Math.max(12,words(SC[i].s)/2.35+2)}
  var SW=640,N=SC.length;
  host.innerHTML='<div class="mv"><div class="mv-top"><span class="mv-ch" aria-live="polite"></span><span class="mv-ctl"><button type="button" data-c="pp">Pause</button><button type="button" data-c="ls" aria-pressed="false">Listen</button><button type="button" data-c="rs">Restart</button></span></div>'+
   '<svg class="mv-svg" viewBox="0 0 600 372" role="img" aria-label="Animated film"></svg>'+
   '<p class="mv-cap"></p><div class="mv-rem"><b>Remember</b><div class="mv-chips"></div></div><p class="note mv-hint">It plays by itself and loops. Sound is off. Press Listen to hear the voice.</p></div>';
  var svg=host.querySelector('svg'),cap=host.querySelector('.mv-cap'),chips=host.querySelector('.mv-chips'),chE=host.querySelector('.mv-ch'),ppB=host.querySelector('[data-c=pp]'),lsB=host.querySelector('[data-c=ls]'),rsB=host.querySelector('[data-c=rs]');
  var cam=S('g',{},svg),ctx=[];
  SC.forEach(function(s,i){var g=S('g',{transform:'translate('+(i*SW)+',0)'},cam),c=Ctx(g);s.build(c);ctx.push(c)});
  /* track */
  var tx0=40,tx1=560,ty=336,TX=function(i){return tx0+i*(tx1-tx0)/(N-1)};
  var tg=S('g',{},svg),tl=S('line',{x1:tx0,y1:ty,x2:tx1,y2:ty,'stroke-width':4,'stroke-linecap':'round'},tg);tl.style.stroke='var(--line)';
  var pl=S('line',{x1:tx0,y1:ty,x2:tx0,y2:ty,'stroke-width':4,'stroke-linecap':'round'},tg);pl.style.stroke='var(--accent)';
  var dots=[];for(var i=0;i<N;i++){var d=S('circle',{cx:TX(i),cy:ty,r:6},tg);d.style.fill='var(--surface)';d.style.stroke='var(--line)';d.style.strokeWidth=2;dots.push(d)}
  var par=S('text',{'text-anchor':'middle','font-size':26,y:ty-12},tg,"📦"),ptx=S('text',{'text-anchor':'middle','font-size':14,y:ty+28},tg,'');ptx.style.fill='var(--muted)';
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur=0,el=0,paused=!!reduce,vis=true,listening=false,sdone=true,camX=0,camFrom=0,camTo=0,last=0,SS=window.speechSynthesis,tok=0,subI=-1,sub=[];
  if(!SS||!window.SpeechSynthesisUtterance){lsB.hidden=true}
  if(reduce){ppB.textContent='Play';}
  function say(text,done){var my=++tok;SS.cancel();var u=new SpeechSynthesisUtterance(text);u.rate=1;u.lang='en-GB';
    try{var vs=SS.getVoices()||[],v=null,best=-1,i,sc;for(i=0;i<vs.length;i++){if(!/^en/i.test(vs[i].lang))continue;sc=1;if(/^en[-_](IN|GB|SG|AU)/i.test(vs[i].lang))sc+=2;else if(/^en[-_]US/i.test(vs[i].lang))sc+=1;if(/natural|neural|online|premium|enhanced|google|siri|samantha|daniel|rishi|veena|neerja/i.test(vs[i].name))sc+=4;if(sc>best){best=sc;v=vs[i]}}if(v){u.voice=v;u.lang=v.lang}}catch(e){}
    var fin=false;function end(){if(fin||my!==tok)return;fin=true;done&&done()}u.onend=end;u.onerror=end;SS.speak(u);setTimeout(end,Math.max(6000,text.length*110)+2000)}
  function start(i,noSpeak){
    cur=i;el=0;ctx[i].upd(0);camFrom=camX;camTo=-i*SW;subI=-1;sub=sentences(SC[i].s);
    chE.textContent='Part '+(i+1)+' of '+N+': '+SC[i].t;
    chips.innerHTML=SC[i].rem.map(function(r,k){return '<span class="mv-chip" data-k="'+r[1]+'" style="opacity:0">'+r[0].replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span>'}).join('');
    par.setAttribute('x',TX(i));ptx.textContent=SC[i].tr;ptx.setAttribute('x',TX(i));
    for(var k=0;k<N;k++){dots[k].style.fill=k<=i?'var(--accent)':'var(--surface)';dots[k].style.stroke=k<=i?'var(--accent)':'var(--line)'}
    pl.setAttribute('x2',TX(i));
    if(listening&&!noSpeak){sdone=false;say(SC[i].s,function(){sdone=true})}else sdone=true;
  }
  function frame(now){
    requestAnimationFrame(frame);
    var dt=Math.min(.1,(now-last)/1000)*(window.Movie.speed||1);last=now;if(paused||!vis)return;
    el+=dt;var D=dur(cur);
    var cr=ez(ramp(el,0,.9));camX=camFrom+(camTo-camFrom)*cr;cam.setAttribute('transform','translate('+camX+',0)');
    var u=ramp(el,.7,D-.5);ctx[cur].upd(u);
    var tt=cl(el/D),w=words(SC[cur].s),acc=0,si=0;for(var k=0;k<sub.length;k++){acc+=words(sub[k]);if(tt*w<=acc){si=k;break}si=k}
    if(si!==subI){subI=si;cap.textContent=sub[si].trim()}
    var cs=chips.children;for(var k=0;k<cs.length;k++)cs[k].style.opacity=ez(ramp(u,.3+k*.1,.4+k*.1));
    if(el>=D&&(sdone||el>D*2.2)){var n=(cur+1)%N;start(n)}
  }
  function jump(i){tok++;if(SS)SS.cancel();ctx.forEach(function(c){c.upd(0)});start(i)}
  ppB.onclick=function(){paused=!paused;ppB.textContent=paused?'Play':'Pause';if(paused&&SS){tok++;SS.cancel()}else if(!paused&&listening){sdone=false;say(SC[cur].s,function(){sdone=true})}};
  rsB.onclick=function(){ctx.forEach(function(c){c.upd(0)});camX=0;cam.setAttribute('transform','translate(0,0)');paused=false;ppB.textContent='Pause';start(0)};
  lsB.onclick=function(){listening=!listening;lsB.setAttribute('aria-pressed',listening);lsB.textContent=listening?'Stop listening':'Listen';if(listening){paused=false;ppB.textContent='Pause';el=0;ctx[cur].upd(0);sdone=false;say(SC[cur].s,function(){sdone=true})}else{tok++;if(SS)SS.cancel();sdone=true}};
  try{var io=new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(!vis&&SS){tok++;SS.cancel();if(listening)sdone=true}},{threshold:.15});io.observe(host)}catch(e){}
  document.addEventListener('visibilitychange',function(){if(document.hidden&&SS){tok++;SS.cancel();sdone=true}});
  window.addEventListener('hashchange',function(){if(SS){tok++;SS.cancel()}});
  start(0,true);ctx[0].upd(0);requestAnimationFrame(function(t){last=t;requestAnimationFrame(frame)});
  window.Movie.api=window.Movie.api||{};window.Movie.api[key||'integration']={jump:jump,at:function(i,uu){jump(i);paused=true;camX=camTo;cam.setAttribute('transform','translate('+camX+',0)');ctx[i].upd(uu);var cs=chips.children;for(var k=0;k<cs.length;k++)cs[k].style.opacity=1}};return window.Movie.api[key||'integration'];
}
window.Movie={mount:mount,films:FILMS};
})();
