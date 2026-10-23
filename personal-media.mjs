// Inline images only: never fetch URLs supplied by a chat or imported backup.
export const MAX_IMAGE_BYTES=384*1024;
export function validateImages(value,max=2){
 if(value===undefined)return [];
 if(!Array.isArray(value)||value.length>max)throw new Error('Mỗi lượt gửi tối đa 2 ảnh.');
 return value.map(image=>{
  const match=typeof image?.url==='string'&&/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(image.url);
  if(!match||match[2].length>Math.ceil(MAX_IMAGE_BYTES/3)*4)throw new Error('Chỉ nhận ảnh JPEG, PNG, WebP dưới 384 KB sau nén.');
  const bytes=Buffer.from(match[2],'base64');
  const valid=match[1]==='jpeg'?bytes.subarray(0,3).equals(Buffer.from([255,216,255])):match[1]==='png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
  if(!valid||bytes.length>MAX_IMAGE_BYTES||bytes.toString('base64')!==match[2])throw new Error('Dữ liệu ảnh không hợp lệ.');
  return {url:image.url,name:typeof image.name==='string'?image.name.slice(0,100):'Ảnh đính kèm'};
 });
}
export function personalImages(request){
 const past=(request.history||[]).filter(m=>m.role==='user').flatMap(m=>m.images||[]).slice(-2);
 return [...past.map(image=>({image,previous:true})),...(request.images||[]).map(image=>({image,previous:false}))];
}
export function personalContent(request,text){
 const images=personalImages(request);
 if(!images.length)return text;
 return [{type:'text',text},...images.flatMap(({image,previous})=>[
  {type:'text',text:(previous?'Ảnh từ lịch sử gần đây: ':'Ảnh của tin nhắn hiện tại: ')+image.name},
  {type:'image_url',image_url:{url:image.url}}
 ])];
}
// A separate live catalog keeps the personal UI independent of tutor curation.
export function personalModels(raw){
 return [...new Set((Array.isArray(raw)?raw:[]).map(m=>typeof m==='string'?m:m?.id))]
  .filter(id=>typeof id==='string'&&id.length<=200&&!/\s/.test(id)&&(/^(ag|gemini)\/gemini/i.test(id)||/^gh\/(gpt-(4\.1(?:-mini)?|4o(?:-mini)?|5\.3-codex|5\.4-nano|5\.6-luna|6-luna)|claude-haiku-4\.5)$/.test(id)))
  .map(id=>({id,label:(id.startsWith('gh/')?'Copilot · ':'Gemini · ')+id.slice(id.indexOf('/')+1),vision:/^(ag|gemini)\/gemini/i.test(id)||/^gh\/gpt-(4\.1|4o|5\.3-codex)/.test(id)}));
}
