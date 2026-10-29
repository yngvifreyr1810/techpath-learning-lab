import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {runPython,judgePython,normalizeOutput,inspectVariable} from './python-lab.mjs';
import {curriculum} from './curriculum.mjs';

const correct=await runPython('print("Tôi đang học Python")');
assert.equal(correct.ok,true,JSON.stringify(correct));assert.equal(judgePython(correct).verdict,'pass');
assert.equal(judgePython(await runPython("print('Tôi đang học Python')")).verdict,'pass');
for(const stdout of [' Tôi đang học Python\n','Tôi đang học Python \n','Tôi đang học Python\n\n','tôi đang học Python\n'])assert.equal(judgePython({...correct,stdout}).verdict,'retry');
assert.equal(normalizeOutput('a\r\n'),'a');
const syntax=await runPython('print("hello"');assert.equal(syntax.ok,false);assert.match(syntax.stderr,/SyntaxError/);assert.ok(syntax.explanation);
const input=await runPython('input()');assert.match(input.explanation,/input/);
const loop=await runPython('while True: pass');assert.match(loop.error,/5 giây/);assert.equal(loop.ok,false);
const large=await runPython('print("a"*100000)');assert.match(large.error,/64 KiB/);assert.ok(Buffer.byteLength(large.stdout)+Buffer.byteLength(large.stderr)<=65536);
const absent=await runPython('pass',{command:'techpath-nonexistent-python'});assert.match(absent.error,/Không mở/);
const controller=new AbortController();const running=runPython('while True: pass',{signal:controller.signal});setTimeout(()=>controller.abort(),200);assert.match((await running).error,/Đã dừng/);
assert.equal(judgePython({...correct,ok:false}).verdict,'retry');
const barePrint=await runPython('print');assert.equal(barePrint.ok,true);assert.equal(barePrint.stdout,'');assert.equal(judgePython(barePrint,'python-print-lines').verdict,'retry');

