/* Labs: small tools that run in the browser with dummy data. */
(function(){
'use strict';
var B=window.BOOK;
function $(s,r){return (r||document).querySelector(s)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

B.L({id:'l-csv',title:'CSV file checker',desc:'Paste a CSV file. The tool finds the usual problems: wrong column counts, duplicate keys, bad dates, empty cells, hidden spaces.',tags:'csv file check excel header duplicate date encoding bom'});
B.L({id:'l-recon',title:'Reconcile two lists',desc:'Paste the IDs Workday sent and the IDs the vendor loaded. See what is missing, extra or duplicated.',tags:'reconciliation count missing duplicate compare'});
B.L({id:'l-xpath',title:'XPath and XSLT playground',desc:'Try XPath and XSLT on a small dummy report. Use the same ideas that Workday transformations use.',tags:'xml xpath xslt namespace transform csv raas'});
B.L({id:'l-time',title:'Time travel: effective date and entry date',desc:'Move two dates and watch one worker change. See why a change entered late causes retro pay.',tags:'effective date entry moment as-of history backdated retro worker history'});
B.L({id:'l-map',title:'Mapping table builder',desc:'Build the mapping table every integration needs. Copy it as CSV for Excel or a ticket.',tags:'mapping document template transformation field'});
B.L({id:'l-dates',title:'Dates and time zones',desc:'See why 01/12/2026 is unsafe, and why a midnight date can move to the day before in another time zone.',tags:'date format iso 8601 time zone utc offset'});

B.L({id:'l-division',title:'Division finder and test-data generator',desc:'Pick a scenario. See the dummy workers and events to create, the Workday steps, and the answer a correct report must give for any date.',tags:'division test data dummy future dated pending transfer level 1 2 3 as of query sql'});

B.L({id:'l-xslt',title:'XSLT playground',desc:'15 examples plus 4 broken ones: flat and nested Workday-style XML in, CSV or new XML out. Change a rule and run it.',tags:'xslt xml csv transform stylesheet for-each value-of template namespace convert pipe sort filter'});

B.L({id:'l-xtree',title:'XML tree and XPath explorer',desc:'See objects inside objects. Click a line to get its XPath and what kind of thing it is.',tags:'xml tree xpath objects hierarchy related business object descriptor id wid reference nested repeating'});

var BUILD={};

/* ---------- csv ---------- */
function parseCSV(text,d){
  var rows=[],row=[],cur='',q=false,i=0,n=text.length,c;
  while(i<n){
    c=text.charAt(i);
    if(q){
      if(c==='"'){if(text.charAt(i+1)==='"'){cur+='"';i+=2;continue}q=false;i++;continue}
      cur+=c;i++;continue;
    }
    if(c==='"'){q=true;i++;continue}
    if(c===d){row.push(cur);cur='';i++;continue}
    if(c==='\r'){i++;continue}
    if(c==='\n'){row.push(cur);rows.push(row);row=[];cur='';i++;continue}
    cur+=c;i++;
  }
  if(cur!==''||row.length){row.push(cur);rows.push(row)}
  return {rows:rows,openQuote:q};
}
BUILD['l-csv']=function(el){
  var SAMPLE='EmployeeID,FirstName,LastName,StartDate,Organization\nE1001,Priya,Sharma,2026-12-01,Data Team\nE1002,Sam ,Lee,01/10/2026,Finance\nE1003,Ana,"Costa, Jr",2025-06-15,Payroll Team\nE1003,Ravi,Iyer,2027-01-10,Data Team\nE1005,Mei,Tan,2026-11-15\nE1006,José,Cruz,2026-11-20,';
  el.innerHTML='<p class="muted">Paste dummy data only. The check runs in your browser. Nothing is sent anywhere.</p>'+
   '<textarea id="csvIn" spellcheck="false" aria-label="CSV text"></textarea>'+
   '<div class="row"><button type="button" class="on" id="csvRun">Check file</button><button type="button" id="csvSample">Load sample with problems</button><label class="note">Key column <select id="csvKey"></select></label></div>'+
   '<div id="csvOut" class="list"></div>';
  var ta=$('#csvIn',el);ta.value=SAMPLE;
  function keySel(){
    var text=ta.value.replace(/^﻿/,''),first=text.split('\n')[0]||'',d=detect(first),h=parseCSV(first,d).rows[0]||[];
    $('#csvKey',el).innerHTML=h.map(function(x,i){return '<option value="'+i+'">'+esc(x||('Column '+(i+1)))+'</option>'}).join('');
  }
  function detect(line){
    var best=',',bc=-1;[',',';','|','\t'].forEach(function(d){var c=line.split(d).length;if(c>bc){bc=c;best=d}});return best;
  }
  function run(){
    var raw=ta.value,out=[],bom=raw.charCodeAt(0)===0xFEFF,text=bom?raw.slice(1):raw;
    if(!text.trim()){$('#csvOut',el).innerHTML='<p class="note">Paste some CSV first.</p>';return}
    var d=detect(text.split('\n')[0]),P=parseCSV(text,d),rows=P.rows;
    while(rows.length&&rows[rows.length-1].join('')==='')rows.pop();
    var head=rows[0]||[],n=head.length;
    function add(l,m){out.push({l:l,m:m})}
    add('ok','Delimiter looks like "'+(d==='\t'?'tab':d)+'". '+rows.length+' rows including the header. '+n+' columns.');
    if(bom)add('chk','The file starts with a hidden BOM mark. Some systems read it as part of the first column name. Ask the receiver if they accept it.');
    var crlf=/\r\n/.test(raw),lf=/[^\r]\n/.test(raw);
    add(crlf&&lf?'chk':'ok','Line endings: '+(crlf&&lf?'mixed (Windows and Unix). Pick one.':crlf?'Windows (CRLF).':'Unix (LF).'));
    if(P.openQuote)add('bad','A quote mark is never closed. Everything after it may be read as one cell.');
    var badCount=[];rows.forEach(function(r,i){if(i>0&&r.length!==n)badCount.push((i+1)+' ('+r.length+' columns)')});
    add(badCount.length?'bad':'ok',badCount.length?'Rows with the wrong number of columns (expected '+n+'): row '+badCount.slice(0,8).join(', row ')+'.':'Every row has '+n+' columns.');
    var ki=+($('#csvKey',el).value||0),seen={},dup=[];
    rows.slice(1).forEach(function(r,i){var k=(r[ki]||'').trim();if(!k)return;if(seen[k]){dup.push(k+' (rows '+seen[k]+' and '+(i+2)+')')}else seen[k]=i+2});
    add(dup.length?'bad':'ok',dup.length?'Duplicate values in key column "'+(head[ki]||ki+1)+'": '+dup.slice(0,8).join(', ')+'.':'No duplicates in key column "'+(head[ki]||ki+1)+'".');
    var empt=[];head.forEach(function(h,c){var k=0;rows.slice(1).forEach(function(r){if(r.length>c&&(r[c]||'').trim()==='')k++});if(k)empt.push(h+': '+k)});
    add(empt.length?'chk':'ok',empt.length?'Empty cells in: '+empt.join('; ')+'. Is each one allowed?':'No empty cells.');
    var sp=0;rows.forEach(function(r){r.forEach(function(c){if(c!==c.trim())sp++})});
    add(sp?'chk':'ok',sp?sp+' cell(s) have a space at the start or end. Many systems treat "Sam " and "Sam" as different.':'No hidden spaces at the start or end of cells.');
    head.forEach(function(h,c){
      if(!/date/i.test(h))return;
      var bad=[];rows.slice(1).forEach(function(r,i){var v=(r[c]||'').trim();if(v&&!/^\d{4}-\d{2}-\d{2}$/.test(v))bad.push('row '+(i+2)+' "'+v+'"')});
      add(bad.length?'bad':'ok',bad.length?'Column "'+h+'" is not all yyyy-mm-dd: '+bad.slice(0,6).join(', ')+'. Is 01/10/2026 the 1st of October or the 10th of January?':'Column "'+h+'" is all yyyy-mm-dd.');
    });
    var na=0;rows.forEach(function(r){if(/[^\x00-\x7f]/.test(r.join('')))na++});
    if(na)add('chk',na+' row(s) have non-English letters (like é). Check the file is saved as UTF-8 and the receiver accepts UTF-8.');
    var lbl={ok:'OK',chk:'Check',bad:'Problem'},cls={ok:'ok',chk:'chk',bad:'bad'};
    var tbl='<div class="wide"><table class="tbl"><tr>'+head.map(function(h){return '<th>'+esc(h)+'</th>'}).join('')+'</tr>'+rows.slice(1,7).map(function(r){return '<tr>'+head.map(function(h,i){return '<td>'+esc(r[i]==null?'(missing)':r[i])+'</td>'}).join('')+'</tr>'}).join('')+'</table></div>';
    $('#csvOut',el).innerHTML='<div class="card">'+out.map(function(o){return '<p><span class="'+cls[o.l]+'">'+lbl[o.l]+'</span> '+esc(o.m)+'</p>'}).join('')+'</div><div class="card"><h4>First rows as a table</h4>'+tbl+'</div>';
  }
  $('#csvRun',el).onclick=run;
  $('#csvSample',el).onclick=function(){ta.value=SAMPLE;keySel();run()};
  ta.addEventListener('input',keySel);
  keySel();run();
};

/* ---------- reconcile ---------- */
BUILD['l-recon']=function(el){
  el.innerHTML='<p class="muted">One ID per line, or separated by commas. Dummy IDs only.</p><div class="two"><div><label class="note">A: Sent by Workday</label><textarea id="rA" spellcheck="false"></textarea></div><div><label class="note">B: Loaded by the vendor</label><textarea id="rB" spellcheck="false"></textarea></div></div>'+
   '<div class="row"><button type="button" class="on" id="rRun">Compare</button><button type="button" id="rSample">Load sample</button><label class="note"><input type="checkbox" id="rCase" checked> Ignore upper and lower case</label></div><div id="rOut" class="list"></div>';
  var A=$('#rA',el),Bx=$('#rB',el);
  function items(s,ic){return s.split(/[\n,;\t]+/).map(function(x){x=x.trim();return ic?x.toLowerCase():x}).filter(Boolean)}
  function count(a){var m={};a.forEach(function(x){m[x]=(m[x]||0)+1});return m}
  function run(){
    var ic=$('#rCase',el).checked,a=items(A.value,ic),b=items(Bx.value,ic),ca=count(a),cb=count(b);
    var ua=Object.keys(ca),ub=Object.keys(cb);
    var miss=ua.filter(function(x){return !cb[x]}),extra=ub.filter(function(x){return !ca[x]});
    var da=ua.filter(function(x){return ca[x]>1}),db=ub.filter(function(x){return cb[x]>1});
    var match=ua.filter(function(x){return cb[x]}).length;
    function row(l,v,cls){return '<tr><td>'+l+'</td><td class="'+(cls||'')+'">'+v+'</td></tr>'}
    function lst(x){return x.length?esc(x.join(', ')):'none'}
    $('#rOut',el).innerHTML='<div class="card wide"><table class="tbl">'+
      row('A total rows',a.length)+row('B total rows',b.length)+row('A unique IDs',ua.length)+row('B unique IDs',ub.length)+row('Matched',match,'ok')+
      row('In A but not in B (missing)',lst(miss),miss.length?'bad':'ok')+row('In B but not in A (extra)',lst(extra),extra.length?'bad':'ok')+
      row('Duplicates inside A',lst(da),da.length?'chk':'ok')+row('Duplicates inside B',lst(db),db.length?'chk':'ok')+'</table></div>'+
      '<p class="note">Counts alone can lie. 118 sent and 118 loaded can still hide two missing and two extra. Always compare the IDs.</p>';
  }
  $('#rRun',el).onclick=run;
  $('#rSample',el).onclick=function(){A.value='E1001\nE1002\nE1003\nE1004\nE1005\nE1006';Bx.value='E1001\nE1002\nE1002\nE1004\nE1006\nE1009';run()};
  A.value='E1001\nE1002\nE1003\nE1004\nE1005\nE1006';Bx.value='E1001\nE1002\nE1002\nE1004\nE1006\nE1009';run();
};

/* ---------- xpath and xslt ---------- */
BUILD['l-xpath']=function(el){
  var XML='<?xml version="1.0" encoding="UTF-8"?>\n<wd:Report_Data xmlns:wd="urn:com.workday.report/Payroll_Worker_Report">\n  <wd:Report_Entry>\n    <wd:Employee_ID>E1001</wd:Employee_ID>\n    <wd:First_Name>Priya</wd:First_Name>\n    <wd:Last_Name>Sharma</wd:Last_Name>\n    <wd:Organization>Data Team</wd:Organization>\n    <wd:Hire_Date>2026-12-01</wd:Hire_Date>\n    <wd:Monthly_Pay>5400</wd:Monthly_Pay>\n  </wd:Report_Entry>\n  <wd:Report_Entry>\n    <wd:Employee_ID>E1002</wd:Employee_ID>\n    <wd:First_Name>Sam</wd:First_Name>\n    <wd:Last_Name>Lee</wd:Last_Name>\n    <wd:Organization>Finance</wd:Organization>\n    <wd:Hire_Date>2026-10-01</wd:Hire_Date>\n    <wd:Monthly_Pay>4800</wd:Monthly_Pay>\n  </wd:Report_Entry>\n  <wd:Report_Entry>\n    <wd:Employee_ID>E1003</wd:Employee_ID>\n    <wd:First_Name>Ana</wd:First_Name>\n    <wd:Last_Name>Costa</wd:Last_Name>\n    <wd:Organization>Payroll Team</wd:Organization>\n    <wd:Hire_Date>2025-06-15</wd:Hire_Date>\n    <wd:Monthly_Pay>6100</wd:Monthly_Pay>\n  </wd:Report_Entry>\n  <wd:Report_Entry>\n    <wd:Employee_ID>E1004</wd:Employee_ID>\n    <wd:First_Name>Ravi</wd:First_Name>\n    <wd:Last_Name>Iyer</wd:Last_Name>\n    <wd:Organization>Data Team</wd:Organization>\n    <wd:Hire_Date>2027-01-10</wd:Hire_Date>\n    <wd:Monthly_Pay>5000</wd:Monthly_Pay>\n  </wd:Report_Entry>\n</wd:Report_Data>';
  var NSX='xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:wd="urn:com.workday.report/Payroll_Worker_Report"';
  var XP=[
   ['Count the workers','count(//wd:Report_Entry)'],
   ['IDs in Data Team','//wd:Report_Entry[wd:Organization=\'Data Team\']/wd:Employee_ID'],
   ['Last names with pay over 5000','//wd:Report_Entry[wd:Monthly_Pay>5000]/wd:Last_Name'],
   ['Total monthly pay','sum(//wd:Monthly_Pay)']
  ];
  var XS=[
   ['XML to CSV','<xsl:stylesheet version="1.0" '+NSX+'>\n  <xsl:output method="text"/>\n  <xsl:template match="/">\n    <xsl:text>EmployeeID,FirstName,LastName,StartDate&#10;</xsl:text>\n    <xsl:for-each select="wd:Report_Data/wd:Report_Entry">\n      <xsl:value-of select="wd:Employee_ID"/><xsl:text>,</xsl:text>\n      <xsl:value-of select="wd:First_Name"/><xsl:text>,</xsl:text>\n      <xsl:value-of select="wd:Last_Name"/><xsl:text>,</xsl:text>\n      <xsl:value-of select="wd:Hire_Date"/><xsl:text>&#10;</xsl:text>\n    </xsl:for-each>\n  </xsl:template>\n</xsl:stylesheet>','EmployeeID,FirstName,LastName,StartDate\nE1001,Priya,Sharma,2026-12-01\nE1002,Sam,Lee,2026-10-01\nE1003,Ana,Costa,2025-06-15\nE1004,Ravi,Iyer,2027-01-10\n'],
   ['XML to new XML (Data Team only)','<xsl:stylesheet version="1.0" '+NSX+'>\n  <xsl:output method="xml" indent="yes"/>\n  <xsl:template match="/">\n    <Workers>\n      <xsl:for-each select="wd:Report_Data/wd:Report_Entry[wd:Organization=\'Data Team\']">\n        <Worker id="{wd:Employee_ID}">\n          <Name><xsl:value-of select="concat(wd:First_Name,\' \',wd:Last_Name)"/></Name>\n          <Pay><xsl:value-of select="wd:Monthly_Pay"/></Pay>\n        </Worker>\n      </xsl:for-each>\n    </Workers>\n  </xsl:template>\n</xsl:stylesheet>','<Workers>\n  <Worker id="E1001">\n    <Name>Priya Sharma</Name>\n    <Pay>5400</Pay>\n  </Worker>\n  <Worker id="E1004">\n    <Name>Ravi Iyer</Name>\n    <Pay>5000</Pay>\n  </Worker>\n</Workers>']
  ];
  el.innerHTML='<p class="muted">The dummy XML below looks like a Workday report (RaaS) output. Notice the <code>wd:</code> prefix. You must use it in every XPath step.</p>'+
   '<label class="note">1. The XML</label><textarea id="xX" spellcheck="false" style="min-height:220px"></textarea>'+
   '<h4>XPath: pick values out of the XML</h4><div class="chips" id="xPre"></div><input type="text" id="xP" style="width:100%;font-family:var(--f-mono)" aria-label="XPath expression"><div class="row"><button type="button" class="on" id="xRun">Run XPath</button></div><pre class="out" id="xO"></pre>'+
   '<h4>XSLT: rebuild the XML into another shape</h4><div class="chips" id="xsPre"></div><textarea id="xS" spellcheck="false" style="min-height:260px" aria-label="XSLT stylesheet"></textarea><div class="row"><button type="button" class="on" id="xsRun">Run XSLT</button></div><pre class="out" id="xsO"></pre><p class="note" id="xsNote"></p>';
  var xX=$('#xX',el),xP=$('#xP',el),xS=$('#xS',el),xO=$('#xO',el),xsO=$('#xsO',el),curXS=0;
  xX.value=XML;xP.value=XP[1][1];xS.value=XS[0][1];
  $('#xPre',el).innerHTML=XP.map(function(p,i){return '<button type="button" class="chip" data-i="'+i+'">'+esc(p[0])+'</button>'}).join('');
  $('#xsPre',el).innerHTML=XS.map(function(p,i){return '<button type="button" class="chip" data-i="'+i+'">'+esc(p[0])+'</button>'}).join('');
  function parse(){var d=new DOMParser().parseFromString(xX.value,'application/xml');var e=d.querySelector('parsererror');return e?{err:e.textContent.slice(0,300)}:{doc:d}}
  function runX(){
    var p=parse();if(p.err){xO.textContent='The XML is not well-formed. Fix it first.\n'+p.err;return}
    var doc=p.doc,ns=doc.documentElement.namespaceURI;
    try{
      var r=doc.evaluate(xP.value,doc,function(x){return x==='wd'?ns:null},XPathResult.ANY_TYPE,null),t=r.resultType,lines=[];
      if(t===1)lines.push('Number: '+r.numberValue);
      else if(t===2)lines.push('Text: '+r.stringValue);
      else if(t===3)lines.push('True or false: '+r.booleanValue);
      else{var n,k=0;while((n=r.iterateNext())&&k<60){k++;lines.push(n.nodeType===1?(n.children.length?new XMLSerializer().serializeToString(n):n.nodeName+' = '+n.textContent):n.textContent)}lines.unshift(k+' node(s) found'+(k?':':'. Check the wd: prefix and the spelling.'))}
      xO.textContent=lines.join('\n');
    }catch(e){xO.textContent='XPath problem: '+e.message}
  }
  function runS(){
    var p=parse();if(p.err){xsO.textContent='The XML is not well-formed. Fix it first.\n'+p.err;return}
    if(typeof XSLTProcessor==='undefined'){xsO.textContent='This browser has no built-in XSLT. XPath still works. Try Firefox or Safari. The expected output for the sample is shown below the box.\n\nExpected:\n'+XS[curXS][2];return}
    try{
      var sd=new DOMParser().parseFromString(xS.value,'application/xml'),se=sd.querySelector('parsererror');
      if(se){xsO.textContent='The XSLT is not well-formed XML:\n'+se.textContent.slice(0,300);return}
      var pr=new XSLTProcessor();pr.importStylesheet(sd);
      var res=pr.transformToDocument(p.doc),txt;
      if(/method\s*=\s*["']text["']/.test(xS.value))txt=res.documentElement?res.documentElement.textContent:'';
      else txt=new XMLSerializer().serializeToString(res);
      xsO.textContent=txt||'(empty output)';
    }catch(e){xsO.textContent='XSLT problem: '+e.message}
  }
  $('#xRun',el).onclick=runX;$('#xsRun',el).onclick=runS;
  $('#xPre',el).onclick=function(ev){var b=ev.target.closest('button');if(b){xP.value=XP[+b.dataset.i][1];runX()}};
  $('#xsPre',el).onclick=function(ev){var b=ev.target.closest('button');if(b){curXS=+b.dataset.i;xS.value=XS[curXS][1];runS()}};
  $('#xsNote',el).textContent='XSLT here is version 1.0, built into most browsers. Workday supports XSLT in its tools. Check which version your tenant uses.';
  runX();runS();
};

/* ---------- time travel ---------- */
BUILD['l-time']=function(el){
  var EV=[
   {k:'Hire',eff:'2026-12-01',ent:'2026-11-10',set:{status:'Active',org:'Data Team',job:'Data Analyst',pay:5000}},
   {k:'Pay change',eff:'2027-01-01',ent:'2026-12-15',set:{pay:5300}},
   {k:'Transfer',eff:'2027-03-01',ent:'2027-02-10',set:{org:'Payroll Team',job:'Payroll Analyst'}},
   {k:'Pay correction (late fix)',eff:'2027-01-01',ent:'2027-04-10',set:{pay:5400}},
   {k:'Terminate',eff:'2027-09-30',ent:'2027-09-01',set:{status:'Terminated'}}
  ];
  el.innerHTML='<p class="muted">Priya Sharma, dummy worker. Every change has two dates. <b>Effective date</b>: when it counts. <b>Entry date</b>: when someone typed it in. Pick one date for each, or tap a preset.</p>'+
   '<div class="chips" id="tP"></div><div class="two"><label class="note">As of effective date<br><input type="date" id="tE" value="2027-03-15"></label><label class="note">What was known on (entry date)<br><input type="date" id="tN" value="2027-03-15"></label></div>'+
   '<div class="res" id="tR"></div><ul class="ev" id="tL"></ul><p class="tech" id="tT"></p>';
  var PRE=[['Mar 2027, asked on 15 Mar','2027-03-15','2027-03-15'],['Same Mar date, asked on 1 May','2027-03-15','2027-05-01'],['Before the hire','2026-11-15','2026-11-20'],['After leaving','2027-10-15','2027-10-15']];
  $('#tP',el).innerHTML=PRE.map(function(p,i){return '<button type="button" class="chip" data-i="'+i+'">'+esc(p[0])+'</button>'}).join('');
  var tE=$('#tE',el),tN=$('#tN',el);
  function run(){
    var e=tE.value,n=tN.value;if(!e||!n)return;
    var st={status:'Not hired yet',org:'None',job:'None',pay:'None'};
    var live=EV.filter(function(x){return x.ent<=n&&x.eff<=e}).sort(function(a,b){return a.eff<b.eff?-1:a.eff>b.eff?1:(a.ent<b.ent?-1:1)});
    live.forEach(function(x){for(var k in x.set)st[k]=x.set[k]});
    if(st.status==='Terminated'){st.org='None';st.job='None';st.pay='None'}
    $('#tR',el).innerHTML=[['Status',st.status],['Organization',st.org],['Job',st.job],['Monthly pay',st.pay==='None'?'None':'$'+st.pay]].map(function(x){return '<div><small>'+x[0]+'</small><b>'+esc(x[1])+'</b></div>'}).join('');
    $('#tL',el).innerHTML=EV.map(function(x){
      var on=x.ent<=n&&x.eff<=e,why=on?'counts':(x.eff>e?'not effective yet':'not entered yet');
      return '<li class="'+(on?'live':'off')+'"><b>'+esc(x.k)+'</b> · effective '+x.eff+' · entered '+x.ent+' · <i>'+why+'</i></li>';
    }).join('');
    var late=live.filter(function(x){return x.ent>x.eff&&x.ent>e&&false});
    var back=live.filter(function(x){return x.ent>e});
    $('#tT',el).textContent=back.length?'Some changes that count for '+e+' were typed in after '+e+'. Anyone who asked on '+e+' got an older answer. If payroll already ran, it must now fix the past. This is called retro pay.':'Everything that counts for this date was already entered on this date. No retro surprise.';
  }
  tE.onchange=run;tN.onchange=run;tE.oninput=run;tN.oninput=run;
  $('#tP',el).onclick=function(ev){var b=ev.target.closest('button');if(!b)return;var p=PRE[+b.dataset.i];tE.value=p[1];tN.value=p[2];run()};
  run();
};

/* ---------- mapping builder ---------- */
BUILD['l-map']=function(el){
  var EX=[
   ['EmployeeID','Worker ID','Copy as is','Yes','E1001','Key for payroll'],
   ['FirstName','Legal first name','Trim spaces','Yes','Priya',''],
   ['StartDate','Hire date','Format as yyyy-mm-dd','Yes','2026-12-01','Vendor rejects other formats'],
   ['OrgCode','Supervisory organization ID','Value map: ORG_021 to D21','Yes','D21','Vendor uses short codes'],
   ['PrimaryJob','Primary job flag','true to Y, false to N','Yes','Y','Needed when a worker has two jobs']
  ];
  var H=['Target field','Source field','Rule','Required','Example','Notes'],rows=[];
  el.innerHTML='<p class="muted">A mapping table says: this source field becomes that target field, with this rule. Keep it with your test evidence. Dummy values only.</p><div class="wide" id="mT"></div><div class="row"><button type="button" id="mAdd">Add row</button><button type="button" id="mDel">Remove last row</button><button type="button" id="mEx">Load example</button><button type="button" class="on" id="mCsv">Copy as CSV</button></div>';
  function draw(){
    $('#mT',el).innerHTML='<table class="tbl"><tr>'+H.map(function(h){return '<th>'+h+'</th>'}).join('')+'</tr>'+rows.map(function(r,i){return '<tr>'+r.map(function(c,j){return '<td><input type="text" data-r="'+i+'" data-c="'+j+'" value="'+esc(c)+'" aria-label="'+H[j]+' row '+(i+1)+'" style="min-width:120px;width:100%"></td>'}).join('')+'</tr>'}).join('')+'</table>';
  }
  rows=EX.map(function(r){return r.slice()});draw();
  $('#mT',el).addEventListener('input',function(ev){var t=ev.target;if(t.dataset&&t.dataset.r!==undefined)rows[+t.dataset.r][+t.dataset.c]=t.value});
  $('#mAdd',el).onclick=function(){rows.push(['','','','','','']);draw()};
  $('#mDel',el).onclick=function(){rows.pop();draw()};
  $('#mEx',el).onclick=function(){rows=EX.map(function(r){return r.slice()});draw()};
  $('#mCsv',el).onclick=function(ev){
    var q=function(s){return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};
    window.copyText([H].concat(rows).map(function(r){return r.map(q).join(',')}).join('\n'),ev.target);
  };
};

/* ---------- dates and time zones ---------- */
BUILD['l-dates']=function(el){
  var ZONES=['Asia/Singapore','UTC','Asia/Kolkata','Europe/London','America/Los_Angeles'];
  el.innerHTML='<h4>1. The same text, two dates</h4><p class="muted">Type a date written as two numbers and a year.</p><input type="text" id="dIn" value="01/12/2026" style="font-family:var(--f-mono)" aria-label="Date text"><div class="res" id="dR"></div><p class="tech" id="dT"></p>'+
   '<h4 style="margin-top:12px">2. Midnight in one zone is another day elsewhere</h4><div class="two"><label class="note">Effective date and time<br><input type="text" id="zIn" value="2026-12-01 00:00" style="font-family:var(--f-mono)"></label><label class="note">Written in this time zone<br><select id="zZ">'+ZONES.map(function(z){return '<option>'+z+'</option>'}).join('')+'</select></label></div><div class="res" id="zR"></div><p class="tech" id="zT"></p>';
  var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function d1(){
    var m=/^\s*(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})\s*$/.exec($('#dIn',el).value);
    if(!m){$('#dR',el).innerHTML='<div><small>Format</small><b>Use dd/mm/yyyy</b></div>';$('#dT').textContent='';return}
    var a=+m[1],b=+m[2],y=+m[3],dmy=(b>=1&&b<=12&&a>=1&&a<=31)?a+' '+MON[b-1]+' '+y:'not a real date',mdy=(a>=1&&a<=12&&b>=1&&b<=31)?b+' '+MON[a-1]+' '+y:'not a real date';
    $('#dR',el).innerHTML='<div><small>Day first (dd/mm)</small><b>'+dmy+'</b></div><div><small>Month first (mm/dd)</small><b>'+mdy+'</b></div><div><small>Safe way (ISO 8601)</small><b>'+(dmy!=='not a real date'?y+'-'+('0'+b).slice(-2)+'-'+('0'+a).slice(-2):'-')+'</b></div>';
    $('#dT',el).textContent=(dmy!=='not a real date'&&mdy!=='not a real date'&&dmy!==mdy)?'Both readings are real dates. A receiver can guess wrong and nobody sees an error. Always send yyyy-mm-dd.':'Only one reading works here, but the next row in the file may not. Use yyyy-mm-dd always.';
  }
  function parts(ms,z){var f=new Intl.DateTimeFormat('en-CA',{timeZone:z,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(ms)),o={};f.forEach(function(p){o[p.type]=p.value});return o}
  function off(ms,z){var o=parts(ms,z);return Date.UTC(+o.year,+o.month-1,+o.day,+o.hour,+o.minute,+o.second)-ms}
  function d2(){
    var m=/^\s*(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})\s*$/.exec($('#zIn',el).value),z=$('#zZ',el).value;
    if(!m){$('#zR',el).innerHTML='<div><small>Format</small><b>yyyy-mm-dd hh:mm</b></div>';$('#zT').textContent='';return}
    var g=Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5]),ms=g-off(g,z),o0=off(ms,z),sg=o0>=0?'+':'-',ab=Math.abs(o0)/60000,iso=m[1]+'-'+m[2]+'-'+m[3]+'T'+m[4]+':'+m[5]+':00'+sg+('0'+Math.floor(ab/60)).slice(-2)+':'+('0'+(ab%60)).slice(-2);
    var h='<div><small>Written as (ISO)</small><b style="font-size:14px">'+esc(iso)+'</b></div>',diff=false,day=m[1]+'-'+m[2]+'-'+m[3];
    ZONES.forEach(function(zz){var p=parts(ms,zz),dd=p.year+'-'+p.month+'-'+p.day;if(dd!==day)diff=true;h+='<div><small>'+zz+'</small><b style="font-size:15px">'+dd+' '+p.hour+':'+p.minute+'</b></div>'});
    $('#zR',el).innerHTML=h;
    $('#zT',el).textContent=diff?'The calendar date is different in some zones. A system that reads the time in UTC or Pacific time may treat this effective date as the day before. Send plain dates (yyyy-mm-dd) for effective dates, and ask each side which time zone it uses for timestamps.':'The date is the same in every zone shown. Midday times are safer than midnight, but plain dates are safest.';
  }
  $('#dIn',el).oninput=d1;$('#zIn',el).oninput=d2;$('#zZ',el).onchange=d2;d1();d2();
};


/* ---------- division finder + test data ---------- */
BUILD['l-division']=function(el){
  var TREE={'Acme Group':null,'Technology':'Acme Group','Finance':'Acme Group','Data Team':'Technology','Platform Team':'Technology','Payroll Team':'Finance'};
  function path(o){var a=[];while(o){a.unshift(o);o=TREE[o]}return a}
  var SC={
   future:{n:'Move approved, starts next month',ev:[['Hire Employee','2024-01-15','2024-01-10','Completed','Data Team'],['Transfer','2026-12-01','2026-10-20','Completed','Payroll Team']],asof:'2026-11-07',note:'Future-dated: completed, effective later.'},
   pending:{n:'Move still waiting for approval',ev:[['Hire Employee','2024-01-15','2024-01-10','Completed','Data Team'],['Transfer','2026-12-01','2026-11-05','In progress','Payroll Team']],asof:'2026-12-02',note:'Pending: has not changed any data.'},
   back:{n:'Back-dated move plus a future change',ev:[['Hire Employee','2024-01-15','2024-01-10','Completed','Data Team'],['Transfer','2026-09-01','2026-11-05','Completed','Platform Team'],['Change Job','2027-01-01','2026-11-05','Completed','Platform Team']],asof:'2026-10-01',note:'Back-dated: effective date is before the entry date.'},
   two:{n:'Two moves in a row',ev:[['Hire Employee','2024-01-15','2024-01-10','Completed','Data Team'],['Transfer','2026-06-01','2026-05-20','Completed','Platform Team'],['Transfer','2026-12-01','2026-11-01','Completed','Payroll Team']],asof:'2026-07-01',note:'Pick the latest completed event on or before the date.'}
  };
  var STEP={'Hire Employee':'Start Hire Employee for a dummy worker. Choose the org, job profile and the hire date. Complete every step.','Transfer':'Start Transfer (or Move Worker). Choose the new org and the effective date. For completed: finish all approvals. For pending: stop before the last approval.','Change Job':'Start Change Job. Choose the effective date and the new org or job. Complete all steps.'};
  el.innerHTML='<p class="muted">Dummy data only. Organization levels here are an example tree: Acme Group (1) > Technology or Finance (2) > team (3). Which level is your division? Decide with your lead.</p>'+
   '<div class="row"><label class="note">Scenario <select id="dvS"></select></label><label class="note">As-of date <input type="text" id="dvD" size="11" style="font-family:var(--f-mono)"></label><button type="button" id="dvCp">Copy test data (CSV)</button></div>'+
   '<h4>1. Dummy events to create</h4><div id="dvT"></div>'+
   '<h4 style="margin-top:12px">2. Steps in the sandbox (in this order)</h4><ol id="dvSt" class="note"></ol>'+
   '<h4 style="margin-top:12px">3. The query, in English</h4><pre id="dvQ" class="note" style="white-space:pre-wrap"></pre>'+
   '<h4 style="margin-top:12px">4. What a correct report must show</h4><div id="dvR" class="list"></div>';
  var sel=$('#dvS',el);sel.innerHTML=Object.keys(SC).map(function(k){return '<option value="'+k+'">'+esc(SC[k].n)+'</option>'}).join('');
  function evs(){return SC[sel.value].ev.map(function(e){return {t:e[0],eff:e[1],ent:e[2],st:e[3],org:e[4]}})}
  function run(){
    var sc=SC[sel.value],E=evs(),d=$('#dvD',el).value.trim();
    var h='<table class="tbl"><tr><th>#</th><th>Event type</th><th>Effective</th><th>Entered</th><th>Status</th><th>Org</th><th>Note</th></tr>';
    E.forEach(function(e,i){var nt=[];if(e.eff>e.ent)nt.push('future-dated');if(e.eff<e.ent&&e.t!=='Hire Employee')nt.push('back-dated');if(e.st!=='Completed')nt.push('pending');h+='<tr><td>'+(i+1)+'</td><td>'+esc(e.t)+'</td><td>'+e.eff+'</td><td>'+e.ent+'</td><td>'+e.st+'</td><td>'+esc(e.org)+'</td><td>'+nt.join(', ')+'</td></tr>'});
    $('#dvT',el).innerHTML=h+'</table><p class="note">'+esc(sc.note)+'</p>';
    $('#dvSt',el).innerHTML='<li>Reuse or create: company, cost center, the orgs above, a job profile.</li>'+E.map(function(e){return '<li>'+esc(STEP[e.t])+' Effective '+e.eff+', org '+esc(e.org)+', status '+(e.st==='Completed'?'complete':'leave pending')+'.</li>'}).join('')+'<li>Write down the worker ID, the dates and the expected answers below.</li>';
    $('#dvQ',el).textContent='SELECT organization, level 1, level 2, level 3\nFROM worker history events\nWHERE worker = the dummy worker\n  AND business process type IN (Hire Employee, Transfer, Change Job, Move Worker)\n  AND status = Completed\n  AND effective date <= as-of date\nORDER BY effective date DESC, entry moment DESC\nTAKE the first row; then climb the org tree.';
    if(!/^\d{4}-\d{2}-\d{2}$/.test(d)){$('#dvR',el).innerHTML='<div><small>Date</small><b>Use yyyy-mm-dd</b></div>';return}
    var ok=E.filter(function(e){return e.st==='Completed'&&e.eff<=d}).sort(function(a,b){return a.eff<b.eff?1:a.eff>b.eff?-1:(a.ent<b.ent?1:-1)})[0];
    var r='';
    if(!ok)r+='<div><small>As of '+d+'</small><b>No completed event yet: worker not hired</b></div>';
    else{var p=path(ok.org);r+='<div><small>As of '+d+' (from '+esc(ok.t)+' effective '+ok.eff+')</small><b>'+esc(ok.org)+'</b><small>Level 1: '+esc(p[0])+' | Level 2: '+esc(p[1]||'-')+' | Level 3: '+esc(p[2]||'-')+'</small></div>'}
    var fut=E.filter(function(e){return e.st==='Completed'&&e.eff>d}),pen=E.filter(function(e){return e.st!=='Completed'});
    fut.forEach(function(e){var p=path(e.org);r+='<div><small>Future-dated (approved)</small><b>'+esc(e.org)+' from '+e.eff+'</b><small>Levels: '+p.map(esc).join(' > ')+'</small></div>'});
    pen.forEach(function(e){var p=path(e.org);r+='<div><small>Pending (not approved, no data change)</small><b>'+esc(e.org)+' if approved, effective '+e.eff+'</b><small>Levels: '+p.map(esc).join(' > ')+'</small></div>'});
    $('#dvR',el).innerHTML=r;
  }
  sel.onchange=function(){$('#dvD',el).value=SC[sel.value].asof;run()};
  $('#dvD',el).oninput=run;
  $('#dvCp',el).onclick=function(){var t='worker,event_type,effective,entered,status,organization,level1,level2,level3\n'+evs().map(function(e){var p=path(e.org);return ['E9001',e.t,e.eff,e.ent,e.st,e.org,p[0],p[1]||'',p[2]||''].join(',')}).join('\n');
    try{navigator.clipboard.writeText(t)}catch(x){} this.textContent='Copied';var b=this;setTimeout(function(){b.textContent='Copy test data (CSV)'},1500)};
  $('#dvD',el).value=SC.future.asof;run();
};


/* ---------- XSLT playground (simple + rich Workday-style XML) ---------- */
var NSURI='urn:com.workday.report/Demo_Workers_Report';
function xWid(n){var h='0123456789abcdef',s='',i;for(i=0;i<32;i++)s+=h.charAt((n*7+i*5+(i>>1)*n)%16);return s}
function xRef(tag,desc,type,val,n,inner){return '<wd:'+tag+' wd:Descriptor="'+desc+'"><wd:ID wd:type="WID">'+xWid(n)+'</wd:ID><wd:ID wd:type="'+type+'">'+val+'</wd:ID>'+(inner||'')+'</wd:'+tag+'>'}
function xPretty(x){var pad=0,out=[];x.replace(/>\s*</g,'>\n<').split('\n').forEach(function(l){if(/^<\/[^>]+>$/.test(l))pad--;out.push(new Array(Math.max(pad,0)+1).join('  ')+l);if(/^<[^\/!?][^>]*[^\/]>$/.test(l))pad++});return out.join('\n')}
function xJob(primary,pos,posId,loc,locId,org,orgId,parent,parentId,pay,n){return '<wd:Worker_Job><wd:Primary_Job>'+primary+'</wd:Primary_Job>'+xRef('Position',pos,'Position_ID',posId,n)+xRef('Location',loc,'Location_ID',locId,n+1)+xRef('Supervisory_Organization',org,'Organization_Reference_ID',orgId,n+2,xRef('Superior_Organization',parent,'Organization_Reference_ID',parentId,n+3))+(pay===''?'<wd:Pay/>':'<wd:Pay>'+pay+'</wd:Pay>')+'</wd:Worker_Job>'}
var XML_SIMPLE=xPretty('<wd:Report_Data xmlns:wd="'+NSURI+'">'+[['E9001','Priya Nair','2024-01-15','Data Team'],['E9002','Arun Menon','2023-06-01','Payroll Team'],['E9003','Meera Iyer','2025-03-10','Platform Team']].map(function(r){return '<wd:Report_Entry><wd:Employee_ID>'+r[0]+'</wd:Employee_ID><wd:Legal_Name>'+r[1]+'</wd:Legal_Name><wd:Hire_Date>'+r[2]+'</wd:Hire_Date><wd:Org>'+r[3]+'</wd:Org></wd:Report_Entry>'}).join('')+'</wd:Report_Data>');
var XML_RICH=xPretty('<wd:Report_Data xmlns:wd="'+NSURI+'">'+
 '<wd:Report_Entry><wd:Employee_ID>E9001</wd:Employee_ID><wd:Legal_Name>Priya Nair</wd:Legal_Name><wd:Hire_Date>2024-01-15-08:00</wd:Hire_Date>'+xRef('Gender','Female','Gender_Code','Female',11)+'<wd:Email>priya@example.com</wd:Email><wd:Email>priya.n@example.org</wd:Email>'+xJob(1,'Data Analyst (P-0012)','P-0012','Dallas','DALLAS','Data Team','DATA_TEAM','Technology','TECHNOLOGY','77500',20)+'</wd:Report_Entry>'+
 '<wd:Report_Entry><wd:Employee_ID>E9002</wd:Employee_ID><wd:Legal_Name>Arun Menon</wd:Legal_Name><wd:Hire_Date>2023-06-01-08:00</wd:Hire_Date>'+xRef('Gender','Male','Gender_Code','Male',12)+'<wd:Email>arun@example.com</wd:Email>'+xJob(1,'Payroll Analyst (P-0044)','P-0044','Singapore','SINGAPORE','Payroll Team','PAYROLL_TEAM','Finance','FINANCE','64000',30)+xJob(0,'Data Mentor (P-0090)','P-0090','Dallas','DALLAS','Data Team','DATA_TEAM','Technology','TECHNOLOGY','8000',40)+'</wd:Report_Entry>'+
 '<wd:Report_Entry><wd:Employee_ID>E9003</wd:Employee_ID><wd:Legal_Name>Iyer, Meera</wd:Legal_Name><wd:Hire_Date>2025-03-10-08:00</wd:Hire_Date>'+xJob(1,'Platform Engineer (P-0101)','P-0101','Singapore','SINGAPORE','Platform Team','PLATFORM_TEAM','Technology','TECHNOLOGY','',50)+'</wd:Report_Entry>'+
 '</wd:Report_Data>');
var XH='<xsl:stylesheet version="1.0"\n  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"\n  xmlns:wd="'+NSURI+'">\n';
var XT='</xsl:stylesheet>';
var XP=[
 {g:'Basics',n:'1. XML to CSV',d:'s',x:XH+`  <xsl:output method="text"/>
  <xsl:template match="/wd:Report_Data">
    <xsl:text>Employee ID,Name,Hire Date,Org&#10;</xsl:text>
    <xsl:for-each select="wd:Report_Entry">
      <xsl:value-of select="wd:Employee_ID"/><xsl:text>,</xsl:text>
      <xsl:value-of select="wd:Legal_Name"/><xsl:text>,</xsl:text>
      <xsl:value-of select="wd:Hire_Date"/><xsl:text>,</xsl:text>
      <xsl:value-of select="wd:Org"/><xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
`+XT,e:['output method="text": the result is plain text, no tags.','template match: start at the root, Report_Data.','The first xsl:text writes the header line. &#10; means new line.','for-each: run the next lines once for every Report_Entry.','value-of picks one field. xsl:text writes the comma.','The last xsl:text on each pass ends the line.']},
 {g:'Basics',n:'2. Pipe file, capital letters, date as DD-MM-YYYY',d:'s',x:XH+`  <xsl:output method="text"/>
  <xsl:template match="/wd:Report_Data">
    <xsl:for-each select="wd:Report_Entry">
      <xsl:value-of select="wd:Employee_ID"/><xsl:text>|</xsl:text>
      <xsl:value-of select="translate(wd:Legal_Name,'abcdefghijklmnopqrstuvwxyz','ABCDEFGHIJKLMNOPQRSTUVWXYZ')"/><xsl:text>|</xsl:text>
      <xsl:value-of select="concat(substring(wd:Hire_Date,9,2),'-',substring(wd:Hire_Date,6,2),'-',substring(wd:Hire_Date,1,4))"/><xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
`+XT,e:['The separator is | now, so only the xsl:text changes.','translate swaps each lower-case letter for its capital.','substring(text, start, length) cuts a piece of the date.','concat joins the pieces: day, dash, month, dash, year.','Workday also has ETV and XTT helpers for this kind of formatting.']},
 {g:'Basics',n:'3. XML to another XML (rename + filter)',d:'s',x:XH.replace('version="1.0"','version="1.0" exclude-result-prefixes="wd"')+`  <xsl:output method="xml" indent="yes"/>
  <xsl:template match="/wd:Report_Data">
    <Workers>
      <xsl:for-each select="wd:Report_Entry[wd:Org != 'Payroll Team']">
        <Worker id="{wd:Employee_ID}">
          <Name><xsl:value-of select="wd:Legal_Name"/></Name>
          <Start><xsl:value-of select="wd:Hire_Date"/></Start>
        </Worker>
      </xsl:for-each>
    </Workers>
  </xsl:template>
`+XT,e:['output method="xml": the result is XML.','Plain tags in the stylesheet (Workers, Worker, Name) are copied to the output as they are.','The square brackets [ ] are a filter: skip Payroll Team.','id="{...}" puts a value inside an attribute.','exclude-result-prefixes="wd" keeps the wd: label out of the new XML.']},
 {g:'Basics',n:'4. Sort by hire date and number the rows',d:'s',x:XH+`  <xsl:output method="text"/>
  <xsl:template match="/wd:Report_Data">
    <xsl:for-each select="wd:Report_Entry">
      <xsl:sort select="wd:Hire_Date"/>
      <xsl:value-of select="position()"/><xsl:text>. </xsl:text>
      <xsl:value-of select="wd:Legal_Name"/><xsl:text> (</xsl:text>
      <xsl:value-of select="wd:Hire_Date"/><xsl:text>)&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
`+XT,e:['xsl:sort goes first inside for-each. Oldest hire date first.','position() is the row number after sorting.','Break it: change the sort field to wd:Legal_Name.','Numbers sort as text unless you add data-type="number". Try it on Pay later.']},
 {g:'Objects inside objects',n:'5. One row per job (loop inside a loop)',d:'r',x:XH+`  <xsl:output method="text"/>
  <xsl:template match="/wd:Report_Data">
    <xsl:text>Employee,Position,Location,Org,Parent org&#10;</xsl:text>
    <xsl:for-each select="wd:Report_Entry">
      <xsl:variable name="emp" select="wd:Employee_ID"/>
      <xsl:for-each select="wd:Worker_Job">
        <xsl:value-of select="$emp"/><xsl:text>,</xsl:text>
        <xsl:value-of select="wd:Position/@wd:Descriptor"/><xsl:text>,</xsl:text>
        <xsl:value-of select="wd:Location/@wd:Descriptor"/><xsl:text>,</xsl:text>
        <xsl:value-of select="wd:Supervisory_Organization/@wd:Descriptor"/><xsl:text>,</xsl:text>
        <xsl:value-of select="wd:Supervisory_Organization/wd:Superior_Organization/@wd:Descriptor"/><xsl:text>&#10;</xsl:text>
      </xsl:for-each>
    </xsl:for-each>
  </xsl:template>
`+XT,e:['Each worker has a repeating group, Worker_Job. Arun has two, so he gets two lines.','The outer loop is the worker. The inner loop is the job.','Inside the inner loop the current item is the job, so the worker ID must be saved first in a variable ($emp).','@wd:Descriptor is an attribute: the readable name of a related object.','Org > Superior_Organization is an object inside an object. Follow the path with slashes.']},
 {g:'Objects inside objects',n:'6. Descriptor vs ID types (which one to send?)',d:'r',x:XH+`  <xsl:output method="text"/>
  <xsl:template match="/wd:Report_Data">
    <xsl:text>Employee|Descriptor|Location_ID|WID&#10;</xsl:text>
    <xsl:for-each select="wd:Report_Entry">
      <xsl:for-each select="wd:Worker_Job[wd:Primary_Job='1']/wd:Location">
        <xsl:value-of select="../../wd:Employee_ID"/><xsl:text>|</xsl:text>
        <xsl:value-of select="@wd:Descriptor"/><xsl:text>|</xsl:text>
        <xsl:value-of select="wd:ID[@wd:type='Location_ID']"/><xsl:text>|</xsl:text>
        <xsl:value-of select="wd:ID[@wd:type='WID']"/><xsl:text>&#10;</xsl:text>
      </xsl:for-each>
    </xsl:for-each>
  </xsl:template>
`+XT,e:['One related object, Location, carries three things: a readable Descriptor and several IDs.','The IDs are all elements named wd:ID. What tells them apart is the attribute wd:type.','wd:ID[@wd:type=\'Location_ID\'] means: the ID whose type is Location_ID.','Vendors usually want a stable ID like Location_ID. Descriptors can be renamed by an admin. The WID is different in some tenants.','../.. means go up two levels (job, then worker).']},
 {g:'Objects inside objects',n:'7. Primary job only',d:'r',x:XH+`  <xsl:output method="text"/>
  <xsl:template match="/wd:Report_Data">
    <xsl:for-each select="wd:Report_Entry">
      <xsl:value-of select="wd:Employee_ID"/><xsl:text>,</xsl:text>
      <xsl:value-of select="wd:Worker_Job[wd:Primary_Job='1']/wd:Position/@wd:Descriptor"/><xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
`+XT,e:['The filter [wd:Primary_Job=\'1\'] keeps only the primary job.','Without it, value-of shows only the first job it finds, which may not be the primary one.','The filter depends on how your report names the flag. Check your own report.']},
 {g:'Objects inside objects',n:'8. Join many values (emails) with ;',d:'r',x:XH+`  <xsl:output method="text"/>
  <xsl:template match="/wd:Report_Data">
    <xsl:for-each select="wd:Report_Entry">
      <xsl:value-of select="wd:Employee_ID"/><xsl:text>,</xsl:text>
      <xsl:for-each select="wd:Email">
        <xsl:if test="position() &gt; 1"><xsl:text>;</xsl:text></xsl:if>
        <xsl:value-of select="."/>
      </xsl:for-each>
      <xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
`+XT,e:['A field can repeat: Priya has two Email elements, Meera has none.','The inner for-each loops over the emails.','position() > 1 means: put a semicolon before every email except the first.','Meera has none, so her line ends right after the comma. Decide with the business what an empty value should look like.','Workday\'s Simple XML does a similar collapse with semicolons.']},
 {g:'Decisions and lookups',n:'9. Map codes with choose / when / otherwise',d:'r',x:XH+`  <xsl:output method="text"/>
  <xsl:template match="/wd:Report_Data">
    <xsl:for-each select="wd:Report_Entry">
      <xsl:value-of select="wd:Employee_ID"/><xsl:text>,</xsl:text>
      <xsl:choose>
        <xsl:when test="wd:Gender/@wd:Descriptor='Female'">F</xsl:when>
        <xsl:when test="wd:Gender/@wd:Descriptor='Male'">M</xsl:when>
        <xsl:otherwise>U</xsl:otherwise>
      </xsl:choose>
      <xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
`+XT,e:['choose is an if / else-if / else.','Each when tests one value and writes the vendor code.','otherwise is the safety net. Meera has no Gender element at all, so she gets U.','Without otherwise, a missing or new value gives an empty column. This is how unmapped values slip into files.','Core Connectors have integration maps for this, so you may not need it in the XSLT.']},
 {g:'Decisions and lookups',n:'10. Group and count (xsl:key)',d:'r',x:XH+`  <xsl:output method="text"/>
  <xsl:key name="byOrg" match="wd:Worker_Job" use="wd:Supervisory_Organization/@wd:Descriptor"/>
  <xsl:template match="/wd:Report_Data">
    <xsl:text>Org,Headcount&#10;</xsl:text>
    <xsl:for-each select="wd:Report_Entry/wd:Worker_Job[generate-id() = generate-id(key('byOrg', wd:Supervisory_Organization/@wd:Descriptor)[1])]">
      <xsl:sort select="wd:Supervisory_Organization/@wd:Descriptor"/>
      <xsl:value-of select="wd:Supervisory_Organization/@wd:Descriptor"/><xsl:text>,</xsl:text>
      <xsl:value-of select="count(key('byOrg', wd:Supervisory_Organization/@wd:Descriptor))"/><xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
`+XT,e:['xsl:key builds an index: jobs grouped by organization name.','The long select keeps only the first job of each organization, so each org appears once.','count(key(...)) counts all the jobs in that organization. Data Team has 2 jobs (Priya, and Arun\'s second job).','This pattern is called Muenchian grouping. You rarely write it, but you will see it in real stylesheets.']},
 {g:'Decisions and lookups',n:'11. Trailer with count and total (spot the NaN)',d:'r',x:XH+`  <xsl:output method="text"/>
  <xsl:template match="/wd:Report_Data">
    <xsl:for-each select="wd:Report_Entry">
      <xsl:value-of select="wd:Employee_ID"/><xsl:text>|</xsl:text>
      <xsl:value-of select="wd:Worker_Job/wd:Pay"/><xsl:text>&#10;</xsl:text>
    </xsl:for-each>
    <xsl:text>T|</xsl:text>
    <xsl:value-of select="count(wd:Report_Entry)"/><xsl:text>|</xsl:text>
    <xsl:value-of select="sum(wd:Report_Entry/wd:Worker_Job/wd:Pay)"/>
  </xsl:template>
`+XT,e:['A trailer (control total) lets the receiver check they got everything: how many rows, and the sum.','count() counts the workers.','sum() adds the numbers. But Meera\'s Pay is empty, so the total is NaN: not a number.','Fix: only add non-empty values: sum(wd:Report_Entry/wd:Worker_Job/wd:Pay[normalize-space(.) != \'\'])','Also note that Arun\'s first Pay is shown, but his total includes both jobs. Decide what the receiver expects.']},
 {g:'Formatting',n:'12. Fixed-length file (pad, truncate, default)',d:'r',x:XH+`  <xsl:output method="text"/>
  <xsl:variable name="pad" select="'                              '"/>
  <xsl:template match="/wd:Report_Data">
    <xsl:for-each select="wd:Report_Entry">
      <xsl:value-of select="substring(concat(wd:Employee_ID, $pad), 1, 8)"/>
      <xsl:value-of select="substring(concat(wd:Legal_Name, $pad), 1, 12)"/>
      <xsl:choose>
        <xsl:when test="normalize-space(wd:Worker_Job[1]/wd:Pay) != ''">
          <xsl:value-of select="format-number(wd:Worker_Job[1]/wd:Pay, '0000000')"/>
        </xsl:when>
        <xsl:otherwise>0000000</xsl:otherwise>
      </xsl:choose>
      <xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
`+XT,e:['Fixed length: every field has an exact width, with spaces or zeros as filler.','concat(value, spaces) then substring(…, 1, N): pads short values and cuts long ones. "Iyer, Meera" is 11 characters; a longer name would be cut to 12.','format-number(value, \'0000000\') pads a number with leading zeros.','The choose gives a default 0000000 when Pay is empty. Without it you get NaN.','Workday XTT does padding and truncation with attributes, which is easier. Understand the idea here.']},
 {g:'Formatting',n:'13. Quote values that contain commas (named template)',d:'r',x:XH+`  <xsl:output method="text"/>
  <xsl:template name="q">
    <xsl:param name="v"/>
    <xsl:choose>
      <xsl:when test="contains($v, ',')"><xsl:text>"</xsl:text><xsl:value-of select="$v"/><xsl:text>"</xsl:text></xsl:when>
      <xsl:otherwise><xsl:value-of select="$v"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <xsl:template match="/wd:Report_Data">
    <xsl:for-each select="wd:Report_Entry">
      <xsl:value-of select="wd:Employee_ID"/><xsl:text>,</xsl:text>
      <xsl:call-template name="q"><xsl:with-param name="v" select="wd:Legal_Name"/></xsl:call-template>
      <xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
`+XT,e:['Meera is stored as "Iyer, Meera". A comma inside a CSV value would split it into two columns.','A named template is a small reusable function. call-template runs it, with-param passes the value.','If the value contains a comma, wrap it in double quotes.','A value that contains a double quote also needs care (the quote is doubled). Real files have more edge cases like this.']},
 {g:'Formatting',n:'14. Dates: remove the time zone part',d:'r',x:XH+`  <xsl:output method="text"/>
  <xsl:template match="/wd:Report_Data">
    <xsl:for-each select="wd:Report_Entry">
      <xsl:value-of select="wd:Employee_ID"/><xsl:text>|</xsl:text>
      <xsl:value-of select="wd:Hire_Date"/><xsl:text>|</xsl:text>
      <xsl:value-of select="substring(wd:Hire_Date, 1, 10)"/><xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
`+XT,e:['Workday XML dates can end with a time zone offset such as -08:00.','Column 2 is the raw value. Column 3 keeps only the first 10 characters: yyyy-mm-dd.','Simple XML removes the offset for you, as the course notes. Workday XML does not.','If a receiver rejects the date, check for this first.']},
 {g:'Copy and change',n:'15. Copy everything, change one thing (identity)',d:'r',x:XH+`  <xsl:output method="xml" indent="yes"/>
  <xsl:template match="@*|node()">
    <xsl:copy><xsl:apply-templates select="@*|node()"/></xsl:copy>
  </xsl:template>
  <xsl:template match="wd:Pay"><wd:Pay>***</wd:Pay></xsl:template>
`+XT,e:['The first template is the identity transform: copy every element, attribute and text as it is.','The second template is more specific, so it wins for wd:Pay and masks the value.','This is the safest way to change one thing in a big XML without rebuilding the whole structure.','apply-templates (instead of for-each) lets the most specific rule decide for each part.']},
 {g:'Break it',n:'B1. Wrong namespace address (no error, wrong output)',d:'s',x:XH.replace('Demo_Workers_Report','Wrong_Report')+`  <xsl:output method="text"/>
  <xsl:template match="/wd:Report_Data">
    <xsl:text>Employee ID,Name&#10;</xsl:text>
    <xsl:for-each select="wd:Report_Entry">
      <xsl:value-of select="wd:Employee_ID"/><xsl:text>,</xsl:text>
      <xsl:value-of select="wd:Legal_Name"/><xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
`+XT,e:['The wd: address here does not match the XML, so the rule never matches.','Result: the values run together as plain text with no commas, because no rule matched. No error is shown.','The prefix (wd) can be anything. The address after it must match exactly.','Fix: copy the namespace address from the XML.']},
 {g:'Break it',n:'B2. Missed a level in the path (blank column)',d:'r',x:XH+`  <xsl:output method="text"/>
  <xsl:template match="/wd:Report_Data">
    <xsl:for-each select="wd:Report_Entry">
      <xsl:value-of select="wd:Employee_ID"/><xsl:text>,</xsl:text>
      <xsl:value-of select="wd:Position/@wd:Descriptor"/><xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
`+XT,e:['Position is not directly under Report_Entry. It is inside Worker_Job.','Result: the second column is blank. No error.','Fix: wd:Worker_Job/wd:Position/@wd:Descriptor. Use the XML Tree lab to find the right path.']},
 {g:'Break it',n:'B3. Attribute used like an element (blank)',d:'r',x:XH+`  <xsl:output method="text"/>
  <xsl:template match="/wd:Report_Data">
    <xsl:for-each select="wd:Report_Entry">
      <xsl:value-of select="wd:Employee_ID"/><xsl:text>,</xsl:text>
      <xsl:value-of select="wd:Worker_Job/wd:Location/wd:Descriptor"/><xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
`+XT,e:['Descriptor is an attribute, written @wd:Descriptor. Here it was written as an element.','Result: blank column, no error.','Elements use plain names. Attributes use @.']},
 {g:'Break it',n:'B4. Many jobs, only the first appears',d:'r',x:XH+`  <xsl:output method="text"/>
  <xsl:template match="/wd:Report_Data">
    <xsl:for-each select="wd:Report_Entry">
      <xsl:value-of select="wd:Employee_ID"/><xsl:text>,</xsl:text>
      <xsl:value-of select="wd:Worker_Job/wd:Position/@wd:Descriptor"/><xsl:text>&#10;</xsl:text>
    </xsl:for-each>
  </xsl:template>
`+XT,e:['Arun has two jobs. value-of on a list of items shows only the first one.','Result: Arun appears with one position and the second job silently disappears.','Fix: loop over the jobs (example 5), or filter to the one you want (example 7).','This is one of the most common real-life defects, because test data usually has one job per person.']}
];
BUILD['l-xslt']=function(el){
  el.innerHTML='<p class="muted">Dummy data only. Runs in your browser with plain XSLT 1.0. The XML has two sets: a simple flat one, and a Workday-style one with objects inside objects. Workday ETV and XTT are Workday-only, so they are not run here. Element names in the rich XML are illustrative: your report\'s XML aliases decide the real names.</p>'+
   '<div class="row"><label class="note">Example <select id="xsP"></select></label><button type="button" id="xsR">Run</button><button type="button" id="xsC">Copy output</button><a href="#l-xtree" class="note">Open the XML tree</a></div>'+
   '<div class="row" style="align-items:stretch"><label class="note" style="flex:1 1 280px">1. XML in<textarea id="xsX" rows="14" spellcheck="false" style="width:100%;font:13px var(--f-mono)"></textarea></label><label class="note" style="flex:1 1 280px">2. Stylesheet (the rules)<textarea id="xsS" rows="14" spellcheck="false" style="width:100%;font:13px var(--f-mono)"></textarea></label></div>'+
   '<h4>3. Output</h4><pre id="xsO" class="note" style="white-space:pre-wrap;min-height:70px;border:1px solid var(--line);border-radius:10px;padding:10px"></pre><p id="xsM" class="note"></p>'+
   '<h4>How this example works</h4><ol id="xsE" class="note"></ol>';
  var sel=$('#xsP',el),gs=[];XP.forEach(function(p,i){if(gs.indexOf(p.g)<0)gs.push(p.g)});
  sel.innerHTML=gs.map(function(g){return '<optgroup label="'+esc(g)+'">'+XP.map(function(p,i){return p.g===g?'<option value="'+i+'">'+esc(p.n)+'</option>':''}).join('')+'</optgroup>'}).join('');
  function load(){var p=XP[+sel.value];$('#xsX',el).value=p.d==='r'?XML_RICH:XML_SIMPLE;$('#xsS',el).value=p.x;$('#xsE',el).innerHTML=p.e.map(function(t){return '<li>'+esc(t)+'</li>'}).join('');run()}
  function run(){
    var out=$('#xsO',el),msg=$('#xsM',el);msg.textContent='';
    try{
      var dp=new DOMParser(),xd=dp.parseFromString($('#xsX',el).value,'application/xml'),sd=dp.parseFromString($('#xsS',el).value,'application/xml');
      if(xd.getElementsByTagName('parsererror').length){out.textContent='';msg.textContent='The XML is not well-formed: a tag is not closed or a character is wrong.';return}
      if(sd.getElementsByTagName('parsererror').length){out.textContent='';msg.textContent='The stylesheet is not well-formed XML: check closing tags and quotes.';return}
      var pr=new XSLTProcessor();pr.importStylesheet(sd);var fr=pr.transformToFragment(xd,document),txt=/method\s*=\s*["']text["']/.test($('#xsS',el).value);
      out.textContent=txt?fr.textContent:new XMLSerializer().serializeToString(fr);
      if(!out.textContent.trim())msg.textContent='Empty output. Common causes: wrong namespace address, wrong path, or a filter that removes every row.';
    }catch(e){out.textContent='';msg.textContent='Could not run: '+e.message}
  }
  sel.onchange=load;$('#xsR',el).onclick=run;
  $('#xsC',el).onclick=function(){try{navigator.clipboard.writeText($('#xsO',el).textContent)}catch(x){}this.textContent='Copied';var b=this;setTimeout(function(){b.textContent='Copy output'},1400)};
  load();
};

/* ---------- XML tree explorer ---------- */
BUILD['l-xtree']=function(el){
  el.innerHTML='<p class="muted">Click any line to see its XPath, its value, and what kind of thing it is. Dummy data. Element names are illustrative.</p><div class="row"><label class="note">Data <select id="xtD"><option value="r">Workday-style XML with objects inside objects</option><option value="s">Simple flat XML</option></select></label></div><div class="row" style="align-items:flex-start"><div id="xtT" style="flex:1 1 320px;max-height:420px;overflow:auto;border:1px solid var(--line);border-radius:10px;padding:8px;font:13px var(--f-mono)"></div><div id="xtI" class="note" style="flex:1 1 260px"><p>Click a line on the left.</p></div></div>';
  var doc,tree=$('#xtT',el),info=$('#xtI',el);
  function ln(n){return n.localName}
  function pfx(n){return n.prefix?n.prefix+':':''}
  function path(n){var p=[];while(n&&n.nodeType===1){var s=pfx(n)+ln(n),sib=[],c=n.parentNode?n.parentNode.children:[],i;for(i=0;i<c.length;i++)if(c[i].localName===n.localName&&c[i].namespaceURI===n.namespaceURI)sib.push(c[i]);
      if(ln(n)==='ID'&&n.getAttributeNS(NSURI,'type'))s+="[@wd:type='"+n.getAttributeNS(NSURI,'type')+"']";else if(sib.length>1)s+='['+(sib.indexOf(n)+1)+']';p.unshift(s);n=n.parentNode}return '/'+p.join('/')}
  function kind(n){var k=[],i,hasID=false,c=n.children;for(i=0;i<c.length;i++)if(ln(c[i])==='ID')hasID=true;
    if(hasID)k.push('Related business object (has IDs and a Descriptor)');else if(ln(n)==='ID')k.push('An ID of the object above. The type attribute says which kind.');else if(c.length)k.push('Group (contains other elements)');else k.push('Simple value');
    var sib=n.parentNode?Array.prototype.filter.call(n.parentNode.children,function(x){return x.localName===n.localName}):[n];if(sib.length>1&&ln(n)!=='ID')k.push('Repeats here: '+sib.length+' instances. Use a loop or a filter.');return k}
  function draw(nd,box,depth){var c=nd.children,txt=c.length?'':nd.textContent,d=document.createElement('div');d.style.paddingLeft=(depth?14:0)+'px';var h=document.createElement('div');h.style.cursor='pointer';h.style.padding='1px 3px';h.style.borderRadius='4px';
    var at='';Array.prototype.forEach.call(nd.attributes,function(a){if(a.name.indexOf('xmlns')!==0)at+=' '+a.name+'="'+a.value+'"'});
    h.textContent=(c.length?'▾ ':'  ')+'<'+pfx(nd)+ln(nd)+at+'>'+(txt?txt:'');h.onclick=function(e){e.stopPropagation();Array.prototype.forEach.call(tree.querySelectorAll('[data-sel]'),function(x){x.removeAttribute('data-sel');x.style.background=''});h.setAttribute('data-sel',1);h.style.background='var(--accent-soft)';
      info.innerHTML='<p><b>XPath</b></p><pre style="white-space:pre-wrap;word-break:break-all">'+esc(path(nd))+'</pre><p><b>Value</b></p><pre style="white-space:pre-wrap">'+esc(c.length?'(group)':nd.textContent||'(empty)')+'</pre><p><b>What is it?</b></p><ul>'+kind(nd).map(function(k){return '<li>'+esc(k)+'</li>'}).join('')+'</ul>'+(nd.getAttributeNS(NSURI,'Descriptor')?'<p><b>Descriptor</b>: '+esc(nd.getAttributeNS(NSURI,'Descriptor'))+' (read it with @wd:Descriptor)</p>':'')};
    d.appendChild(h);box.appendChild(d);Array.prototype.forEach.call(c,function(x){draw(x,d,depth+1)})}
  function load(){doc=new DOMParser().parseFromString($('#xtD',el).value==='r'?XML_RICH:XML_SIMPLE,'application/xml');tree.innerHTML='';draw(doc.documentElement,tree,0);info.innerHTML='<p>Click a line on the left.</p>'}
  $('#xtD',el).onchange=load;load();
};

/* ---------- shell ---------- */
window.Labs={render:function(root){
  root.innerHTML='<div><h2>Labs</h2><p class="muted">Small tools with dummy data. They run in your browser. Nothing is uploaded. Never paste real employee data.</p></div><div class="list" id="labList"></div>';
  $('#labList',root).innerHTML=B.labs.map(function(l){
    return '<details class="lab" id="'+l.id+'"><summary><span class="at">'+esc(l.title)+'</span><span class="as">'+esc(l.desc)+'</span></summary><div class="labb"></div></details>';
  }).join('');
  Array.prototype.forEach.call(root.querySelectorAll('details.lab'),function(d){
    d.addEventListener('toggle',function(){
      if(d.open&&!d.dataset.m){d.dataset.m=1;BUILD[d.id](d.querySelector('.labb'))}
    });
  });
}};
})();
