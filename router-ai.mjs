import {PERSONAL_INSTRUCTIONS,personalContext} from './personal-prompts.mjs';
import {TUTOR_INSTRUCTIONS} from './tutor-prompts.mjs';
import {sharedContext} from './tutor-context.mjs';
import {readChatCompletion,completeReview} from './chat-completion.mjs';
import {catalogModels,defaultRouterModel} from './provider-catalog.mjs';
import {personalModels,personalContent,personalImages} from './personal-media.mjs';
import path from 'node:path';
import {existsSync} from 'node:fs';

const BASE='http://127.0.0.1:20128/v1';

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
  const r=await fetch(BASE+'/models',{headers:await getHeaders(),redirect:'error',signal:AbortSignal.timeout(5000)});
  if(!r.ok)return {connected:false,models:[],defaultModel:'',message:r.status===401?'9Router yêu cầu API key. Cấu hình TECHPATH_9ROUTER_API_KEY.':'9Router chưa trả danh sách model.'};
  const body=await r.json(),models=catalogModels(body.data);
  return {connected:models.length>0,models,personalModels:personalModels(body.data).filter(model=>! /^(gh|copilot)\//i.test(model.id)),defaultModel:defaultRouterModel(models),message:'Đã đọc danh mục 9Router. Chọn workflow hoặc model; khả năng gọi và quota phụ thuộc provider.'};
 }catch{return {connected:false,models:[],defaultModel:'',message:'Chưa mở 9Router. Mở shortcut 9Router trên Desktop rồi kết nối lại.'};}
}
export async function routerReview(request,emit,signal){
 const catalog=await routerStatus();if(!catalog.connected)throw new Error(catalog.message);
 const model=request.model||catalog.defaultModel;
 const personal=request.conversationScope==='personal',choices=personal?[...(catalog.personalModels||[]),...catalog.models.filter(m=>m.id==='techpath-light')]:catalog.models;
 if(!model||!choices.some(m=>m.id===model))throw new Error('Chọn một workflow/model có trong danh mục 9Router. App không tự chọn model cloud khác.');
 if(personal&&personalImages(request).length&&!choices.find(m=>m.id===model)?.vision)throw new Error('Model/workflow này chưa được xác nhận nhận ảnh. Chọn kết nối đang hỗ trợ ảnh.');
 let input=(request.conversationScope==='personal'?personalContext(request):sharedContext(request));
 if(request.grading)input+='\n\nChỉ trả JSON theo schema:\n'+JSON.stringify(request.grading.schema);
 const response=await fetch(BASE+'/chat/completions',{method:'POST',headers:await getHeaders(),redirect:'error',body:JSON.stringify({model,messages:[{role:'system',content:personal?PERSONAL_INSTRUCTIONS:TUTOR_INSTRUCTIONS},{role:'user',content:personal?personalContent(request,input):input}],stream:true}),signal:AbortSignal.any([AbortSignal.timeout(240000),...(signal?[signal]:[])])});
 if(!response.ok){
  if(response.status===401||response.status===403)throw new Error('9Router/provider chưa xác thực. Kiểm tra Providers trong 9Router.');
  if(response.status===429)throw new Error('Workflow/model đang giới hạn lượt hoặc hết quota. Bạn có thể chọn Local AI; app không tự gửi lại.');
  throw new Error('9Router trả HTTP '+response.status+'. Kiểm tra workflow/model trong 9Router; app không tự gửi lại.');
 }
 const result=await readChatCompletion(response,request.grading?undefined:text=>emit({type:'delta',text}));
 completeReview(result,request,emit,'9Router',model);
}

// Explicit local Qoder diagnostic; never invoked by status or ordinary chat.
export async function qoderCheckRequest(model) {
 if(model!==null && !/^(qd|qoder)\/[^\s]+$/.test(model))throw new Error('Invalid Qoder model');
 const signal=AbortSignal.timeout(model===null?5000:45000);
 const response=await fetch(BASE+(model===null?'/models':'/chat/completions'),{
  method:model===null?'GET':'POST',headers:await getHeaders(),redirect:'error',signal,
  ...(model===null?{}:{body:JSON.stringify({model,messages:[{role:'user',content:'Reply with exactly OK.'}],stream:false,max_tokens:64})})
 });
 if(!response.ok)throw new Error('HTTP '+response.status);
 const body=await response.json();
 if(model===null)return body.data;
 if(body.error || !body.choices?.[0]?.message?.content?.trim())throw new Error('Empty or invalid response');
 return true;
}
