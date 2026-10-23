import {spawn} from 'node:child_process';
import {existsSync,readFileSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PERSONAL_INSTRUCTIONS,personalContext} from './personal-prompts.mjs';
const root=fileURLToPath(new URL('.',import.meta.url)),home=path.join(root,'.techpath-local/gemini-chat/home'),work=path.join(root,'.techpath-local/gemini-chat/work');
function entry(){try{const dir=path.join(root,'.techpath-local/gemini-runtime/node_modules/@google/gemini-cli');const pkg=JSON.parse(readFileSync(path.join(dir,'package.json'),'utf8'));const bin=typeof pkg.bin==='string'?pkg.bin:pkg.bin?.gemini;const file=path.resolve(dir,bin);return file.startsWith(dir+path.sep)&&existsSync(file)?file:null;}catch{return null;}}
export function geminiChatStatus(){const installed=!!entry(),signedIn=existsSync(path.join(home,'oauth_creds.json'));return {installed,signedIn,connected:installed&&signedIn,message:!installed?'Chạy Setup-GeminiChat.cmd một lần để cài Gemini CLI.':!signedIn?'Gemini CLI đã cài. Bấm Đăng nhập Gemini, chọn Sign in with Google và đăng nhập tài khoản của bạn.':'Đã tìm thấy đăng nhập Gemini CLI. Quyền truy cập và quota được kiểm tra khi bạn gửi tin nhắn.'};}
export async function prepareGeminiChat(){
 await mkdir(path.join(home,'policies'),{recursive:true});await mkdir(work,{recursive:true});
 const settings={general:{autoUpdate:false,disableAutoUpdate:true,enableAutoUpdateNotification:false},security:{auth:{selectedType:'oauth-personal'}},telemetry:{enabled:false},privacy:{usageStatisticsEnabled:false},advanced:{autoConfigureMemory:false},tools:{core:[],exclude:['*']},mcp:{allowed:[]},mcpServers:{},hooksConfig:{enabled:false},context:{fileName:[]}};
 await writeFile(path.join(home,'settings.json'),JSON.stringify(settings,null,2));
 await writeFile(path.join(home,'policies/chat-only.toml'),'[[rule]]\ntoolName = "*"\ndecision = "deny"\npriority = 999\n');
 await writeFile(path.join(home,'personal-system.md'),PERSONAL_INSTRUCTIONS);
 return {GEMINI_CLI_HOME:home,GEMINI_SYSTEM_MD:path.join(home,'personal-system.md')};
}
function environment(extra){const env={...process.env,...extra};for(const name of ['GEMINI_API_KEY','GOOGLE_API_KEY','GOOGLE_GENAI_USE_VERTEXAI','GOOGLE_APPLICATION_CREDENTIALS','GOOGLE_CLOUD_PROJECT'])delete env[name];return env;}
export async function geminiChat(request,emit,signal){
 const status=geminiChatStatus();if(!status.connected)throw new Error(status.message);
 const extra=await prepareGeminiChat();
 const result=await new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,[entry(),'--prompt','Trả lời tin nhắn trong ngữ cảnh nhận qua stdin.','--output-format','json','--extensions','none'],{cwd:work,env:environment(extra),windowsHide:true,stdio:['pipe','pipe','pipe']});
  let output='',closed=false;const stop=()=>child.kill();
  const timer=setTimeout(()=>{stop();reject(new Error('Gemini CLI chưa trả lời kịp. Không tự gửi lại.'));},180000);signal?.addEventListener('abort',stop,{once:true});
  child.stdout.on('data',b=>{output+=b;if(output.length>200000){stop();reject(new Error('Phản hồi quá dài.'));}});child.stderr.on('data',()=>{});
  child.on('error',()=>{clearTimeout(timer);signal?.removeEventListener('abort',stop);reject(new Error('Không mở được Gemini CLI. Chạy lại thiết lập.'));});
  child.on('exit',code=>{if(closed)return;closed=true;clearTimeout(timer);signal?.removeEventListener('abort',stop);if(signal?.aborted)return reject(new Error('Đã dừng.'));if(code!==0)return reject(new Error('Gemini CLI chưa hoàn tất. Kiểm tra đăng nhập hoặc quota trong cửa sổ Gemini; không tự gửi lại.'));try{const body=JSON.parse(output);if(body.error||typeof body.response!=='string'||!body.response.trim())throw new Error();resolve(body.response);}catch{reject(new Error('Gemini CLI chưa trả phản hồi hoàn chỉnh.'));}});
  child.stdin.on('error',()=>{});child.stdin.end(personalContext(request));
 });
 emit({type:'done',text:result,provider:'Gemini CLI',model:'Google account',assessment:null});
}
export async function startGeminiLogin(){
 await prepareGeminiChat();const cli=entry();if(!cli)throw new Error('Chạy Setup-GeminiChat.cmd để cài Gemini CLI trước.');
 const file=path.join(root,'Setup-GeminiChat.ps1');
 const child=spawn('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',file,'-LoginOnly'],{cwd:root,windowsHide:false,detached:true,stdio:'ignore'});child.unref();
 return {message:'Đã mở cửa sổ Gemini. Bạn tự chọn Sign in with Google và đăng nhập. Sau đó đóng cửa sổ và bấm Làm mới AI.'};
}
