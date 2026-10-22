'use strict';
/* Official MCP Apps bridge. No browser automation or ChatGPT credentials. */
(() => {
 const pending=new Map();let sequence=0,ready=false,hostContext=null;
 const embedded=window.parent!==window;
 const listeners=new Set();
 const notify=()=>{listeners.forEach(fn=>fn());window.dispatchEvent(new CustomEvent('techpath:host'));};
 function rpc(method,params){
  return new Promise((resolve,reject)=>{
   const id=++sequence;
   const timer=setTimeout(()=>{pending.delete(id);reject(new Error('Host chưa xác nhận. Không tự gửi lại để tránh trùng tin nhắn.'));},15000);
   pending.set(id,{resolve,reject,timer});
   window.parent.postMessage({jsonrpc:'2.0',id,method,params},'*');
  });
 }
 window.addEventListener('message',event=>{
  if(event.source!==window.parent)return;
  const m=event.data;if(!m||m.jsonrpc!=='2.0')return;
  if(m.id!==undefined&&pending.has(m.id)){
   const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);
   if(m.error)p.reject(new Error(m.error.message||'Host từ chối yêu cầu.'));else p.resolve(m.result);return;
  }
  if(m.method==='ui/notifications/tool-result'&&m.params?.structuredContent){hostContext=m.params.structuredContent;notify();}
  if(m.method==='ui/notifications/tool-input'&&m.params?.arguments){hostContext={...hostContext,...m.params.arguments};notify();}
 },{passive:true});
 const api={
  available:()=>ready||typeof window.openai?.sendFollowUpMessage==='function',
  embedded:()=>embedded,
  context:()=>hostContext||window.openai?.toolOutput||null,
  state:()=>window.openai?.widgetState?.techpath||null,
  persist:state=>{try{window.openai?.setWidgetState?.({techpath:state});}catch{/* JSON backup remains available. */}},
  subscribe:fn=>{listeners.add(fn);return()=>listeners.delete(fn);},
  async send(prompt){
   if(typeof prompt!=='string'||!prompt.trim())throw new Error('Chưa có câu hỏi để gửi.');
   if(prompt.length>60000)throw new Error('Ngữ cảnh quá dài. Chỉ giữ đoạn code liên quan (dưới 60.000 ký tự).');
   if(ready)return rpc('ui/message',{role:'user',content:[{type:'text',text:prompt}]});
   if(typeof window.openai?.sendFollowUpMessage==='function')return window.openai.sendFollowUpMessage({prompt,scrollToBottom:true});
   throw new Error('Hãy mở TechPath qua plugin trong ChatGPT/Codex để gửi vào chat.');
  }
 };
 window.TechPathHost=api;
 if(embedded){
  rpc('ui/initialize',{appInfo:{name:'techpath-learning-lab',version:'0.2.0'},appCapabilities:{},protocolVersion:'2026-01-26'})
   .then(result=>{ready=true;hostContext=result?.hostContext||hostContext;window.parent.postMessage({jsonrpc:'2.0',method:'ui/notifications/initialized',params:{}},'*');notify();})
   .catch(()=>{ready=false;notify();});
 }
 window.addEventListener('openai:set_globals',()=>notify());
})();
