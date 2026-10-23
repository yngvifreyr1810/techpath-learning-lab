'use strict';
(() => {
 const KEY = 'techpath.tutor.v1', LOCAL = 'http://127.0.0.1:4173';
 const base = ['127.0.0.1', 'localhost'].includes(location.hostname) ? location.origin : LOCAL;
 const el = document.createElement('aside');
 el.className = 'tutor-panel';
 el.hidden = true;
 el.setAttribute('aria-label', 'Gia sư TechPath');
 el.innerHTML = `<header class="tutor-heading"><div><span class="eyebrow">GIA SƯ TECHPATH</span><h2>Gỡ một nút thắt.</h2></div><button class="button ghost small" data-tutor-close aria-label="Đóng khung gia sư">✕</button></header><div class="tutor-ai-bar"><label for="tutor-provider">Gia sư:</label><select id="tutor-provider"><option value="router">9Router · Workflow / model</option><option value="local">Local AI · chỉ máy này</option><option value="codex">Codex · ChatGPT</option></select><select id="tutor-model" aria-label="Chọn workflow hoặc model"></select></div><p class="tutor-routing-note"></p><button class="button secondary small" data-tutor-refresh>Làm mới AI</button><p class="tutor-connection" role="status">Kết nối bộ gia sư trên máy khi bạn gửi bài.</p><div class="tutor-setup" hidden><p>Mở <strong>Start TechPath</strong> trên Desktop để bật cổng 4173. Có thể bật tự khởi động bằng Enable-TechPathStartup.ps1.</p><p>9Router cần chạy ở cổng 20128. Local AI dùng một model đang tải trong LM Studio, server 1235 hoặc 1234. Nếu trình duyệt chặn kết nối, mở <a href="http://127.0.0.1:4173/#lesson/sql-proc" target="_blank" rel="noopener">bản local</a>.</p><button class="button secondary small" data-tutor-connect>Kết nối lại</button></div><div class="tutor-messages" aria-live="polite" aria-relevant="additions text"></div><div class="tutor-compose"><label for="tutor-followup">Hỏi tiếp về bài này</label><textarea id="tutor-followup" rows="3" placeholder="Mình nghĩ là do… Có phải mình cần kiểm tra…?"></textarea><div class="actions"><button class="button small" data-tutor-send>Gửi câu hỏi</button><button class="button secondary small" data-tutor-stop hidden>Dừng</button></div><p class="save-meta">Học thường ngày: ưu tiên techpath-light hoặc Local AI. Bài khó: chọn workflow cloud. Các lựa chọn dùng chung lịch sử bài học.</p></div>`;
 document.body.append(el);

 const q = s => el.querySelector(s), historyArea = q('.tutor-messages'), status = q('.tutor-connection'), setup = q('.tutor-setup');
 let data = {version: 1, clientId: crypto.randomUUID(), histories: {}, selectedProvider: 'router', selectedModel: 'techpath-light'}, context = null, token = null, busy = false, controller = null, serverStatus = null, connectSequence = 0;

 function isRouter(p){ return ['router','antigravity','gemini'].includes(p); }

 function validate(raw){
  if(!raw || raw.version !== 1 || !raw.histories || typeof raw.histories !== 'object' || Array.isArray(raw.histories)) throw new Error('Lịch sử gia sư không hợp lệ.');
  const next = {
   version: 1,
   clientId: /^[a-f0-9-]{36}$/i.test(raw.clientId || '') ? raw.clientId : crypto.randomUUID(),
   histories: {},
   selectedProvider: isRouter(raw.selectedProvider) ? 'router' : (raw.selectedProvider === 'local' ? 'local' : raw.selectedProvider === 'codex' ? 'codex' : 'router'),
   selectedModel: typeof raw.selectedModel === 'string' && raw.selectedModel.length <= 200 ? raw.selectedModel : 'techpath-light'
  };
  for(const [id, messages] of Object.entries(raw.histories).slice(0, 100)){
   if(/^[a-z0-9-]{1,60}$/.test(id) && Array.isArray(messages)){
    next.histories[id] = messages.slice(-200)
     .filter(m => m && ['user', 'assistant', 'error'].includes(m.role) && typeof m.text === 'string')
     .map(m => ({
      role: m.role,
      text: m.text.slice(0, 60000),
      at: typeof m.at === 'string' ? m.at : new Date().toISOString(),
      provider: typeof m.provider === 'string' ? m.provider : undefined,
      model: typeof m.model === 'string' ? m.model : undefined,
      route: typeof m.route === 'string' ? m.route : undefined
     }));
   }
  }
  return next;
 }

 try{
  const saved = localStorage.getItem(KEY);
  if(saved) data = validate(JSON.parse(saved));
 }catch{/* Preserve course data even if tutor storage is unavailable. */}

 function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(data)); }
  catch{ status.textContent = 'Chưa lưu được lịch sử gia sư. Xuất JSON trước khi đóng trang.'; }
 }

 function history(){ return data.histories[context.lessonId] ??= ([]); }

 function updateAiSelector(){
  const providerSelect=q('#tutor-provider'), modelSelect=q('#tutor-model');
  providerSelect.value=data.selectedProvider;
  modelSelect.replaceChildren();
  modelSelect.hidden=data.selectedProvider!=='router';
  const models=serverStatus?.router?.models||[];
  if(data.selectedProvider==='router'){
   const groups=new Map();
   for(const m of models){
    const group=m.group||'Model';
    if(!groups.has(group)){const g=document.createElement('optgroup');g.label=group;groups.set(group,g);modelSelect.append(g);}
    const opt=document.createElement('option');opt.value=m.id;opt.textContent=m.label||m.id;groups.get(group).append(opt);
   }
   if(!data.selectedModel) data.selectedModel=serverStatus?.router?.defaultModel||'';
   if(!models.some(m=>m.id===data.selectedModel)){
    const opt=document.createElement('option');opt.value=data.selectedModel;opt.textContent=data.selectedModel ? data.selectedModel+' · chưa có trong danh mục' : 'Chạy 9Router rồi bấm Làm mới AI';modelSelect.append(opt);
   }
   modelSelect.value=data.selectedModel;
  }
  q('.tutor-routing-note').textContent=data.selectedProvider==='local'
   ? 'Chỉ gọi model đang tải trong LM Studio trên máy này. Không chuyển sang cloud.'
   :data.selectedProvider==='codex'?'Dùng hạn mức Codex của tài khoản đã đăng nhập.'
   :(models.find(m=>m.id===data.selectedModel)?.description||'Lấy danh sách từ 9Router. Chọn model rõ ràng; app không tự đổi lựa chọn.');
 }

 function render(){
  historyArea.replaceChildren();
  if(!context) return;
  const heading = document.createElement('p');
  heading.className = 'save-meta';
  heading.textContent = context.title;
  historyArea.append(heading);

  for(const m of history()){
   const item = document.createElement('article');
   item.className = 'tutor-message tutor-' + m.role;
   const label = document.createElement('strong');
   if(m.role === 'user'){
    label.textContent = 'Bạn';
   }else if(m.role === 'assistant'){
    label.textContent = 'Gia sư';
    if(m.provider){
     const badge = document.createElement('span');
     badge.className = 'tutor-badge';
     badge.textContent = m.provider;
     label.append(badge);
    }
   }else{
    label.textContent = 'Chưa hoàn tất';
   }
   const text = document.createElement('div');
   text.textContent = m.text;
   item.append(label, text);
   if(m.role==='assistant'&&m.model){const meta=document.createElement('small');meta.className='save-meta';meta.textContent=(m.route?'Luồng: '+m.route+' · ':'')+'Model trả về: '+m.model;item.append(meta);}
   historyArea.append(item);
  }
  historyArea.scrollTop = historyArea.scrollHeight;
 }

 function open(next){
  if(next && !busy){ context = next; render(); }
  el.hidden = false;
  document.body.classList.add('tutor-open');
  if(!token) connect();
 }

 function add(role, text, provider, model){
  const m = {role, text, at: new Date().toISOString()};
  if(provider) m.provider = provider;
  if(model) m.model = model;
  history().push(m);
  save();
  render();
  return m;
 }

 function controls(){
  q('[data-tutor-send]').disabled = busy;
  q('[data-tutor-stop]').hidden = !busy;
  q('[data-tutor-connect]').disabled = busy;
  q('[data-tutor-refresh]').disabled = busy;
  q('#tutor-provider').disabled = busy;
  q('#tutor-model').disabled = busy;
  window.dispatchEvent(new CustomEvent('techpath:tutor-busy', {detail: busy}));
 }

 async function connect(){
  const sequence=++connectSequence, provider=data.selectedProvider;
  status.textContent='Đang kiểm tra kết nối gia sư…';
  try{
   const response=await fetch(base+'/api/tutor/status?provider='+encodeURIComponent(provider),{mode:'cors',signal:AbortSignal.timeout(50000)});
   const result=await response.json();
   if(sequence!==connectSequence)return false;
   if(!response.ok||!result.token)throw new Error(result.error||'Chưa kết nối được bộ gia sư.');
   token=result.token;serverStatus=result;updateAiSelector();
   const selected=result[provider];
   status.textContent=selected?.message||'AI đã chọn chưa sẵn sàng.';
   setup.hidden=!!selected?.connected;
   return !!selected?.connected;
  }catch(error){
   if(sequence!==connectSequence)return false;
   token=null;serverStatus=null;setup.hidden=false;updateAiSelector();
   status.textContent=error instanceof TypeError?'Chưa bật bộ kết nối 4173. Mở Start TechPath trên Desktop rồi bấm Làm mới AI.':error.message;
   return false;
  }
 }

 async function send(prompt, label, snapshot, gradingSubmission){
  if(busy){ status.textContent = 'Gia sư đang trả lời. Chờ xong hoặc bấm Dừng.'; return; }
  if(!prompt.trim() || prompt.length > 60000){ status.textContent = 'Giữ phần bài làm và câu hỏi liên quan dưới 60.000 ký tự.'; return; }
  busy = true;
  controls();
  let answer = null, done = false, completionNotice = '', assessment = null;
  const currentProvider=data.selectedProvider;
  const currentModel=currentProvider==='router'?data.selectedModel:currentProvider==='local'?'local-ai':'gpt-6.1-sol';

  try{
   if((!token||!serverStatus?.[currentProvider]?.connected) && !(await connect())) return;
   // Capture prior turns before adding this request's display label.
   const recentHistory = history().filter(m => ['user', 'assistant'].includes(m.role) && m.text.trim()).slice(-6).map(m => ({role: m.role, text: m.text}));
   add('user', label);
   const modelLabel=currentProvider==='router'?currentModel:currentProvider==='local'?'Local AI':'Codex';
   status.textContent = gradingSubmission
    ? `AI (${modelLabel}) đang review bài và giải đáp phần bạn hỏi…`
    : `Gia sư (${modelLabel}) đang đọc bài làm…`;
   controller = new AbortController();

   const response = await fetch(base + '/api/tutor/review', {
    method: 'POST',
    mode: 'cors',
    headers: {'Content-Type': 'application/json', 'X-TechPath-Token': token},
    body: JSON.stringify({
     clientId: data.clientId,
     lessonId: context.lessonId,
     prompt,
     contextPrompt: snapshot,
     purpose: gradingSubmission ? 'grade' : 'chat',
     submission: gradingSubmission,
     provider: currentProvider,
     model: currentModel,
     history: recentHistory
    }),
    signal: controller.signal
   });

   if(!response.ok){
    if(response.status === 403) token = null;
    const result = await response.json();
    throw new Error(result.error || 'Không gửi được bài làm.');
   }

   answer = add('assistant', '', currentProvider, currentModel);
   const reader = response.body.getReader(), decoder = new TextDecoder();
   let buffer = '';
   const event = line => {
    if(!line.trim()) return;
    const m = JSON.parse(line);
    if(m.type === 'delta'){ answer.text += m.text; render(); }
    if(m.type === 'done'){
     answer.text = m.text;
     answer.provider = m.provider || (currentProvider==='router'?'9Router':currentProvider==='local'?'Local AI':'Codex');
     answer.model = m.model || currentModel;
     answer.route=m.route||currentModel;
     assessment = m.assessment || null;
     done = true;
     completionNotice = m.persistenceWarning || (m.sessionRecovered ? 'Đã mở phiên thay thế và gửi lại ngữ cảnh bài làm vì phiên cũ chưa có lịch sử lưu.' : '');
     save();
     render();
     // Start reading the new answer at its beginning, even for a longer explanation.
     const latest = historyArea.lastElementChild;
     if(latest) historyArea.scrollTop += latest.getBoundingClientRect().top - historyArea.getBoundingClientRect().top;
    }
    if(m.type === 'error') throw new Error(m.text);
   };

   while(true){
    const part = await reader.read();
    buffer += decoder.decode(part.value || new Uint8Array(), {stream: !part.done});
    let split;
    while((split = buffer.indexOf('\n')) >= 0){
     event(buffer.slice(0, split));
     buffer = buffer.slice(split + 1);
    }
    if(part.done) break;
   }
   if(buffer.trim()) event(buffer);
   if(!done) throw new Error('Kết nối ngắt trước khi phản hồi hoàn tất. Không tự gửi lại.');
   status.textContent = completionNotice || (assessment?.answers?.length ? 'Đã review và giải đáp phần bạn hỏi.' : 'Đã review. Bạn có thể hỏi tiếp bên dưới.');
   return {assessment};
  }catch(error){
   if(answer && !answer.text) history().pop();
   add('error', error.name === 'AbortError' ? 'Đã yêu cầu dừng. Phản hồi một phần (nếu có) được giữ lại.' : error.message);
   status.textContent = 'Chưa hoàn tất — không tự gửi lại để tránh dùng thêm hạn mức.';
  }finally{
   controller = null;
   busy = false;
   controls();
   save();
  }
 }

 q('#tutor-provider').addEventListener('change',async e=>{
  data.selectedProvider=e.target.value;token=null;serverStatus=null;updateAiSelector();save();await connect();
 });
 q('#tutor-model').addEventListener('change',e=>{data.selectedModel=e.target.value;save();updateAiSelector();});

 el.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if(!button) return;
  if(button.hasAttribute('data-tutor-close')){ el.hidden = true; document.body.classList.remove('tutor-open'); }
  if(button.hasAttribute('data-tutor-connect')||button.hasAttribute('data-tutor-refresh')) await connect();
  if(button.hasAttribute('data-tutor-stop')) controller?.abort();
  if(button.hasAttribute('data-tutor-send')){
   const input = q('#tutor-followup'), question = input.value.trim();
   if(!question || !context) return;
   const fresh = window.TechPathTutorContext?.();
   const snapshot = fresh?.lessonId === context.lessonId ? fresh : context;
   input.value = '';
   await send(question, question, snapshot.prompt);
  }
 });

 updateAiSelector();

 window.TechPathTutor = {
  async review(next){
   if(busy){ open(); status.textContent = 'Gia sư đang trả lời bài trước. Chờ xong rồi gửi bài mới.'; return; }
   open(next);
   await send(next.prompt, 'Nhờ review bài làm hiện tại · ' + next.title + '\n' + (next.question || 'Chỉ một gợi ý nhỏ ở điểm cần kiểm tra tiếp.'), next.prompt);
  },
  async grade(next){
   if(busy){ open(); status.textContent = 'Chờ gia sư trả lời xong trước khi đánh giá.'; return null; }
   open(next);
   return await send(next.prompt, 'Review & đánh giá · ' + next.title, next.prompt, next.submission);
  },
  identity(){ return data.clientId; },
  open(next){ open(next); },
  export(){ return structuredClone(data); },
  restore(raw){ if(!raw) return; data = validate(raw); token=null;serverStatus=null;connectSequence++;updateAiSelector(); save(); if(context) render(); },
  validate,
 };
})();
