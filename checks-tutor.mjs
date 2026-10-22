import assert from 'node:assert/strict';
import {assessmentSpec,parseAssessment,assessmentText} from './assessment.mjs';
import {sharedContext} from './tutor-context.mjs';

// A concise review must still evaluate the real task and complete submission.
const submission={mode:'standard',code:'SELECT 1;',output:'1',notes:'',question:'',execution:{module:'sql',ok:true,verified:true}};
const spec=assessmentSpec('sql-proc',submission);
assert.ok(spec.prompt.includes('severity High/High/Medium'));
assert.ok(spec.prompt.includes('sys.sp_helptext'));
assert.ok(!spec.criteria.some(c=>c.includes('Giải thích')||c.includes('Đóng query')));
const answer={verdict:'pass',summary:'Đủ yêu cầu.',hint:'',optimization:'',criteria:spec.criteria.map((_,id)=>({id,status:'met',reason:'Đáp ứng.'}))};
assert.equal(parseAssessment(JSON.stringify(answer),spec).verdict,'pass');
assert.throws(()=>parseAssessment(JSON.stringify({...answer,criteria:answer.criteria.slice(1)}),spec));
const failed=structuredClone(answer);failed.criteria[0].status='not_met';failed.criteria[0].reason='Thiếu severity.';
assert.equal(parseAssessment(JSON.stringify(failed),spec).verdict,'retry');
const unknown=structuredClone(answer);unknown.criteria[0].status='unknown';
assert.equal(parseAssessment(JSON.stringify(unknown),spec).verdict,'needs_evidence');
assert.equal(parseAssessment(JSON.stringify(answer),{...spec,submission:{...submission,execution:{...submission.execution,stale:true}}}).verdict,'needs_evidence');
assert.equal(parseAssessment(JSON.stringify(answer),{...spec,submission:{...submission,execution:{...submission.execution,ok:false}}}).verdict,'retry');
const result=parseAssessment(JSON.stringify({...failed,summary:'Bài còn thiếu cột severity.',hint:'Thêm cột severity vào cả ba nhánh UNION ALL.'}),spec);
const text=assessmentText(result);
assert.ok(text.includes(result.summary)&&text.includes(result.hint));
assert.ok(!text.includes(result.criteria[0].text)); // Full rubric remains in result.criteria / expandable card.
assert.equal(result.criteria.length,spec.criteria.length);

// Context trimming must never truncate the current code or repeat it.
const code='SELECT '+Array.from({length:2000},(_,i)=>i).join(',')+';';
const packet='Bài làm:\n'+code;
const question='Vì sao báo lỗi?';
const chat=sharedContext({prompt:question,contextPrompt:packet,history:[{role:'user',text:'Câu hỏi trước'},{role:'assistant',text:'Kiểm tra số cột.'}]});
assert.ok(chat.includes(code));
assert.equal(chat.split(code).length-1,1);
assert.equal(chat.split(question).length-1,1);
assert.equal(sharedContext({prompt:packet,contextPrompt:packet}).split(code).length-1,1);
const graded=sharedContext({prompt:packet,contextPrompt:packet,history:[],grading:spec});
assert.ok(graded.includes(spec.prompt));
assert.ok(!graded.includes(packet)); // Grade sends trusted submission once, not the browser packet again.
const hugeHistory=Array.from({length:20},(_,i)=>({role:i%2?'assistant':'user',text:'h'.repeat(10000)}));
assert.ok(sharedContext({prompt:'Hiện tại',history:hugeHistory}).length<6500);
console.log('PASS: concise review, task-based grading, conservative verdicts, current-code preservation, bounded history; no AI requests.');
