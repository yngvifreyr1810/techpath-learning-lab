'use strict';
(() => {
 const C=window.TECHPATH,R=C.roadmap;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const by=id=>C.lessons.find(l=>l.id===id);
 let app,token,checking=false,page=0,activeLesson='',controller;
 const base=location.origin;
 const empty=()=>({version:1,reads:{},drafts:{},attempts:[]});
 const valid=id=>!!by(id)?.questions||R.weeks.some(w=>w.available&&'week-'+w.number===id);
 function clean(raw){
  const out=empty(),text=(s,n=4000)=>typeof s==='string'?s.slice(0,n):'';
  if(!raw||typeof raw!=='object')return out;
  for(const [id,v] of Object.entries(raw.reads||{}))if(valid(id)&&!isNaN(Date.parse(v)))out.reads[id]=v;
  for(const [id,v] of Object.entries(raw.drafts||{}))if(valid(id)&&v&&typeof v==='object')out.drafts[id]={answers:Array.isArray(v.answers)?v.answers.slice(0,5).map(x=>Number.isInteger(x)&&x>=0&&x<10?x:null):[],reflection:text(v.reflection),question:text(v.question),seen:Array.isArray(v.seen)?v.seen.filter(n=>Number.isInteger(n)&&n>=0&&n<4):[]};
  out.attempts=(Array.isArray(raw.attempts)?raw.attempts:[]).slice(-2000).filter(a=>a&&valid(a.lessonId)&&!isNaN(Date.parse(a.at))&&Array.isArray(a.answers)).map(a=>({id:text(a.id,100),lessonId:a.lessonId,at:a.at,version:Number(a.version)||1,answers:a.answers.slice(0,5).map(x=>Number.isInteger(x)?x:null),score:Math.max(0,Math.min(5,Number(a.score)||0)),total:Math.max(0,Math.min(5,Number(a.total)||0)),threshold:Math.max(0,Math.min(5,Number(a.threshold)||0)),passed:a.passed===true,cases:(Array.isArray(a.cases)?a.cases:[]).slice(0,5).map(c=>({prompt:text(c.prompt),passed:c.passed===true,actual:text(c.actual),expected:text(c.expected),explanation:text(c.explanation),review:by(c.review)?c.review:''}))}));
  return out;
 }
 const state=()=>app.state();
 const learning=()=>state().learning||(state().learning=empty());
 const draft=id=>learning().drafts[id]||(learning().drafts[id]={answers:[],reflection:'',question:'',seen:[]});
 const latest=id=>learning().attempts.filter(a=>a.lessonId===id).at(-1);
 const practical=id=>state().attempts.filter(a=>a.lessonId===id&&(a.pythonJudging||a.apiJudging||a.judging)).at(-1);
 const good=a=>!!a&&['python_pass','api_pass','sql_pass'].includes(a.assessment)&&(state().drafts[a.lessonId]?.code??a.code)===a.code;
 const day=at=>new Date(at).toLocaleDateString('en-CA');
 function status(id){
  const l=by(id);if(!l)return 'Chưa có';
  if(l.kind==='knowledge'){const a=latest(id);return a?(a.passed&&a.version===l.contentVersion&&JSON.stringify(a.answers)===JSON.stringify(draft(id).answers)?'Đã làm đạt':'Cần ôn'):learning().reads[id]?'Đã đọc':'Chưa học';}
  const a=practical(id);if(!a)return 'Chưa học';if(!good(a))return 'Cần ôn';
  const repeated=C.lessons.filter(x=>x.reviewOf===id).some(x=>{const r=practical(x.id);return good(r)&&!r.hints&&!r.solution&&day(r.at)>day(a.at);});
  if(repeated)return 'Đã kiểm tra lại';
  if(l.reviewOf){const earlier=practical(l.reviewOf);if(good(earlier)&&!a.hints&&!a.solution&&day(a.at)>day(earlier.at))return 'Đã kiểm tra lại';}
  return 'Đã làm đạt';
 }
 const done=id=>['Đã làm đạt','Đã kiểm tra lại'].includes(status(id));
 function checkpoint(w){const id='week-'+w.number,a=latest(id);return !!a?.passed&&a.version===R.version&&JSON.stringify(a.answers)===JSON.stringify(draft(id).answers)&&w.checkpoint.practical.every(id=>good(practical(id)));}
 function next(){
  for(const w of R.weeks.filter(w=>w.available)){
   if(checkpoint(w))continue;
   for(const s of w.sessions.slice(0,5))for(const id of s.lessons)if(!done(id))return {url:'#lesson/'+id,title:by(id).title};
   return {url:'#checkpoint/'+w.number,title:'Kiểm tra tuần '+w.number};
  }
  return {url:'#roadmap/week-4',title:'Xem trước chặng tiếp theo · Sắp có'};
 }
 function due(){
  const ids=new Set(R.weeks.filter(w=>w.available).flatMap(w=>w.sessions.flatMap(s=>s.lessons)));
  return [...ids].find(id=>{const a=by(id)?.kind==='knowledge'?latest(id):practical(id);return done(id)&&a&&Date.now()-Date.parse(a.at)>=3*86400000;});
 }
 const source=w=>`<a class="text-link" href="${esc(w.source)}" target="_blank" rel="noopener">AI Engineering from Scratch ↗</a>`;
 function banner(){const n=next();return `<aside class="foundation-callout learning-callout"><div><strong>Lộ trình AI Engineer · 12 tuần</strong><p>Tuần 1–3 đã có bài học · 45–60 phút/buổi · đích đến: trợ lý học từ ghi chú.</p></div><a class="button secondary small" href="#roadmap">Xem lộ trình →</a><a class="text-link" href="${n.url}">Tiếp tục: ${esc(n.title)}</a></aside>`;}
 function roadmap(weekId){
  const selected=R.weeks.find(w=>'week-'+w.number===weekId);
  if(selected)return weekPage(selected);
  const n=next(),review=due(),passed=R.weeks.filter(w=>w.available&&checkpoint(w)).length;
  return `<div class="page-head"><div><span class="eyebrow">AI ENGINEER · 12 TUẦN</span><h1>Từ nền tảng đến ứng dụng AI đầu tiên</h1><p>${esc(R.destination)}</p></div></div>
   <section class="card learning-overview"><div><strong>45–60 phút · 6 buổi/tuần</strong><p>54–72 giờ dự kiến. Một ngày nghỉ hoặc học bù; tuần là nhịp gợi ý, không phải hạn chót.</p><p><strong>${passed}/12 chặng vượt kiểm tra</strong> · 3 chặng đã mở, 9 chặng sắp có.</p></div><div><a class="button" href="${n.url}">${esc(n.title)} →</a>${review?`<p><a href="#lesson/${review}">Đến hạn ôn: ${esc(by(review).title)} ↺</a></p>`:''}</div></section>
   <div class="learning-outcomes"><section class="card"><h2>Sau khoảng 8 tuần</h2><p>${esc(R.level8)}</p></section><section class="card"><h2>Sau khoảng 12 tuần</h2><p>${esc(R.level12)}</p></section></div>
   <p class="learning-legend">Đã đọc → Đã làm đạt → Đã kiểm tra lại. “Cần ôn” chỉ ra phần còn vướng. Một lần làm đúng chưa có nghĩa thành thạo.</p>
   <div class="learning-weeks">${R.weeks.map(w=>`<a class="card learning-week" href="#roadmap/week-${w.number}"><div class="card-title"><span class="eyebrow">TUẦN ${w.number}</span><span class="pill">${w.available?(checkpoint(w)?'Vượt kiểm tra':'Có thể học'):'Sắp có'}</span></div><h2>${esc(w.title)}</h2><p>${esc(w.topics)}</p><p><strong>Làm được:</strong> ${esc(w.outcome)}</p><span class="text-link">${w.available?'Xem 6 buổi học':'Xem mục tiêu'} →</span></a>`).join('')}</div>
   <section class="card"><h2>Sau lộ trình này học gì?</h2><ol>${R.next.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><p>Đích xa: xây, đánh giá và vận hành ứng dụng AI đáng tin cậy.</p></section>
   <section class="card"><h2>Nguồn và phạm vi</h2><p>TechPath chọn lọc và chia nhỏ bài cho người mới; không tuyên bố hoàn thành toàn bộ hai tài liệu gốc trong ba tháng.</p><p><a href="${R.sources.setup}" target="_blank" rel="noopener">AI Engineering from Scratch · bắt đầu ở Setup & Tooling ↗</a></p><p><a href="${R.sources.map}" target="_blank" rel="noopener">roadmap.sh · bản đồ đích đến ↗</a></p><a href="#roadmap/library">Các lộ trình Application Support / BI và thư viện cũ →</a></section>`;
 }
 function lessonLink(id){const l=by(id);return `<a class="learning-lesson" href="#lesson/${esc(id)}"><span>${esc(l.title)}</span><span class="pill">${status(id)}</span></a>`;}
 function weekPage(w){
  return `<a class="back" href="#roadmap">← Toàn bộ lộ trình</a><div class="page-head"><div><span class="eyebrow">TUẦN ${w.number} · ${w.available?'CÓ THỂ HỌC':'SẮP CÓ'}</span><h1>${esc(w.title)}</h1><p>${esc(w.topics)}</p></div></div><section class="card"><h2>Đích đến của chặng</h2><p>${esc(w.outcome)}</p><p>4 buổi có hướng dẫn → 1 buổi luyện → 1 buổi kiểm tra. Mỗi buổi 45–60 phút.</p>${source(w)}</section>${!w.available?'<section class="card"><h2>Sắp có</h2><p>Chặng này mới có mục tiêu. Nội dung và bộ kiểm tra chưa được triển khai; chưa thể bắt đầu hoặc ghi nhận hoàn thành.</p></section>':w.sessions.map((s,i)=>`<section class="card learning-session"><div class="card-title"><h2>Buổi ${i+1} · ${esc(s.title)}</h2><span class="meta">45–60 phút</span></div><p>Ôn nhanh → hiểu ví dụ → tự làm → giải thích lại. Bài đã đạt có thể mở lại để ôn.</p>${s.lessons.map(lessonLink).join('')}${s.kind==='checkpoint'?`<a class="button secondary" href="#checkpoint/${w.number}">Mở kiểm tra tuần ${w.number} →</a>`:''}</section>`).join('')}${w.optionalReview?.length?`<section class="card"><h2>Bài cũ có thể ôn thêm</h2><p>Các bài này đã có trong thư viện; không bắt buộc làm hết trong buổi. Chặng Sắp có vẫn chưa có đủ nội dung và kiểm tra.</p>${w.optionalReview.map(lessonLink).join('')}</section>`:''}`;
 }
 function resources(l){return `<p class="save-meta">${esc(l.sourceKind)}</p>${l.resources.map(([name,url])=>`<p><a class="text-link" href="${esc(url)}" target="_blank" rel="noopener">${esc(name)} ↗</a></p>`).join('')}`;}
 function theory(l,practice){
  if(activeLesson!==l.id){activeLesson=l.id;page=0;}
  if(practice)return knowledgePractice(l);
  const d=draft(l.id);if(!d.seen.includes(page)){d.seen.push(page);app.save();}
  const parts=l.body.split(/(?=<h2>)/).filter(Boolean),titles=['Mục tiêu','Kiến thức','Ví dụ','Đề bài'];
  const body=page===3?`<h2>Bạn sẽ làm gì?</h2><p>${esc(l.task)}</p><p>Trả lời ${l.questions.length} câu ngắn và viết lại một ý theo cách hiểu của bạn. Chỉ chọn đáp án mới được kiểm tra tự động; phần tự giải thích được giữ để đối chiếu.</p>`:parts[page];
  return `<section class="python-theory learning-theory"><header class="theory-header"><div><span class="eyebrow">HIỂU AI TỪ ĐẦU · ${status(l.id)}</span><h1>${esc(l.title)}</h1></div><a class="text-link" href="#roadmap">← Lộ trình</a></header><nav class="theory-steps" aria-label="Các trang kiến thức">${titles.map((title,i)=>`<button class="theory-step ${page===i?'active':''}" data-learning-page="${i}" ${page===i?'aria-current="step"':''}><span>${i+1}</span>${title}</button>`).join('')}</nav><article class="card lesson-body theory-slide" id="learning-theory-panel" tabindex="-1"><div class="theory-slide-content">${body}${page===0?`<p class="save-meta">${esc(l.sourceKind)}</p>`:''}</div></article><footer class="theory-controls"><div class="theory-navigation"><button class="button secondary" data-learning-page="${page-1}" ${page===0?'disabled':''} aria-label="Trang trước">←</button><span class="theory-count">${page+1} / 4</span><button class="button secondary" data-learning-page="${page+1}" ${page===3?'disabled':''} aria-label="Trang tiếp">→</button></div><a class="button" href="#lesson/${l.id}/practice">Bắt đầu làm bài →</a></footer></section>`;
 }
 function quiz(id,questions){const d=draft(id);return `<form id="learning-quiz" data-learning-id="${esc(id)}">${questions.map((q,i)=>`<fieldset class="learning-question"><legend>${i+1}. ${esc(q.prompt)}</legend>${q.options.map((option,j)=>`<label><input type="radio" name="q${i}" value="${j}" ${d.answers[i]===j?'checked':''} required><span>${esc(option)}</span></label>`).join('')}</fieldset>`).join('')}<button class="button" type="submit" ${checking?'disabled':''}>${checking?'Đang kiểm tra…':'Kiểm tra câu trả lời'}</button><p class="save-meta">Đáp án soạn sẵn · không gọi AI · tự lưu lựa chọn.</p></form>`;}
 function continuation(id){
  const w=R.weeks.find(w=>w.available&&(w.sessions.some(s=>s.lessons.includes(id))||'week-'+w.number===id));
  if(!w)return {url:'#roadmap',title:'Về lộ trình'};
  const ids=[...new Set(w.sessions.slice(0,5).flatMap(s=>s.lessons))];
  const pending=id.startsWith('week-')?w.checkpoint.practical.find(x=>!done(x)):ids.slice(ids.indexOf(id)+1).find(x=>!done(x));
  if(pending)return {url:'#lesson/'+pending,title:'Bài tiếp theo: '+by(pending).title};
  if(!id.startsWith('week-'))return {url:'#checkpoint/'+w.number,title:'Kiểm tra cuối tuần '+w.number};
  return {url:'#roadmap/week-'+(w.number+1),title:w.number<3?'Tiếp tục tuần '+(w.number+1):'Xem chặng tiếp theo · Sắp có'};
 }
 function resultAction(id,a,stale){
  if(stale)return '';
  const target=a.passed?continuation(id):{url:by(id)?'#lesson/'+id:'#roadmap/week-'+id.slice(5),title:'Xem lại kiến thức'};
  return `<div class="learning-next"><p>${a.passed?'Bạn có thể tiếp tục khi đã xem xong kết quả.':'Xem giải thích ở các câu chưa đúng, rồi sửa lựa chọn và kiểm tra lại.'}</p><a class="button" data-learning-next href="${esc(target.url)}">${esc(target.title)} →</a></div>`;
 }
 function quizResult(id){const a=latest(id);if(!a)return '<p>Chưa có lần kiểm tra.</p>';const stale=a.version!==(by(id)?.contentVersion||R.version)||JSON.stringify(a.answers)!==JSON.stringify(draft(id).answers);return `${stale?'<p class="stale-result">Câu trả lời đã đổi. Kết quả này thuộc lần trước; hãy kiểm tra lại.</p>':''}<section aria-live="polite"><div class="result-heading ${a.passed?'accepted':'failed'}"><div><span class="eyebrow">KẾT QUẢ KIỂM TRA</span><h2>${a.passed?'✓ Đạt câu hỏi':'✕ Cần ôn'} · ${a.score}/${a.total}</h2></div></div>${resultAction(id,a,stale)}${a.cases.map(c=>`<details class="learning-feedback" ${c.passed?'':'open'}><summary>${c.passed?'✓':'✕'} ${esc(c.prompt)}</summary><p>Bạn chọn: ${esc(c.actual)}</p><p>Đáp án: ${esc(c.expected)}</p><p>${esc(c.explanation)}</p>${c.review?`<a href="#lesson/${esc(c.review)}">Ôn phần này →</a>`:''}</details>`).join('')}<p class="save-meta">Lần kiểm tra: ${esc(new Date(a.at).toLocaleString('vi-VN'))}. Đạt câu hỏi chưa chứng minh tự thực hành được.</p></section>`;}
 function chatFields(id){const d=draft(id);return `<label for="learning-reflection">Một điều mình hiểu / chỗ còn vướng</label><textarea id="learning-reflection" data-learning-field="reflection" data-learning-id="${esc(id)}">${esc(d.reflection)}</textarea><label for="learning-question">Câu muốn hỏi bên Chat</label><textarea id="learning-question" data-learning-field="question" data-learning-id="${esc(id)}">${esc(d.question)}</textarea><button class="button secondary" data-learning-copy="${esc(id)}">Sao chép ngữ cảnh sang Chat</button><p class="save-meta">Chỉ gồm bài này và nội dung bạn vừa ghi. Không kèm cấu hình gia sư hoặc hội thoại riêng.</p>`;}
 function knowledgePractice(l){const d=draft(l.id);return `<section class="challenge-workspace learning-workspace"><header class="challenge-header"><div><a href="#lesson/${l.id}">← Lý thuyết & ví dụ</a><span>${esc(l.title)}</span></div><a class="text-link" href="#roadmap">Lộ trình →</a></header><div class="challenge-split"><article class="challenge-problem"><div class="challenge-document"><h1>${esc(l.title)}</h1><h2>Yêu cầu</h2><p>${esc(l.task)}</p><button class="button secondary" data-learning-read="${l.id}" ${d.seen.length<4?'disabled':''}>${learning().reads[l.id]?'Đã đọc ✓':'Đánh dấu đã đọc'}</button><p class="save-meta">Xem cả 4 trang để đánh dấu đã đọc. Trạng thái này không thay cho kết quả kiểm tra.</p>${resources(l)}${chatFields(l.id)}<details><summary>Đối chiếu cách tự giải thích</summary><p>${esc(l.reflectionModel)}</p><p>Đối chiếu với ví dụ ở trang Hiểu bài. Phần viết của bạn không được chấm đúng chỉ vì đã nhập nội dung.</p></details></div></article><section class="challenge-coding learning-questions"><div class="challenge-document">${quiz(l.id,l.questions)}<div id="learning-result">${quizResult(l.id)}</div></div></section></div></section>`;}
 function checkpointPage(number){const w=R.weeks.find(w=>w.number===Number(number));if(!w||!w.available)return '<section class="card"><h1>Chưa có kiểm tra cho chặng này</h1><a href="#roadmap">Về lộ trình</a></section>';const id='week-'+w.number;return `<a class="back" href="#roadmap/week-${w.number}">← Tuần ${w.number}</a><div class="page-head"><div><h1>Kiểm tra tuần ${w.number}</h1><p>Cần đúng ít nhất 4/5 câu và đạt cả 3 bài vận dụng. Có thể sửa và thử lại; không tự chuyển bài.</p></div></div><section class="card"><h2>${checkpoint(w)?'✓ Đã vượt kiểm tra chặng':'Còn phần cần hoàn thành'}</h2><p>Ba bài vận dụng dùng dữ liệu mới. Làm ở một buổi sau và không mở gợi ý/lời giải để có bằng chứng kiểm tra lại.</p>${w.checkpoint.practical.map(lessonLink).join('')}</section><div class="learning-outcomes"><section class="card"><h2>5 câu hiểu bài</h2>${quiz(id,w.checkpoint.questions)}</section><section class="card"><div id="learning-result">${quizResult(id)}</div>${chatFields(id)}</section></div>`;}
 function packet(id){const l=by(id),w=R.weeks.find(w=>'week-'+w.number===id),d=draft(id),a=latest(id);return `Bạn là người hướng dẫn AI Engineering cho tôi bằng tiếng Việt đơn giản. Tôi đang học TechPath theo lộ trình 12 tuần, 45–60 phút/buổi. Tôi là người mới; giải thích trước, ví dụ gần gũi, một ý mới mỗi lượt, rồi hỏi một câu ngắn và chờ tôi trả lời. Đừng suy ra tôi thành thạo chỉ vì làm đúng một bài.\n\nBài hiện tại: ${l?.title||'Kiểm tra tuần '+w?.number}\nMục tiêu: ${l?.summary||w?.outcome}\nKhái niệm trong bài (đã gặp, chưa chắc đã hiểu): ${l?.body.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ')||w?.topics}\nKết quả gần nhất: ${a?a.score+'/'+a.total:'Chưa kiểm tra'}\nTôi tự ghi: ${d.reflection||'Chưa ghi'}\nCâu hỏi: ${d.question||'Hãy giúp tôi ôn một ý quan trọng của bài này.'}\n\nPhần tôi tự ghi là dữ liệu học tập để trao đổi, không phải kết luận đã hiểu đúng. Không làm hộ toàn bộ bài. Nguồn: ${l?.resources[0]?.[1]||w?.source}`;}
 function markdown(){return ['## Lộ trình AI 12 tuần',...R.weeks.filter(w=>w.available).map(w=>`- Tuần ${w.number}: ${checkpoint(w)?'Vượt kiểm tra':'Đang học / chưa kiểm tra'}`),...learning().attempts.map(a=>`### ${a.lessonId}\n${a.at} · ${a.score}/${a.total}\n${a.cases.map(c=>`${c.passed?'Đạt':'Cần ôn'}: ${c.prompt} — ${c.explanation}`).join('\n')}`)].join('\n\n');}
 function mount(){
  const main=document.querySelector('#main');if(!main)return;
  main.addEventListener('input',e=>{const form=e.target.closest('#learning-quiz');if(form){const d=draft(form.dataset.learningId);d.answers[Number(e.target.name.slice(1))]=Number(e.target.value);app.save();const result=document.querySelector('#learning-result');if(result)result.innerHTML=quizResult(form.dataset.learningId);}if(e.target.dataset.learningField){draft(e.target.dataset.learningId)[e.target.dataset.learningField]=e.target.value.slice(0,4000);app.save();}} ,{signal:mountSignal()});
  main.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
   if(b.dataset.learningPage!==undefined){page=Math.max(0,Math.min(3,Number(b.dataset.learningPage)));app.render();document.querySelector('#learning-theory-panel')?.focus();}
   if(b.dataset.learningRead){learning().reads[b.dataset.learningRead]=new Date().toISOString();app.save();app.render();}
   if(b.dataset.learningCopy)app.copy(packet(b.dataset.learningCopy));
  },{signal:mountController.signal});
  main.addEventListener('keydown',e=>{if(!e.target.closest('.learning-theory')||e.ctrlKey||e.altKey||e.metaKey||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();page=Math.max(0,Math.min(3,page+(e.key==='ArrowRight'?1:-1)));app.render();document.querySelector('#learning-theory-panel')?.focus();},{signal:mountController.signal});
  const form=document.querySelector('#learning-quiz');form?.addEventListener('submit',async e=>{
   e.preventDefault();if(checking)return;const id=form.dataset.learningId,answers=[...draft(id).answers],hash=location.hash,storage=learning();checking=true;form.querySelector('button[type=submit]').disabled=true;
   try{controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);let result;
    try{if(!token){const r=await fetch(base+'/api/learning/status',{signal:controller.signal});const data=await r.json();if(!r.ok)throw new Error(data.error||'Chưa kết nối được bộ kiểm tra.');token=data.token;}
     const response=await fetch(base+'/api/learning/check',{method:'POST',headers:{'Content-Type':'application/json','X-TechPath-Token':token},body:JSON.stringify({id,answers}),signal:controller.signal});result=await response.json();if(!response.ok){if(response.status===403)token=null;throw new Error(result.error||'Chưa kiểm tra được.');}
    }finally{clearTimeout(timer);}
    if(learning()!==storage)throw new Error('Tiến độ đã được thay thế. Hãy kiểm tra lại bài hiện tại.');
    storage.attempts.push({...result,id:crypto.randomUUID(),lessonId:id,answers});app.save();
   }catch(error){app.toast(error.name==='AbortError'?'Kết nối quá lâu. Câu trả lời vẫn được giữ.':error instanceof TypeError?'Chưa kết nối bộ kiểm tra local. Câu trả lời vẫn được giữ.':error.message);}
   finally{checking=false;if(location.hash===hash||document.querySelector('#learning-quiz'))app.render();}
  });
 }
 let mountController;
 function mountSignal(){mountController?.abort();mountController=new AbortController();return mountController.signal;}
 window.TechPathLearning={empty,clean,configure:value=>{app=value;},isRoadmapLesson:id=>R.weeks.some(w=>w.optionalReview.includes(id)||w.sessions.some(s=>s.lessons.includes(id))),status,done,checkpoint,next,banner,roadmap,theory,checkpointPage,mount,packet,markdown};
})();
