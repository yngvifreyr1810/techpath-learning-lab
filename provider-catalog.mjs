const workflows={
 'techpath-light':{label:'Học thường ngày · Free → Local',description:'Workflow tiết kiệm đã cấu hình trong 9Router. Dùng cho giải thích, gợi ý và luyện tập thường ngày.'},
 'techpath-codex-first':{label:'Bài khó · Codex ưu tiên',description:'Workflow Codex-first trong 9Router; có dùng hạn mức cloud của tài khoản kết nối.'},
 'techpath-antigravity-first':{label:'Bài khó · Antigravity ưu tiên',description:'Workflow Antigravity-first trong 9Router; có dùng hạn mức cloud của tài khoản kết nối.'}
};
export function describeModel(id){
 if(workflows[id])return {id,...workflows[id],group:'Workflow học tập'};
 const group=!id.includes('/')?'Workflow tùy chỉnh':id.startsWith('local/')?'Local qua 9Router':id.startsWith('oc/')&&/free/i.test(id)?'Free có giới hạn':id.startsWith('ag/')?'Antigravity':id.startsWith('cx/')?'Codex qua 9Router':'Model khác trong 9Router';
 return {id,label:id,group,description:group==='Workflow tùy chỉnh'?'Chạy theo chuỗi và quy tắc đã cấu hình trong 9Router.':'Dùng cấu hình/hạn mức của provider trong 9Router. Có trong danh mục chưa chứng minh tài khoản gọi được model.'};
}
export function catalogModels(raw){
 const ids=[...new Set((Array.isArray(raw)?raw:[]).map(m=>typeof m==='string'?m:m?.id).filter(id=>typeof id==='string'&&id.length<=200&&!/\s|embedding|rerank|copilot-search|daybreak|reserve|auto-review|typesafe\/jev/i.test(id)))];
 const rank=id=>Object.keys(workflows).includes(id)?Object.keys(workflows).indexOf(id):id.startsWith('local/')?3:id.startsWith('oc/')&&/free/i.test(id)?4:id.startsWith('ag/')?5:id.startsWith('cx/')?6:7;
 return ids.sort((a,b)=>rank(a)-rank(b)||a.localeCompare(b)).map(describeModel);
}
export function defaultRouterModel(models){return models.find(m=>m.id==='techpath-light')?.id||models.find(m=>m.id==='local/local-ai')?.id||models.find(m=>m.group==='Free có giới hạn')?.id||'';}
