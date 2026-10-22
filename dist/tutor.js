'use strict';
(() => {
 const KEY='techpath.tutor.v1',LOCAL='http://127.0.0.1:4173';
 const base=['127.0.0.1','localhost'].includes(location.hostname)?location.origin:LOCAL;
 const el=document.createElement('aside');el.className='tutor-panel';el.hidden=true;el.setAttribute('aria-label','Gia sư TechPath');
 el.innerHTML=`<header class="tutor-heading"><div><span class="eyebrow">GIA SƯ TECHPATH</span><h2>Gỡ một nút thắt.</h2></div><button class="button ghost small" data-tutor-close aria-label="Đóng khung gia sư">✕</button></header><p class="tutor-connection" role="status">Kết nối Codex trên máy khi bạn gửi bài.</p><div class="tutor-setup" hidden><p>Chạy <strong>Start-TechPath.cmd</strong> trong thư mục app trên máy này, rồi bấm kết nối lại. Bộ kết nối dùng tài khoản ChatGPT đã đăng nhập trong Codex.</p><p>Nếu trình duyệt hỏi quyền truy cập mạng cục bộ, cho phép TechPath kết nối với máy này. Nếu trình duyệt chặn, mở bản TechPath tại <a href="http://127.0.0.1:4173/#lesson/sql-proc" target="_blank" rel="noopener">127.0.0.1:4173</a>; xuất/nhập JSON để chuyển bài làm từ trang web.</p><button class="button secondary small" data-tutor-connect>Kết nối lại</button></div><div class="tutor-messages" aria-live="polite" aria-relevant="additions text"></div><div class="tutor-compose"><label for="tutor-followup">Hỏi tiếp về bài này</label><textarea id="tutor-followup" rows="3" placeholder="Mình nghĩ là do… Có phải mình cần kiểm tra…?"></textarea><div class="actions"><button class="button small" data-tutor-send>Gửi câu hỏi</button><button class="button secondary small" data-tutor-stop hidden>Dừng</button></div><p class="save-meta">GPT‑6.1 Sol · Light · dùng hạn mức Codex. Lịch sử riêng theo bài, không tự đọc cuộc chat thiết kế app hoặc SSMS.</p></div>`;
 document.body.append(el);
 const q=s=>el.querySelector(s),historyArea=q('.tutor-messages'),status=q('.tutor-connection'),setup=q('.tutor-setup');
 let data={version:1,clientId:crypto.randomUUID(),histories:{}},context=null,token=null,busy=false,controller=null;
 function validate(raw){
  if(!raw||raw.version!==1||!raw.histories||typeof raw.histories!=='object'||Array.isArray(raw.histories))throw new Error('Lịch sử gia sư không hợp lệ.');
  const next={version:1,clientId:/^[a-f0-9-]{36}$/i.test(raw.clientId||'')?raw.clientId:crypto.randomUUID(),histories:{}};
  for(const [id,messages] of Object.entries(raw.histories).slice(0,100))if(/^[a-z0-9-]{1,60}$/.test(id)&&Array.isArray(messages))next.histories[id]=messages.slice(-200).filter(m=>m&&['user','assistant','error'].includes(m.role)&&typeof m.text==='string').map(m=>({role:m.role,text:m.text.slice(0,60000),at:typeof m.at==='string'?m.at:new Date().toISOString()}));
  return next;
 }
 try{const saved=localStorage.getItem(KEY);if(saved)data=validate(JSON.parse(saved));}catch{/* Preserve course data even if tutor storage is unavailable. */}
 function save(){try{localStorage.setItem(KEY,JSON.stringify(data));}catch{status.textContent='Chưa lưu được lịch sử gia sư. Xuất JSON trước khi đóng trang.';}}
 function history(){return data.histories[context.lessonId]??=([]);}
 function render(){
  historyArea.replaceChildren();
  if(!context)return;
  const heading=document.createElement('p');heading.className='save-meta';heading.textContent=context.title;historyArea.append(heading);
  for(const m of history()){
   const item=document.createElement('article');item.className='tutor-message tutor-'+m.role;
   const label=document.createElement('strong');label.textContent=m.role==='user'?'Bạn':m.role==='assistant'?'Gia sư':'Chưa hoàn tất';
   const text=document.createElement('div');text.textContent=m.text;item.append(label,text);historyArea.append(item);
  }
  historyArea.scrollTop=historyArea.scrollHeight;
 }
 function open(next){if(next&&!busy){context=next;render();}el.hidden=false;document.body.classList.add('tutor-open');}
 function add(role,text){const m={role,text,at:new Date().toISOString()};history().push(m);save();render();return m;}
 function controls(){q('[data-tutor-send]').disabled=busy;q('[data-tutor-stop]').hidden=!busy;q('[data-tutor-connect]').disabled=busy;window.dispatchEvent(new CustomEvent('techpath:tutor-busy',{detail:busy}));}
 async function connect(){
  status.textContent='Đang kết nối Codex trên máy…';setup.hidden=true;
  try{
   const response=await fetch(base+'/api/tutor/status',{mode:'cors',signal:AbortSignal.timeout(50000)});
   const result=await response.json();if(!response.ok||!result.connected)throw new Error(result.error||result.message||'Chưa kết nối được Codex.');
   token=result.token;status.textContent=result.message;return true;
  }catch(error){token=null;setup.hidden=false;status.textContent=error instanceof TypeError?'Chưa kết nối được bộ gia sư trên máy. Khởi động bộ kết nối hoặc mở bản local bên dưới.':error.message;return false;}
 }
 async function send(prompt,label){
  if(busy){status.textContent='Gia sư đang trả lời. Chờ xong hoặc bấm Dừng.';return;}
  if(!prompt.trim()||prompt.length>60000){status.textContent='Giữ phần bài làm và câu hỏi liên quan dưới 60.000 ký tự.';return;}
  busy=true;controls();let answer=null,done=false;
  try{
   if(!token&&!(await connect()))return;
   add('user',label);status.textContent='Gia sư đang đọc bài làm…';controller=new AbortController();
   const response=await fetch(base+'/api/tutor/review',{method:'POST',mode:'cors',headers:{'Content-Type':'application/json','X-TechPath-Token':token},body:JSON.stringify({clientId:data.clientId,lessonId:context.lessonId,prompt}),signal:controller.signal});
   if(!response.ok){if(response.status===403)token=null;const result=await response.json();throw new Error(result.error||'Không gửi được bài làm.');}
   answer=add('assistant','');const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='';
   const event=line=>{
    if(!line.trim())return;const m=JSON.parse(line);
    if(m.type==='delta'){answer.text+=m.text;render();}
    if(m.type==='done'){answer.text=m.text;done=true;save();render();}
    if(m.type==='error')throw new Error(m.text);
   };
   while(true){const part=await reader.read();buffer+=decoder.decode(part.value||new Uint8Array(),{stream:!part.done});let split;while((split=buffer.indexOf('\n'))>=0){event(buffer.slice(0,split));buffer=buffer.slice(split+1);}if(part.done)break;}
   if(buffer.trim())event(buffer);if(!done)throw new Error('Kết nối ngắt trước khi phản hồi hoàn tất. Không tự gửi lại.');
   status.textContent='Đã review. Bạn có thể suy luận và hỏi tiếp ngay bên dưới.';
  }catch(error){if(answer&&!answer.text)history().pop();add('error',error.name==='AbortError'?'Đã yêu cầu dừng. Phản hồi một phần (nếu có) được giữ lại.':error.message);status.textContent='Chưa hoàn tất — không tự gửi lại để tránh dùng thêm hạn mức.';
  }finally{controller=null;busy=false;controls();save();}
 }
 el.addEventListener('click',async event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-tutor-close')){el.hidden=true;document.body.classList.remove('tutor-open');}
  if(button.hasAttribute('data-tutor-connect'))await connect();
  if(button.hasAttribute('data-tutor-stop'))controller?.abort();
  if(button.hasAttribute('data-tutor-send')){
   const input=q('#tutor-followup'),question=input.value.trim();if(!question||!context)return;
   const fresh=window.TechPathTutorContext?.();
   // Freeze to the currently reviewed lesson. Navigation never mixes another draft into a reply.
   const snapshot=fresh?.lessonId===context.lessonId?fresh:context;
   const prior=history().filter(m=>m.role!=='error').slice(-8).map(m=>(m.role==='user'?'Tôi':'Gia sư')+': '+m.text.slice(0,3500)).join('\n\n');
   const prompt=snapshot.prompt+'\n\nTrao đổi gần đây trong app (có thể đã nằm trong lịch sử của bạn):\n'+prior+'\n\nCâu hỏi tiếp theo của tôi:\n'+question;
   input.value='';await send(prompt,question);
  }
 });
 window.TechPathTutor={
  async review(next){if(busy){open();status.textContent='Gia sư đang trả lời bài trước. Chờ xong rồi gửi bài mới.';return;}open(next);await send(next.prompt,'Nhờ review bài làm hiện tại · '+next.title+'\n'+(next.question||'Chỉ một gợi ý nhỏ ở điểm cần kiểm tra tiếp.'));},
  open(next){open(next);},
  export(){return structuredClone(data);},
  restore(raw){if(!raw)return;data=validate(raw);save();if(context)render();},
  validate,
 };
})();
