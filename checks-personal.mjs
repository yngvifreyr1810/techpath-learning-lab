import assert from 'node:assert/strict';
import http from 'node:http';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {validateImages,personalModels,personalContent,MAX_IMAGE_BYTES} from './personal-media.mjs';
import {personalRoute,closePersonal} from './personal-http.mjs';
import {routerReview} from './router-ai.mjs';
import {localReview} from './local-ai.mjs';
import {sessionToken} from './session-access.mjs';

const image={url:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=',name:'offline.png'};
assert.equal(validateImages([image]).length,1);
for(const bad of [[{url:'https://example.com/private.png'}],[{url:'data:image/svg+xml;base64,PHN2Zz4='}],[{url:'data:image/png;base64,aGVsbG8='}],Array(3).fill(image),[{url:'data:image/png;base64,'+'A'.repeat(MAX_IMAGE_BYTES*2)}]])assert.throws(()=>validateImages(bad));
const catalog=personalModels([{id:'gh/gpt-4.1'},{id:'gh/gpt-4o-mini'},{id:'gh/gpt-5.4-nano'},{id:'unknown'},{id:'gh/gpt-4.1'}]);
assert.equal(catalog.length,3);assert.equal(catalog.find(m=>m.id==='gh/gpt-4o-mini').vision,true);assert.equal(catalog.find(m=>m.id==='gh/gpt-5.4-nano').vision,false);
assert.deepEqual(personalModels([]),[]);
assert.equal(personalContent({history:[],images:[image]},'look').filter(p=>p.type==='image_url').length,1);

const realFetch=globalThis.fetch,oldKey=process.env.TECHPATH_9ROUTER_API_KEY;
process.env.TECHPATH_9ROUTER_API_KEY='offline-test';
let posts=[],vision=true,rateLimit=false;
const completion=()=>new Response('data: '+JSON.stringify({choices:[{delta:{content:'Phản hồi giả lập.'},finish_reason:null}]})+'\n\ndata: '+JSON.stringify({choices:[{delta:{},finish_reason:'stop'}]})+'\n\ndata: [DONE]\n\n',{headers:{'Content-Type':'text/event-stream'}});
globalThis.fetch=async(url,options={})=>{
 const address=String(url);
 if(address==='http://127.0.0.1:20128/v1/models')return Response.json({data:[{id:'gh/gpt-4.1'},{id:'techpath-light'}]});
 if(address.endsWith('/api/v1/models'))return Response.json({models:address.includes(':1235')?[{type:'llm',display_name:'Offline local',capabilities:{vision},loaded_instances:[{id:'offline-local'}]}]:[]});
 if(address==='http://127.0.0.1:20128/v1/chat/completions'||address==='http://127.0.0.1:1235/v1/chat/completions'){
  posts.push({url:address,...JSON.parse(options.body)});return rateLimit?new Response('',{status:429}):completion();
 }
 throw new Error('Unexpected network request: '+address);
};
const base={conversationScope:'personal',history:[],prompt:'Xem ảnh',images:[image],profile:'',style:'listen',model:'gh/gpt-4.1',grading:null};
try{
 let events=[];await routerReview(base,e=>events.push(e));
 assert.equal(events.at(-1).type,'done');assert.equal(posts.at(-1).model,'gh/gpt-4.1');assert.equal(posts.at(-1).messages[1].content.at(-1).image_url.url,image.url);
 await assert.rejects(routerReview({...base,model:'techpath-light'},()=>{}),/nhận ảnh/);
 await assert.rejects(routerReview({...base,model:'gh/nonexistent'},()=>{}),/danh mục/);
 await localReview({...base,model:'local-ai'},()=>{});
 assert.equal(posts.at(-1).url,'http://127.0.0.1:1235/v1/chat/completions');
 assert.ok(posts.at(-1).messages[0].content.includes('không gian riêng'));
 vision=false;const before=posts.length;await assert.rejects(localReview({...base,model:'local-ai'},()=>{}),/không hỗ trợ ảnh/);assert.equal(posts.length,before);
 rateLimit=true;await assert.rejects(routerReview({...base,images:[]},()=>{}),/quota/);assert.equal(posts.length,before+1);rateLimit=false;

 const server=http.createServer((req,res)=>personalRoute(req,res,new URL(req.url,'http://local').pathname));
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const endpoint='http://127.0.0.1:'+server.address().port+'/api/personal/chat';
 const post=body=>realFetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','X-TechPath-Token':sessionToken},body:JSON.stringify({provider:'router',style:'listen',model:'gh/gpt-4.1',prompt:'',images:[image],...body})});
 try{
  let response=await post({provider:'codex'});assert.equal(response.status,400);assert.match((await response.json()).error,/CLI/);
  response=await post({images:[{url:'https://example.com/image'}]});assert.equal(response.status,400);await response.text();
  response=await post({prompt:'x'.repeat(3000001)});assert.equal(response.status,413);await response.text();
  response=await post({history:Array(6).fill({role:'user',text:'Ảnh cũ',images:[image]})});assert.equal(response.status,200);assert.match(await response.text(),/"type":"done"/);
  assert.equal(posts.at(-1).messages[1].content.filter(p=>p.type==='image_url').length,3);
 }finally{await new Promise(resolve=>server.close(resolve));}
}finally{globalThis.fetch=realFetch;if(oldKey===undefined)delete process.env.TECHPATH_9ROUTER_API_KEY;else process.env.TECHPATH_9ROUTER_API_KEY=oldKey;closePersonal();}

// Delete/cancel, legacy backup migration and failed persistence in an isolated VM.
const key='techpath.personal.v1',first='00000000-0000-4000-8000-000000000001',second='00000000-0000-4000-8000-000000000002';
let saved=JSON.stringify({schema:key,profile:'',route:'local',style:'listen',chats:[{id:first,title:'Keep',messages:[{role:'user',text:'Legacy'}]},{id:second,title:'Delete test',messages:[]}]}),accept=false,full=false,handlers={};
const element={innerHTML:'',textContent:'',value:'',options:[],classList:{toggle(){}},add(){},querySelector(){return null;}};
const ctx={URL,Blob,Date,JSON,Math,Array,Object,String,Number,Set,Map,Error,Option:function(){},AbortController,AbortSignal,structuredClone,crypto:{randomUUID:()=>first},location:{hostname:'localhost',origin:'http://localhost:4181',hash:'#notebook'},confirm:()=>accept,localStorage:{getItem:()=>saved,setItem:(k,v)=>{if(full)throw new Error('full');saved=v;}},document:{querySelector:s=>s==='#personal-root'?{set outerHTML(v){element.innerHTML=v;}}:element,addEventListener:(name,fn)=>handlers[name]=fn,body:{classList:{toggle(){}}}},fetch:async()=>Response.json({}),setTimeout(){}};
ctx.window=ctx;vm.createContext(ctx);vm.runInContext(readFileSync(new URL('./dist/personal.js',import.meta.url),'utf8'),ctx);
const click=attribute=>handlers.click({target:{closest:()=>({dataset:{},hasAttribute:name=>name===attribute})}});
await click('data-personal-unlock');await click('data-personal-delete');assert.equal(JSON.parse(saved).chats.length,2);
accept=true;full=true;await click('data-personal-delete');assert.equal(JSON.parse(saved).chats.length,2);
full=false;await click('data-personal-delete');assert.equal(JSON.parse(saved).chats.length,1);assert.equal(JSON.parse(saved).chats[0].id,first);assert.equal(JSON.parse(saved).chats[0].messages[0].text,'Legacy');
assert.equal(JSON.parse(saved).chats[0].draftImages.length,0);
console.log('PASS: image validation, live Copilot selection, multimodal router/local payloads, text-only rejection, no retry, API validation, delete/cancel/storage failure and legacy backups. All inference mocked; no cloud quota used.');
