import {geminiChatStatus,geminiChat,startGeminiLogin} from './gemini-chat.mjs';
import {LocalCodex} from './local-codex.mjs';
import {localReview} from './local-ai.mjs';
import {routerReview} from './router-ai.mjs';
import {sessionToken} from './session-access.mjs';
import {fileURLToPath} from 'node:url';
const codex=new LocalCodex(fileURLToPath(new URL('./.techpath-local/personal/',import.meta.url)));
let busy=false;
export async function personalRoute(req,res,pathname){
 if(!pathname.startsWith('/api/personal/'))return false;
 const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 try{
  if(pathname==='/api/personal/gemini-status'&&req.method==='GET'){json(200,geminiChatStatus());return true;}
  if(pathname==='/api/personal/gemini-login'&&req.method==='POST'){if(req.headers['x-techpath-token']!==sessionToken){json(403,{error:'Kết nối hết hạn.'});return true;}json(200,await startGeminiLogin());return true;}
  if(pathname!=='/api/personal/chat'||req.method!=='POST'){json(404,{error:'Không có thao tác này.'});return true;}
  if(req.headers['x-techpath-token']!==sessionToken){json(403,{error:'Kết nối hết hạn. Gửi lại khi bộ kết nối đã chạy.'});return true;}
  if(!req.headers['content-type']?.startsWith('application/json')){json(415,{error:'Cần JSON.'});return true;}
  let text='';for await(const chunk of req){text+=chunk;if(Buffer.byteLength(text)>100000){json(413,{error:'Cuộc trò chuyện quá dài.'});return true;}}
  const body=JSON.parse(text);
  if(typeof body.prompt!=='string'||!body.prompt.trim()||body.prompt.length>6000||!['local','router','codex','gemini-cli'].includes(body.provider)||!['listen','reflect','plan'].includes(body.style)){json(400,{error:'Nội dung hoặc lựa chọn AI không hợp lệ.'});return true;}
  if(body.provider==='router'&&(typeof body.model!=='string'||body.model.length>200||!(/gemini/i.test(body.model)||body.model==='techpath-light'))){json(400,{error:'Chọn Gemini hoặc techpath-light trong danh mục hiện tại.'});return true;}
  const history=(Array.isArray(body.history)?body.history:[]).filter(m=>m&&['user','assistant'].includes(m.role)&&typeof m.text==='string').slice(-12).map(m=>({role:m.role,text:m.text.slice(0,2200)}));
  const request={prompt:body.prompt,history,profile:typeof body.profile==='string'?body.profile.slice(0,2000):'',style:body.style,conversationScope:'personal',clientId:'personal',lessonId:'personal-chat',provider:body.provider,model:body.provider==='local'?'local-ai':body.model,grading:null};
  if(busy){json(409,{error:'Đang trả lời một cuộc trò chuyện riêng khác. Hãy chờ hoặc dừng trước.'});return true;}
  busy=true;const controller=new AbortController();res.on('close',()=>controller.abort());
  res.writeHead(200,{'Content-Type':'application/x-ndjson; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  const emit=event=>{if(!res.destroyed)res.write(JSON.stringify(event)+'\n');};
  try{if(body.provider==='gemini-cli')await geminiChat(request,emit,controller.signal);else if(body.provider==='local')await localReview(request,emit,controller.signal);else if(body.provider==='router')await routerReview(request,emit,controller.signal);else await codex.review(request,emit,controller.signal);}
  catch(error){emit({type:'error',text:error.message});}
  finally{busy=false;res.end();}
 }catch{if(!res.headersSent)json(400,{error:'Không đọc được yêu cầu.'});else res.end();}
 return true;
}
export const closePersonal=()=>codex.close();
