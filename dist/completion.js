'use strict';
(() => {
 // Authored names + current editor/schema only. Never reads lesson solutions.
 const keywords=['SELECT','FROM','WHERE','JOIN','LEFT','INNER','ON','AND','OR','AS','IS','NULL','NOT','ORDER BY','GROUP BY','HAVING','COUNT','SUM','TOP','DISTINCT','ASC','DESC'];
 const reserved=new Set(keywords.flatMap(w=>w.split(' ')).concat(['RIGHT','OUTER','FULL','CROSS','GO','SET','WITH','UNION']));
 // Keep editor history outside the DOM: Run/Submit and tab changes replace it.
 const histories=new Map();
 function mountHistory(editor,key){
  const snapshot=()=>({value:editor.value,start:editor.selectionStart,end:editor.selectionEnd,scroll:editor.scrollTop});
  let history=histories.get(key),restoring=false;
  if(!history||history.items[history.index].value!==editor.value){history={items:[snapshot()],index:0};histories.set(key,history);}
  else{const current=history.items[history.index];editor.setSelectionRange(current.start,current.end);editor.scrollTop=current.scroll;}
  function travel(direction){
   const next=history.index+direction;if(next<0||next>=history.items.length)return;
   history.items[history.index]=snapshot();history.index=next;const target=history.items[next];
   restoring=true;
   try{editor.value=target.value;editor.setSelectionRange(target.start,target.end);editor.scrollTop=target.scroll;editor.dispatchEvent(new Event('input',{bubbles:true}));editor.dispatchEvent(new Event('click'));}
   finally{restoring=false;}
  }
  editor.addEventListener('keydown',event=>{
   if(event.isComposing||event.altKey||!(event.ctrlKey||event.metaKey))return;
   const key=event.key.toLowerCase();if(key!=='z'&&key!=='y')return;
   event.preventDefault();event.stopImmediatePropagation();travel(key==='y'||event.shiftKey?1:-1);
  },true);
  editor.addEventListener('beforeinput',event=>{
   if(event.inputType==='historyUndo'||event.inputType==='historyRedo'){event.preventDefault();travel(event.inputType==='historyUndo'?-1:1);return;}
   history.items[history.index]=snapshot();
  });
  editor.addEventListener('input',()=>{
   if(restoring||history.items[history.index].value===editor.value)return;
   history.items.splice(history.index+1);history.items.push(snapshot());
   if(history.items.length>100)history.items.shift();history.index=history.items.length-1;
  });
  for(const event of ['select','keyup','mouseup','scroll'])editor.addEventListener(event,()=>{if(!restoring&&history.items[history.index].value===editor.value)history.items[history.index]=snapshot();});
 }
 function mask(code,language){return code.replace(language==='python'?/(#[^\n]*|"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^"\\])*(?:"|$)|'(?:\\.|[^'\\])*(?:'|$))/g:/(--[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|'(?:''|[^'])*(?:'|$))/g,m=>' '.repeat(m.length));}
 function suggest(code,pos,language,lessonId){
  const before=code.slice(0,pos),safe=mask(before,language);if(before.length&&safe.at(-1)===' '&&before.at(-1)!==' ')return [];
  const match=safe.match(/([A-Za-z_]\w*)?$/),prefix=match?.[0]||'';let words=[];
  if(language==='python'){words=['print'];for(const m of safe.matchAll(/\b([A-Za-z_]\w*)\s*=(?!=)/g))words.push(m[1]);}
  else{
   const bank=window.TECHPATH_CHALLENGES,problem=bank?.problems[lessonId],tables=(problem?.tables||[]).map(n=>[n,bank.tables[n]]),dot=safe.slice(0,safe.length-prefix.length).match(/([A-Za-z_]\w*)\.$/);
   if(dot){const qualifier=dot[1].toLowerCase();if(qualifier==='dbo')words=tables.map(([name])=>name);else{let name=tables.find(([n])=>n.toLowerCase()===qualifier)?.[0];for(const m of mask(code,'sql').matchAll(/\b(?:FROM|JOIN)\s+(?:dbo\.)?(\w+)(?:\s+(?:AS\s+)?(\w+))?/gi))if(m[2]?.toLowerCase()===qualifier&&!reserved.has(m[2].toUpperCase()))name=m[1];words=tables.filter(([n])=>n.toLowerCase()===name?.toLowerCase()).flatMap(([,t])=>t.columns.map(c=>c[0]));}}
   else words=[...keywords,...tables.map(([n])=>n),...tables.flatMap(([,t])=>t.columns.map(c=>c[0]))];
  }
  if(!prefix&&!/\.$/.test(safe))return [];
  return [...new Set(words)].filter(w=>w.toLowerCase().startsWith(prefix.toLowerCase())&&w!==prefix).slice(0,12).map(label=>({label,from:pos-prefix.length,to:pos}));
 }
 function mount(language,lessonId){
  const editor=document.querySelector('#draft-code');if(!editor||!['python','sql'].includes(language))return;
  mountHistory(editor,language+':'+lessonId);
  const host=editor.parentElement;host.classList.add('completion-host');const box=document.createElement('div');box.className='completion-list';box.id='code-completions';box.setAttribute('role','listbox');box.setAttribute('aria-label','Gợi ý code');box.hidden=true;host.append(box);
  editor.setAttribute('aria-autocomplete','list');editor.setAttribute('aria-controls',box.id);editor.setAttribute('aria-expanded','false');let items=[],index=0,composing=false;
  const hide=()=>{items=[];box.hidden=true;editor.setAttribute('aria-expanded','false');editor.removeAttribute('aria-activedescendant');};
  function paint(){box.replaceChildren();items.forEach((item,i)=>{const option=document.createElement('div');option.id='completion-'+i;option.setAttribute('role','option');option.setAttribute('aria-selected',String(i===index));option.className=i===index?'selected':'';option.textContent=item.label;option.addEventListener('mousedown',e=>{e.preventDefault();index=i;accept();});box.append(option);});box.hidden=!items.length;editor.setAttribute('aria-expanded',String(!!items.length));if(items.length)editor.setAttribute('aria-activedescendant','completion-'+index);else editor.removeAttribute('aria-activedescendant');}
  function update(){if(composing||editor.selectionStart!==editor.selectionEnd){hide();return;}items=suggest(editor.value,editor.selectionStart,language,lessonId);index=0;paint();}
  function accept(){const item=items[index];if(!item)return;editor.setRangeText(item.label,item.from,item.to,'end');hide();editor.dispatchEvent(new Event('input',{bubbles:true}));hide();editor.focus();}
  editor.addEventListener('input',update);editor.addEventListener('click',update);editor.addEventListener('blur',hide);editor.addEventListener('scroll',hide);editor.addEventListener('compositionstart',()=>{composing=true;hide();});editor.addEventListener('compositionend',()=>{composing=false;update();});
  editor.addEventListener('keydown',e=>{
   if(e.isComposing||composing)return;
   if(e.ctrlKey&&e.code==='Space'){e.preventDefault();e.stopPropagation();update();return;}
   if(items.length&&!e.shiftKey&&['Tab','ArrowDown','ArrowUp','Escape'].includes(e.key)){e.preventDefault();e.stopPropagation();if(e.key==='Tab')accept();else if(e.key==='Escape')hide();else{index=(index+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;paint();}return;}
   if(['ArrowLeft','ArrowRight','Home','End','Enter','Tab'].includes(e.key))hide();
  });
 }
 window.TechPathCompletion={mount,suggest,mountHistory};
})();
