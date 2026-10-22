'use strict';
(() => {
 const KEY = 'techpath.tutor.v1', LOCAL = 'http://127.0.0.1:4173';
 const base = ['127.0.0.1', 'localhost'].includes(location.hostname) ? location.origin : LOCAL;
 const el = document.createElement('aside');
 el.className = 'tutor-panel';
 el.hidden = true;
 el.setAttribute('aria-label', 'Gia sư TechPath');
 el.innerHTML = `<header class="tutor-heading"><div><span class="eyebrow">GIA SƯ TECHPATH</span><h2>Gỡ một nút thắt.</h2></div><button class="button ghost small" data-tutor-close aria-label="Đóng khung gia sư">✕</button></header><div class="tutor-ai-bar"><label for="tutor-provider">Gia sư:</label><select id="tutor-provider"><option value="antigravity">Antigravity (Gemini · Claude · GPT-OSS)</option><option value="codex">Codex (ChatGPT)</option></select><select id="tutor-model" aria-label="Chọn model"></select></div><p class="tutor-connection" role="status">Kết nối bộ gia sư trên máy khi bạn gửi bài.</p><div class="tutor-setup" hidden><p>Chạy <strong>Start-TechPath.cmd</strong> trên máy này, rồi bấm kết nối lại. Hỗ trợ Codex (ChatGPT) và Antigravity (Gemini, Claude, GPT-OSS) qua 9Router.</p><p>Đảm bảo 9Router đang chạy (port 20128). Nếu trình duyệt chặn, mở bản TechPath tại <a href="http://127.0.0.1:4173/#lesson/sql-proc" target="_blank" rel="noopener">127.0.0.1:4173</a>.</p><button class="button secondary small" data-tutor-connect>Kết nối lại</button></div><div class="tutor-messages" aria-live="polite" aria-relevant="additions text"></div><div class="tutor-compose"><label for="tutor-followup">Hỏi tiếp về bài này</label><textarea id="tutor-followup" rows="3" placeholder="Mình nghĩ là do… Có phải mình cần kiểm tra…?"></textarea><div class="actions"><button class="button small" data-tutor-send>Gửi câu hỏi</button><button class="button secondary small" data-tutor-stop hidden>Dừng</button></div><p class="save-meta">Gia sư hỗ trợ Codex & Antigravity (Gemini, Claude, GPT-OSS) qua 9Router. Dùng chung lịch sử học tập.</p></div>`;
 document.body.append(el);

 const q = s => el.querySelector(s), historyArea = q('.tutor-messages'), status = q('.tutor-connection'), setup = q('.tutor-setup');
 let data = {version: 1, clientId: crypto.randomUUID(), histories: {}, selectedProvider: 'antigravity', selectedModel: 'ag/gemini-3.8-flash-low'}, context = null, token = null, busy = false, controller = null, serverStatus = null;
 const submittedContexts = new Map();

 function isAntigravity(p){ return p === 'antigravity' || p === 'gemini'; }

 function validate(raw){
  if(!raw || raw.version !== 1 || !raw.histories || typeof raw.histories !== 'object' || Array.isArray(raw.histories)) throw new Error('Lịch sử gia sư không hợp lệ.');
  const next = {
   version: 1,
   clientId: /^[a-f0-9-]{36}$/i.test(raw.clientId || '') ? raw.clientId : crypto.randomUUID(),
   histories: {},
   selectedProvider: isAntigravity(raw.selectedProvider) ? 'antigravity' : (raw.selectedProvider === 'codex' ? 'codex' : 'antigravity'),
   selectedModel: typeof raw.selectedModel === 'string' && raw.selectedModel.length <= 80 ? raw.selectedModel : 'ag/gemini-3.8-flash-low'
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
      model: typeof m.model === 'string' ? m.model : undefined
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
  const providerSelect = q('#tutor-provider');
  const modelSelect = q('#tutor-model');
  if(!providerSelect || !modelSelect) return;
  const currentIsAnti = isAntigravity(data.selectedProvider);
  providerSelect.value = currentIsAnti ? 'antigravity' : 'codex';
  modelSelect.replaceChildren();
  if(currentIsAnti){
   const models = serverStatus?.router?.models?.length ? serverStatus.router.models : [
    {id: 'ag/gemini-3.8-flash-low', label: 'Gemini 3.8 Flash (Low)'},
    {id: 'ag/gemini-3.8-flash', label: 'Gemini 3.8 Flash'},
    {id: 'ag/gemini-3.8-flash-medium', label: 'Gemini 3.8 Flash (Medium)'},
    {id: 'ag/gemini-3.8-flash-high', label: 'Gemini 3.8 Flash (High)'},
    {id: 'ag/claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (Thinking)'},
    {id: 'ag/claude-opus-4-6-thinking', label: 'Claude Opus 4.6 (Thinking)'},
    {id: 'ag/gpt-oss-120b-medium', label: 'GPT-OSS 120B (Medium)'}
   ];
   for(const m of models){
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.label || m.id;
    modelSelect.append(opt);
   }
   if(data.selectedModel && models.some(m => m.id === data.selectedModel)){
    modelSelect.value = data.selectedModel;
   }else if(models.length){
    const def = models.find(m => /3\.8-flash-low/i.test(m.id))?.id || models[0].id;
    modelSelect.value = def;
    data.selectedModel = def;
    save();
   }
   modelSelect.hidden = false;
  }else{
   const opt = document.createElement('option');
   opt.value = 'gpt-6.1-sol';
   opt.textContent = 'GPT-6.1 Sol';
   modelSelect.append(opt);
   modelSelect.hidden = true;
  }
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
  q('#tutor-provider').disabled = busy;
  q('#tutor-model').disabled = busy;
  window.dispatchEvent(new CustomEvent('techpath:tutor-busy', {detail: busy}));
 }

 async function connect(){
  status.textContent = 'Đang kiểm tra kết nối gia sư…';
  setup.hidden = true;
  try{
   const response = await fetch(base + '/api/tutor/status', {mode: 'cors', signal: AbortSignal.timeout(50000)});
   const result = await response.json();
   if(!response.ok || !result.connected) throw new Error(result.error || result.message || 'Chưa kết nối được bộ gia sư.');
   token = result.token;
   serverStatus = result;
   if(!data.selectedProvider && result.defaultProvider) data.selectedProvider = result.defaultProvider;
   updateAiSelector();
   const curIsAnti = isAntigravity(data.selectedProvider);
   if(curIsAnti){
    status.textContent = result.router?.connected ? result.router.message : (result.message || 'Antigravity đã sẵn sàng.');
   }else{
    status.textContent = result.codex?.connected ? result.codex.message : (result.message || 'Codex đã sẵn sàng.');
   }
   return true;
  }catch(error){
   token = null;
   serverStatus = null;
   setup.hidden = false;
   status.textContent = error instanceof TypeError ? 'Chưa kết nối được bộ gia sư trên máy. Khởi động bộ kết nối hoặc mở bản local bên dưới.' : error.message;
   return false;
  }
 }

 async function send(prompt, label, snapshot, gradingSubmission){
  if(busy){ status.textContent = 'Gia sư đang trả lời. Chờ xong hoặc bấm Dừng.'; return; }
  if(!prompt.trim() || prompt.length > 60000){ status.textContent = 'Giữ phần bài làm và câu hỏi liên quan dưới 60.000 ký tự.'; return; }
  busy = true;
  controls();
  let answer = null, done = false, completionNotice = '', assessment = null;
  const currentIsAnti = isAntigravity(data.selectedProvider);
  const currentProvider = currentIsAnti ? 'antigravity' : 'codex';
  const currentModel = currentIsAnti ? (data.selectedModel || 'ag/gemini-3.8-flash-low') : 'gpt-6.1-sol';

  try{
   if(!token && !(await connect())) return;
   add('user', label);
   const modelLabel = currentIsAnti ? (q('#tutor-model')?.selectedOptions?.[0]?.text || 'Antigravity') : 'Codex';
   status.textContent = gradingSubmission
    ? `AI (${modelLabel}) đang đối chiếu bài làm với yêu cầu và kết quả chạy…`
    : `Gia sư (${modelLabel}) đang đọc bài làm…`;
   controller = new AbortController();

   const recentHistory = history().slice(-16).map(m => ({role: m.role, text: m.text}));
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
     answer.provider = m.provider || (currentIsAnti ? 'Antigravity' : 'Codex');
     answer.model = m.model || currentModel;
     assessment = m.assessment || null;
     done = true;
     completionNotice = m.persistenceWarning || (m.sessionRecovered ? 'Đã mở phiên thay thế và gửi lại ngữ cảnh bài làm vì phiên cũ chưa có lịch sử lưu.' : '');
     if(snapshot) submittedContexts.set(context.lessonId, snapshot);
     save();
     render();
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
   status.textContent = completionNotice || 'Đã review. Bạn có thể suy luận và hỏi tiếp ngay bên dưới.';
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

 q('#tutor-provider').addEventListener('change', e => {
  data.selectedProvider = e.target.value;
  updateAiSelector();
  save();
  if(serverStatus){
   if(isAntigravity(data.selectedProvider)){
    status.textContent = serverStatus.router?.connected ? serverStatus.router.message : '9Router chưa kết nối Antigravity.';
   }else{
    status.textContent = serverStatus.codex?.connected ? serverStatus.codex.message : 'Codex chưa kết nối.';
   }
  }
 });

 q('#tutor-model').addEventListener('change', e => {
  data.selectedModel = e.target.value;
  save();
 });

 el.addEventListener('click', async event => {
  const button = event.target.closest('button');
  if(!button) return;
  if(button.hasAttribute('data-tutor-close')){ el.hidden = true; document.body.classList.remove('tutor-open'); }
  if(button.hasAttribute('data-tutor-connect')) await connect();
  if(button.hasAttribute('data-tutor-stop')) controller?.abort();
  if(button.hasAttribute('data-tutor-send')){
   const input = q('#tutor-followup'), question = input.value.trim();
   if(!question || !context) return;
   const fresh = window.TechPathTutorContext?.();
   const snapshot = fresh?.lessonId === context.lessonId ? fresh : context;
   const changed = submittedContexts.get(context.lessonId) !== snapshot.prompt;
   const prompt = (changed ? snapshot.prompt + '\n\n' : 'Dựa trên bài làm đã review trong cuộc trò chuyện này.\n\n') + 'Câu hỏi tiếp theo của tôi:\n' + question;
   input.value = '';
   await send(prompt, question, snapshot.prompt);
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
  restore(raw){ if(!raw) return; data = validate(raw); updateAiSelector(); submittedContexts.clear(); save(); if(context) render(); },
  validate,
 };
})();
