import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import http from 'node:http';
import path from 'node:path';
import {curriculum as C} from './curriculum.mjs';
import {pythonRoute} from './python-lab.mjs';
import {apiRoute} from './api-lab.mjs';
import {learningRoute} from './learning-lab.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const root=path.resolve(fileURLToPath(new URL('./dist/',import.meta.url)));
const server=http.createServer(async(req,res)=>{
 try{
  const origin='http://127.0.0.1:'+server.address().port;
  if(req.headers.host!==new URL(origin).host||(req.headers.origin&&req.headers.origin!==origin)){res.writeHead(403);res.end();return;}
  const pathname=new URL(req.url,origin).pathname;
  if(await learningRoute(req,res,pathname)||await pythonRoute(req,res,pathname)||await apiRoute(req,res,pathname))return;
  if(req.method!=='GET'||pathname.startsWith('/api/')){res.writeHead(404);res.end();return;}
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep))throw Error('path');
  res.writeHead(200,{'Content-Type':{'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'}[path.extname(file)]||'text/plain'});res.end(await readFile(file));
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'msedge',headless:true});
const folder=new URL('./.techpath-local/roadmap-qa/',import.meta.url);await mkdir(folder,{recursive:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'}),page=await context.newPage();
 const errors=[],inference=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()==='POST'&&/tutor|review|chat|grade/.test(r.url()))inference.push(r.url());});
 const status=await(await page.request.get(base+'/api/learning/status')).json();assert.ok(status.token);
 assert.equal((await page.request.post(base+'/api/learning/check',{data:{id:'ai-role',answers:[1,0,2]}})).status(),403);
 assert.equal((await page.request.get(base+'/api/learning/status',{headers:{Origin:'https://foreign.invalid'}})).status(),403);
 assert.equal((await page.request.post(base+'/api/learning/check',{headers:{'X-TechPath-Token':status.token},data:{id:'week-4',answers:[]}})).status(),400);
 const forged=await(await page.request.post(base+'/api/learning/check',{headers:{'X-TechPath-Token':status.token},data:{id:'ai-role',answers:[0,1,0],passed:true}})).json();assert.equal(forged.passed,false);
 await page.goto(base+'/#roadmap');await page.getByRole('heading',{name:'Từ nền tảng đến ứng dụng AI đầu tiên'}).waitFor();assert.equal(await page.locator('.learning-week').count(),12);assert.equal(await page.locator('.learning-week .pill').filter({hasText:'Sắp có'}).count(),9);
 const blocks=await page.evaluate(()=>window.TechPathDebug.planBlocks(60,window.TECHPATH.lessons.find(l=>l.id==='ai-role')));
 assert.equal(blocks.reduce((n,b)=>n+b.m,0),60);assert.ok(blocks.some(b=>b.n==='Kiểm tra và luyện lại'));assert.ok(!blocks.some(b=>b.p.includes('Nhờ AI đánh giá')));
 await page.screenshot({path:fileURLToPath(new URL('roadmap-desktop.png',folder)),fullPage:true});
 for(const w of C.roadmap.weeks){await page.goto(base+'/#roadmap/week-'+w.number);await page.getByRole('heading',{name:w.title,exact:true}).waitFor();assert.equal(await page.locator('.learning-session').count(),w.available?6:0);}
 await page.goto(base+'/#lesson/ai-role');
 for(const viewport of [{width:1366,height:768},{width:1280,height:600},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  for(let i=0;i<4;i++){await page.locator('[data-learning-page="'+i+'"].theory-step').click();assert.ok(await page.evaluate(()=>{const a=document.querySelector('.theory-controls>a').getBoundingClientRect();return a.bottom<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth+1;}));}
 }
 await page.setViewportSize({width:1440,height:1000});await page.getByRole('link',{name:'Bắt đầu làm bài →'}).click();
 await page.getByRole('button',{name:'Đánh dấu đã đọc',exact:true}).click();
 let saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('techpath.learning.v1')));assert.ok(saved.learning.reads['ai-role']);assert.equal(saved.learning.attempts.length,0);
 const questions=C.lessons.find(l=>l.id==='ai-role').questions;
 for(let i=0;i<3;i++)await page.locator(`input[name=q${i}][value="${(questions[i].answer+1)%3}"]`).check();
 await page.getByRole('button',{name:'Kiểm tra câu trả lời'}).click();await page.getByRole('heading',{name:/Cần ôn.*0\/3/}).waitFor();
 for(let i=0;i<3;i++)await page.locator(`input[name=q${i}][value="${questions[i].answer}"]`).check();
 await page.locator('#learning-result .stale-result').waitFor();await page.getByRole('button',{name:'Kiểm tra câu trả lời'}).click();await page.getByRole('heading',{name:/Đạt câu hỏi.*3\/3/}).waitFor();
 const nextLesson=C.roadmap.weeks[0].sessions.slice(0,5).flatMap(s=>s.lessons);const expectedNext=nextLesson[nextLesson.indexOf('ai-role')+1];
 assert.equal(await page.locator('[data-learning-next]').getAttribute('href'),'#lesson/'+expectedNext);
 await page.locator('[data-learning-next]').click();await page.waitForURL('**/#lesson/'+expectedNext);
 await page.goto(base+'/#lesson/ai-role/practice');
 await page.locator(`input[name=q0][value="${(questions[0].answer+1)%3}"]`).check();assert.equal(await page.locator('[data-learning-next]').count(),0);
 await page.locator(`input[name=q0][value="${questions[0].answer}"]`).check();assert.equal(await page.locator('[data-learning-next]').count(),1);
 await page.locator('#learning-reflection').fill('Mô hình là một phần của ứng dụng.');await page.locator('#learning-question').fill('Giải thích lại inference.');
 const prompt=await page.evaluate(()=>window.TechPathLearning.packet('ai-role'));assert.ok(prompt.includes('Giải thích lại inference'));assert.ok(!prompt.includes('token:'));assert.ok(!prompt.includes('9Router'));
 await page.reload();assert.equal(await page.locator('#learning-question').inputValue(),'Giải thích lại inference.');
 // A failed connection preserves draft and creates no fake attempt.
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('techpath.learning.v1')).learning.attempts.length);
 await page.route('**/api/learning/check',r=>r.abort());await page.getByRole('button',{name:'Kiểm tra câu trả lời'}).click();await page.getByRole('status').filter({hasText:'Chưa kết nối'}).waitFor();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('techpath.learning.v1')).learning.attempts.length),before);await page.unroute('**/api/learning/check');
 // Guided code is optional, preserves drafts, and participates in Undo.
 await page.goto(base+'/#lesson/python-variable-name/practice');
 await page.getByText('Khung code để hoàn thiện',{exact:true}).click();
 const scaffoldEditor=page.getByRole('textbox',{name:'Python Editor'});
 await page.locator('[data-python-scaffold]').click();assert.ok((await scaffoldEditor.inputValue()).includes('name = ____'));
 await scaffoldEditor.press('Control+z');assert.equal(await scaffoldEditor.inputValue(),'');
 await scaffoldEditor.fill('name = "Bản nháp"');await page.reload();assert.equal(await scaffoldEditor.inputValue(),'name = "Bản nháp"');
 await page.getByText('Khung code để hoàn thiện',{exact:true}).click();assert.ok(await page.locator('[data-python-scaffold]').isDisabled());
 await page.locator('.python-workspace .challenge-document').evaluate(el=>el.scrollTop=0);
 assert.ok(await page.evaluate(()=>{const a=document.querySelector('.challenge-problem').getBoundingClientRect(),b=document.querySelector('.challenge-coding').getBoundingClientRect();return b.x>a.right&&Math.abs(a.y-b.y)<2;}));
 await page.screenshot({path:fileURLToPath(new URL('practice-datacamp-desktop.png',folder)),fullPage:true});
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:fileURLToPath(new URL('practice-datacamp-mobile.png',folder)),fullPage:true});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto(base+'/#lesson/python-choice-minutes/practice');const editor=page.getByRole('textbox',{name:'Python Editor'}),l=C.lessons.find(l=>l.id==='python-choice-minutes');
 await editor.fill(l.solution);await page.getByRole('button',{name:'Chạy',exact:true}).click();await page.getByRole('heading',{name:'Output (stdout)',exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('techpath.learning.v1')).attempts.length),0);
 await page.getByRole('button',{name:'Nộp bài',exact:true}).click();await page.getByRole('heading',{name:'✓ Accepted · Đạt',exact:true}).waitFor();
 assert.equal(await page.locator('[data-python-case]').count(),5);await page.locator('[data-python-case="3"]').click();await page.getByRole('heading',{name:'Dữ liệu thử',exact:true}).waitFor();
 await page.screenshot({path:fileURLToPath(new URL('variant-result.png',folder)),fullPage:true});
 await editor.press('End');await editor.press('Enter');await editor.press('Control+z');assert.equal(await editor.inputValue(),l.solution);
 await editor.fill('minutes = 25\nprint("Đủ")');await page.getByRole('button',{name:'Nộp bài',exact:true}).click();await page.getByRole('heading',{name:'✕ Chưa đạt',exact:true}).waitFor();
 await page.reload();await page.getByRole('heading',{name:'✕ Chưa đạt',exact:true}).waitFor();
 await page.goto(base+'/#checkpoint/1');const w=C.roadmap.weeks[0];for(let i=0;i<5;i++)await page.locator(`input[name=q${i}][value="${w.checkpoint.questions[i].answer}"]`).check();
 await page.getByRole('button',{name:'Kiểm tra câu trả lời'}).click();await page.getByRole('heading',{name:/Đạt câu hỏi.*5\/5/}).waitFor();await page.getByRole('heading',{name:'Còn phần cần hoàn thành'}).waitFor();
 // Actual submissions are required in addition to the quiz.
 for(const id of w.checkpoint.practical){const l=C.lessons.find(l=>l.id===id);await page.goto(base+'/#lesson/'+id+'/practice');await editor.fill(l.solution);await page.getByRole('button',{name:'Nộp bài',exact:true}).click();await page.getByRole('heading',{name:'✓ Accepted · Đạt',exact:true}).waitFor();}
 await page.goto(base+'/#checkpoint/1');await page.getByRole('heading',{name:'✓ Đã vượt kiểm tra chặng'}).waitFor();
 // Editing a checkpoint answer must invalidate its current completion badge.
 await page.locator('input[name=q0][value="0"]').check();await page.goto(base+'/#roadmap/week-1');
 assert.equal(await page.evaluate(()=>window.TechPathLearning.checkpoint(window.TECHPATH.roadmap.weeks[0])),false);
 await page.goto(base+'/#checkpoint/1');await page.locator('input[name=q0][value="1"]').check();
 assert.equal(await page.evaluate(()=>window.TechPathLearning.checkpoint(window.TECHPATH.roadmap.weeks[0])),true);
 saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('techpath.learning.v1')));
 const validated=await page.evaluate(s=>window.TechPathDebug.validate(s),saved);assert.deepEqual(validated.learning,saved.learning);assert.equal(validated.attempts.at(-1).pythonJudging.cases.length,3);
 const downloadEvent=page.waitForEvent('download');await page.locator('#backup-top').click();const download=await downloadEvent;const backupPath=fileURLToPath(new URL('backup.json',folder));await download.saveAs(backupPath);
 await page.locator('#import-file').setInputFiles(backupPath);await page.locator('#backup-before-import').click();await page.locator('#confirm-import').click();
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('techpath.learning.v1')).learning),saved.learning);
 await page.goto(base+'/#roadmap');await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:fileURLToPath(new URL('roadmap-mobile.png',folder)),fullPage:true});
 await page.goto(base+'/#lesson/ai-json/practice');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 // Every new theory page is keyboard reachable, with the start button visible.
 for(const l of C.lessons.filter(l=>l.kind==='knowledge'||l.roadmapCases)){
  await page.goto(base+'/#lesson/'+l.id);const attr=l.kind==='knowledge'?'learning':'python';
  for(let i=0;i<4;i++){
   await page.locator(`.theory-step[data-${attr}-page="${i}"]`).click();
   assert.ok(await page.evaluate(()=>{const r=document.querySelector('.theory-controls>a').getBoundingClientRect();return r.bottom<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth+1;}),l.id+' page '+i);
  }
 }
 // Backup fixtures exercise later-day independent review without changing real learner state.
 const reviewStates=await page.evaluate(()=>{
  const key='techpath.learning.v1',s=JSON.parse(localStorage.getItem(key));
  const original=s.attempts.find(a=>a.lessonId==='python-check-w1-topic');
  const baseline={...original,id:'baseline',lessonId:'python-variable-topic',at:'2026-10-25T01:00:00.000Z',code:'topic="Python"\nprint(topic)',assessment:'python_pass'};
  s.attempts.push(baseline);s.drafts[baseline.lessonId]={code:baseline.code};
  const variant=s.attempts.find(a=>a.lessonId==='python-check-w1-topic');variant.at='2026-10-26T01:00:00.000Z';variant.hints=0;variant.solution=false;
  return s;
 });
 for(const [hints,label] of [[0,'Đã kiểm tra lại'],[1,'Đã làm đạt']]){
  reviewStates.attempts.find(a=>a.lessonId==='python-check-w1-topic').hints=hints;
  const rc=await browser.newContext();await rc.addInitScript(s=>localStorage.setItem('techpath.learning.v1',JSON.stringify(s)),reviewStates);
  const rp=await rc.newPage();await rp.goto(base+'/#roadmap');
  assert.equal(await rp.evaluate(()=>window.TechPathLearning.status('python-check-w1-topic')),label);await rc.close();
 }
 // Stub SQL execution only to verify roadmap Submit never invokes optional AI review.
 await page.goto(base+'/#lesson/sql-basic-select-customers');
 await page.evaluate(()=>{window.roadmapTutorCalls=0;window.TechPathTutor.review=async()=>{window.roadmapTutorCalls++;};window.TechPathSql.submit=async()=>({ok:true,output:'SQL fixture',results:[],elapsedMs:1,judge:{verdict:'pass',summary:'SQL fixture',basis:'Offline UI fixture only',at:new Date().toISOString(),cases:[]}});});
 await page.getByRole('textbox',{name:'SQL Editor'}).fill('SELECT customer_id, customer_name FROM Customers');
 await page.locator('[data-submit-sql]').click();await page.getByRole('heading',{name:'✓ Accepted',exact:true}).waitFor();
 assert.equal(await page.evaluate(()=>window.roadmapTutorCalls),0);
 assert.deepEqual(errors,[]);assert.deepEqual(inference,[]);
 console.log('PASS: offline roadmap UI, 12 weeks/9 unavailable, viewport/keyboard, quizzes, connection failure, real multi-case Python Run/Submit, stale/Undo, checkpoint threshold, backup import and no inference.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
