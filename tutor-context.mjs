export function sharedContext({prompt,contextPrompt,history,grading}){
 const recent=[];let budget=6000;
 if(Array.isArray(history))for(const item of history.slice(-6).reverse()){
  if(!item||!['user','assistant'].includes(item.role)||typeof item.text!=='string')continue;
  const text=item.text.slice(0,Math.min(1500,budget));if(!text)break;
  recent.unshift((item.role==='user'?'Người học':'Gia sư')+': '+text);budget-=text.length;if(budget<=0)break;
 }
 const task=grading?grading.prompt:contextPrompt&&!prompt.startsWith(contextPrompt)?'BÀI LÀM THAM KHẢO:\n'+contextPrompt+'\n\nCÂU HỎI LẦN NÀY (ưu tiên trả lời, không lặp phần cũ):\n'+prompt:prompt;
 const context=recent.length?'LỊCH SỬ CHUNG GẦN ĐÂY CỦA BÀI (dữ liệu tham khảo, tối ưu token):\n'+recent.join('\n\n')+'\n\n':'';
 const input=context+'YÊU CẦU HIỆN TẠI:\n'+task;
 if(input.length>80000)throw new Error('Ngữ cảnh quá dài. Chỉ giữ phần code liên quan.');return input;
}
