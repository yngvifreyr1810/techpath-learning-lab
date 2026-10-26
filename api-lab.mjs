import {randomBytes} from 'node:crypto';
import {curriculum} from './curriculum.mjs';
const token=randomBytes(32).toString('hex');
const books=[{id:1,title:'Học Python',topic:'python'},{id:2,title:'Học SQL',topic:'sql'},{id:3,title:'Làm quen API',topic:'api'}];
const stable=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
const errorResponse=(status,error,message)=>({status,headers:{'content-type':'application/json'},body:{error,message}});
function parseRequest(raw){
 if(!raw||typeof raw.method!=='string'||typeof raw.path!=='string'||typeof raw.body!=='string'||typeof raw.contentType!=='string')throw new Error('Request cần có method, đường dẫn, Content-Type và body.');
 const method=raw.method.trim().toUpperCase(),pathname=raw.path.trim();
 if(!pathname.startsWith('/')||pathname.startsWith('//')||pathname.includes('#')||pathname.includes('\\')||pathname.length>2000)throw new Error('Chỉ dùng đường dẫn lab bắt đầu bằng /, ví dụ /hello. Không nhập địa chỉ website.');
 const url=new URL(pathname,'http://lab.invalid');
 if(url.origin!=='http://lab.invalid')throw new Error('Đường dẫn không hợp lệ.');
 url.searchParams.sort();
 return {method,path:url.pathname+url.search,contentType:raw.contentType.trim().toLowerCase(),body:raw.body,url};
}
export function runApi(raw){
 const start=Date.now();
 try{
  const request=parseRequest(raw),{method,url,body,contentType}=request;let response;
  const json=(status,data)=>({status,headers:{'content-type':'application/json'},body:data});
  if(!['GET','POST'].includes(method))response=errorResponse(405,'METHOD_NOT_ALLOWED','Lab hiện hỗ trợ GET và POST.');
  else if(method==='GET'&&body.trim())response=errorResponse(400,'UNEXPECTED_BODY','Bài GET này không dùng body.');
  else if(method==='GET'&&url.pathname==='/hello')response=json(200,{message:'Chào bạn'});
  else if(method==='GET'&&url.pathname==='/profile')response=json(200,{name:'Lan',city:'Huế'});
  else if(method==='GET'&&url.pathname==='/topic')response=json(200,{topic:'Python'});
  else if(method==='GET'&&url.pathname==='/books')response=json(200,{books:books.filter(b=>!url.searchParams.has('topic')||b.topic===url.searchParams.get('topic'))});
  else if(method==='GET'&&/^\/books\/\d+$/.test(url.pathname)){const book=books.find(b=>b.id===Number(url.pathname.split('/').at(-1)));response=book?json(200,book):errorResponse(404,'BOOK_NOT_FOUND','Không tìm thấy sách.');}
  else if(method==='POST'&&url.pathname==='/notes'){
   if(contentType!=='application/json')response=errorResponse(415,'UNSUPPORTED_MEDIA_TYPE','Điền Content-Type là application/json.');
   else{let data;try{data=JSON.parse(body);}catch(error){response=errorResponse(400,'INVALID_JSON',error.message);}
    if(!response)response=data&&typeof data==='object'&&!Array.isArray(data)&&typeof data.title==='string'&&data.title.trim()?json(201,{id:1,title:data.title}):errorResponse(400,'MISSING_TITLE','Body cần có title là một chuỗi không rỗng.');
   }
  }else response=errorResponse(404,'ENDPOINT_NOT_FOUND','Không có đường dẫn này trong API mẫu.');
  return {ok:true,response,elapsedMs:Date.now()-start};
 }catch(error){return {ok:false,error:{code:'INVALID_REQUEST',message:error.message},elapsedMs:Date.now()-start};}
}
export function judgeApi(raw,result,lessonId){
 const lesson=curriculum.lessons.find(l=>l.id===lessonId&&l.module==='api');if(!lesson)throw new Error('Bài API không hợp lệ.');
 let requestMatches=false;
 try{const actual=parseRequest(raw),expected=parseRequest(lesson.apiRequest);requestMatches=actual.method===expected.method&&actual.path===expected.path&&(actual.method==='GET'?!actual.body.trim():actual.contentType===expected.contentType&&stable(JSON.parse(actual.body))===stable(JSON.parse(expected.body)));}catch{}
 const cases=[{name:'Request theo đề',passed:requestMatches,message:requestMatches?'Đúng method, đường dẫn và dữ liệu gửi.':'Đối chiếu method, đường dẫn, query, Content-Type và body với đề.'},{name:'HTTP status',passed:result.response?.status===lesson.expectedStatus,message:'Cần HTTP '+lesson.expectedStatus+'.'},{name:'Response body',passed:!!result.response&&stable(result.response.body)===stable(lesson.expectedBody),message:'Đối chiếu các trường và giá trị JSON với response mong đợi.'}];
 const verdict=cases.every(c=>c.passed)?'pass':'retry';
 return {verdict,summary:verdict==='pass'?'Đạt yêu cầu request và response.':'Chưa đạt. Xem các mục kiểm tra bên dưới.',cases,at:new Date().toISOString(),expectedStatus:lesson.expectedStatus,expectedBody:JSON.stringify(lesson.expectedBody,null,2)};
}
export async function apiRoute(req,res,pathname){
 if(!pathname.startsWith('/api/practice-api/'))return false;
 const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 try{
  if(pathname==='/api/practice-api/status'&&req.method==='GET'){json(200,{ok:true,token,mode:'simulation'});return true;}
  if(!['/api/practice-api/run','/api/practice-api/submit'].includes(pathname)||req.method!=='POST'){json(404,{error:'Không có thao tác API này.'});return true;}
  if(req.headers['x-techpath-token']!==token){json(403,{error:'Kết nối hết hạn. Bấm Chạy lại.'});return true;}
  if(!req.headers['content-type']?.startsWith('application/json')){json(415,{error:'Cần dữ liệu JSON.'});return true;}
  const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>65536){json(413,{error:'Request vượt giới hạn 64 KiB.'});return true;}chunks.push(chunk);}
  const data=JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if(!curriculum.lessons.some(l=>l.id===data.lessonId&&l.module==='api')){json(400,{error:'Bài API không hợp lệ.'});return true;}
  const result=runApi(data.request);json(200,{...result,...(pathname.endsWith('/submit')?{judge:judgeApi(data.request,result,data.lessonId)}:{})});
 }catch(error){json(400,{error:error.message});}
 return true;
}
