import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {curriculum} from './curriculum.mjs';

const token=randomBytes(32).toString('hex');
const folder=fileURLToPath(new URL('./.techpath-local/python-lab/',import.meta.url));
const pythonLesson=id=>curriculum.lessons.find(l=>l.id===id&&l.module==='python');
let busy=false;
export const normalizeOutput=text=>text.replace(/\r\n/g,'\n').replace(/\n$/,'');
export function explainPythonError(stderr){
 if(/SyntaxError|IndentationError|TabError/.test(stderr))return 'Python chưa đọc được cú pháp. Xem dòng được chỉ ra; lỗi cú pháp là cách viết lệnh chưa hợp lệ.';
 if(/NameError/.test(stderr))return 'Python gặp một tên chưa được định nghĩa. Tên hàm hoặc tên biến cần tồn tại trước khi được dùng.';
 if(/EOFError/.test(stderr))return 'Bài này chưa hỗ trợ nhập tương tác bằng input().';
 return stderr?'Chương trình gặp lỗi khi chạy. Đọc dòng cuối thông báo để biết loại lỗi.':'';
}
export async function runPython(code,{signal,timeoutMs=5000,command='py'}={}){
 await mkdir(folder,{recursive:true});
 return new Promise(resolve=>{
  const start=Date.now(),out=[],err=[];let size=0,reason='',done=false;
  const child=spawn(command,['-3','-I','-S','-X','utf8','-c',code],{cwd:folder,windowsHide:true,shell:false,stdio:['pipe','pipe','pipe']});
  const finish=(exitCode,error='')=>{if(done)return;done=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);const stdout=Buffer.concat(out).toString('utf8'),stderr=Buffer.concat(err).toString('utf8');resolve({ok:exitCode===0&&!reason&&!error,stdout,stderr,exitCode,elapsedMs:Date.now()-start,error:error||reason,explanation:explainPythonError(stderr)});};
  const stop=why=>{if(done||reason)return;reason=why;if(process.platform==='win32'&&child.pid){const killer=spawn('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});killer.on('error',()=>child.kill());}else child.kill('SIGKILL');};
  const abort=()=>stop('Đã dừng chạy Python.');
  const timer=setTimeout(()=>stop('Chương trình vượt giới hạn 5 giây.'),timeoutMs);
  const collect=target=>chunk=>{if(done)return;const remaining=65536-size;target.push(chunk.subarray(0,Math.max(0,remaining)));size+=chunk.length;if(size>65536)stop('Output vượt giới hạn 64 KiB.');};
  child.stdout.on('data',collect(out));child.stderr.on('data',collect(err));
  child.on('error',()=>finish(null,'Không mở được Python. Cài Python và kiểm tra lệnh py -3 --version.'));
  child.on('close',exit=>finish(exit));child.stdin.on('error',()=>{});child.stdin.end();
  signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();
 });
}
export async function inspectVariable(code,lessonId,{signal}={}){
 const requirements=pythonLesson(lessonId)?.pythonRequirements;
 if(requirements)return inspectRequirements(code,requirements,{signal});
 const variable=pythonLesson(lessonId)?.requiredVariable;if(!variable)return true;
 // Parse without executing student code. Only top-level assignments followed by
 // a print reading that name count; comments, strings and dead branches don't.
 const source=Buffer.from(code,'utf8').toString('base64');
 const script=`import ast, base64, json\ntree = ast.parse(base64.b64decode('${source}').decode('utf-8'))\nassigned = False\npassed = False\nfor node in tree.body:\n    if isinstance(node, (ast.Assign, ast.AnnAssign)):\n        targets = node.targets if isinstance(node, ast.Assign) else [node.target]\n        if any(isinstance(target, ast.Name) and target.id == '${variable}' for target in targets):\n            assigned = True\n    if assigned and isinstance(node, ast.Expr) and isinstance(node.value, ast.Call):\n        call = node.value\n        if isinstance(call.func, ast.Name) and call.func.id == 'print' and any(isinstance(arg, ast.Name) and arg.id == '${variable}' for arg in call.args):\n            passed = True\nprint(json.dumps(passed))`;
 const analysis=await runPython(script,{signal});return analysis.ok&&analysis.stdout.trim()==='true';
}
async function inspectRequirements(code,requirements,{signal}={}){
 const source=Buffer.from(code,'utf8').toString('base64'),rules=Buffer.from(JSON.stringify(requirements)).toString('base64');
 // Only inspect straight-line beginner code; never execute it during analysis.
 // Dependencies and features must flow into print, not an unused/dead example.
 const script=`import ast, base64, json
tree = ast.parse(base64.b64decode('${source}').decode('utf-8'))
rules = json.loads(base64.b64decode('${rules}'))
env = {}
used, features, types, values = set(), set(), {}, {}
valid = True
def info(node):
    names, tags, kinds, literals = set(), set(), {}, {}
    for part in ast.walk(node):
        if isinstance(part, ast.Name) and isinstance(part.ctx, ast.Load) and part.id in env:
            saved = env[part.id]
            names.update(saved[0]); tags.update(saved[1]); kinds.update(saved[2]); literals.update(saved[3])
        if isinstance(part, ast.JoinedStr): tags.add('fstring')
        if isinstance(part, ast.Call) and isinstance(part.func, ast.Name) and part.func.id == 'int': tags.add('cast-int')
        if isinstance(part, ast.BinOp) and isinstance(part.op, ast.Add): tags.add('add')
    return names, tags, kinds, literals
for node in tree.body:
    if isinstance(node, (ast.Assign, ast.AnnAssign)) and node.value is not None:
        targets = node.targets if isinstance(node, ast.Assign) else [node.target]
        data = info(node.value)
        for target in targets:
            if not isinstance(target, ast.Name) or target.id in ('print', 'int'):
                valid = False
                continue
            kind = type(node.value.value).__name__ if isinstance(node.value, ast.Constant) else None
            if isinstance(node.value, ast.Call) and isinstance(node.value.func, ast.Name) and node.value.func.id == 'int': kind = 'int'
            names, tags, kinds, literals = set(data[0]), set(data[1]), dict(data[2]), dict(data[3])
            names.add(target.id); kinds[target.id] = kind
            literals[target.id] = node.value.value if isinstance(node.value, ast.Constant) else None
            env[target.id] = (names, tags, kinds, literals)
    elif isinstance(node, ast.Expr) and isinstance(node.value, ast.Call) and isinstance(node.value.func, ast.Name) and node.value.func.id == 'print':
        data = info(node.value)
        used.update(data[0]); features.update(data[1]); types.update(data[2]); values.update(data[3])
    else:
        valid = False
passed = valid and set(rules.get('variables', [])).issubset(used) and set(rules.get('features', [])).issubset(features) and all(types.get(name) == kind for name, kind in rules.get('types', {}).items()) and all(values.get(name) == value for name, value in rules.get('values', {}).items())
print(json.dumps(passed))`;
 const analysis=await runPython(script,{signal});return analysis.ok&&analysis.stdout.trim()==='true';
}
export function judgePython(result,lessonId='python-basic-print',structurePassed=false){
 const lesson=pythonLesson(lessonId);if(!lesson)throw new Error('Bài Python không hợp lệ.');
 const outputPassed=result.ok&&normalizeOutput(result.stdout)===lesson.expected;
 const structureOk=!(lesson.requiredVariable||lesson.pythonRequirements)||structurePassed===true;
 const verdict=outputPassed&&structureOk?'pass':'retry';
 const summary=verdict==='pass'?(lesson.pythonRequirements?'Đạt yêu cầu bài học.':lesson.requiredVariable?'Đạt yêu cầu gán và đọc giá trị của biến.':'Đạt yêu cầu hiển thị văn bản.'):!result.ok?'Chương trình chưa chạy thành công.':!outputPassed?'Output chưa khớp yêu cầu. Đối chiếu hai kết quả bên dưới.':lesson.pythonRequirements?'Output đã khớp. Cần làm đúng cách trong đề: '+lesson.practiceRule:`Output đã khớp. Bài này còn cần gán biến ${lesson.requiredVariable}, rồi dùng print() đọc biến đó.`;
 return {verdict,summary,expected:lesson.expected,at:new Date().toISOString()};
}
export async function judgeRoadmapPython(code,lessonId,initial,{signal}={}){
 const lesson=pythonLesson(lessonId);
 if(!lesson?.roadmapCases)throw new Error('Bài kiểm tra biến thể không hợp lệ.');
 const cases=[];const started=Date.now();
 for(const fixture of lesson.roadmapCases){
  if(signal?.aborted)throw new Error('Đã dừng chạy Python.');
  // Parsing replaces only authored input assignments, never client-selected files or tests.
  // Unparse is used only for extra fixtures. The normal run retains original error locations.
  const src=Buffer.from(code).toString('base64'),inputs=Buffer.from(JSON.stringify(fixture.inputs)).toString('base64');
  const script=`import ast, base64, json
tree = ast.parse(base64.b64decode('${src}').decode('utf-8'))
inputs = json.loads(base64.b64decode('${inputs}'))
seen = set()
for node in tree.body:
    if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
        name = node.targets[0].id
        if name in inputs:
            if name in seen:
                raise ValueError('Chỉ gán biến đầu vào một lần ở đầu chương trình: ' + name)
            seen.add(name)
            node.value = ast.parse(repr(inputs[name]), mode='eval').body
    elif isinstance(node, ast.AnnAssign) and isinstance(node.target, ast.Name) and node.target.id in inputs:
        name = node.target.id
        if name in seen:
            raise ValueError('Biến đầu vào bị gán lại: ' + name)
        seen.add(name)
        node.value = ast.parse(repr(inputs[name]), mode='eval').body
if seen != set(inputs):
    raise ValueError('Thiếu phép gán biến đầu vào: ' + ', '.join(sorted(set(inputs) - seen)))
print(ast.unparse(ast.fix_missing_locations(tree)))`;
  const parsed=initial.ok?await runPython(script,{signal}):null;
  const run=parsed?.ok?await runPython(parsed.stdout,{signal}):null;
  const passed=!!run?.ok&&normalizeOutput(run.stdout)===fixture.expected;
  cases.push({name:fixture.name,passed,inputs:JSON.stringify(fixture.inputs),actual:run?.stdout||'',expected:fixture.expected,message:!initial.ok?'Chương trình gốc gặp lỗi.':!parsed?.ok?'Giữ phép gán riêng cho từng biến đầu vào như đề bài.':run?.error||run?.stderr||(passed?'Khớp dữ liệu thử.':'Kết quả chưa đúng khi đổi dữ liệu.')});
  if(!initial.ok)break;
 }
 const passed=initial.ok&&normalizeOutput(initial.stdout)===lesson.expected&&cases.length===lesson.roadmapCases.length&&cases.every(c=>c.passed);
 return {verdict:passed?'pass':'retry',summary:passed?'Đạt với các bộ dữ liệu đã công bố.':'Chưa đạt. Xem từng bộ dữ liệu và thông báo bên dưới.',expected:lesson.expected,at:new Date().toISOString(),contentVersion:lesson.contentVersion,cases,elapsedMs:Date.now()-started};
}
export async function pythonRoute(req,res,pathname){
 if(!pathname.startsWith('/api/python/'))return false;
 const json=(status,data)=>{if(!res.destroyed){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}};
 try{
  if(pathname==='/api/python/status'&&req.method==='GET'){const result=await runPython('import sys; print(sys.version.split()[0])');json(200,{ok:result.ok,version:result.stdout.trim(),token:result.ok?token:undefined,error:result.error});return true;}
  if(!['/api/python/run','/api/python/submit'].includes(pathname)||req.method!=='POST'){json(404,{error:'Không có thao tác Python này.'});return true;}
  if(req.headers['x-techpath-token']!==token){json(403,{error:'Kết nối hết hạn. Bấm Chạy lại để kết nối.'});return true;}
  if(!req.headers['content-type']?.startsWith('application/json')){json(415,{error:'Cần dữ liệu JSON.'});return true;}
  const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>200000){json(413,{error:'Code quá dài.'});return true;}chunks.push(chunk);}
  const data=JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if(!pythonLesson(data.lessonId)||typeof data.code!=='string'||!data.code.trim()||data.code.length>60000)throw new Error('Bài học hoặc code Python không hợp lệ.');
  if(data.mode&&data.mode!=='standard')throw new Error('Chấm Python hiện chỉ hỗ trợ bài chuẩn.');
  if(busy){json(409,{error:'Python đang chạy. Chờ hoặc bấm Dừng.'});return true;}
  busy=true;
  try{const controller=new AbortController(),abort=()=>controller.abort();res.on('close',abort);const result=await runPython(data.code,{signal:controller.signal});let judge;
   if(pathname.endsWith('/submit')){if(pythonLesson(data.lessonId).roadmapCases)judge=await judgeRoadmapPython(data.code,data.lessonId,result,{signal:controller.signal});else{const structurePassed=result.ok?await inspectVariable(data.code,data.lessonId,{signal:controller.signal}):false;judge=judgePython(result,data.lessonId,structurePassed);}}
   res.off('close',abort);json(200,{...result,...(judge?{judge}:{})});}finally{busy=false;}
 }catch(error){json(400,{error:error.message});}
 return true;
}
