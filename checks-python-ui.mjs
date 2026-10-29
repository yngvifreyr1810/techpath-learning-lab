import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {curriculum} from './curriculum.mjs';
import http from 'node:http';
import path from 'node:path';
import {pythonRoute} from './python-lab.mjs';
import {apiRoute} from './api-lab.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
// An ephemeral fixture for both offline labs; no tutor/provider routes.
const fixture=process.argv.includes('--offline')?http.createServer(async(req,res)=>{
 try{
  const origin='http://'+req.headers.host;
  if(req.headers.origin&&req.headers.origin!==origin){res.writeHead(403);res.end();return;}
  const pathname=new URL(req.url,origin).pathname;
  if(await pythonRoute(req,res,pathname))return;
  if(await apiRoute(req,res,pathname))return;
  if(req.method!=='GET'||pathname.startsWith('/api/')){res.writeHead(404);res.end();return;}
  const root=fileURLToPath(new URL('./dist/',import.meta.url)),target=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!target.startsWith(root)){res.writeHead(403);res.end();return;}
  const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
  res.writeHead(200,{'Content-Type':types[path.extname(target)]||'text/plain'});res.end(await readFile(target));
 }catch{res.writeHead(404);res.end();}
}):null;
if(fixture)await new Promise(resolve=>fixture.listen(0,'127.0.0.1',resolve));
const base=fixture?'http://127.0.0.1:'+fixture.address().port:process.env.TECHPATH_TEST_URL||'http://127.0.0.1:4189';
const folder=new URL('./.techpath-local/python-qa/',import.meta.url);await mkdir(folder,{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const errors=[],inference=[];
 if(!process.argv.includes('--api-only')){
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()==='POST'&&/\/api\/.*(?:chat|review|grade)/.test(r.url()))inference.push(r.url());});
 assert.equal((await page.request.post(base+'/api/python/run',{data:{code:'print(1)',lessonId:'python-basic-print'}})).status(),403);
 assert.equal((await page.request.get(base+'/api/python/status',{headers:{Origin:'https://foreign.invalid'}})).status(),403);
 const status=await (await page.request.get(base+'/api/python/status')).json();assert.equal(status.ok,true);
 assert.equal((await page.request.post(base+'/api/python/submit',{headers:{'X-TechPath-Token':status.token},data:{code:'print(1)',lessonId:'sql-proc',judge:{verdict:'pass'}}})).status(),400);
 await page.goto(base+'/#lesson/python-basic-print');
 await page.getByRole('heading',{name:'Mục tiêu',exact:true}).waitFor();
 const editor=page.getByRole('textbox',{name:'Python Editor'});assert.equal(await editor.count(),0);assert.equal(await page.locator('[data-hint]').count(),0);
 for(const viewport of [{width:1440,height:1000},{width:1366,height:768},{width:1280,height:600},{width:390,height:844},{width:390,height:667}]){
  await page.setViewportSize(viewport);
  for(let i=0;i<4;i++){
   await page.locator('.theory-step[data-python-page="'+i+'"]').click();
   const dimensions=await page.evaluate(()=>{const stage=document.querySelector('.theory-slide'),start=document.querySelector('.theory-controls>a'),rect=start.getBoundingClientRect();return {page:document.documentElement.scrollHeight<=innerHeight+1,stage:stage.scrollHeight<=stage.clientHeight+1,button:rect.top>=0&&rect.bottom<=innerHeight};});
   assert.deepEqual(dimensions,{page:true,stage:true,button:true},JSON.stringify({viewport,i,dimensions}));
   if(i===2){await page.locator('[data-python-example]').click();assert.ok(await page.evaluate(()=>{const stage=document.querySelector('.theory-slide');return stage.scrollHeight<=stage.clientHeight+1;}));await page.locator('[data-python-example]').click();}
  }
 }
 await page.setViewportSize({width:1440,height:1000});await page.locator('.theory-step[data-python-page="0"]').click();
 await page.locator('#python-theory-panel').press('ArrowRight');await page.getByRole('heading',{name:'Kiến thức cần biết'}).waitFor();await page.locator('#python-theory-panel').press('ArrowLeft');await page.getByRole('heading',{name:'Mục tiêu',exact:true}).waitFor();
 await page.screenshot({path:fileURLToPath(new URL('desktop-theory.png',folder)),fullPage:true});
 await page.getByRole('link',{name:'Bắt đầu làm bài →'}).click();await editor.waitFor();assert.equal(await editor.inputValue(),'');
 assert.equal(await page.locator('.challenge-split').count(),1);await page.screenshot({path:fileURLToPath(new URL('desktop-practice.png',folder)),fullPage:true});
 const splitter=page.getByRole('separator',{name:'Điều chỉnh độ rộng đề bài và editor'});const originalSize=await splitter.getAttribute('aria-valuenow');await splitter.press('ArrowRight');assert.notEqual(await splitter.getAttribute('aria-valuenow'),originalSize);
 await editor.fill('pri');await editor.press('Tab');assert.equal(await editor.inputValue(),'print');
 await editor.fill('pri');await editor.press('Escape');await editor.press('Tab');assert.equal(await editor.inputValue(),'pri    ');
 await editor.fill('print("Tôi đang học Python")');await editor.press('Control+Enter');
 await page.locator('#python-results').getByRole('heading',{name:'Output (stdout)',exact:true}).waitFor();assert.equal(await page.locator('#python-results .case-layout').count(),0);
 let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('techpath.learning.v1')));assert.equal(saved.attempts.length,0);
 await page.getByRole('button',{name:'Nộp bài',exact:true}).click();await page.locator('#python-results').getByRole('heading',{name:'Đạt yêu cầu hiển thị văn bản.'}).waitFor();
 saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('techpath.learning.v1')));assert.equal(saved.attempts.length,1);assert.equal(saved.attempts[0].assessment,'python_pass');assert.ok(page.url().endsWith('python-basic-print/practice'));
 await page.getByRole('tab',{name:'Lần nộp · 1'}).click();await page.locator('.challenge-document').getByText('Đạt ·',{exact:false}).waitFor();await page.getByRole('tab',{name:'Gợi ý',exact:true}).click();await page.getByRole('button',{name:'Mở một gợi ý'}).click();await page.getByText('Dùng hàm print để hiển thị nội dung.',{exact:false}).waitFor();await page.getByRole('tab',{name:'Đề bài',exact:true}).click();
 await editor.fill('print("sai")');await page.locator('#python-results .stale-result').waitFor();
 assert.equal(await page.locator('[data-python-next]').isVisible(),false);
 await editor.fill('print("Tôi đang học Python")');assert.equal(await page.locator('[data-python-next]').isVisible(),true);assert.equal(await page.locator('#python-results .stale-result').count(),0);await editor.fill('print("sai")');
 await page.getByRole('link',{name:'← Lý thuyết & ví dụ'}).click();await editor.waitFor({state:'detached'});assert.equal(await editor.count(),0);await page.getByRole('link',{name:'Bắt đầu làm bài →'}).click();await editor.waitFor();assert.equal(await editor.inputValue(),'print("sai")');
 await page.reload();assert.equal(await editor.inputValue(),'print("sai")');await page.locator('#python-results .stale-result').waitFor();
 await page.getByRole('button',{name:'Nộp bài',exact:true}).click();await page.locator('#python-results').getByRole('heading',{name:'Output chưa khớp yêu cầu. Đối chiếu hai kết quả bên dưới.'}).waitFor();
 await editor.fill('print("hello"');await page.getByRole('button',{name:'Chạy',exact:true}).click();await page.locator('#python-results').getByText(/Python chưa đọc được cú pháp/).waitFor();
 assert.equal(await page.locator('#python-results .result-heading h2').innerText(),'✕ Python Error');
 await page.locator('#python-results .python-diagnostic').getByText(/SyntaxError.*dòng 1/).waitFor();
 await page.locator('[data-python-error-line]').click();assert.equal(await editor.evaluate(el=>document.activeElement===el),true);
 for(const [source,type] of [['print("a" "b")',''],['print("a" 2)','SyntaxError'],['print(missing_name)','NameError'],['if True:\nprint("a")','IndentationError']]){
  await editor.fill(source);await page.getByRole('button',{name:'Chạy',exact:true}).click();
  if(type)await page.locator('#python-results .python-diagnostic').getByText(new RegExp(type+'.*dòng')).waitFor();
  else await page.locator('#python-results .result-heading h2').filter({hasText:'Output (stdout)'}).waitFor();
 }
 await editor.fill('print("hello"');await page.getByRole('button',{name:'Nộp bài',exact:true}).click();
 await page.locator('#python-results .result-heading h2').filter({hasText:'Chưa đạt'}).waitFor();
 await page.locator('#python-results .python-diagnostic>span').filter({hasText:'SyntaxError'}).waitFor();
 await page.screenshot({path:fileURLToPath(new URL('submission-error.png',folder)),fullPage:true});
 await page.locator('[data-python-case="1"]').click();await page.locator('[data-python-case-panel="1"]').getByRole('heading',{name:/Chưa kiểm tra/}).waitFor();
 await page.reload();await page.locator('#python-results .python-diagnostic>span').filter({hasText:'SyntaxError'}).waitFor();

 await editor.fill('while True: pass');await page.getByRole('button',{name:'Chạy',exact:true}).click();await page.getByRole('button',{name:'Dừng',exact:true}).click();await page.getByRole('status').filter({hasText:'Đã dừng chạy Python.'}).waitFor();
 await page.goto(base+'/#lesson/sql-basic-select-customers');const sql=page.getByRole('textbox',{name:'SQL Editor'});await sql.fill('SEL');await sql.press('Tab');assert.equal(await sql.inputValue(),'SELECT');
 await sql.fill('SELECT c.\nFROM dbo.Customers AS c');await sql.press('Home');await sql.press('Control+Home');await sql.press('ArrowRight');await sql.press('ArrowRight');await sql.press('ArrowRight');await sql.press('ArrowRight');await sql.press('ArrowRight');await sql.press('ArrowRight');await sql.press('ArrowRight');await sql.press('ArrowRight');await sql.press('ArrowRight');await sql.press('Control+Space');
 assert.ok((await page.locator('#code-completions').innerText()).includes('customer_id'));await sql.press('Escape');
 await page.goto(base+'/#lesson/python-basic-print/practice');assert.equal(await editor.inputValue(),'while True: pass');
 await page.setViewportSize({width:390,height:844});await editor.scrollIntoViewIfNeeded();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:fileURLToPath(new URL('mobile-editor.png',folder)),fullPage:true});
 await page.setViewportSize({width:1440,height:1000});
 const downloadPromise=page.waitForEvent('download');await page.locator('#backup-top').click();const download=await downloadPromise;const backupPath=fileURLToPath(new URL('roundtrip.json',folder));await download.saveAs(backupPath);
 const backup=JSON.parse(await readFile(backupPath,'utf8'));assert.equal(backup.attempts.filter(a=>a.pythonJudging).length,3);assert.equal(backup.drafts['sql-basic-select-customers'].code,'SELECT c.\nFROM dbo.Customers AS c');
 backup.attempts.push({id:'legacy-sql-fixture',lessonId:'sql-proc',at:new Date().toISOString(),code:'SELECT 1;',output:'1',assessment:'sql_pass',judging:{verdict:'pass',summary:'SQL fixture retained',cases:[]}});
 await page.locator('#import-file').setInputFiles({name:'roundtrip.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await page.locator('#backup-before-import').click();await page.locator('#confirm-import').click();
 saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('techpath.learning.v1')));assert.equal(saved.attempts.length,4);assert.equal(saved.attempts[3].judging.summary,'SQL fixture retained');assert.equal(saved.attempts[0].pythonJudging.stdout.replace(/\r\n/g,'\n'),'Tôi đang học Python\n');
 const mdPromise=page.waitForEvent('download');await page.goto(base+'/#settings');await page.locator('[data-export-md]').click();const md=await mdPromise;const mdPath=fileURLToPath(new URL('journal.md',folder));await md.saveAs(mdPath);assert.ok((await readFile(mdPath,'utf8')).includes('```python'));
 const progression=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'}),study=await progression.newPage();
 study.on('pageerror',e=>errors.push(e.message));study.on('request',r=>{if(r.method()==='POST'&&/\/api\/.*(?:chat|review|grade)/.test(r.url()))inference.push(r.url());});
 const lessons=curriculum.lessons.filter(l=>l.module==='python'&&!l.roadmapWeek);
 await study.goto(base+'/#lesson/'+lessons[0].id);
 for(const [index,l] of lessons.entries()){
  assert.ok(study.url().endsWith('#lesson/'+l.id));await study.getByRole('heading',{name:'Mục tiêu',exact:true}).waitFor();await study.getByText('Dùng để làm gì?',{exact:false}).waitFor();
  for(const viewport of [{width:1366,height:768},{width:1280,height:600},{width:390,height:667}]){
   await study.setViewportSize(viewport);
   for(let i=0;i<4;i++){
    await study.locator('.theory-step[data-python-page="'+i+'"]').click();
    const dimensions=await study.evaluate(()=>{const slide=document.querySelector('.theory-slide'),r=document.querySelector('.theory-controls>a').getBoundingClientRect();return {page:document.documentElement.scrollHeight<=innerHeight+1,stage:slide.scrollHeight<=slide.clientHeight+1,button:r.bottom<=innerHeight};});
    assert.deepEqual(dimensions,{page:true,stage:true,button:true},JSON.stringify({lesson:l.id,viewport,i,dimensions}));
   }
  }
  await study.setViewportSize({width:1366,height:768});
  if(l.requiredVariable||l.pythonRequirements){await study.locator('.theory-step[data-python-page="2"]').click();await study.screenshot({path:fileURLToPath(new URL(l.id+'-example.png',folder))});assert.equal(await study.locator('[data-python-example]').count(),0);}
  await study.getByRole('link',{name:'Bắt đầu làm bài →'}).click();const code=study.getByRole('textbox',{name:'Python Editor'});await code.waitFor();assert.equal(await code.inputValue(),'');
  if(l.requiredVariable||l.pythonRequirements){await code.fill('print('+JSON.stringify(l.expected)+')');await study.getByRole('button',{name:'Nộp bài',exact:true}).click();await study.locator('#python-results').getByRole('heading',{name:/Output đã khớp/}).waitFor();assert.equal(await study.locator('[data-python-next]').count(),0);}
  await code.fill(l.solution);await study.getByRole('button',{name:'Nộp bài',exact:true}).click();await study.locator('#python-results').getByRole('heading',{name:l.pythonRequirements?'Đạt yêu cầu bài học.':l.requiredVariable?'Đạt yêu cầu gán và đọc giá trị của biến.':'Đạt yêu cầu hiển thị văn bản.'}).waitFor();
  assert.ok(study.url().endsWith(l.id+'/practice'));
  if(index<lessons.length-1){assert.ok((await study.locator('[data-python-next]').getAttribute('href')).endsWith(lessons[index+1].id));await study.locator('[data-python-next]').click();await study.getByRole('heading',{name:'Mục tiêu',exact:true}).waitFor();}
  else{assert.equal(await study.locator('[data-python-next]').count(),0);await study.getByText('Đã xong nhóm luyện hiện tại.',{exact:false}).waitFor();}
 }
 const progress=await study.evaluate(()=>JSON.parse(localStorage.getItem('techpath.learning.v1')));assert.equal(progress.attempts.filter(a=>a.assessment==='python_pass').length,27);assert.equal(progress.attempts.filter(a=>a.assessment==='python_retry').length,24);
 const validated=await study.evaluate(raw=>window.TechPathDebug.validate(JSON.parse(JSON.stringify(raw))),progress);assert.equal(validated.attempts.length,51);assert.equal(validated.selected,'python-review-walk');assert.equal(validated.drafts['python-review-walk'].code,lessons.at(-1).solution);assert.equal(validated.attempts.at(-1).pythonJudging.verdict,'pass');
 const bareContext=await browser.newContext(),bare=await bareContext.newPage();
 await bare.goto(base+'/#lesson/python-print-lines/practice');const bareEditor=bare.getByRole('textbox',{name:'Python Editor'});
 await bareEditor.fill('print');await bare.getByRole('button',{name:'Chạy',exact:true}).click();
 await bare.locator('#python-results .result-heading.run-neutral').getByRole('heading',{name:'Output (stdout)'}).waitFor();
 assert.equal(await bare.locator('#python-results .accepted,#python-results .case-pass,#python-results .case-layout').count(),0);
 await bare.locator('#python-results .python-stdout').getByText('(Không có output)',{exact:true}).waitFor();
 assert.equal(await bare.locator('#python-results').getByRole('heading',{name:/Đạt/}).count(),0);
 assert.equal((await bare.evaluate(()=>JSON.parse(localStorage.getItem('techpath.learning.v1')))).attempts.length,0);
 await bare.getByRole('button',{name:'Nộp bài',exact:true}).click();await bare.locator('#python-results .result-heading.failed').getByRole('heading',{name:'✕ Chưa đạt'}).waitFor();
 await bare.locator('[data-python-case-panel="1"]').getByText('Output chưa khớp.',{exact:false}).waitFor();
 assert.equal(await bare.locator('[data-python-next]').count(),0);
 assert.equal((await bare.evaluate(()=>JSON.parse(localStorage.getItem('techpath.learning.v1')))).attempts[0].assessment,'python_retry');
 await bareContext.close();
 const undoContext=await browser.newContext(),undoPage=await undoContext.newPage();
 undoPage.on('pageerror',e=>errors.push(e.message));
 for(const [id,label,source] of [['python-basic-print','Python Editor','print("test")'],['sql-basic-select-customers','SQL Editor','SELECT 1']]){
  await undoPage.goto(base+'/#lesson/'+id+(label==='Python Editor'?'/practice':''));
  const input=undoPage.getByRole('textbox',{name:label});await input.fill(source);await input.press('End');await input.press('Enter');
  assert.equal(await input.inputValue(),source+'\n');await input.press('Control+z');assert.equal(await input.inputValue(),source);
  await input.press('Control+y');assert.equal(await input.inputValue(),source+'\n');await input.press('Control+z');await input.press('Control+Shift+z');assert.equal(await input.inputValue(),source+'\n');
  await input.press('Control+a');await input.press('Backspace');assert.equal(await input.inputValue(),'');await input.press('Control+z');assert.equal(await input.inputValue(),source+'\n');
  if(label==='Python Editor'){
   await undoPage.getByRole('button',{name:'Chạy',exact:true}).click();await undoPage.locator('.python-run-result').waitFor();
   await input.press('Control+z');assert.equal(await input.inputValue(),source);await input.press('Control+y');assert.equal(await input.inputValue(),source+'\n');
   await undoPage.getByRole('button',{name:'Nộp bài',exact:true}).click();await undoPage.locator('#python-results .result-heading.failed').waitFor();
   await input.press('Control+z');assert.equal(await input.inputValue(),source);
   await undoPage.getByRole('tab',{name:'Gợi ý',exact:true}).click();await input.press('Control+y');assert.equal(await input.inputValue(),source+'\n');
  }
  await input.fill(label==='Python Editor'?'pri':'SEL');await input.press('End');await input.press('Control+Space');await input.press('Tab');
  assert.equal(await input.inputValue(),label==='Python Editor'?'print':'SELECT');await input.press('Control+z');assert.equal(await input.inputValue(),label==='Python Editor'?'pri':'SEL');
  await input.press('Escape');await input.press('Tab');assert.ok((await input.inputValue()).endsWith('    '));await input.press('Control+z');assert.equal(await input.inputValue(),label==='Python Editor'?'pri':'SEL');
  await input.press('Control+y');await input.press('Control+z');await input.press('End');await input.press('Escape');await input.press('x');await input.press('Control+y');assert.ok((await input.inputValue()).endsWith('x'));
 }
 await undoContext.close();
 }
 const apiContext=await browser.newContext({viewport:{width:1366,height:768}}),apiPage=await apiContext.newPage();
 apiPage.on('pageerror',e=>errors.push(e.message));apiPage.on('request',r=>{if(r.method()==='POST'&&/\/api\/.*(?:chat|review|grade)/.test(r.url()))inference.push(r.url());});
 assert.equal((await apiPage.request.post(base+'/api/practice-api/run',{data:{}})).status(),403);
 assert.equal((await apiPage.request.get(base+'/api/practice-api/status',{headers:{Origin:'https://foreign.invalid'}})).status(),403);
 const apiLessons=curriculum.lessons.filter(l=>l.module==='api');
 for(const [index,l] of apiLessons.entries()){
  await apiPage.goto(base+'/#lesson/'+l.id);
  for(const viewport of [{width:1366,height:768},{width:390,height:667}]){
   await apiPage.setViewportSize(viewport);
   for(let i=0;i<4;i++){
    await apiPage.locator('[data-python-page="'+i+'"].theory-step').click();
    assert.ok(await apiPage.evaluate(()=>{const stage=document.querySelector('.theory-slide');return stage.scrollHeight<=stage.clientHeight+1;}),l.id+' theory '+i+' '+viewport.width);
   }
  }
  await apiPage.setViewportSize({width:1366,height:768});await apiPage.getByRole('link',{name:'Bắt đầu làm bài →'}).click();
  const r=l.apiRequest;await apiPage.locator('#api-method').selectOption(r.method);await apiPage.locator('#api-path').fill(r.path);if(r.method==='POST'){await apiPage.locator('#api-content-type').fill(r.contentType);await apiPage.getByRole('textbox',{name:'Body JSON'}).fill(r.body);}
  await apiPage.getByRole('button',{name:'Chạy',exact:true}).click();await apiPage.locator('#api-results .result-heading h2').filter({hasText:'Response · HTTP '+l.expectedStatus}).waitFor();
  assert.equal(await apiPage.locator('#api-results .case-layout').count(),0);assert.equal((await apiPage.evaluate(()=>JSON.parse(localStorage.getItem('techpath.learning.v1')))).attempts.length,index);
  await apiPage.getByRole('button',{name:'Nộp bài',exact:true}).click();await apiPage.locator('#api-results .accepted').getByRole('heading',{name:'✓ Accepted · Đạt'}).waitFor();
  if(index<apiLessons.length-1){assert.ok(await apiPage.locator('[data-api-next]').isVisible());await apiPage.locator('#api-path').fill('/wrong');assert.equal(await apiPage.locator('[data-api-next]').isVisible(),false);await apiPage.locator('#api-results .stale-result').waitFor();}
 }
 await apiPage.locator('#api-body').fill('{"title":');await apiPage.getByRole('button',{name:'Chạy',exact:true}).click();await apiPage.locator('#api-results').getByRole('heading',{name:'Response · HTTP 400'}).waitFor();await apiPage.locator('#api-results pre').filter({hasText:'INVALID_JSON'}).waitFor();
 await apiPage.reload();assert.equal(await apiPage.locator('#api-body').inputValue(),'{"title":');
 const apiState=await apiPage.evaluate(()=>JSON.parse(localStorage.getItem('techpath.learning.v1'))),apiValidated=await apiPage.evaluate(raw=>window.TechPathDebug.validate(raw),apiState);
 assert.equal(apiValidated.attempts.filter(a=>a.apiJudging?.judge.verdict==='pass').length,12);assert.equal(apiValidated.drafts['api-post-walk'].code,apiState.drafts['api-post-walk'].code);
 const apiBackupPromise=apiPage.waitForEvent('download');await apiPage.locator('#backup-top').click();const apiBackup=await apiBackupPromise;const apiBackupPath=fileURLToPath(new URL('api-roundtrip.json',folder));await apiBackup.saveAs(apiBackupPath);
 const apiRaw=JSON.parse(await readFile(apiBackupPath,'utf8'));
 apiRaw.attempts.push({id:'sql-preserved',lessonId:'sql-proc',at:new Date().toISOString(),code:'SELECT 1',assessment:'sql_pass',judging:{verdict:'pass',summary:'SQL retained',cases:[]}});
 apiRaw.attempts.push({id:'python-preserved',lessonId:'python-basic-print',at:new Date().toISOString(),code:'print("Tôi đang học Python")',assessment:'python_pass',pythonJudging:{verdict:'pass',summary:'Python retained',ok:true,stdout:'Tôi đang học Python\n'}});
 await apiPage.locator('#import-file').setInputFiles({name:'api-roundtrip.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(apiRaw))});await apiPage.locator('#backup-before-import').click();await apiPage.locator('#confirm-import').click();
 const importedApi=await apiPage.evaluate(()=>JSON.parse(localStorage.getItem('techpath.learning.v1')));
 assert.equal(importedApi.attempts.length,14);assert.equal(importedApi.attempts[0].apiJudging.judge.verdict,'pass');assert.equal(importedApi.attempts[12].judging.summary,'SQL retained');assert.equal(importedApi.attempts[13].pythonJudging.summary,'Python retained');
 await apiPage.getByRole('tab',{name:'Gợi ý',exact:true}).click();await apiPage.getByRole('button',{name:'Mở một gợi ý'}).click();await apiPage.getByText(apiLessons.at(-1).hints[0],{exact:false}).waitFor();
 const apiMdPromise=apiPage.waitForEvent('download');await apiPage.goto(base+'/#settings');await apiPage.locator('[data-export-md]').click();const apiMd=await apiMdPromise;const apiMdPath=fileURLToPath(new URL('api-journal.md',folder));await apiMd.saveAs(apiMdPath);assert.ok((await readFile(apiMdPath,'utf8')).includes('### API judging'));
 await apiPage.goto(base+'/#lesson/api-post-walk/practice');
 const apiBody=apiPage.getByRole('textbox',{name:'Body JSON'}),beforeUndo=await apiBody.inputValue();await apiBody.press('End');await apiBody.press('x');await apiBody.press('Control+z');assert.equal(await apiBody.inputValue(),beforeUndo);await apiBody.press('Control+y');assert.equal(await apiBody.inputValue(),beforeUndo+'x');await apiBody.press('Control+z');
 await apiPage.setViewportSize({width:390,height:667});assert.ok(await apiPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await apiPage.screenshot({path:fileURLToPath(new URL('api-mobile.png',folder)),fullPage:true});await apiContext.close();
 assert.deepEqual(errors,[]);assert.deepEqual(inference,[]);
 console.log(process.argv.includes('--api-only')?'PASS: 12 API lessons, theory viewport fit, request/response, 404 accepted, invalid JSON, stale/drafts and backup validation; zero inference requests.':'PASS: 27 Python and 12 API lessons, theory viewport fit, structural judging, HTTP statuses, keyboard/undo, Run/Submit, stale/reload, draft isolation, backup/import and Markdown; zero inference requests.');
}finally{await browser.close();if(fixture)await new Promise(resolve=>fixture.close(resolve));}
