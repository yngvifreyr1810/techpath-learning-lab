import assert from 'node:assert/strict';
import http from 'node:http';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
import worker from './dist/server/index.js';
const {chromium}=createRequire(import.meta.url)('playwright');
const server=http.createServer(async(req,res)=>{const chunks=[];for await(const c of req)chunks.push(c);const r=await worker.fetch(new Request('http://127.0.0.1:'+server.address().port+req.url,{method:req.method,headers:req.headers,...(chunks.length?{body:Buffer.concat(chunks)}:{})}));res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=process.env.MOBILE_QA_URL||'http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'msedge',headless:true});await mkdir('.techpath-local/mobile-qa',{recursive:true});
try{for(const size of [{width:375,height:667},{width:390,height:844},{width:430,height:932},{width:844,height:390}]){
 const context=await browser.newContext({viewport:size,isMobile:true,hasTouch:true,deviceScaleFactor:2});const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['roadmap','roadmap/week-1','lesson/ai-model-data','lesson/ai-role/practice','lesson/python-variable-name/practice','lessons/api','settings']){
  await page.goto(base+'/#'+route);await page.locator('#main').waitFor();await page.waitForTimeout(200);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+JSON.stringify(size));
 }
 await page.goto(base+'/#lesson/ai-role/practice');for(const [i,n] of [1,0,2].entries())await page.locator(`input[name=q${i}][value="${n}"]`).check();
 await page.getByRole('button',{name:'Kiểm tra câu trả lời'}).click();await page.getByRole('heading',{name:/Đạt câu hỏi.*3\/3/}).waitFor();await page.locator('[data-learning-next]').scrollIntoViewIfNeeded();
 await page.screenshot({path:'.techpath-local/mobile-qa/'+size.width+'-'+(process.env.MOBILE_QA_URL?'live':'worker')+'.png'});
 await page.locator('[data-learning-next]').click();assert.ok(!page.url().endsWith('ai-role/practice'));
 assert.deepEqual(errors,[]);await context.close();
}console.log('PASS: hosted Worker mobile touch 375/390/430 + landscape; routes, quiz Submit and next lesson, no desktop connector.');}finally{await browser.close();await new Promise(r=>server.close(r));}
