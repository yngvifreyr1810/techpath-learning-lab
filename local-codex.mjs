import {PERSONAL_INSTRUCTIONS,personalContext} from './personal-prompts.mjs';
import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {mkdir} from 'node:fs/promises';
import {parseAssessment,assessmentText} from './assessment.mjs';
import {sharedContext} from './tutor-context.mjs';
import {TUTOR_INSTRUCTIONS} from './tutor-prompts.mjs';

const MODEL='gpt-6.1-sol';

export class LocalCodex {
 constructor(folder){this.folder=folder;this.pending=new Map();this.listeners=new Set();this.sequence=0;this.busy=false;}
 async init(){if(!this.starting)this.starting=this.connect().catch(err=>{this.starting=null;throw err;});return this.starting;}
 async connect(){
  await mkdir(this.folder,{recursive:true});
  const env={...process.env};delete env.OPENAI_API_KEY;delete env.AZURE_OPENAI_API_KEY;
  this.proc=spawn(process.env.TECHPATH_CODEX_BIN||'codex',['app-server','--stdio'],{cwd:this.folder,env,windowsHide:true,stdio:['pipe','pipe','pipe']});
  this.proc.stderr.on('data',()=>{});
  this.proc.on('error',()=>this.fail(new Error('Không mở được Codex. Cài Codex CLI hoặc mở lại TechPath từ bộ khởi động.')));
  this.proc.on('exit',()=>this.fail(new Error('Bộ kết nối Codex đã dừng. Khởi động lại TechPath.')));
  createInterface({input:this.proc.stdout}).on('line',line=>{
   let msg;try{msg=JSON.parse(line);}catch{return;}
   if(msg.id!==undefined&&!msg.method&&this.pending.has(msg.id)){
    const p=this.pending.get(msg.id);this.pending.delete(msg.id);clearTimeout(p.timer);
    if(msg.error)p.reject(new Error(msg.error.message||'Codex từ chối yêu cầu.'));else p.resolve(msg.result);
   }else if(msg.id!==undefined&&msg.method){
    this.write({jsonrpc:'2.0',id:msg.id,error:{code:-32601,message:'TechPath tutor supports text only; tools are disabled.'}});
   }else for(const fn of this.listeners)fn(msg);
  });
  await this.rpc('initialize',{clientInfo:{name:'techpath_learning_lab',title:'TechPath Tutor',version:'0.3.0'}});
  this.write({jsonrpc:'2.0',method:'initialized',params:{}});return this;
 }
 write(msg){if(this.proc?.stdin.writable)this.proc.stdin.write(JSON.stringify(msg)+'\n');}
 rpc(method,params){return new Promise((resolve,reject)=>{
  const id=++this.sequence,timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('Codex chưa trả lời. Kiểm tra đăng nhập hoặc kết nối mạng.'));},45000);
  this.pending.set(id,{resolve,reject,timer});this.write({jsonrpc:'2.0',id,method,params});
 });}
 fail(error){this.starting=null;for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(error);}this.pending.clear();for(const fn of this.listeners)fn({method:'techpath/disconnected',params:{message:error.message}});}
 async status(){await this.init();const r=await this.rpc('account/read',{refreshToken:false});const ok=r.account?.type==='chatgpt';return {connected:ok,model:MODEL,effort:'low',message:ok?'Codex đã đăng nhập bằng ChatGPT. Dùng hạn mức của gói hiện có.':'Cần đăng nhập Codex bằng tài khoản ChatGPT (codex login). TechPath không dùng API key.'};}
 async review(request,emit,signal){
  const {grading}=request;
  if(this.busy)throw new Error('Gia sư đang trả lời. Hãy chờ xong trước khi gửi tiếp.');
  this.busy=true;let listener,threadId,turnId,aborted=false;
  const abort=()=>{aborted=true;if(threadId&&turnId)this.rpc('turn/interrupt',{threadId,turnId}).catch(()=>{});};
  signal?.addEventListener('abort',abort,{once:true});
  try{
   const status=await this.status();if(!status.connected)throw new Error(status.message);
   const inputPrompt=(request.conversationScope==='personal'?personalContext(request):sharedContext(request));
   // Native persistent threads can be claimed by another desktop writer.
   // A fresh ephemeral thread has one owner; shared memory lives in TechPath.
   const r=await this.rpc('thread/start',{model:MODEL,modelProvider:'openai',approvalPolicy:'never',sandbox:'read-only',cwd:this.folder,baseInstructions:request.conversationScope==='personal'?PERSONAL_INSTRUCTIONS:TUTOR_INSTRUCTIONS,ephemeral:true,config:{model_reasoning_effort:'low',model_verbosity:grading&&!grading.submission.question.trim()&&!grading.submission.notes.trim()?'low':'medium',web_search:'disabled',features:{shell_tool:false},mcp_servers:{}}});
   threadId=r.thread.id;if(aborted)throw new Error('Đã dừng trước khi gửi.');
   const messages=new Map();let complete,fail;
   const finished=new Promise((resolve,reject)=>{complete=resolve;fail=reject;});
   finished.catch(()=>{});
   listener=m=>{
    const p=m.params||{};
    if(m.method==='techpath/disconnected'){fail(new Error(p.message));return;}
    if(p.threadId!==threadId)return;
    if(m.method==='item/agentMessage/delta'){const id=p.itemId||'answer';messages.set(id,(messages.get(id)||'')+(p.delta||''));if(!grading)emit({type:'delta',text:p.delta||''});}
    if(m.method==='item/completed'&&p.item?.type==='agentMessage'){if(grading&&p.item.phase==='commentary')messages.delete(p.item.id);else messages.set(p.item.id,p.item.text||'');}
    if(m.method==='turn/completed'){
     if(p.turn?.error)fail(new Error(p.turn.error.message||'Codex gặp lỗi.'));
     else if(p.turn?.status==='interrupted')fail(new Error('Đã dừng phản hồi.'));
     else complete([...messages.values()].join('\n\n'));
    }
   };
   this.listeners.add(listener);
   // Keep read-only execution. The current server rejects the retired readOnly.access field.
   const result=await this.rpc('turn/start',{threadId,model:MODEL,effort:'low',input:[{type:'text',text:inputPrompt}],approvalPolicy:'never',sandboxPolicy:{type:'readOnly'},...(grading?{outputSchema:grading.schema}:{})});
   turnId=result.turn.id;if(aborted)abort();
   let deadline;const timeout=new Promise((_,reject)=>{deadline=setTimeout(()=>{abort();reject(new Error('Phản hồi quá lâu. Đã yêu cầu dừng; không tự gửi lại.'));},240000);});
   try{
    const answer=await Promise.race([finished,timeout]);if(!answer.trim())throw new Error('Codex kết thúc nhưng chưa có câu trả lời.');
    const assessment=grading?parseAssessment(answer,grading):null;
    emit({type:'done',text:assessment?assessmentText(assessment):answer,assessment,model:MODEL,provider:'codex'});
   }finally{clearTimeout(deadline);}
  }finally{if(listener)this.listeners.delete(listener);signal?.removeEventListener('abort',abort);if(threadId)this.rpc('thread/unsubscribe',{threadId}).catch(()=>{});this.busy=false;}
 }
 close(){this.proc?.kill();}
}
