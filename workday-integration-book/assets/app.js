/* App shell: router, search box, library, animations, playbooks, meetings, job map, quiz. */
(function(){
'use strict';
var B=window.BOOK;
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var store={
  get:function(k,d){try{var v=localStorage.getItem('wib.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set:function(k,v){try{localStorage.setItem('wib.'+k,JSON.stringify(v))}catch(e){}}
};
function copy(text,btn){
  var done=function(){if(btn){var o=btn.getAttribute('data-l')||btn.textContent;btn.setAttribute('data-l',o);btn.textContent='Copied';setTimeout(function(){btn.textContent=o},1400)}};
  var fb=function(){var t=document.createElement('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}catch(e){}document.body.removeChild(t)};
  try{navigator.clipboard.writeText(text).then(done,fb)}catch(e){fb()}
}
window.copyText=copy;
function hl(text,toks){
  var t=esc(text);
  if(!toks||!toks.length)return t;
  toks.forEach(function(k){
    if(k.length<2||/^(amp|lt|gt|quot)$/.test(k))return;
    t=t.replace(new RegExp('('+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi'),'<mark>$1</mark>');
  });
  return t;
}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}

var TABS=[['start','Start'],['library','Library'],['movie','Movie'],['animations','Animations'],['playbooks','Playbooks'],['meetings','Meetings and email'],['labs','Labs'],['jobmap','Job map'],['quiz','Quiz']];
var cur='start',rendered={};
var S={q:'',part:'',lv:0,kd:'',hide:false,open:false,sort:'chapter',known:new Set(store.get('known',[]))};
var PN={},PI={};
B.parts.forEach(function(p,i){PN[p.id]=p.name;PI[p.id]=i});
B.entries.forEach(function(e,i){e._i=i});
var TAGS={};
B.entries.forEach(function(e){e.t.forEach(function(t){(TAGS[t]=TAGS[t]||[]).push(e)})});
function related(e){
  var seen={},out=[];
  e.t.slice().sort(function(a,b){return TAGS[a].length-TAGS[b].length}).forEach(function(t){
    TAGS[t].forEach(function(r){if(r!==e&&!seen[r.id]&&out.length<5){seen[r.id]=1;out.push(r)}});
  });
  return out;
}

/* theme */
var themeBtn=$('#theme'),themes=['auto','light','dark'];
function applyTheme(t){
  var r=document.documentElement;
  if(t==='auto')r.removeAttribute('data-theme');else r.setAttribute('data-theme',t);
  themeBtn.textContent=t==='auto'?'Auto':t==='light'?'Light':'Dark';
}
applyTheme(store.get('theme','auto'));
themeBtn.onclick=function(){var t=themes[(themes.indexOf(store.get('theme','auto'))+1)%3];store.set('theme',t);applyTheme(t)};

/* tabs */
$('#tabs').innerHTML=TABS.map(function(t){return '<a href="#'+t[0]+'" data-tab="'+t[0]+'">'+t[1]+'</a>'}).join('');

/* ---------- start ---------- */
var PATH=[
 ['Days 1 to 3','Get comfortable','Files, folders, office words and email words. Then see what an integration is.',['pc','ac','em'],['a-flow'],'l-csv','Lab: CSV file checker'],
 ['Days 4 to 7','How integrations work','Source and target, files, schedules, full and delta, errors.',['if'],['a-sftp','a-delta','a-reconcile'],'l-recon','Lab: reconcile two lists'],
 ['Week 2','Formats and the web','CSV, XML, XPath, XSLT, JSON, SOAP, REST, HTTP status codes.',['fm'],['a-xslt','a-api-types','a-http'],'l-xpath','Lab: XPath and XSLT playground'],
 ['Week 3','Workday HR from zero','Workers, organizations, jobs, positions, history, business processes.',['hr'],['a-org-tree','a-two-jobs','a-worker-history','a-bp'],'l-time','Lab: time travel'],
 ['Week 4','Reports and tools','Custom reports, RaaS, EIB, Core Connector, Studio, web services.',['rp','tl'],['a-core-connector','a-eib-out','a-eib-in','a-studio'],'l-map','Lab: mapping table builder'],
 ['Week 5','Payroll','Business objects payroll needs, PECI, cut-off, retro, reconciliation.',['py'],['a-payroll-flow','a-payroll-objects','a-backdated'],'l-dates','Lab: dates and time zones'],
 ['Week 6','Security, delivery, support','Access, privacy, project stages, testing, incidents, root cause.',['sc','dl'],['a-security','a-lifecycle','a-environments','a-troubleshoot'],'','Then: Playbooks and Meetings']
];
function renderStart(){
  var root=$('#v-start'),tot=B.entries.length,kn=S.known.size;
  var pr=B.parts.map(function(p){
    var all=B.entries.filter(function(e){return e.part===p.id}),k=all.filter(function(e){return S.known.has(e.id)}).length;
    return '<div><div class="row" style="justify-content:space-between"><a href="#library" data-gopart="'+p.id+'">'+esc(p.name)+'</a><span class="note">'+k+' of '+all.length+'</span></div><div class="bar2"><i style="width:'+(all.length?Math.round(100*k/all.length):0)+'%"></i></div></div>';
  }).join('');
  root.innerHTML=
   '<div style="display:flex;flex-direction:column;gap:10px"><span class="b lv1" style="align-self:flex-start">Plain English. Short sentences.</span><h1>Workday Integration Book</h1>'+
   '<p class="lead">Every word you will hear in Workday integration work, explained from zero. Search any word. Watch it move. Then try it with dummy data.</p>'+
   '<div class="row"><button class="on" id="goSearch">Search the book</button><a href="#library" class="b lv1" style="padding:9px 14px;font-size:15px;text-decoration:none">Open the Library</a><a href="#movie" class="b lv3" style="padding:9px 14px;font-size:15px;text-decoration:none">Watch the integration movie</a><a href="#animations" class="b lv3" style="padding:9px 14px;font-size:15px;text-decoration:none">More animations</a></div></div>'+
   '<div class="grid3" style="grid-template-columns:repeat(2,minmax(0,1fr))">'+
    [[tot,'terms explained'],[B.anims.length,'animations'],[B.playbooks.length,'fix-it playbooks'],[B.phrases.length+B.templates.length+B.checks.length,'phrases, emails, checklists']].map(function(s){return '<div class="card stat"><b>'+s[0]+'</b><span class="muted">'+s[1]+'</span></div>'}).join('')+'</div>'+
   '<div class="card"><h2>How to use this book</h2><ol style="margin:10px 0 0;padding-left:22px;display:grid;gap:4px">'+
    '<li>Tap the search box at the top, or press <code>/</code>. Type any word, like PECI, FYI or 403.</li>'+
    '<li>In the Library, tap More to see an example and what it means for you.</li>'+
    '<li>Tick "I know this". The book saves your progress in this browser only.</li>'+
    '<li>Watch the animation before you read a hard part.</li>'+
    '<li>Something broke? Open Playbooks. Confusing email? Open Meetings and email.</li>'+
    '<li>Try the Labs. They run in your browser. Use dummy data only.</li></ol></div>'+
   '<div class="grid2"><div class="card"><h3>Three kinds of words</h3><p style="margin-top:8px"><span class="b">General IT</span> works everywhere.</p><p style="margin-top:6px"><span class="b k-w">Workday</span> belongs to Workday.</p><p style="margin-top:6px"><span class="b k-c">Depends on company</span> means your company chose it. Ask your lead.</p></div>'+
   '<div class="card"><h3>Three levels</h3><p style="margin-top:8px"><span class="b lv1">Start here</span> learn these first.</p><p style="margin-top:6px"><span class="b">Core</span> you will use these every week.</p><p style="margin-top:6px"><span class="b lv3">Deeper</span> learn these when you meet them.</p></div></div>'+
   '<div><h2>A six-week path</h2><p class="muted" style="margin-top:4px">One stage at a time. Do the lab at the end of each stage.</p></div>'+
   '<div class="grid2">'+PATH.map(function(s){
      return '<div class="card" style="display:flex;flex-direction:column;gap:8px"><span class="tag note">'+s[0]+'</span><h3>'+s[1]+'</h3><p class="muted">'+s[2]+'</p>'+
       '<div class="chips">'+s[3].map(function(p){return '<a class="b" href="#library" data-gopart="'+p+'">'+esc(PN[p]||p)+'</a>'}).join('')+'</div>'+
       '<div class="chips">'+s[4].map(function(a){var x=B.anims.filter(function(z){return z.id===a})[0];return x?'<a class="b lv3" href="#'+a+'">'+esc(x.title)+'</a>':''}).join('')+'</div>'+
       (s[5]?'<a href="#'+s[5]+'">'+esc(s[6])+'</a>':'<span class="note">'+esc(s[6])+'</span>')+'</div>';
    }).join('')+'</div>'+
   '<div class="card"><h2>My progress</h2><p class="muted" style="margin:4px 0 10px">'+kn+' of '+tot+' terms ticked.</p><div class="bar2" style="margin-bottom:14px"><i style="width:'+Math.round(100*kn/Math.max(1,tot))+'%"></i></div><div class="grid2">'+pr+'</div><div class="row" style="margin-top:14px"><button id="cpProg">Copy my progress</button></div></div>'+
   '<div class="card"><h2>Honest limits</h2><p style="margin-top:8px">This book teaches ideas and common words. Workday setups differ between companies. Menu and task names change between releases, so this book names few of them. When a detail depends on your company, the card says so. Never change anything in production without your lead\'s approval. Never share real employee data, passwords or keys.</p></div>';
  $('#goSearch').onclick=function(){$('#q').focus()};
  $('#cpProg').onclick=function(ev){
    var lines=['Workday Integration Book: my progress','Terms ticked: '+kn+' of '+tot];
    B.parts.forEach(function(p){var all=B.entries.filter(function(e){return e.part===p.id});lines.push('- '+p.name+': '+all.filter(function(e){return S.known.has(e.id)}).length+' of '+all.length)});
    var jr=store.get('jd',{}),n=B.jd.length,s=0;B.jd.forEach(function(j){s+=(jr[j.id]||0)});
    lines.push('Job map self-rating: '+Math.round(100*s/Math.max(1,3*n))+'%');
    copy(lines.join('\n'),ev.target);
  };
}

/* ---------- library ---------- */
function libSkeleton(){
  return '<div><h2>Library</h2><p class="muted" id="libBlurb"></p></div>'+
   '<div class="chips" id="libParts" role="group" aria-label="Choose a part"></div>'+
   '<div class="row" id="libFilters"></div>'+
   '<div id="libInfo" class="note"></div><div class="az" id="libAz"></div><div class="list" id="libList"></div>';
}
function chip(on,attr,label){return '<button type="button" class="chip'+(on?' on':'')+'" '+attr+'>'+label+'</button>'}
function filtered(){
  var toks=B.tokens(S.q),list;
  if(toks.length)list=B.search(S.q,'term').map(function(d){return d.ref});
  else list=B.entries.slice();
  list=list.filter(function(e){return (!S.part||e.part===S.part)&&(!S.lv||e.lv===S.lv)&&(!S.kd||e.k===S.kd)&&(!S.hide||!S.known.has(e.id))});
  if(!toks.length){
    if(S.sort==='az')list.sort(function(a,b){return a.term.localeCompare(b.term,'en',{sensitivity:'base'})});
    else list.sort(function(a,b){return (PI[a.part]-PI[b.part])||(a._i-b._i)});
  }
  return {list:list,toks:toks};
}
function entryHTML(e,toks){
  var kn=S.known.has(e.id),rel=related(e);
  return '<article class="e'+(kn?' known':'')+'" id="'+e.id+'">'+
   '<div class="eh"><h3>'+hl(e.term,toks)+'</h3><span class="b lv'+e.lv+'">'+B.LV[e.lv]+'</span><span class="b k-'+e.k+'">'+B.KD[e.k]+'</span></div>'+
   '<p class="m">'+hl(e.m,toks)+'</p>'+
   '<div class="more"'+(S.open?'':' hidden')+'>'+
    (e.x?'<p><b>Example</b> '+hl(e.x,toks)+'</p>':'')+
    (e.f?'<p><b>For me</b> '+hl(e.f,toks)+'</p>':'')+
    (e.d?'<ul>'+e.d.map(function(x){return '<li>'+hl(x,toks)+'</li>'}).join('')+'</ul>':'')+
    (e.aka?'<p class="note">Also called: '+esc(e.aka)+'</p>':'')+
    (rel.length?'<p class="note">See also: '+rel.map(function(r){return '<a href="#'+r.id+'">'+esc(r.term)+'</a>'}).join(', ')+'</p>':'')+
    '<div class="tags">'+e.t.map(function(t){return '<a href="#library" data-act="tag" data-tag="'+esc(t)+'">'+esc(t)+'</a>'}).join('')+'</div>'+
   '</div>'+
   '<div class="ef"><button type="button" class="tg" data-act="more">'+(S.open?'Less':'More')+'</button>'+
    '<label class="kn"><input type="checkbox" data-act="known"'+(kn?' checked':'')+'> I know this</label>'+
    '<a href="#'+e.id+'" data-act="link">Link</a><span class="note">'+esc(PN[e.part]||'')+'</span></div></article>';
}
var libBound=false;
function renderLibrary(){
  var root=$('#v-library');
  if(!libBound){root.innerHTML=libSkeleton();bindLibrary(root);libBound=true}
  libUpdate();
}
function libUpdate(){
  var root=$('#v-library'),F=filtered(),list=F.list,toks=F.toks;
  var cnt={};B.entries.forEach(function(e){cnt[e.part]=(cnt[e.part]||0)+1});
  $('#libParts').innerHTML=chip(!S.part,'data-part=""','All parts ('+B.entries.length+')')+B.parts.map(function(p){return chip(S.part===p.id,'data-part="'+p.id+'"',esc(p.name)+' ('+(cnt[p.id]||0)+')')}).join('');
  var bl=S.part?(B.parts[PI[S.part]]||{}).blurb:'Every word has a meaning, an example, and what it means for you. Type in the box at the top to search.';
  $('#libBlurb').textContent=bl||'';
  $('#libFilters').innerHTML=
    '<span class="note">Level</span>'+[[0,'All'],[1,'Start here'],[2,'Core'],[3,'Deeper']].map(function(x){return chip(S.lv===x[0],'data-lv="'+x[0]+'"',x[1])}).join('')+
    '<span class="note" style="margin-left:8px">Kind</span>'+[['','All'],['g','General IT'],['w','Workday'],['c','Depends on company']].map(function(x){return chip(S.kd===x[0],'data-kd="'+x[0]+'"',x[1])}).join('')+
    '<span style="flex:1"></span>'+
    chip(S.hide,'data-act="hide"','Hide ones I know')+chip(S.open,'data-act="open"','Show all details')+
    '<label class="note">Sort <select id="libSort"><option value="chapter"'+(S.sort==='chapter'?' selected':'')+'>By part</option><option value="az"'+(S.sort==='az'?' selected':'')+'>A to Z</option></select></label>';
  var info='Showing '+list.length+' of '+B.entries.length+' terms';
  if(toks.length)info+=' for "<b>'+esc(S.q)+'</b>" <button type="button" class="chip" data-act="clear">Clear search</button>';
  var extra='';
  if(toks.length){
    var others=B.search(S.q).filter(function(d){return d.type!=='term'}).slice(0,8);
    if(others.length)extra='<div style="margin-top:6px">Also found: '+others.map(function(d){return '<a href="#'+d.id+'">'+esc(d.title.length>48?d.title.slice(0,48)+'...':d.title)+'</a>'}).join(' · ')+'</div>';
  }
  $('#libInfo').innerHTML=info+extra;
  var az=$('#libAz'),html='',prev='';
  if(S.sort==='az'&&!toks.length&&list.length){
    var letters={};list.forEach(function(e){letters[e.term.charAt(0).toUpperCase()]=1});
    az.innerHTML=Object.keys(letters).sort().map(function(l){return '<a href="#library" data-letter="'+l+'">'+l+'</a>'}).join('');
  }else az.innerHTML='';
  list.forEach(function(e){
    if(S.sort==='az'&&!toks.length){var l=e.term.charAt(0).toUpperCase();if(l!==prev){html+='<h2 class="lt" id="L-'+(/[A-Z]/.test(l)?l:'0')+'">'+l+'</h2>';prev=l}}
    else if(!toks.length&&!S.part&&e.part!==prev){html+='<h2 class="lt">'+esc(PN[e.part])+'</h2>';prev=e.part}
    html+=entryHTML(e,toks);
  });
  if(!list.length)html='<div class="card"><p>No term matches. Try a shorter word, or clear the filters.</p></div>';
  $('#libList').innerHTML=html;
}
function bindLibrary(root){
  root.addEventListener('click',function(ev){
    var t=ev.target.closest('button,a');
    if(!t||!root.contains(t))return;
    var d=t.dataset;
    if(d.part!==undefined){S.part=d.part;libUpdate();return}
    if(d.lv!==undefined){S.lv=+d.lv;libUpdate();return}
    if(d.kd!==undefined){S.kd=d.kd;libUpdate();return}
    if(d.letter){ev.preventDefault();var h=document.getElementById('L-'+d.letter);if(h)h.scrollIntoView();return}
    switch(d.act){
      case 'hide':S.hide=!S.hide;libUpdate();break;
      case 'open':S.open=!S.open;libUpdate();break;
      case 'clear':S.q='';$('#q').value='';libUpdate();break;
      case 'tag':ev.preventDefault();S.q=d.tag;$('#q').value=d.tag;libUpdate();window.scrollTo(0,0);break;
      case 'more':
        var a=t.closest('.e'),m=$('.more',a);m.hidden=!m.hidden;t.textContent=m.hidden?'More':'Less';break;
      case 'link':ev.preventDefault();copy(location.href.split('#')[0]+'#'+t.closest('.e').id,t);break;
    }
  });
  root.addEventListener('change',function(ev){
    var t=ev.target;
    if(t.id==='libSort'){S.sort=t.value;libUpdate();return}
    if(t.dataset&&t.dataset.act==='known'){
      var a=t.closest('.e'),id=a.id;
      if(t.checked)S.known.add(id);else S.known.delete(id);
      store.set('known',Array.from(S.known));
      a.classList.toggle('known',t.checked);
      if(S.hide)libUpdate();
    }
  });
}

/* ---------- movie ---------- */
function renderMovie(){
  var root=$('#v-movie');
  root.innerHTML='<div><h2>The integration movie</h2><p class="muted">Short films that play by themselves. Stickers show the words to remember. Press Listen for the voice.</p></div><h3>1. One whole integration, data to delivery</h3><div id="mvHost"></div><h3 style="margin-top:22px">2. After a sandbox refresh: do not send test files to the real vendor</h3><div id="mvHost2"></div><h3 style="margin-top:22px">3. XSLT in plain English: turn Workday XML into CSV or another XML</h3><div id="mvHost3"></div><h3 style="margin-top:22px">4. XML objects inside objects, and 13 reasons an XSLT goes wrong</h3><div id="mvHost4"></div><p class="note">Try it yourself: <a href="#l-xslt">XSLT playground</a>, <a href="#l-xtree">XML tree explorer</a>.</p>';
  window.Movie.mount($('#mvHost',root),'integration');window.Movie.mount($('#mvHost2',root),'refresh');window.Movie.mount($('#mvHost3',root),'xslt');window.Movie.mount($('#mvHost4',root),'xmlobj');
}

/* ---------- animations ---------- */
var AN={part:''};
function renderAnims(){
  var root=$('#v-animations');
  var parts=[];B.anims.forEach(function(a){if(parts.indexOf(a.part)<0)parts.push(a.part)});
  parts.sort(function(a,b){return PI[a]-PI[b]});
  root.innerHTML='<div><h2>Animations</h2><p class="muted">Tap a title to open it. Press Next to move one step, or Play to run all steps. Each step shows what moves, with the real technical words under it.</p></div>'+
   '<div class="chips" id="anChips"></div><div class="list" id="anList"></div>';
  function paint(){
    $('#anChips').innerHTML=chip(!AN.part,'data-p=""','All ('+B.anims.length+')')+parts.map(function(p){return chip(AN.part===p,'data-p="'+p+'"',esc(PN[p]||p))}).join('');
    var list=B.anims.filter(function(a){return !AN.part||a.part===AN.part});
    $('#anList').innerHTML=list.map(function(a){
      return '<details class="an" id="'+a.id+'"><summary><span class="at">'+esc(a.title)+'</span><span class="as">'+esc(a.sum)+'</span><span><span class="b">'+esc(PN[a.part]||'')+'</span> <span class="b">'+a.steps.length+' steps</span></span></summary><div class="ab"></div></details>';
    }).join('');
    $$('#anList details').forEach(function(el){
      el.addEventListener('toggle',function(){
        if(el.open&&!el.dataset.m){
          el.dataset.m=1;
          var spec=B.anims.filter(function(a){return a.id===el.id})[0];
          window.Anim.mount($('.ab',el),spec);
        }
      });
    });
  }
  root.addEventListener('click',function(ev){var b=ev.target.closest('button[data-p]');if(b){AN.part=b.dataset.p;paint()}});
  paint();
}

/* ---------- playbooks ---------- */
var PB={area:''};
function renderPlaybooks(){
  var root=$('#v-playbooks'),areas=[];
  B.playbooks.forEach(function(p){if(areas.indexOf(p.area)<0)areas.push(p.area)});
  root.innerHTML='<div><h2>Fix-it playbooks</h2><p class="muted">When something breaks, start here. Each playbook starts with safe, read-only checks. It tells you what evidence to collect and who to contact. It never tells you to re-run or delete anything in production on your own.</p></div><div class="chips" id="pbChips"></div><div class="list" id="pbList"></div>';
  function li(a){return a.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')}
  function paint(){
    $('#pbChips').innerHTML=chip(!PB.area,'data-a=""','All ('+B.playbooks.length+')')+areas.map(function(a){return chip(PB.area===a,'data-a="'+esc(a)+'"',esc(a))}).join('');
    $('#pbList').innerHTML=B.playbooks.filter(function(p){return !PB.area||p.area===PB.area}).map(function(p){
      return '<details class="pb" id="'+p.id+'"><summary><span class="at">'+esc(p.title)+'</span><span><span class="b">'+esc(p.area)+'</span></span></summary><div class="pbb">'+
       '<p><b>What you see.</b> '+esc(p.sym)+'</p>'+
       '<div class="pbflow" data-pb="'+p.id+'"></div>'+
       '<h4>It might be (not sure yet)</h4><ul>'+li(p.may)+'</ul>'+
       '<h4>Safe checks first (read only)</h4><ol>'+li(p.check)+'</ol>'+
       '<h4>Evidence to collect</h4><ul>'+li(p.evid)+'</ul>'+
       '<p><b>Who to contact.</b> '+esc(p.who)+'</p>'+
       '<p class="dont"><b>Do not.</b> '+esc(p.dont)+'</p></div></details>';
    }).join('');
  }
  function cut(t,n){t=String(t);return t.length>n?t.slice(0,n-1).replace(/\s+\S*$/,'')+'...':t}
  function flowSpec(p){
    var nodes=[],edges=[],steps=[],y=16,W=280,H=62,G=20,i,prev=null;
    function add(k,t,sub,c){nodes.push([k,t,sub,c,40,y,W,H]);if(prev)edges.push(['e'+k,prev,k]);prev=k;y+=H+G}
    add('n0','What you see',cut(p.sym,70),'coral');
    steps.push({t:'What you see',p:p.sym,k:'Stay calm. Do not change anything yet.',d:'It might be:\n- '+(p.may||[]).join('\n- '),on:['n0']});
    (p.check||[]).forEach(function(c,j){
      var k='n'+(j+1);add(k,'Check '+(j+1),cut(c,70),'teal');
      steps.push({t:'Check '+(j+1),p:c,k:'Safe, read-only. If this explains it, stop here.',on:[k],ed:['e'+k]});
    });
    var ke='nE';add(ke,'Keep evidence',cut((p.evid||[]).join(', '),70),'amber');
    steps.push({t:'Keep evidence',p:'Collect: '+(p.evid||[]).join('; ')+'.',k:'Evidence helps the next person and the RCA.',on:[ke],ed:['e'+ke]});
    var kw='nW';add(kw,'Ask for help',cut(p.who,70),'gray');
    steps.push({t:'Ask for help',p:p.who,k:'Do not: '+p.dont,on:[kw],ed:['e'+kw]});
    return {title:p.title,sum:'Flow for: '+p.title,nodes:nodes,edges:edges,steps:steps};
  }
  root.addEventListener('toggle',function(ev){
    var d=ev.target;if(!d.open||!d.classList||!d.classList.contains('pb'))return;
    var h=d.querySelector('.pbflow');if(!h||h.dataset.done)return;h.dataset.done='1';
    var p=B.playbooks.filter(function(x){return x.id===d.id})[0];
    if(p&&window.Anim)window.Anim.mount(h,flowSpec(p));
  },true);
  root.addEventListener('click',function(ev){var b=ev.target.closest('button[data-a]');if(b){PB.area=b.dataset.a;paint()}});
  paint();
}

/* ---------- meetings and email ---------- */
var M={sub:'phrases',theme:''};
function renderMeetings(){
  var root=$('#v-meetings'),themes=[];
  B.phrases.forEach(function(p){if(themes.indexOf(p.theme)<0)themes.push(p.theme)});
  var ck=store.get('ck',{});
  root.innerHTML='<div><h2>Meetings and email</h2><p class="muted">Decode what people say. Reply without pretending to know. Copy a template and fill in the gaps. Remove names and confidential data before you share anything.</p></div>'+
   '<div class="chips" id="mSub"></div><div class="chips" id="mTheme"></div><div class="list" id="mList"></div>';
  function paint(){
    $('#mSub').innerHTML=[['phrases','Phrase decoder ('+B.phrases.length+')'],['templates','Email and chat templates ('+B.templates.length+')'],['checks','Checklists ('+B.checks.length+')']].map(function(x){return chip(M.sub===x[0],'data-s="'+x[0]+'"',x[1])}).join('');
    $('#mTheme').innerHTML=M.sub==='phrases'?chip(!M.theme,'data-t=""','All themes')+themes.map(function(t){return chip(M.theme===t,'data-t="'+esc(t)+'"',esc(t))}).join(''):'';
    var h='';
    if(M.sub==='phrases'){
      h=B.phrases.filter(function(p){return !M.theme||p.theme===M.theme}).map(function(p){
        return '<article class="ph" id="'+p.id+'"><div class="say">"'+esc(p.say)+'"</div><div><span class="b">'+esc(p.theme)+'</span></div><dl>'+
         '<dt>It means</dt><dd>'+esc(p.means)+'</dd><dt>Where it fits</dt><dd>'+esc(p.fits)+'</dd><dt>They may expect</dt><dd>'+esc(p.expect)+'</dd>'+
         '<dt>Ask this</dt><dd>'+esc(p.ask)+'</dd><dt>Safe reply</dt><dd>'+esc(p.reply)+'</dd></dl>'+
         '<div class="row"><button type="button" data-copy="'+esc(p.reply)+'">Copy reply</button><button type="button" data-copy="'+esc(p.ask)+'">Copy question</button></div></article>';
      }).join('');
    }else if(M.sub==='templates'){
      h=B.templates.map(function(t){
        return '<article class="tpl" id="'+t.id+'"><h3>'+esc(t.title)+'</h3><p class="muted">'+esc(t.when)+'</p><pre>'+esc(t.body)+'</pre><div class="row"><button type="button" data-copy="'+esc(t.body)+'">Copy template</button></div></article>';
      }).join('');
    }else{
      h=B.checks.map(function(c){
        return '<article class="tpl ck" id="'+c.id+'"><h3>'+esc(c.title)+'</h3>'+c.items.map(function(it,i){var k=c.id+'-'+i;return '<label><input type="checkbox" data-ck="'+k+'"'+(ck[k]?' checked':'')+'> <span>'+esc(it)+'</span></label>'}).join('')+'</article>';
      }).join('');
    }
    $('#mList').innerHTML=h;
  }
  root.addEventListener('click',function(ev){
    var b=ev.target.closest('button');if(!b)return;
    if(b.dataset.s){M.sub=b.dataset.s;paint()}
    else if(b.dataset.t!==undefined){M.theme=b.dataset.t;paint()}
    else if(b.dataset.copy)copy(b.dataset.copy,b);
  });
  root.addEventListener('change',function(ev){var t=ev.target;if(t.dataset&&t.dataset.ck){ck[t.dataset.ck]=t.checked;store.set('ck',ck)}});
  paint();
}

/* ---------- labs ---------- */
function renderLabs(){window.Labs.render($('#v-labs'))}

/* ---------- job map ---------- */
function renderJobmap(){
  var root=$('#v-jobmap'),jr=store.get('jd',{});
  var lv=['Not yet','Learning','Can do with help','Can do alone'];
  root.innerHTML='<div><h2>Job map</h2><p class="muted">Each line comes from a Senior Workday Integration Developer job post. The book turns each line into plain words and points to where you can learn it. Rate yourself honestly. Only you see this.</p></div>'+
   '<div class="card"><div class="row" style="justify-content:space-between"><b id="jdTxt"></b></div><div class="bar2" style="margin-top:8px"><i id="jdBar"></i></div></div><div class="list" id="jdList"></div>';
  function sum(){var n=B.jd.length,s=0;B.jd.forEach(function(j){s+=(jr[j.id]||0)});var p=Math.round(100*s/Math.max(1,3*n));$('#jdBar').style.width=p+'%';$('#jdTxt').textContent='Ready for these lines: '+p+'%'}
  var areas=[];B.jd.forEach(function(j){if(areas.indexOf(j.area)<0)areas.push(j.area)});
  $('#jdList').innerHTML=areas.map(function(a){
    return '<h3 style="margin-top:8px">'+esc(a)+'</h3>'+B.jd.filter(function(j){return j.area===a}).map(function(j){
      return '<article class="jd" id="'+j.id+'"><div style="display:flex;flex-direction:column;gap:6px"><h3 style="font-size:17px">'+esc(j.item)+'</h3><p class="muted">In plain words: '+esc(j.plain)+'</p><div class="links">'+
       (j.go||[]).map(function(g){return g[1].indexOf('q:')===0?'<button type="button" data-q="'+esc(g[1].slice(2))+'">'+esc(g[0])+'</button>':'<a href="'+esc(g[1])+'">'+esc(g[0])+'</a>'}).join('')+'</div></div>'+
       '<label class="note">My level<br><select data-jd="'+j.id+'">'+lv.map(function(l,i){return '<option value="'+i+'"'+((jr[j.id]||0)===i?' selected':'')+'>'+l+'</option>'}).join('')+'</select></label></article>';
    }).join('');
  }).join('');
  root.addEventListener('change',function(ev){var t=ev.target;if(t.dataset&&t.dataset.jd){jr[t.dataset.jd]=+t.value;store.set('jd',jr);sum()}});
  root.addEventListener('click',function(ev){var b=ev.target.closest('button[data-q]');if(b){S.q=b.dataset.q;$('#q').value=S.q;location.hash='#library';if(cur==='library')libUpdate()}});
  sum();
}

/* ---------- quiz ---------- */
var Q={list:[],i:0,score:0,wrong:{},part:'',done:false};
function renderQuiz(){
  var root=$('#v-quiz'),parts=B.parts.filter(function(p){return B.quiz.some(function(q){return q.part===p.id})});
  root.innerHTML='<div><h2>Quiz</h2><p class="muted">Ten quick questions. Pick one part or mix them all. Wrong answers show why.</p></div><div class="chips" id="qzChips"></div><div class="row"><button type="button" class="on" id="qzStart">Start quiz</button></div><div id="qzBody" class="quiz"></div>';
  function chips(){$('#qzChips').innerHTML=chip(!Q.part,'data-qp=""','All parts')+parts.map(function(p){return chip(Q.part===p.id,'data-qp="'+p.id+'"',esc(p.name))}).join('')}
  chips();
  function show(){
    var body=$('#qzBody');
    if(Q.i>=Q.list.length){
      var weak=Object.keys(Q.wrong);
      body.innerHTML='<div class="card"><h3>You scored '+Q.score+' of '+Q.list.length+'</h3><p class="muted" style="margin-top:6px">'+(weak.length?'Review these parts:':'Nothing to review. Try another part.')+'</p><div class="chips" style="margin-top:8px">'+weak.map(function(p){return '<a class="b" href="#library" data-gopart="'+p+'">'+esc(PN[p]||p)+'</a>'}).join('')+'</div></div>';
      return;
    }
    var q=Q.list[Q.i],opts=shuffle(q.o.map(function(t,i){return {t:t,r:i===q.a}}));
    body.innerHTML='<div class="card"><p class="note">Question '+(Q.i+1)+' of '+Q.list.length+' · '+esc(PN[q.part]||'')+'</p><h3 style="margin-top:4px">'+esc(q.q)+'</h3>'+
      opts.map(function(o,i){return '<button type="button" class="opt" data-r="'+(o.r?1:0)+'">'+esc(o.t)+'</button>'}).join('')+'<div id="qzFb" style="margin-top:12px"></div></div>';
  }
  root.addEventListener('click',function(ev){
    var b=ev.target.closest('button');if(!b)return;
    if(b.dataset.qp!==undefined){Q.part=b.dataset.qp;chips();return}
    if(b.id==='qzStart'){
      var pool=B.quiz.filter(function(q){return !Q.part||q.part===Q.part});
      Q.list=shuffle(pool).slice(0,10);Q.i=0;Q.score=0;Q.wrong={};show();return;
    }
    if(b.classList.contains('opt')&&!Q.answered){
      var q=Q.list[Q.i],right=b.dataset.r==='1';
      $$('.opt',root).forEach(function(x){x.disabled=true;if(x.dataset.r==='1')x.classList.add('right')});
      if(!right){b.classList.add('wrong');Q.wrong[q.part]=1}else Q.score++;
      $('#qzFb').innerHTML='<p><b>'+(right?'Right. ':'Not quite. ')+'</b>'+esc(q.w)+'</p><div class="row" style="margin-top:8px"><button type="button" class="on" id="qzNext">'+(Q.i+1>=Q.list.length?'See score':'Next question')+'</button></div>';
      return;
    }
    if(b.id==='qzNext'){Q.i++;show()}
  });
}

/* ---------- search box ---------- */
var qEl=$('#q'),sr=$('#sr'),timer=null;
var LBL={term:'Terms',pb:'Playbooks',phrase:'Meeting phrases',tpl:'Templates and checklists',anim:'Animations',lab:'Labs',jd:'Job map'};
function dropdown(q){
  var res=B.search(q);
  if(!res.length){sr.innerHTML='<div class="none">No match. Try a shorter word.</div>';sr.hidden=false;return}
  var g={};res.forEach(function(d){(g[d.type]=g[d.type]||[]).push(d)});
  var h='';
  Object.keys(LBL).forEach(function(k){
    if(!g[k])return;
    h+='<div class="g">'+LBL[k]+' ('+g[k].length+')</div>'+g[k].slice(0,5).map(function(d){
      return '<a class="r" href="#'+d.id+'"><span class="t">'+esc(d.title.length>70?d.title.slice(0,70)+'...':d.title)+'</span><span class="s">'+esc((d.sn||'').slice(0,100))+'</span></a>';
    }).join('');
  });
  if(g.term&&g.term.length>5)h+='<button type="button" class="all" data-all="1">See all '+g.term.length+' terms in the Library</button>';
  sr.innerHTML=h;sr.hidden=false;
}
qEl.addEventListener('input',function(){
  clearTimeout(timer);
  var v=qEl.value.trim();
  timer=setTimeout(function(){
    if(cur==='library'){S.q=v;sr.hidden=true;libUpdate()}
    else if(v)dropdown(v);else sr.hidden=true;
  },90);
});
qEl.addEventListener('keydown',function(ev){
  if(ev.key==='Escape'){qEl.value='';sr.hidden=true;if(cur==='library'){S.q='';libUpdate()}qEl.blur()}
  else if(ev.key==='Enter'){
    var v=qEl.value.trim();if(!v)return;
    var first=$('a.r',sr);
    if(cur!=='library'&&first){location.hash=first.getAttribute('href');sr.hidden=true}
    else{S.q=v;location.hash='#library';if(cur==='library')libUpdate()}
  }else if(ev.key==='ArrowDown'){var f=$('a.r',sr);if(f){ev.preventDefault();f.focus()}}
});
sr.addEventListener('click',function(ev){
  var b=ev.target.closest('[data-all]');
  if(b){S.q=qEl.value.trim();sr.hidden=true;location.hash='#library';if(cur==='library')libUpdate();return}
  if(ev.target.closest('a.r'))sr.hidden=true;
});
sr.addEventListener('keydown',function(ev){
  var a=$$('a.r',sr),i=a.indexOf(document.activeElement);
  if(ev.key==='ArrowDown'&&i<a.length-1){ev.preventDefault();a[i+1].focus()}
  else if(ev.key==='ArrowUp'){ev.preventDefault();if(i>0)a[i-1].focus();else qEl.focus()}
  else if(ev.key==='Escape'){sr.hidden=true;qEl.focus()}
});
document.addEventListener('click',function(ev){if(!ev.target.closest('.sw'))sr.hidden=true});
document.addEventListener('keydown',function(ev){
  if(ev.key==='/'&&!/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName)){ev.preventDefault();qEl.focus();qEl.select()}
});
/* part links from anywhere */
document.addEventListener('click',function(ev){
  var a=ev.target.closest('[data-gopart]');
  if(a){ev.preventDefault();S.part=a.dataset.gopart;S.q='';S.lv=0;S.kd='';qEl.value='';if(location.hash==='#library'){show('library')}else location.hash='#library'}
});

/* ---------- router ---------- */
var R={start:renderStart,library:renderLibrary,movie:renderMovie,animations:renderAnims,playbooks:renderPlaybooks,meetings:renderMeetings,labs:renderLabs,jobmap:renderJobmap,quiz:renderQuiz};
function show(tab,focus){
  cur=tab;
  TABS.forEach(function(t){$('#v-'+t[0]).hidden=t[0]!==tab});
  $$('#tabs a').forEach(function(a){if(a.dataset.tab===tab)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  if(tab==='library'){
    if(focus){S.q='';S.part='';S.lv=0;S.kd='';S.hide=false;qEl.value=''}
    renderLibrary();
  }else if(tab==='start'){renderStart()}
  else if(!rendered[tab]){R[tab]();rendered[tab]=1}
  if(focus){
    var el=document.getElementById(focus);
    if(el){
      if(el.tagName==='DETAILS')el.open=true;
      if(el.classList.contains('e')){var mo=$('.more',el);if(mo){mo.hidden=false;var tg=$('.tg',el);if(tg)tg.textContent='Less'}}
      el.scrollIntoView({block:'start'});
      el.classList.add('flash');setTimeout(function(){el.classList.remove('flash')},2200);
    }
  }else window.scrollTo(0,0);
}
function route(){
  var h=(location.hash||'#start').slice(1)||'start',tab='start',focus=null;
  if(TABS.some(function(t){return t[0]===h}))tab=h;
  else if(/^t-/.test(h)){tab='library';focus=h}
  else if(/^a-/.test(h)){tab='animations';focus=h}
  else if(/^p-/.test(h)){tab='playbooks';focus=h}
  else if(/^m-/.test(h)){tab='meetings';focus=h;
    var isT=/^m-t-/.test(h),isC=/^m-c-/.test(h);M.sub=isT?'templates':isC?'checks':'phrases';M.theme='';rendered.meetings=0}
  else if(/^l-/.test(h)){tab='labs';focus=h}
  else if(/^j-/.test(h)){tab='jobmap';focus=h}
  show(tab,focus);
}
B.buildIndex();
window.addEventListener('hashchange',route);
route();
})();
