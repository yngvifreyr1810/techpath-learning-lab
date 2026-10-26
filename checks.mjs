import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {sharedContext} from './tutor-context.mjs';
import {routerStatus, routerReview} from './router-ai.mjs';

const elements=new Map();
const node=selector=>{if(!elements.has(selector))elements.set(selector,{innerHTML:'',textContent:'',classList:{add(){},remove(){}},addEventListener(){}});return elements.get(selector);};
const docHandlers={},winHandlers={};let saved;
const ctx={console,Date,Math,JSON,Number,String,Set,Map,Object,Array,Boolean,Error,structuredClone,isNaN,
 location:{hash:'#lesson/sql-join'},history:{replaceState(){}},
 localStorage:{getItem(){return null;},setItem(k,v){saved=JSON.parse(v);}},
 document:{
  querySelector:s=>elements.get(s)||(['#nav','#breadcrumb','#main','#save-status','#import-file'].includes(s)?node(s):null),
  querySelectorAll:s=>[],
  addEventListener(k,f){docHandlers[k]=f;},
  title:''
 },
 setInterval(){},setTimeout(){},clearTimeout(){},navigator:{},crypto:{randomUUID:()=> 'test-id'}};
ctx.window=ctx;ctx.globalThis=ctx;ctx.addEventListener=(k,f)=>winHandlers[k]=f;ctx.scrollTo=()=>{};
vm.createContext(ctx);
vm.runInContext(readFileSync(new URL('./dist/content.js',import.meta.url),'utf8'),ctx);
vm.runInContext(readFileSync(new URL('./dist/app.js',import.meta.url),'utf8'),ctx);

const c=ctx.TECHPATH,debug=ctx.TechPathDebug;
assert.equal(c.lessons.length,15);assert.equal(new Set(c.lessons.map(l=>l.id)).size,15);
for(const l of c.lessons){assert.ok(l.task&&l.body&&l.solution&&l.transfer);assert.equal(l.hints.length,3);assert.ok(l.checks.length);assert.ok(c.modules.some(m=>m.id===l.module));}
for(let t=15;t<=240;t++){const blocks=debug.planBlocks(t,c.lessons[5]);assert.equal(blocks.reduce((n,b)=>n+b.m,0),t);assert.ok(blocks.every(b=>b.m>0));}
// Regression: old editor must save to the old lesson, never the destination hash.
elements.set('#draft-code',{value:'SELECT 42 AS old_lesson;'});
ctx.location.hash='#lesson/sql-cte';winHandlers.hashchange();
assert.equal(saved.drafts['sql-join'].code,'SELECT 42 AS old_lesson;');
assert.equal(saved.drafts['sql-cte'].code,'');
assert.equal(saved.selected,'sql-cte');
elements.delete('#draft-code');
assert.throws(()=>debug.validate({version:9}));
assert.throws(()=>debug.validate({version:1,attempts:[],sessions:[],notes:[],drafts:[]}));
const roundTrip=debug.validate(JSON.parse(JSON.stringify(saved)));
assert.equal(roundTrip.drafts['sql-join'].code,'SELECT 42 AS old_lesson;');
const unsafe=JSON.parse(JSON.stringify(saved));unsafe.selected='unknown';unsafe.duration=-10;unsafe.drafts['unknown']={code:'x'};
const clean=debug.validate(unsafe);assert.equal(clean.selected,'sql-proc');assert.equal(clean.duration,60);assert.equal(clean.drafts.unknown,undefined);
// Render every route to catch authored content / missing data regressions.
for(const hash of ['#home','#lessons','#session','#roadmap','#notebook','#glossary','#settings',...c.lessons.map(l=>'#lesson/'+l.id)]){ctx.location.hash=hash;winHandlers.hashchange();assert.ok(node('#main').innerHTML.length>100);}

// Shared context tests (ensuring cross-AI shared history)
const history = [
 {role: 'user', text: 'Tôi muốn lấy tất cả khách hàng kể cả người chưa mua hàng.'},
 {role: 'assistant', text: 'Hãy nghĩ về chiều ưu tiên dữ liệu: bên nào cần giữ 100% dòng?'}
];
const formatted = sharedContext({prompt: 'Dùng LEFT JOIN có đúng không?', contextPrompt: '', history});
assert.ok(formatted.includes('LỊCH SỬ CHUNG GẦN ĐÂY CỦA BÀI'));
assert.ok(formatted.includes('Người học: Tôi muốn lấy tất cả khách hàng'));
assert.ok(formatted.includes('Gia sư: Hãy nghĩ về chiều ưu tiên'));
assert.ok(formatted.includes('YÊU CẦU HIỆN TẠI:\nDùng LEFT JOIN có đúng không?'));

// Router status test
const status = await routerStatus();
assert.equal(typeof status.connected, 'boolean');
assert.ok(Array.isArray(status.models));

// Explanations survive backup validation, render safely, and remain in the journal.
const withAnswers=structuredClone(saved);
withAnswers.attempts=[{id:'review-test',lessonId:'sql-proc',at:new Date().toISOString(),code:'SELECT 1;',output:'1',notes:'Chưa học stored procedure.',question:'GO làm gì?',mode:'standard',assessment:'ai_retry',grading:{verdict:'retry',summary:'Cần sửa.',hint:'Kiểm tra lại.',optimization:'',answers:[{topic:'GO',text:'GO tách nhóm lệnh gửi tới SQL Server.'},{topic:'<img src=x onerror=alert(1)>',text:'<script>alert(1)</script>'}],criteria:[]}}];
const answerBackup=debug.validate(withAnswers);
assert.deepEqual(JSON.parse(JSON.stringify(answerBackup.attempts[0].grading.answers)),withAnswers.attempts[0].grading.answers);
const legacy=structuredClone(withAnswers);delete legacy.attempts[0].grading.answers;
assert.equal(debug.validate(legacy).attempts[0].grading.answers.length,0);
const dirty=structuredClone(withAnswers);
dirty.attempts[0].grading.answers.push({topic:'  ',text:'không có chủ đề'},{topic:'Có chủ đề',text:'   '},{topic:'  GO  ',text:'  Tách batch.  '});
const cleaned=debug.validate(dirty).attempts[0].grading.answers;
assert.equal(cleaned.length,3);
assert.deepEqual(JSON.parse(JSON.stringify(cleaned.at(-1))),{topic:'GO',text:'Tách batch.'});
ctx.localStorage.getItem=()=>JSON.stringify(withAnswers);
ctx.location.hash='#lesson/sql-proc';
vm.runInContext(readFileSync(new URL('./dist/app.js',import.meta.url),'utf8'),ctx);
await docHandlers.click({target:{closest:()=>({classList:{contains:()=>false},dataset:{lessonTab:'practice'},hasAttribute:key=>key==='data-lesson-tab'})}});
assert.ok(node('#main').innerHTML.includes('Giải thích phần bạn hỏi'));
assert.ok(node('#main').innerHTML.includes('GO tách nhóm lệnh'));
assert.ok(!node('#main').innerHTML.includes('<img src=x'));
ctx.location.hash='#notebook';winHandlers.hashchange();
assert.ok(node('#main').innerHTML.includes('GO tách nhóm lệnh'));
console.log('PASS: 15 lessons; duration plans; draft isolation; old/new backups; explanations persist and render safely; routes, context and router status.');
