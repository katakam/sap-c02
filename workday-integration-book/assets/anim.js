/* Step-by-step animation player. Specs come from content/anims-*.js.
   node: [key, title, sub, color, x, y, w, h, opts]   edge: [key, from, to, opts]
   step: {t, p, k, d, on:[node keys], ed:[edge keys], vis:[node keys], chip:[node key, label, bad, pos]} */
(function(){
'use strict';
var NS='http://www.w3.org/2000/svg',UID=0;
function S(n,a,p){var e=document.createElementNS(NS,n);if(a){for(var k in a)e.setAttribute(k,a[k])}if(p)p.appendChild(e);return e}
function wrap(t,max){
  var w=String(t||'').split(/\s+/).filter(Boolean),L=[],c='';
  w.forEach(function(x){var n=c?c+' '+x:x;if(n.length>max&&c){L.push(c);c=x}else c=n});
  if(c)L.push(c);return L;
}
function pt(n,s){return s==='t'?[n.x+n.w/2,n.y]:s==='b'?[n.x+n.w/2,n.y+n.h]:s==='l'?[n.x,n.y+n.h/2]:[n.x+n.w,n.y+n.h/2]}
var OPP={t:'b',b:'t',l:'r',r:'l'};
function route(a,b,o){
  var f=o.from,t=o.to,d,my,mx;
  if(!f){if(b.y>=a.y+a.h+6)f='b';else if(b.y+b.h<=a.y-6)f='t';else if(b.x>=a.x+a.w)f='r';else f='l'}
  t=t||OPP[f];
  var p=pt(a,f),q=pt(b,t);
  if(f==='b'||f==='t'){
    if(t==='l'||t==='r')d='M'+p[0]+' '+p[1]+'V'+q[1]+'H'+q[0];
    else if(Math.abs(p[0]-q[0])<2)d='M'+p[0]+' '+p[1]+'V'+q[1];
    else{my=(p[1]+q[1])/2;d='M'+p[0]+' '+p[1]+'V'+my+'H'+q[0]+'V'+q[1]}
  }else{
    if(t==='t'||t==='b')d='M'+p[0]+' '+p[1]+'H'+q[0]+'V'+q[1];
    else if(Math.abs(p[1]-q[1])<2)d='M'+p[0]+' '+p[1]+'H'+q[0];
    else{mx=(p[0]+q[0])/2;d='M'+p[0]+' '+p[1]+'H'+mx+'V'+q[1]+'H'+q[0]}
  }
  return {d:d,mid:[(p[0]+q[0])/2,(p[1]+q[1])/2]};
}
function chipBox(n,label,pos){
  var cw=Math.max(56,label.length*6.9+18);
  var left=(pos==='bl'||pos==='tl');
  var x=left?n.x+8:n.x+n.w-cw-8;
  var y=(pos==='tr'||pos==='tl')?n.y-12:n.y+n.h-12;
  return {x:x,y:y,w:cw};
}
function mount(host,spec){
  var id=++UID,N={},NE={},steps=spec.steps,cur=0,timer=null,maxY=0;
  spec.nodes.forEach(function(n){
    N[n[0]]={k:n[0],t:n[1],s:n[2]||'',c:n[3]||'gray',x:n[4],y:n[5],w:n[6],h:n[7],o:n[8]||{}};
    maxY=Math.max(maxY,n[5]+n[7]);
  });
  var H=spec.h||maxY+34;
  host.innerHTML='<div class="stage"><div class="sv"></div><div class="side">'+
    '<div class="pills" role="group" aria-label="Choose a step"></div>'+
    '<div class="cap" aria-live="polite"><h4></h4><p class="p"></p><p class="tech"></p></div>'+
    '<pre class="data" aria-label="Example data for this step"></pre>'+
    '<div class="row"><button type="button" data-a="prev">Back</button><button type="button" data-a="next">Next</button><button type="button" data-a="play">Play</button><button type="button" data-a="listen" aria-pressed="false">Listen</button></div>'+
    '</div></div>';
  var sv=host.querySelector('.sv');
  var svg=S('svg',{viewBox:'0 0 360 '+H,role:'img','aria-label':spec.sum||spec.title,'class':'asvg'},sv);
  var defs=S('defs',null,svg);
  [['ah'+id,'var(--muted)'],['aa'+id,'var(--accent)']].forEach(function(m){
    var mk=S('marker',{id:m[0],viewBox:'0 0 10 10',refX:'8',refY:'5',markerWidth:'7',markerHeight:'7',orient:'auto'},defs);
    S('path',{d:'M2 1L8 5L2 9',fill:'none',style:'stroke:'+m[1]+';stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round'},mk);
  });
  /* containers first so inner nodes draw on top */
  var order=spec.nodes.slice().sort(function(a,b){return ((b[8]&&b[8].cont)?1:0)-((a[8]&&a[8].cont)?1:0)});
  var nodeEls={};
  order.forEach(function(arr){
    var n=N[arr[0]],o=n.o;
    var g=S('g',{'class':'nd c-'+n.c+(o.cont?' cont':'')+(o.dash?' dash':'')},svg);
    S('rect',{x:n.x,y:n.y,width:n.w,height:n.h,rx:8},g);
    var tl=wrap(n.t,Math.floor((n.w-16)/8.2)),sl=wrap(n.s,Math.floor((n.w-16)/6.4));
    var bh=tl.length*17+(sl.length?sl.length*15+3:0);
    var y0=o.top?n.y+8:n.y+(n.h-bh)/2;
    var i;
    for(i=0;i<tl.length;i++){var t1=S('text',{x:n.x+n.w/2,y:y0+13+17*i,'text-anchor':'middle','class':'nt'},g);t1.textContent=tl[i]}
    for(i=0;i<sl.length;i++){var t2=S('text',{x:n.x+n.w/2,y:y0+tl.length*17+3+11+15*i,'text-anchor':'middle','class':'ns'},g);t2.textContent=sl[i]}
    nodeEls[n.k]=g;
  });
  var edgeEls={};
  (spec.edges||[]).forEach(function(e){
    var a=N[e[1]],b=N[e[2]],o=e[3]||{};
    var r=route(a,b,o);
    var p=S('path',{d:r.d,'class':'ed'+(o.dash?' dash':''),'marker-end':'url(#ah'+id+')'});
    svg.insertBefore(p,svg.querySelector('.nd'));
    if(o.lbl){var lt=S('text',{x:r.mid[0]+6,y:r.mid[1]-4,'class':'el'},svg);lt.textContent=o.lbl}
    edgeEls[e[0]]={el:p,a:e[1],b:e[2],o:o};
  });
  var chip=S('g',{'class':'chip',style:'opacity:0'},svg);
  var chipR=S('rect',{x:0,y:0,width:60,height:24,rx:6},chip);
  var chipT=S('text',{x:30,y:16,'text-anchor':'middle'},chip);

  var pills=host.querySelector('.pills'),h4=host.querySelector('.cap h4'),cp=host.querySelector('.cap .p'),ck=host.querySelector('.cap .tech'),dd=host.querySelector('.data'),playB=host.querySelector('[data-a=play]');
  steps.forEach(function(s,i){
    var b=document.createElement('button');b.type='button';b.textContent=String(i+1);b.setAttribute('aria-label','Step '+(i+1)+': '+s.t);
    b.onclick=function(){stop();go(i)};pills.appendChild(b);
  });
  function render(){
    var s=steps[cur],on=s.on||[],ed=s.ed||[],vis=s.vis,k;
    for(k in nodeEls){
      var g=nodeEls[k],isOn=on.indexOf(k)>-1,hid=vis&&vis.indexOf(k)<0;
      g.setAttribute('class',g.getAttribute('class').replace(/ (act|dim|hid)/g,'')+(hid?' hid':isOn?' act':(on.length?' dim':'')));
    }
    for(k in edgeEls){
      var E=edgeEls[k],isE=ed.indexOf(k)>-1,hide=vis&&(vis.indexOf(E.a)<0||vis.indexOf(E.b)<0);
      E.el.setAttribute('class','ed'+(E.o.dash?' dash':'')+(hide?' hid':isE?' act':(ed.length||on.length?' dim':'')));
      E.el.setAttribute('marker-end','url(#'+(isE?'aa':'ah')+id+')');
    }
    if(s.chip&&N[s.chip[0]]){
      var c=s.chip,n=N[c[0]],box=chipBox(n,c[1],c[3]||'br');
      chipR.setAttribute('width',box.w);chipT.setAttribute('x',box.w/2);chipT.textContent=c[1];
      chip.setAttribute('class','chip'+(c[2]?' bad':''));
      chip.style.transform='translate('+box.x+'px,'+box.y+'px)';chip.style.opacity=1;
    }else{chip.style.opacity=0}
    h4.textContent='Step '+(cur+1)+' of '+steps.length+': '+s.t;
    cp.textContent=s.p||'';ck.textContent=s.k||'';dd.textContent=s.d||'';
    Array.prototype.forEach.call(pills.children,function(b,i){b.className=i===cur?'on':'';if(i===cur)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
  }
  function go(i){cur=(i+steps.length)%steps.length;render()}
  function stop(){if(timer){clearInterval(timer);timer=null}playB.textContent='Play'}
  function play(){stop();playB.textContent='Pause';timer=setInterval(function(){go(cur+1)},6500)}
  host.querySelector('[data-a=prev]').onclick=function(){stop();go(cur-1)};
  host.querySelector('[data-a=next]').onclick=function(){stop();go(cur+1)};
  playB.onclick=function(){if(timer)stop();else play()};
  /* read aloud with the browser's own voice; no audio files needed */
  var listenB=host.querySelector('[data-a=listen]'),listening=false,tok=0,SS=window.speechSynthesis;
  if(!SS||!window.SpeechSynthesisUtterance){listenB.hidden=true}
  function say(text,done){
    var my=++tok;SS.cancel();
    var u=new SpeechSynthesisUtterance(text);u.rate=1;u.lang='en-GB';
    try{var vs=SS.getVoices()||[],v=null,best=-1,i,sc;
      for(i=0;i<vs.length;i++){if(!/^en/i.test(vs[i].lang))continue;sc=1;
        if(/^en[-_](IN|GB|SG|AU)/i.test(vs[i].lang))sc+=2;else if(/^en[-_]US/i.test(vs[i].lang))sc+=1;
        if(/natural|neural|online|premium|enhanced|google|siri|samantha|daniel|rishi|veena|neerja/i.test(vs[i].name))sc+=4;
        if(sc>best){best=sc;v=vs[i]}}
      if(v){u.voice=v;u.lang=v.lang}}catch(e){}
    var fin=false;function end(){if(fin||my!==tok)return;fin=true;done&&done()}
    u.onend=end;u.onerror=end;
    SS.speak(u);
    setTimeout(end,Math.max(5000,text.length*95)+1500);
  }
  function spoken(i){var s=steps[i];return s.s||((s.p||s.t||'')+'')}
  var _go=go;go=function(i){_go(i);if(listening)speakCur()};
  function speakCur(){
    if(!listening)return;
    say(spoken(cur),function(){
      if(!listening)return;
      if(cur<steps.length-1){_go(cur+1);speakCur()}else stopListen();
    });
  }
  function stopListen(){listening=false;tok++;if(SS)SS.cancel();listenB.textContent='Listen';listenB.setAttribute('aria-pressed','false')}
  playB.onclick=function(){if(listening)stopListen();if(timer)stop();else play()};
  listenB.onclick=function(){
    if(listening){stopListen();return}
    stop();listening=true;listenB.textContent='Stop listening';listenB.setAttribute('aria-pressed','true');speakCur();
  };
  steps.forEach(function(s,i){pills.children[i].onclick=function(){stop();go(i)}});
  host.querySelector('[data-a=prev]').onclick=function(){stop();go(cur-1)};
  host.querySelector('[data-a=next]').onclick=function(){stop();go(cur+1)};
  window.addEventListener('hashchange',function(){if(listening)stopListen()});
  render();
  return {go:go,stop:function(){stop();stopListen()}};
}
window.Anim={mount:mount};
})();