const ctx={};ctx.window=ctx;vm.createContext(ctx);
for(const name of ['content.js','challenges.js','foundations.js','python-content.js','api-content.js','completion.js','python.js'])vm.runInContext(await readFile(new URL('./dist/'+name,import.meta.url),'utf8'),Object.assign(ctx,{location:{hostname:'localhost',origin:'http://localhost'}}));
const suggestions=(code,lang,id)=>Array.from(ctx.TechPathCompletion.suggest(code,code.length,lang,id),x=>x.label);
assert.deepEqual(suggestions('pri','python'),['print']);
assert.deepEqual(suggestions('message = "hello"\nprint(mes','python'),['message']);
assert.deepEqual(suggestions('print("pri','python'),[]);assert.deepEqual(suggestions('# pri','python'),[]);
assert.ok(suggestions('SEL','sql','sql-basic-select-customers').includes('SELECT'));
assert.deepEqual(suggestions('SELECT c. FROM dbo.Customers AS c'.slice(0,9),'sql','sql-basic-select-customers'),[]); // no alias in current text
const sql='SELECT c.cus\nFROM dbo.Customers AS c';
const names=Array.from(ctx.TechPathCompletion.suggest(sql,12,'sql','sql-basic-select-customers'),x=>x.label);assert.ok(names.includes('customer_id'));assert.ok(!names.includes('order_id'));
assert.deepEqual(suggestions("SELECT 'SEL",'sql','sql-basic-select-customers'),[]);
assert.ok(curriculum.lessons.length>=74);assert.equal(new Set(curriculum.lessons.map(l=>l.id)).size,curriculum.lessons.length);
const pythonLessons=curriculum.lessons.filter(l=>l.module==='python'&&!l.roadmapWeek);assert.equal(pythonLessons.length,27);
for(const l of pythonLessons){
 assert.equal(l.hints.length,3);assert.ok(l.body.includes('Dùng để làm gì?'));assert.ok(l.body.includes('Ví dụ có giải thích'));assert.ok(l.resources[0][1].includes('ix9cRaBkVe0'));
 const run=await runPython(l.solution),structure=await inspectVariable(l.solution,l.id);assert.equal(judgePython(run,l.id,structure).verdict,'pass',l.id);
 if(l.pythonRequirements){
  const literal='print('+JSON.stringify(l.expected)+')';assert.equal(await inspectVariable(literal,l.id),false,l.id+' literal');assert.equal(judgePython(await runPython(literal),l.id,false).verdict,'retry');
  assert.equal(await inspectVariable('if False:\n    '+l.solution.split('\n').join('\n    ')+'\n'+literal,l.id),false,l.id+' dead code');
 }
 if(l.requiredVariable){
  for(const code of [JSON.stringify(l.requiredVariable+' = "anything"')+'\nprint('+JSON.stringify(l.expected)+')','# '+l.solution.split('\n')[0]+'\nprint('+JSON.stringify(l.expected)+')',l.solution.split('\n')[0]+'\nprint('+JSON.stringify(l.expected)+')','if False:\n    '+l.solution.split('\n').join('\n    ')+'\nprint('+JSON.stringify(l.expected)+')'])assert.equal(await inspectVariable(code,l.id),false,code);
  const literal=await runPython('print('+JSON.stringify(l.expected)+')');assert.equal(judgePython(literal,l.id,false).verdict,'retry');
 }
}
assert.equal(await inspectVariable('name: str = "Lan"\nprint((name))','python-variable-name'),true);
for(const [id,code] of [
 ['python-integer-notebooks','notebooks = "3"\nprint(notebooks)'],
 ['python-float-water','water = 2\nprint(water)'],
 ['python-fstring-greeting','name = "Lan"\nunused = f"{name}"\nprint(name)'],
 ['python-cast-notebooks','text = "3"\nunused = int(text)\nnotebooks = 3\nprint(text)\nprint(notebooks)'],
 ['python-add-notebooks','notebooks = 4\nextra = 1\ntotal = notebooks + extra\nprint(total)'],
 ['python-review-fruit','apples = 3\noranges = 2\ntotal = 5\nunused = apples + oranges\nprint(f"Có {total} quả")']
])assert.equal(await inspectVariable(code,id),false,id+' rejects wrong type/value or unused feature');
assert.equal(await inspectVariable('notebooks=3\nextra=2\ntotal=(notebooks + extra)\nprint((total))','python-add-notebooks'),true);
assert.throws(()=>judgePython(correct,'sql-proc'));
assert.equal(judgePython({...correct,stdout:'API\nPython\nSQL\n'},'python-print-lines').verdict,'retry');
const lesson=curriculum.lessons.find(l=>l.id==='python-basic-print');assert.ok(lesson);assert.equal(lesson.hints.length,3);
const draft={code:'',output:'',hints:0,solution:false};
const html=ctx.TechPathPython.render(lesson,draft,null,[]);assert.ok(html.includes('Mục tiêu'));assert.ok(!html.includes('Python Editor'));assert.ok(!html.includes('data-hint'));assert.ok(html.includes('Bắt đầu làm bài'));assert.ok(!html.includes('Output mong đợi'));
ctx.TechPathPython.page(1);assert.ok(ctx.TechPathPython.render(lesson,draft,null,[]).includes('Kiến thức cần biết'));
ctx.TechPathPython.page(3);assert.ok(ctx.TechPathPython.render(lesson,draft,null,[]).includes('Output mong đợi'));
const practice=ctx.TechPathPython.render(lesson,draft,null,[],true);assert.ok(practice.includes('challenge-split'));assert.ok(practice.includes('Python Editor'));assert.ok(!practice.includes('data-review'));assert.ok(practice.includes('Lý thuyết & ví dụ'));
console.log('PASS: original 27 Python exercises and solutions, per-lesson output, real Python limits, AST variable requirements reject literal/comment/dead-code shortcuts, practical examples, completion and theory rendering.');
