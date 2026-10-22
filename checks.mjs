import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const elements=new Map();
const node=selector=>{if(!elements.has(selector))elements.set(selector,{innerHTML:'',textContent:'',classList:{add(){},remove(){}},addEventListener(){}});return elements.get(selector);};
const docHandlers={},winHandlers={};let saved;
const ctx={console,Date,Math,JSON,Number,String,Set,Map,Object,Array,Boolean,Error,structuredClone,isNaN,
 location:{hash:'#lesson/sql-join'},history:{replaceState(){}},
 localStorage:{getItem(){return null;},setItem(k,v){saved=JSON.parse(v);}},
 document:{querySelector:s=>elements.get(s)||(['#nav','#breadcrumb','#main','#save-status','#import-file'].includes(s)?node(s):null),addEventListener(k,f){docHandlers[k]=f;},title:''},
 setInterval(){},setTimeout(){},clearTimeout(){},navigator:{},crypto:{randomUUID:()=> 'test-id'}};
ctx.window=ctx;ctx.globalThis=ctx;ctx.addEventListener=(k,f)=>winHandlers[k]=f;ctx.scrollTo=()=>{};
vm.createContext(ctx);vm.runInContext(readFileSync(new URL('./dist/content.js',import.meta.url),'utf8'),ctx);vm.runInContext(readFileSync(new URL('./dist/app.js',import.meta.url),'utf8'),ctx);
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
console.log('PASS: 15 lessons; 226 duration plans; cross-lesson draft isolation; backup round-trip/validation; all routes render. SQL execution not included.');
