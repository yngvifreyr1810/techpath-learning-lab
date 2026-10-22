import {TUTOR_INSTRUCTIONS} from './tutor-prompts.mjs';
import {sharedContext} from './tutor-context.mjs';
import {parseAssessment,assessmentText} from './assessment.mjs';
import path from 'node:path';
import {existsSync} from 'node:fs';

const BASE='http://127.0.0.1:20128/v1';

export const ACTIVE_ANTIGRAVITY_MODELS = {
 'ag/gemini-3.8-flash-low': 'Gemini 3.8 Flash (Low)',
 'ag/gemini-3.8-flash': 'Gemini 3.8 Flash',
 'ag/gemini-3.8-flash-medium': 'Gemini 3.8 Flash (Medium)',
 'ag/gemini-3.8-flash-high': 'Gemini 3.8 Flash (High)',
 'ag/claude-sonnet-4-6': 'Claude Sonnet 4.6 (Thinking)',
 'ag/claude-opus-4-6-thinking': 'Claude Opus 4.6 (Thinking)',
 'ag/gpt-oss-120b-medium': 'GPT-OSS 120B (Medium)'
};

let discoveredKey = null;
async function resolveApiKey(){
 if(process.env.TECHPATH_9ROUTER_API_KEY) return process.env.TECHPATH_9ROUTER_API_KEY;
 if(discoveredKey) return discoveredKey;
 try{
  const {DatabaseSync} = await import('node:sqlite');
  const candidates = [
   path.join(process.env.LOCALAPPDATA || '', 'Packages/OpenAI.Codex_2p2nqsd0c76g0/LocalCache/Roaming/9router/db/data.sqlite'),
   path.join(process.env.APPDATA || '', '9router/db/data.sqlite')
  ];
  for(const p of candidates){
   if(existsSync(p)){
    const db = new DatabaseSync(p, {readOnly: true});
    const row = db.prepare('SELECT key FROM apiKeys ORDER BY createdAt DESC LIMIT 1').get();
    db.close();
    if(row?.key){
     discoveredKey = row.key;
     return discoveredKey;
    }
   }
  }
 }catch{}
 return null;
}

const getHeaders = async () => {
 const key = await resolveApiKey();
 return {
  'Content-Type': 'application/json',
  ...(key ? {Authorization: 'Bearer ' + key} : {})
 };
};

export async function routerStatus(){
 try{
  const headers = await getHeaders();
  const r = await fetch(BASE+'/models', {headers, signal: AbortSignal.timeout(10000)});
  if(!r.ok) return {connected:false, models:[], message: r.status===401 ? '9Router yêu cầu API key. Cấu hình TECHPATH_9ROUTER_API_KEY cho bộ kết nối.' : '9Router chưa trả danh sách model.'};
  const body = await r.json();
  const rawList = (body.data||[]).map(m => m.id);
  
  // Filter only active models that are confirmed working in Antigravity
  const models = Object.entries(ACTIVE_ANTIGRAVITY_MODELS)
   .filter(([id]) => rawList.includes(id))
   .map(([id, label]) => ({id, label}));

  return {
   connected: models.length > 0,
   models,
   message: models.length ? 'Đã kết nối Antigravity qua 9Router (Gemini, Claude, GPT-OSS).' : 'Mở 9Router → Providers để kết nối Antigravity.'
  };
 }catch{
  return {connected: false, models: [], message: 'Chưa mở 9Router. Mở shortcut 9Router trên Desktop rồi kết nối lại.'};
 }
}

export async function routerReview(request, emit, signal){
 const catalog = await routerStatus();
 if(!catalog.connected) throw new Error(catalog.message);
 const model = request.model || catalog.models.find(m => /3\.8-flash-low/i.test(m.id))?.id || catalog.models[0]?.id;
 if(!catalog.models.some(m => m.id === model)) throw new Error(`Model ${model} không có trong danh sách khả dụng của Antigravity/9Router. Chọn lại model.`);

 let input = sharedContext(request);
 if(request.grading) input += '\n\nChỉ trả JSON, không markdown hoặc code fence, theo schema: ' + JSON.stringify(request.grading.schema);

 const signals = [AbortSignal.timeout(180000)];
 if(signal) signals.push(signal);
 const combined = AbortSignal.any(signals);

 const headers = await getHeaders();
 const response = await fetch(BASE+'/chat/completions', {
  method: 'POST',
  headers,
  body: JSON.stringify({
   model,
   messages: [
    {role: 'system', content: TUTOR_INSTRUCTIONS},
    {role: 'user', content: input}
   ],
   stream: true
  }),
  signal: combined
 });

 if(!response.ok){
  if(response.status === 401 || response.status === 403){
   throw new Error('9Router/Antigravity chưa xác thực. Mở 9Router → Providers để đăng nhập Antigravity; nếu gateway yêu cầu key, cấu hình TECHPATH_9ROUTER_API_KEY.');
  }
  if(response.status === 429){
   throw new Error('Model này đang hết hạn mức hoặc bị giới hạn lượt gọi. Đổi sang model khác (ví dụ Gemini 3.8 Flash Low).');
  }
  throw new Error('9Router/Antigravity trả lỗi HTTP ' + response.status + '. Kiểm tra model hoặc trạng thái provider trong 9Router.');
 }

 let answer = '';
 if(response.headers.get('content-type')?.includes('application/json')){
  const body = await response.json();
  answer = body.choices?.[0]?.message?.content || '';
 }else{
  const reader = response.body.getReader(), decoder = new TextDecoder();
  let buffer = '';
  function event(line){
   if(!line.startsWith('data:')) return;
   const data = line.slice(5).trim();
   if(!data || data === '[DONE]') return;
   const m = JSON.parse(data);
   if(m.error) throw new Error('AI báo lỗi trong lúc phản hồi. Kiểm tra provider trong 9Router.');
   const text = m.choices?.[0]?.delta?.content;
   if(typeof text === 'string'){
    answer += text;
    if(answer.length > 120000) throw new Error('Phản hồi quá dài. Đã dừng nhận nội dung.');
    if(!request.grading) emit({type: 'delta', text});
   }
  }
  while(true){
   const part = await reader.read();
   buffer += decoder.decode(part.value || new Uint8Array(), {stream: !part.done});
   let index;
   while((index = buffer.indexOf('\n')) >= 0){
    event(buffer.slice(0, index).replace(/\r$/, ''));
    buffer = buffer.slice(index + 1);
   }
   if(part.done) break;
  }
  if(buffer.trim()) event(buffer);
 }

 if(!answer.trim()) throw new Error('AI chưa trả nội dung. Chưa xác nhận bài hoặc tự gửi lại.');
 const assessment = request.grading
  ? parseAssessment(answer.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/, '$1'), request.grading)
  : null;

 let providerName = 'Gemini';
 if(/claude/i.test(model)) providerName = 'Claude';
 else if(/gpt-oss/i.test(model)) providerName = 'GPT-OSS';

 emit({
  type: 'done',
  text: assessment ? assessmentText(assessment) : answer,
  assessment,
  model,
  provider: providerName
 });
}
