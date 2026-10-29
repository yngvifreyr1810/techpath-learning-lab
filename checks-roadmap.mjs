import assert from 'node:assert/strict';
import {curriculum as C} from './curriculum.mjs';
import {gradeKnowledge} from './learning-lab.mjs';
import {runPython,judgeRoadmapPython} from './python-lab.mjs';
const R=C.roadmap,ids=new Set(C.lessons.map(l=>l.id));
assert.equal(R.weeks.length,12);assert.equal(R.weeks.filter(w=>w.available).length,3);
assert.equal(ids.size,C.lessons.length);
for(const w of R.weeks){
 assert.ok(w.outcome&&w.source.startsWith('https://github.com/rohitg00/'));
 if(!w.available){assert.equal(w.sessions.length,0);assert.equal(w.checkpoint,null);continue;}
 assert.equal(w.sessions.length,6);assert.equal(w.checkpoint.questions.length,5);assert.equal(w.checkpoint.practical.length,3);
 for(const session of w.sessions)for(const id of session.lessons)assert.ok(ids.has(id),id);
 for(const q of w.checkpoint.questions){assert.ok(ids.has(q.review));assert.ok(q.answer<q.options.length);}
 const answers=w.checkpoint.questions.map(q=>q.answer);
 assert.equal(gradeKnowledge('week-'+w.number,answers).passed,true);
 const wrong=[...answers];wrong[0]=(wrong[0]+1)%3;assert.equal(gradeKnowledge('week-'+w.number,wrong).passed,true);
 wrong[1]=(wrong[1]+1)%3;assert.equal(gradeKnowledge('week-'+w.number,wrong).passed,false);
}
assert.throws(()=>gradeKnowledge('week-4',[0,0,0,0,0]));
assert.throws(()=>gradeKnowledge('ai-role',[]));assert.throws(()=>gradeKnowledge('ai-role',[99,99,99]));
const mapped=new Set(R.weeks.flatMap(w=>[...w.sessions.flatMap(s=>s.lessons),...w.optionalReview]));
for(const l of C.lessons.filter(l=>['python','api'].includes(l.module)||l.foundation))assert.ok(mapped.has(l.id),'unmapped '+l.id);
for(const l of C.lessons.filter(l=>l.kind==='knowledge')){
 assert.equal(gradeKnowledge(l.id,l.questions.map(q=>q.answer)).passed,true);
 assert.ok(l.reflectionModel&&l.body&&l.resources.length);
}
const lessons=C.lessons.filter(l=>l.roadmapCases);
assert.equal(lessons.length,27);
for(const l of lessons){
 const run=await runPython(l.solution);assert.ok(run.ok,l.id+': '+run.stderr);
 const judge=await judgeRoadmapPython(l.solution,l.id,run);assert.equal(judge.verdict,'pass',l.id+JSON.stringify(judge));
 assert.equal(judge.cases.length,3);assert.ok(l.hints.length===3);
 const literal=l.starter+'\nprint('+JSON.stringify(l.expected)+')';
 assert.equal((await judgeRoadmapPython(literal,l.id,await runPython(literal))).verdict,'retry','hardcode '+l.id);
}
const id='python-choice-minutes';
for(const code of ['print("Đủ")','minutes = 25\nif minutes >= 20:\nprint("Đủ")','minutes = 25\nif minutes > 20:\n    print("Đủ")\nelse:\n    print("Chưa đủ")']){
 assert.equal((await judgeRoadmapPython(code,id,await runPython(code))).verdict,'retry');
}
const alternate='minutes: int = 25\nif (minutes < 20):\n    print("Chưa đủ")\nelse:\n    print("Đủ")';
assert.equal((await judgeRoadmapPython(alternate,id,await runPython(alternate))).verdict,'pass');
const controller=new AbortController();controller.abort();await assert.rejects(judgeRoadmapPython('minutes=25',id,{ok:true},{signal:controller.signal}),/dừng/);
console.log('PASS: 12-week map, 18 sessions, prerequisites/references, 5 theory lessons, 3 checkpoints and all 27 new Python exercises (solutions, hardcode rejection, alternate solution, boundary and cancel). No AI/SQL calls.');
