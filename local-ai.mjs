import {TUTOR_INSTRUCTIONS} from './tutor-prompts.mjs';
import {sharedContext} from './tutor-context.mjs';
import {readChatCompletion,completeReview} from './chat-completion.mjs';
// Fixed loopback destinations only. This module never calls 9Router or cloud.
const endpoints=['http://127.0.0.1:1235','http://127.0.0.1:1234'];
const headers=()=>({'Content-Type':'application/json',...(process.env.TECHPATH_LOCAL_API_KEY?{Authorization:'Bearer '+process.env.TECHPATH_LOCAL_API_KEY}:{})});
export function loadedLocalModels(body){return (Array.isArray(body?.models)?body.models:[]).filter(m=>m.type==='llm').flatMap(m=>(m.loaded_instances||[]).filter(i=>typeof i.id==='string').map(i=>({id:i.id,name:m.display_name||m.key||i.id,context:i.config?.context_length||0})));}
async function discover(){
 const scans=await Promise.all(endpoints.map(async base=>{try{const r=await fetch(base+'/api/v1/models',{headers:headers(),redirect:'error',signal:AbortSignal.timeout(2000)});if(!r.ok)return {base,loaded:[],auth:r.status===401||r.status===403};return {base,loaded:loadedLocalModels(await r.json())};}catch{return {base,loaded:[]};}}));
 return scans.find(s=>s.loaded.length===1)||scans.find(s=>s.loaded.length>1)||scans[0];
}
export async function localStatus(){
 const s=await discover(),one=s.loaded.length===1;
 return {connected:one,models:one?[{id:'local-ai',label:'Local AI · model đang tải',group:'Chỉ máy này',description:'Chỉ gọi LM Studio trên máy này; không chuyển sang cloud.'}]:[],model:one?s.loaded[0].name:'',message:one?'Local AI sẵn sàng: '+s.loaded[0].name+'. Chỉ dùng máy này, không dùng quota cloud.':s.loaded.length>1?'LM Studio đang tải nhiều model. Giữ một model ngôn ngữ để Local AI chọn đúng.':s.auth?'LM Studio yêu cầu xác thực. Cấu hình TECHPATH_LOCAL_API_KEY cho bộ kết nối.':'Mở LM Studio, tải một model rồi bật Developer → Start server (cổng 1235 hoặc 1234).'};
}
export async function localReview(request,emit,signal){
 const s=await discover();if(s.loaded.length!==1)throw new Error((await localStatus()).message);
 if(request.model&&request.model!=='local-ai')throw new Error('Local AI dùng model hiện được tải trong LM Studio.');
 const input=sharedContext(request),model=s.loaded[0].id;
 const response=await fetch(s.base+'/v1/chat/completions',{method:'POST',headers:headers(),redirect:'error',signal:AbortSignal.any([AbortSignal.timeout(240000),...(signal?[signal]:[])]),body:JSON.stringify({model,messages:[{role:'system',content:TUTOR_INSTRUCTIONS},{role:'user',content:input}],stream:true,max_tokens:request.grading?6144:2048,...(request.grading?{response_format:{type:'json_schema',json_schema:{name:'techpath_review',strict:true,schema:request.grading.schema}}}:{})})});
 if(!response.ok)throw new Error('Local AI trả HTTP '+response.status+'. Kiểm tra model/server trong LM Studio. Không tự chuyển sang cloud.');
 const result=await readChatCompletion(response,request.grading?undefined:text=>emit({type:'delta',text}));
 completeReview(result,request,emit,'Local AI',model);
}
