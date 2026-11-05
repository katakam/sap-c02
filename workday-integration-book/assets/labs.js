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
