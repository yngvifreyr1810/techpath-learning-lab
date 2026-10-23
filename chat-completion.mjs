import {parseAssessment,assessmentText} from './assessment.mjs';
export async function readChatCompletion(response,onDelta){
 let answer='',model='',finish='',ended=false;
 function consume(m,stream){
  if(m.error)throw new Error('AI báo lỗi trong lúc phản hồi. Chưa xác nhận bài hoặc tự gửi lại.');
  if(typeof m.model==='string')model=m.model;
  const c=m.choices?.[0];if(!c)return;
  if(c.finish_reason)finish=c.finish_reason;
  if(c.message?.tool_calls?.length||c.delta?.tool_calls?.length)throw new Error('Gia sư chỉ hỗ trợ phản hồi văn bản, không thực thi công cụ.');
  const text=stream?c.delta?.content:c.message?.content;
  if(typeof text==='string'){answer+=text;if(answer.length>120000)throw new Error('Phản hồi quá dài.');onDelta?.(text);}
 }
 if(response.headers.get('content-type')?.includes('application/json')){consume(await response.json(),false);ended=true;}
 else{
  if(!response.body)throw new Error('AI chưa mở luồng phản hồi.');
  const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='';
  const event=line=>{if(!line.startsWith('data:'))return;const data=line.slice(5).trim();if(data==='[DONE]'){ended=true;return;}if(data)consume(JSON.parse(data),true);};
  try{while(true){const part=await reader.read();buffer+=decoder.decode(part.value||new Uint8Array(),{stream:!part.done});let i;while((i=buffer.indexOf('\n'))>=0){event(buffer.slice(0,i).replace(/\r$/,''));buffer=buffer.slice(i+1);}if(part.done)break;}if(buffer.trim())event(buffer);}catch(error){await reader.cancel().catch(()=>{});throw error;}finally{reader.releaseLock();}
 }
 if(finish==='length')throw new Error('AI dừng vì giới hạn độ dài. Chưa chấm đạt; thử với phần bài làm liên quan ngắn hơn.');
 if(finish&&finish!=='stop')throw new Error('AI kết thúc không hoàn chỉnh ('+finish+'). Chưa xác nhận bài.');
 if(!ended&&finish!=='stop')throw new Error('Kết nối ngắt trước khi AI hoàn tất. Không tự gửi lại.');
 if(!answer.trim())throw new Error('AI chưa trả nội dung. Chưa xác nhận bài hoặc tự gửi lại.');
 return {answer,model};
}
export function completeReview(result,request,emit,provider,route){
 const assessment=request.grading?parseAssessment(result.answer.trim().replace(/^```(?:json)?\s*([\s\S]*?)\s*```$/,'$1'),request.grading):null;
 emit({type:'done',text:assessment?assessmentText(assessment):result.answer,assessment,model:result.model||route,route,provider});
}
