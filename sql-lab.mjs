import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {randomUUID,createHash} from 'node:crypto';
import {curriculum} from './curriculum.mjs';
import {sessionToken} from './session-access.mjs';
const folder=new URL('./.techpath-local/',import.meta.url),configPath=new URL('sql-lab.json',folder);
const worker=fileURLToPath(new URL('./sql-worker.ps1',import.meta.url));
const executions=new Map();let initialization,busy=false;
const hash=code=>createHash('sha256').update(code).digest('hex');
export function splitSql(code,database){
 const batches=[];let sql=[],startLine=1,quote=null,depth=0;
 const lines=code.replace(/^\uFEFF/,'').split(/\r?\n/);
 for(let n=0;n<lines.length;n++){
  let line=lines[n];
  if(!quote&&!depth&&/^\s*GO\b/i.test(line)){
   if(!/^\s*GO\s*(?:--.*)?$/i.test(line))throw new Error('Dùng GO trên dòng riêng; SQL lab chưa hỗ trợ GO kèm số lần lặp.');
   if(sql.join('\n').trim())batches.push({sql:sql.join('\n'),startLine});sql=[];startLine=n+2;continue;
  }
  if(!quote&&!depth&&/^\s*USE\s+(?:\[SupportLab\]|SupportLab)\s*;?\s*(?:--.*)?$/i.test(line))line=`USE [${database}];`;
  sql.push(line);
  for(let i=0;i<line.length;i++){
   const c=line[i],next=line[i+1];
   if(depth){if(c==='/'&&next==='*'){depth++;i++;}else if(c==='*'&&next==='/'){depth--;i++;}continue;}
   if(quote){const end=quote==='['?']':quote;if(c===end){if(next===end)i++;else quote=null;}continue;}
   if(c==='-'&&next==='-')break;
   if(c==='/'&&next==='*'){depth++;i++;}else if(c==="'"||c==='"'||c==='[')quote=c;
  }
 }
 if(sql.join('\n').trim())batches.push({sql:sql.join('\n'),startLine});
 if(!batches.length||batches.length>20)throw new Error('Mỗi lần chạy cần từ 1 đến 20 batch SQL.');return batches;
}
function invoke(payload,signal){return new Promise((resolve,reject)=>{
 const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',worker],{windowsHide:true,stdio:['pipe','pipe','pipe']});
 let out='',settled=false;const timer=setTimeout(()=>{child.kill();finish(new Error('SQL lab đã dừng truy vấn quá 45 giây.'));},45000);
 const abort=()=>{child.kill();finish(new Error('Đã dừng chạy SQL.'));};
 function finish(error,result){if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);error?reject(error):resolve(result);}
 child.on('error',()=>finish(new Error('Không mở được SQL lab. Cần Windows và SQL Server Express trên máy này.')));
 child.stdout.setEncoding('utf8');child.stdout.on('data',chunk=>{out+=chunk;if(out.length>2000000){child.kill();finish(new Error('Kết quả SQL quá lớn. Hãy dùng TOP để giới hạn.'));}});
 child.stderr.on('data',()=>{});
 child.on('exit',()=>{if(settled)return;try{finish(null,JSON.parse(out.replace(/^\uFEFF/,'').trim()));}catch{finish(new Error('SQL lab chưa trả kết quả hợp lệ. Kiểm tra SQL Server Express đang chạy.'));}});
 signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted){abort();return;}
 child.stdin.on('error',()=>{});child.stdin.end(JSON.stringify(payload));
 });}
