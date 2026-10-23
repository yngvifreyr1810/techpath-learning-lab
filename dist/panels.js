'use strict';
(() => {
 const key='techpath.layout.v1',defaults={problem:44,editor:360,tutor:460};
 let sizes={...defaults},observed=null,active=null;
 const clamp=(v,min,max)=>Math.min(Math.max(v,min),Math.max(min,max));
 try{const raw=JSON.parse(localStorage.getItem(key));for(const name of Object.keys(defaults))if(Number.isFinite(raw?.[name]))sizes[name]=clamp(raw[name],name==='problem'?20:180,name==='problem'?80:1200);}catch{}
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(sizes));}catch{}};
 function bounds(kind){
  if(kind==='problem'){const w=document.querySelector('.challenge-split')?.clientWidth||1000;return [Math.min(45,260/w*100),Math.max(55,(w-328)/w*100)];}
  if(kind==='editor')return [180,Math.max(220,Math.min(850,innerHeight-360))];
  return [Math.min(320,innerWidth),Math.min(1000,innerWidth-16)];
 }
 function paint(){
  document.documentElement.style.setProperty('--problem-share',clamp(sizes.problem,...bounds('problem'))+'%');
  document.documentElement.style.setProperty('--editor-height',clamp(sizes.editor,...bounds('editor'))+'px');
  document.documentElement.style.setProperty('--tutor-width',clamp(sizes.tutor,...bounds('tutor'))+'px');
  document.querySelector('.challenge-split')?.classList.toggle('panels-stacked',(document.querySelector('.challenge-split')?.clientWidth||1000)<760);
  for(const el of document.querySelectorAll('[data-panel-size]')){const name=el.dataset.panelSize,[min,max]=bounds(name);el.setAttribute('aria-valuemin',Math.round(min));el.setAttribute('aria-valuemax',Math.round(max));el.setAttribute('aria-valuenow',Math.round(clamp(sizes[name],min,max)));el.setAttribute('aria-valuetext',Math.round(clamp(sizes[name],min,max))+(name==='problem'?' phần trăm':' pixel'));}
 }
 function separator(kind,label,orientation){
  const el=document.createElement('div');el.className='panel-splitter panel-'+kind;el.dataset.panelSize=kind;el.tabIndex=0;el.setAttribute('role','separator');el.setAttribute('aria-label',label);el.setAttribute('aria-orientation',orientation);el.title=label+' · Kéo hoặc dùng phím mũi tên. Nhấp đúp để khôi phục.';
  el.addEventListener('dblclick',()=>{sizes[kind]=defaults[kind];save();paint();});
  el.addEventListener('keydown',e=>{const delta=kind==='problem'?2:24;let step=0;if(['ArrowLeft','ArrowUp'].includes(e.key))step=-delta;if(['ArrowRight','ArrowDown'].includes(e.key))step=delta;if(kind==='tutor')step=-step;if(e.key==='Home'){sizes[kind]=defaults[kind];}else if(step)sizes[kind]=clamp(sizes[kind]+step,...bounds(kind));else return;e.preventDefault();save();paint();});
  el.addEventListener('pointerdown',e=>{
   if(e.button!==0||active)return;e.preventDefault();el.setPointerCapture(e.pointerId);document.body.classList.add('resizing-panels');
   const controller=new AbortController(),start={x:e.clientX,y:e.clientY,value:sizes[kind]},split=document.querySelector('.challenge-split');active=controller;
   const finish=()=>{controller.abort();active=null;document.body.classList.remove('resizing-panels');save();};
   el.addEventListener('pointermove',event=>{const delta=kind==='problem'?(event.clientX-start.x)/(split?.clientWidth||1000)*100:kind==='editor'?event.clientY-start.y:start.x-event.clientX;sizes[kind]=clamp(start.value+delta,...bounds(kind));paint();},{signal:controller.signal});
   el.addEventListener('pointerup',finish,{once:true,signal:controller.signal});el.addEventListener('pointercancel',finish,{once:true,signal:controller.signal});el.addEventListener('lostpointercapture',finish,{once:true,signal:controller.signal});
  });return el;
 }
 const observer=new ResizeObserver(()=>paint());
 function mount(){
  const split=document.querySelector('.challenge-split'),editor=document.querySelector('.editor-status'),tutor=document.querySelector('.tutor-panel');
  if(split&&!split.querySelector('.panel-problem'))split.insertBefore(separator('problem','Điều chỉnh độ rộng đề bài và editor','vertical'),split.querySelector('.challenge-coding'));
  if(editor&&!editor.parentElement.querySelector('.panel-editor'))editor.after(separator('editor','Điều chỉnh chiều cao editor và kết quả','horizontal'));
  if(tutor&&!tutor.querySelector('.panel-tutor'))tutor.prepend(separator('tutor','Điều chỉnh độ rộng gia sư','vertical'));
  const header=document.querySelector('.challenge-header>div:last-child');
  if(header&&!header.querySelector('.panels-reset')){const b=document.createElement('button');b.className='button ghost small panels-reset';b.textContent='↺ Bố cục';b.title='Khôi phục kích thước các khung';b.addEventListener('click',()=>{sizes={...defaults};save();paint();});header.prepend(b);}
  if(split!==observed){observer.disconnect();if(split)observer.observe(split);observed=split;}paint();
 }
 new MutationObserver(()=>mount()).observe(document.body,{childList:true,subtree:true});window.addEventListener('resize',paint);mount();
})();
