/* Core data model and search. Content files call BOOK.E, BOOK.PB, BOOK.PH and so on. */
(function(){
'use strict';
var B=window.BOOK={parts:[],entries:[],anims:[],playbooks:[],phrases:[],templates:[],checks:[],jd:[],quiz:[],labs:[],docs:[]};
var used={};
function slug(s){return String(s).toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}
function uid(p,t){var b=p+slug(t).slice(0,56),i=b,n=2;while(used[i]){i=b+'-'+n++}used[i]=1;return i}
B.slug=slug;
B.LV={1:'Start here',2:'Core',3:'Deeper'};
B.KD={g:'General IT',w:'Workday',c:'Depends on company'};

B.part=function(id,name,blurb){B.parts.push({id:id,name:name,blurb:blurb})};
/* E(part, term, meaning, example, forMe, level 1-3, kind g|w|c, tags "a b c", aka "other names") */
B.E=function(part,term,m,x,f,lv,k,tags,aka){
  var o={id:uid('t-',term),part:part,term:term,m:m,x:x||'',f:f||'',lv:lv||2,k:k||'g',t:String(tags||'').split(/\s+/).filter(Boolean),aka:aka||''};
  B.entries.push(o);
  return {D:function(a){o.d=a;return this}};
};
B.PB=function(o){o.id=uid('p-',o.title);B.playbooks.push(o)};
B.PH=function(o){o.id=uid('m-',o.say.slice(0,44));B.phrases.push(o)};
B.TP=function(o){o.id=uid('m-t-',o.title);B.templates.push(o)};
B.CK=function(o){o.id=uid('m-c-',o.title);B.checks.push(o)};
B.JD=function(o){o.id=uid('j-',o.item.slice(0,40));B.jd.push(o)};
B.Q=function(o){B.quiz.push(o)};
B.A=function(o){B.anims.push(o)};
B.L=function(o){B.labs.push(o)};

B.tokens=function(q){
  return String(q||'').toLowerCase().split(/[^a-z0-9_+#.\/\-]+/).map(function(t){return t.replace(/^[.\-\/]+|[.\-\/]+$/g,'')}).filter(Boolean);
};
function lc(s){return String(s||'').toLowerCase()}
function mk(type,ref,title,aka,tags,body,sn,tab){
  return {type:type,id:ref.id,ref:ref,title:title,tl:lc(title),al:lc(aka),aw:lc(aka).split(/[^a-z0-9]+/).filter(Boolean),tg:lc(tags),bd:lc(body),sn:sn||'',tab:tab};
}
B.buildIndex=function(){
  var D=[];
  B.entries.forEach(function(e){D.push(mk('term',e,e.term,e.aka,e.t.join(' '),[e.m,e.x,e.f].concat(e.d||[]).join(' '),e.m,'library'))});
  B.playbooks.forEach(function(p){D.push(mk('pb',p,p.title,p.area,p.tags||'',[p.sym].concat(p.may||[],p.check||[],p.evid||[],[p.who,p.dont]).join(' '),p.sym,'playbooks'))});
  B.phrases.forEach(function(p){D.push(mk('phrase',p,p.say,p.theme,'',[p.means,p.fits,p.expect,p.ask,p.reply].join(' '),p.means,'meetings'))});
  B.templates.forEach(function(t){D.push(mk('tpl',t,t.title,'','',t.when+' '+t.body,t.when,'meetings'))});
  B.checks.forEach(function(t){D.push(mk('tpl',t,t.title,'','',t.items.join(' '),'Checklist','meetings'))});
  B.anims.forEach(function(a){D.push(mk('anim',a,a.title,'',a.tags||'',a.sum+' '+a.steps.map(function(s){return s.t+' '+s.p+' '+(s.k||'')}).join(' '),a.sum,'animations'))});
  B.labs.forEach(function(l){D.push(mk('lab',l,l.title,'',l.tags||'',l.desc,l.desc,'labs'))});
  B.jd.forEach(function(j){D.push(mk('jd',j,j.item,'',j.tags||'',j.plain,j.plain,'jobmap'))});
  B.docs=D;
};
function sc(d,t){
  if(d.tl===t)return 60;
  if(d.aw.indexOf(t)>-1)return 50;
  var tw=d.tl.split(/[^a-z0-9]+/);
  if(tw.indexOf(t)>-1)return 40;
  if(d.tl.indexOf(t)===0)return 34;
  for(var i=0;i<tw.length;i++){if(tw[i].indexOf(t)===0)return 28}
  if(t.length>4&&d.tl.indexOf(t)>-1)return 20;
  if(d.al.indexOf(t)>-1)return 18;
  if(d.tg.indexOf(t)>-1)return 12;
  if(d.bd.indexOf(t)>-1)return 3;
  return 0;
}
B.search=function(q,type){
  var toks=B.tokens(q);var out=[];out.partial=false;
  if(!toks.length)return out;
  if(!B.docs.length)B.buildIndex();
  var i,j,d,s,tot,ok;
  for(i=0;i<B.docs.length;i++){
    d=B.docs[i];if(type&&d.type!==type)continue;
    tot=0;ok=true;
    for(j=0;j<toks.length;j++){s=sc(d,toks[j]);if(!s){ok=false;break}tot+=s}
    if(ok)out.push({d:d,s:tot,n:toks.length});
  }
  if(!out.length&&toks.length>1){
    out.partial=true;
    for(i=0;i<B.docs.length;i++){
      d=B.docs[i];if(type&&d.type!==type)continue;
      tot=0;var n=0;
      for(j=0;j<toks.length;j++){s=sc(d,toks[j]);if(s){n++;tot+=s}}
      if(n)out.push({d:d,s:tot,n:n});
    }
  }
  out.sort(function(a,b){return (b.n-a.n)||(b.s-a.s)||(a.d.title.length-b.d.title.length)});
  var res=out.map(function(r){return r.d});
  res.partial=out.partial;
  return res;
};
})();
