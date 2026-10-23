import {LocalCodex} from './local-codex.mjs';
import {routerStatus, routerReview} from './router-ai.mjs';
import {localStatus,localReview} from './local-ai.mjs';
import {sessionToken as token} from './session-access.mjs';
import {assessmentSpec} from './assessment.mjs';
import {executionForGrade} from './sql-lab.mjs';
import {fileURLToPath} from 'node:url';

const tutor = new LocalCodex(fileURLToPath(new URL('./.techpath-local/', import.meta.url)));
let activeReview=false;

export async function tutorRoute(req, res, pathname){
 if(!pathname.startsWith('/api/tutor/')) return false;
 const json = (status, data) => {
  res.writeHead(status, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
  res.end(JSON.stringify(data));
 };

 try{
  if(pathname === '/api/tutor/status' && req.method === 'GET'){
   const requested=new URL(req.url,'http://localhost').searchParams.get('provider');
   const [codex,router,local]=await Promise.all([
    !requested||requested==='codex'?tutor.status().catch(e=>({connected:false,message:e.message,model:'gpt-6.1-sol'})):Promise.resolve({connected:false,model:'gpt-6.1-sol',message:'Chọn Codex để kiểm tra đăng nhập.'}),
    requested==='local'?Promise.resolve({connected:false,models:[],message:'Chọn 9Router để đọc danh mục workflow.'}):routerStatus(),
    localStatus()
   ]);
   const connected = codex.connected || router.connected || local.connected;
   const defaultProvider = router.connected ? 'router' : (local.connected ? 'local' : 'codex');
   json(200, {
    token,
    serviceConnected:true,
    connected,
    message: 'Bộ kết nối TechPath đã chạy. Chọn AI hoặc workflow để học.',
    model: codex.model,
    effort: codex.effort,
    codex,
    router,
    local,
    defaultProvider
   });
   return true;
  }

  if(pathname !== '/api/tutor/review' || req.method !== 'POST'){
   json(404, {error: 'Không có thao tác này.'});
   return true;
  }

  if(req.headers['x-techpath-token'] !== token){
   json(403, {error: 'Kết nối hết hạn. Bấm Kết nối lại.'});
   return true;
  }

  if(!req.headers['content-type']?.startsWith('application/json')){
   json(415, {error: 'Cần dữ liệu JSON.'});
   return true;
  }

  let body = '';
  for await(const chunk of req){
   body += chunk;
   if(Buffer.byteLength(body) > 400000){
    json(413, {error: 'Bài làm quá dài. Giữ phần liên quan dưới 60.000 ký tự.'});
    return true;
   }
  }

  let data;
  try{ data = JSON.parse(body); }catch{ json(400, {error: 'Dữ liệu không hợp lệ.'}); return true; }

  if(!/^[a-f0-9-]{36}$/i.test(data.clientId||'') || !/^[a-z0-9-]{1,60}$/.test(data.lessonId||'') || typeof data.prompt !== 'string' || !data.prompt.trim() || data.prompt.length > 60000){
   json(400, {error: 'Bài làm hoặc thông tin buổi học không hợp lệ.'});
   return true;
  }

  if(data.contextPrompt !== undefined && (typeof data.contextPrompt !== 'string' || data.contextPrompt.length > 60000)){
   json(400, {error: 'Ngữ cảnh bài làm không hợp lệ.'});
   return true;
  }

  if(data.purpose !== undefined && !['chat', 'grade'].includes(data.purpose)){
   json(400, {error: 'Loại yêu cầu không hợp lệ.'});
   return true;
  }

  const history = Array.isArray(data.history)
   ? data.history.filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.text === 'string').slice(-20)
   : [];
  if(!['codex','router','antigravity','gemini','local'].includes(data.provider||'antigravity')){json(400,{error:'Provider không hợp lệ.'});return true;}
  const provider=data.provider==='codex'?'codex':data.provider==='local'?'local':'router';
  const model=typeof data.model==='string'&&data.model.length<=200?data.model:undefined;

  let grading = null;
  if(data.purpose === 'grade'){
   const submission = {...data.submission};
   delete submission.execution;
   const execution = executionForGrade(data.clientId, data.lessonId, typeof submission.code === 'string' ? submission.code : '', submission.runId);
   submission.execution = execution;
   if(execution.verified){
    submission.output = execution.output;
    delete submission.execution.output;
   }
   grading = assessmentSpec(data.lessonId, submission);
  }

  if(activeReview){json(409,{error:'Gia sư đang trả lời một yêu cầu khác. Chờ xong để tránh dùng quota trùng.'});return true;}
  activeReview=true;
  res.writeHead(200, {
   'Content-Type': 'application/x-ndjson; charset=utf-8',
   'Cache-Control': 'no-store',
   'X-Content-Type-Options': 'nosniff'
  });

  const controller = new AbortController();
  res.on('close', () => controller.abort());
  const emit = event => { if(!res.destroyed) res.write(JSON.stringify(event) + '\n'); };

  const requestPayload = {...data, grading, history, provider, model};
  try{
   if(provider === 'local'){
    await localReview(requestPayload,emit,controller.signal);
   }else if(provider === 'router'){
    await routerReview(requestPayload, emit, controller.signal);
   }else{
    await tutor.review(requestPayload, emit, controller.signal);
   }
  }catch(error){
   emit({type: 'error', text: error.message});
  }finally{
   activeReview=false;
   res.end();
  }
 }catch(error){
  if(!res.headersSent) json(503, {error: error.message});
  else res.end();
 }
 return true;
}

export const closeTutor = () => tutor.close();
