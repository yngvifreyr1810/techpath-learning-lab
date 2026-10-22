import {randomBytes} from 'node:crypto';
import {LocalCodex} from './local-codex.mjs';
import {fileURLToPath} from 'node:url';
const token=randomBytes(32).toString('hex');
const tutor=new LocalCodex(fileURLToPath(new URL('./.techpath-local/',import.meta.url)));
export async function tutorRoute(req,res,pathname){
 if(!pathname.startsWith('/api/tutor/'))return false;
 const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 try{
  if(pathname==='/api/tutor/status'&&req.method==='GET'){json(200,{...await tutor.status(),token});return true;}
  if(pathname!=='/api/tutor/review'||req.method!=='POST'){json(404,{error:'Không có thao tác này.'});return true;}
  if(req.headers['x-techpath-token']!==token){json(403,{error:'Kết nối hết hạn. Bấm Kết nối lại.'});return true;}
  if(!req.headers['content-type']?.startsWith('application/json')){json(415,{error:'Cần dữ liệu JSON.'});return true;}
  let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>400000){json(413,{error:'Bài làm quá dài. Giữ phần liên quan dưới 60.000 ký tự.'});return true;}}
  let data;try{data=JSON.parse(body);}catch{json(400,{error:'Dữ liệu không hợp lệ.'});return true;}
  if(!/^[a-f0-9-]{36}$/i.test(data.clientId||'')||!/^[a-z0-9-]{1,60}$/.test(data.lessonId||'')||typeof data.prompt!=='string'||!data.prompt.trim()||data.prompt.length>60000){json(400,{error:'Bài làm hoặc thông tin buổi học không hợp lệ.'});return true;}
  if(data.contextPrompt!==undefined&&(typeof data.contextPrompt!=='string'||data.contextPrompt.length>60000)){json(400,{error:'Ngữ cảnh bài làm không hợp lệ.'});return true;}
  res.writeHead(200,{'Content-Type':'application/x-ndjson; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  const controller=new AbortController();res.on('close',()=>controller.abort());
  const emit=event=>{if(!res.destroyed)res.write(JSON.stringify(event)+'\n');};
  try{await tutor.review(data,emit,controller.signal);}catch(error){emit({type:'error',text:error.message});}finally{res.end();}
 }catch(error){if(!res.headersSent)json(503,{error:error.message});else res.end();}
 return true;
}
export const closeTutor=()=>tutor.close();