export async function ensureSqlLab(){
 if(!initialization)initialization=(async()=>{
  await mkdir(folder,{recursive:true});let config;
  try{config=JSON.parse(await readFile(configPath,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;config={server:'localhost\\SQLEXPRESS',database:'TechPathLab_'+randomUUID().replace(/-/g,'').slice(0,12),owner:randomUUID()};await writeFile(configPath,JSON.stringify(config,null,2));}
  if(!/^TechPathLab_[a-f0-9]{12}$/.test(config.database)||config.server!=='localhost\\SQLEXPRESS')throw new Error('Cấu hình SQL lab không hợp lệ.');
  const seed=curriculum.seed.slice(curriculum.seed.indexOf('CREATE TABLE dbo.Customers')).replace(/\nGO\s*$/,'');
  const result=await invoke({action:'setup',config,seed});if(!result.ok)throw new Error(result.error?.message||'Chưa khởi tạo được SQL lab.');return config;
 })().catch(error=>{initialization=null;throw error;});return initialization;
}
export function sqlOutput(result){
 const sections=(result.results||[]).map((set,i)=>`Result ${i+1}:\n${set.columns.map(c=>c.name).join('\t')}\n${set.rows.map(row=>row.map(v=>v===null?'NULL':String(v)).join('\t')).join('\n')}\n(${set.rows.length} dòng)`);
 if(result.messages?.length)sections.push(result.messages.join('\n'));
 if(!result.ok)sections.push(`SQL ERROR${result.error?.number?' '+result.error.number:''}${result.error?.line?' · dòng '+result.error.line:''}: ${result.error?.message}`);
 if(result.truncated)sections.push('Kết quả bị giới hạn; cần thu hẹp truy vấn trước khi đánh giá.');
 return sections.join('\n\n')||(result.ok?'Chạy thành công. Không có result set.':'Chạy chưa thành công.');
}
export function executionForGrade(clientId,lessonId,code,runId){
 const module=curriculum.lessons.find(l=>l.id===lessonId)?.module;
 if(module!=='sql')return {verified:false,module};
 const run=executions.get(runId);
 if(!run||run.clientId!==clientId||run.lessonId!==lessonId)return {verified:false,module:'sql',stale:!!runId};
 if(run.hash!==hash(code))return {verified:false,module:'sql',stale:true};
 return {verified:true,module:'sql',ok:run.result.ok,truncated:run.result.truncated,runId,output:sqlOutput(run.result),database:run.result.database,at:run.at};
}
export async function sqlRoute(req,res,pathname){
 if(!pathname.startsWith('/api/sql/'))return false;
 const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 try{
  if(pathname==='/api/sql/status'&&req.method==='GET'){const config=await ensureSqlLab();json(200,{ok:true,database:config.database,token:sessionToken});return true;}
  if(pathname!=='/api/sql/run'||req.method!=='POST'){json(404,{error:'Không có thao tác SQL này.'});return true;}
  if(req.headers['x-techpath-token']!==sessionToken){json(403,{error:'Kết nối hết hạn. Bấm Chạy lại để kết nối.'});return true;}
  if(!req.headers['content-type']?.startsWith('application/json')){json(415,{error:'Cần dữ liệu JSON.'});return true;}
  let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>400000){json(413,{error:'Query quá dài.'});return true;}}
  const data=JSON.parse(body);
  if(typeof data.code!=='string'||!data.code.trim()||data.code.length>60000||!/^[a-f0-9-]{36}$/i.test(data.clientId||'')||!curriculum.lessons.some(l=>l.id===data.lessonId&&l.module==='sql'))throw new Error('Thông tin query hoặc bài học không hợp lệ.');
  if(busy){json(409,{error:'SQL lab đang chạy truy vấn khác. Chờ hoặc bấm Dừng.'});return true;}
  busy=true;
  try{
   const config=await ensureSqlLab(),batches=splitSql(data.code,config.database),controller=new AbortController();res.on('close',()=>controller.abort());
   const result=await invoke({action:'run',config,batches},controller.signal),runId=randomUUID(),at=new Date().toISOString();
   executions.set(runId,{clientId:data.clientId,lessonId:data.lessonId,hash:hash(data.code),result,at});while(executions.size>100)executions.delete(executions.keys().next().value);
   json(200,{...result,runId,at,output:sqlOutput(result)});
  }finally{busy=false;}
 }catch(error){if(!res.headersSent)json(400,{error:error.message});else res.end();}
 return true;
}
