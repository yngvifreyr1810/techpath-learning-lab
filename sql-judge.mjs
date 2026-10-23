import {curriculum} from './curriculum.mjs';
const lesson=id=>curriculum.lessons.find(l=>l.id===id);
const report=()=>lesson('sql-report').solution;
export function referenceSql(id){
 if(['sql-proc','sql-params'].includes(id))return report();
 return lesson(id)?.solution;
}
export function procedureProbe(id){return id==='sql-params'
 ? "EXEC dbo.usp_GetDataQualityIssues;\nEXEC dbo.usp_GetDataQualityIssues @Severity='High';\nEXEC dbo.usp_GetDataQualityIssues @Severity='Medium';\nEXEC dbo.usp_GetDataQualityIssues @Severity='Low';\nSELECT OBJECT_DEFINITION(OBJECT_ID(N'dbo.usp_GetDataQualityIssues')) AS definition;"
 : "EXEC dbo.usp_GetDataQualityIssues;\nSELECT OBJECT_DEFINITION(OBJECT_ID(N'dbo.usp_GetDataQualityIssues')) AS definition;";}
const textType=t=>/char|text/i.test(t||'');
function canonical(v,name){
 if(v===null)return ['null'];
 if(name==='observed_value'&&typeof v==='string'&&/^-?\d+(?:\.\d+)?$/.test(v.trim()))return ['number',Number(v)];
 return [typeof v,v];
}
export function compareSet(actual,expected,{ordered=false,report=false,optionalSeverity=false}={}){
 if(!actual||!expected)return {passed:false,message:'Thiếu result set cần trả về.'};
 const names=actual.columns.map(c=>c.name.toLowerCase()),required=expected.columns.map(c=>c.name.toLowerCase());
 if(optionalSeverity&&!names.includes('severity'))required.splice(required.indexOf('severity'),1);
 if(names.length!==required.length||required.some((n,i)=>names[i]!==n))return {passed:false,message:'Cần đúng các cột theo thứ tự: '+required.join(', ')+'.'};
 for(let i=0;i<names.length;i++)if(['observed_value','issue_type','record_type','severity','email','customer_name'].includes(names[i])&&!textType(actual.columns[i].type))return {passed:false,message:'Cột '+names[i]+' phải có kiểu text.'};
 const indexes=required.map(n=>expected.columns.findIndex(c=>c.name.toLowerCase()===n));
 const key=row=>JSON.stringify(row.map((v,i)=>canonical(v,names[i])).filter((_,i)=>!(report&&names[i]==='issue_type')));
 if(report&&actual.rows.some(row=>typeof row[0]!=='string'||!row[0].trim()))return {passed:false,message:'issue_type cần là mô tả lỗi không rỗng.'};
 const got=actual.rows.map(key),want=expected.rows.map(row=>key(indexes.map(i=>row[i])));
 if(!ordered){got.sort();want.sort();}
 const passed=JSON.stringify(got)===JSON.stringify(want);
 return {passed,message:passed?'Khớp cột, kiểu dữ liệu và từng dòng.':ordered?'Dữ liệu hoặc thứ tự dòng chưa khớp.':'Nội dung hoặc số dòng chưa khớp. Kiểm tra dòng thiếu/thừa, NULL và bản ghi bị lặp.'};
}
function hasProcedureDeclaration(code){
 let text='',quote=false,depth=0;
 for(let i=0;i<code.length;i++){
  const c=code[i],next=code[i+1];
  if(depth){if(c==='/'&&next==='*'){depth++;i++;}else if(c==='*'&&next==='/'){depth--;i++;}continue;}
  if(quote){if(c==="'"){if(next==="'")i++;else quote=false;}continue;}
  if(c==='-'&&next==='-'){while(i<code.length&&code[i]!=='\n')i++;text+=' ';continue;}
  if(c==='/'&&next==='*'){depth++;i++;text+=' ';continue;}
  if(c==="'"){quote=true;text+=' ';continue;}
  text+=c;
 }
 return /\b(?:CREATE\s+(?:OR\s+ALTER\s+)?|ALTER\s+)PROC(?:EDURE)?\b/i.test(text);
}
export function judgeSql({id,run,reference,probe,code='',mode='standard'}){
 if(mode!=='standard')return {verdict:'needs_review',summary:'Bài chuyển giao chưa có bộ chấm tự động. Có thể chạy SQL và hỏi gia sư riêng.',cases:[]};
 if(!run.ok||run.truncated)return {verdict:'retry',summary:run.truncated?'Kết quả bị cắt; thu hẹp query rồi nộp lại.':'SQL chưa chạy thành công.',cases:[{name:'Thực thi SQL',passed:false,message:run.error?.message||'Kết quả bị giới hạn.',actual:run.results||[],expected:[]}]};
 if(!reference?.ok||reference.truncated)return {verdict:'needs_review',summary:'Chưa lấy được kết quả tham chiếu. Không đánh dấu đạt.',cases:[]};
 const cases=[],reportMode=['sql-report','sql-proc','sql-params'].includes(id);
 function add(name,actual,expected,options={}){cases.push({name,...compareSet(actual,expected,options),actual:actual?[actual]:[],expected:expected?[expected]:[]});}
 if(['sql-proc','sql-params'].includes(id)){
  if(!probe?.ok||probe.truncated)return {verdict:'retry',summary:'Chưa gọi được procedure độc lập: '+(probe?.error?.message||'thiếu kết quả'),cases:[{name:'Thực thi procedure',passed:false,message:probe?.error?.message||'Không có kết quả.',actual:probe?.results||[],expected:reference.results}]};
  const definition=probe.results.at(-1)?.rows?.[0]?.[0];
  cases.push({name:'Định nghĩa trong code đã nộp',passed:hasProcedureDeclaration(code),message:'Code nộp cần có CREATE/ALTER PROCEDURE, không chỉ sử dụng procedure của lần trước.',actual:[],expected:[]});
  cases.push({name:'Procedure đã lưu trong database',passed:typeof definition==='string'&&definition.trim().length>0,message:'Kiểm tra định nghĩa được SQL Server lưu.',actual:[],expected:[]});
  const levels=id==='sql-params'?[null,'High','Medium','Low']:[null];
  levels.forEach((level,i)=>{const expected=structuredClone(reference.results[0]);if(level)expected.rows=expected.rows.filter(row=>row[4]===level);add(level||'Report đầy đủ',probe.results[i],expected,{report:true});});
  if(id==='sql-proc'){
   const found=run.results.some(set=>compareSet(set,reference.results[0],{report:true}).passed);
   cases.push({name:'Gọi report trong bài nộp',passed:found,message:'Bài nộp cần tự gọi EXEC và hiển thị report.',actual:[],expected:[]});
   const viewed=run.results.some(set=>set.columns.length===1&&set.columns[0].name==='Text'&&set.rows.some(row=>typeof row[0]==='string'&&row[0].trim()));
   cases.push({name:'Xem định nghĩa với sp_helptext',passed:viewed,message:'Bài nộp cần có kết quả sys.sp_helptext.',actual:[],expected:[]});
  }
 }else{
  const expectedSets=reference.results||[];
  if(run.results.length!==expectedSets.length)cases.push({name:'Số result set',passed:false,message:'Cần '+expectedSets.length+' result set; nhận '+run.results.length+'.',actual:[],expected:[]});
  expectedSets.forEach((expected,i)=>add(expectedSets.length>1?'Rule '+(i+1):'Dataset hiện tại',run.results[i],expected,{ordered:id==='sql-cte',report:reportMode,optionalSeverity:id==='sql-report'}));
 }
 const passed=cases.length>0&&cases.every(c=>c.passed),manual=id==='sql-debug'&&passed;
 return {verdict:manual?'needs_review':passed?'pass':'retry',summary:manual?'Phần SQL đúng. Ticket giải thích cần review riêng trước khi hoàn thành bài.':passed?'Đạt '+cases.length+'/'+cases.length+' kiểm tra trên dataset hiện tại.':'Chưa đạt: '+cases.filter(c=>!c.passed).length+'/'+cases.length+' kiểm tra cần sửa.',cases,basis:'Đối chiếu kết quả SQL trên database lab hiện tại; không gọi AI. Không có bộ dữ liệu ẩn.',at:new Date().toISOString()};
}
