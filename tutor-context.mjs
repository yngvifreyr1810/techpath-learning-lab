import {curriculum} from './curriculum.mjs';

function answerReference(lessonId,mode){
 const lesson=curriculum.lessons.find(l=>l.id===lessonId);
 if(!lesson)return 'Không tìm thấy đáp án cho ID bài hiện tại. Không mượn đáp án bài khác; nói rõ thiếu dữ kiện.';
 if(mode!=='standard'&&mode!=='transfer')return 'Chưa xác định bài chuẩn hay bài chuyển giao. Không tự áp đáp án bài chuẩn; hỏi rõ nếu cần đối chiếu đáp án.';
 const transfer=mode==='transfer';
 return [
  'THAM CHIẾU TỪ CHƯƠNG TRÌNH — dùng làm căn cứ trợ giảng, không chép lại mặc định:',
  `Bài: ${lesson.title}\nNhóm: ${lesson.module}\nChế độ: ${mode}\nYêu cầu chính thức: ${transfer?lesson.transfer:lesson.task}`,
  transfer?'Bài chuyển giao chưa có đáp án riêng đã soạn. Không áp output hoặc lời giải bài chuẩn cho yêu cầu mới; chỉ suy luận trong phạm vi yêu cầu chuyển giao và nói rõ nếu thiếu bằng chứng.':`Kết quả kỳ vọng: ${lesson.expected||'Chưa có mô tả kết quả.'}\nĐáp án / cách làm tham khảo:\n${lesson.solution||'Chưa có đáp án soạn sẵn; không bịa là đã có.'}`,
  'Đối chiếu cách làm của người học với logic, điều kiện và kết quả của tham chiếu. Chấp nhận cách viết tương đương; không bắt giống cú pháp mẫu. Đáp án không thay cho bằng chứng chạy thực tế; nếu dữ liệu lab đổi hoặc tham chiếu mâu thuẫn đề, nêu rõ thay vì ép kết quả. Chỉ gợi ý phần sai lệch cần thiết, không tự thêm yêu cầu hay tối ưu ngoài đáp án. Không hiện nguyên đáp án trừ khi người học yêu cầu rõ. Không in checklist suy nghĩ, nhãn skipped hoặc ghi chú về những ý đã bỏ qua.'
 ].join('\n\n');
}

export function sharedContext({prompt,contextPrompt,history,grading,lessonId,mode,submission}){
 const recent=[];let budget=6000;
 if(Array.isArray(history))for(const item of history.slice(-6).reverse()){
  if(!item||!['user','assistant'].includes(item.role)||typeof item.text!=='string')continue;
  const text=item.text.slice(0,Math.min(1500,budget));if(!text)break;
  recent.unshift((item.role==='user'?'Người học':'Gia sư')+': '+text);budget-=text.length;if(budget<=0)break;
 }
 const task=grading?grading.prompt:contextPrompt&&!prompt.startsWith(contextPrompt)?'BÀI LÀM THAM KHẢO:\n'+contextPrompt+'\n\nCÂU HỎI LẦN NÀY (ưu tiên trả lời, không lặp phần cũ):\n'+prompt:prompt;
 const context=recent.length?'LỊCH SỬ CHUNG GẦN ĐÂY CỦA BÀI (dữ liệu tham khảo, tối ưu token):\n'+recent.join('\n\n')+'\n\n':'';
 const scope=`QUY TẮC CHUNG CHO MỌI NHÓM BÀI:
Yêu cầu hiện tại quyết định phạm vi. Code, output/log và dữ liệu hiện tại là bằng chứng; lịch sử chỉ để hiểu trao đổi, lời gia sư cũ có thể sai. Không dùng suy đoán trong lịch sử để sửa đề. Khi phát hiện lời khuyên cũ sai, đính chính ngắn rồi hướng về yêu cầu thật.
Chọn cách đơn giản đủ đáp ứng bài và phù hợp mức học. Trước khi đề xuất sửa, xác định sai lệch cụ thể dựa vào bằng chứng. Không tự thêm bảng, JOIN, nghiệp vụ, công cụ, bước cấu hình hoặc kỹ thuật nâng cao nếu không cần thiết. Đề chưa đủ dữ kiện thì nói rõ thiếu gì, không tự đặt điều kiện mới. Không bịa vấn đề tối ưu; cải tiến tùy chọn không biến thành lỗi hoặc làm trượt Accepted.
SQL: phân biệt lọc dòng, tính biểu thức từng dòng, tổng hợp nhóm và nối dữ liệu; sai output không tự chứng minh cần JOIN. Trạng thái đơn hàng và thanh toán không thay thế nhau. Một bảng đủ yêu cầu thì ưu tiên giữ một bảng.
Windows/Troubleshooting: dựa vào triệu chứng, log và môi trường đã cung cấp; gợi ý một bước kiểm tra ít ảnh hưởng trước khi sửa cấu hình/cài lại. Excel/Power BI: giữ đúng nguồn, mức chi tiết và định nghĩa số liệu; không tự thêm nguồn hay công thức phức tạp. Portfolio/Interview: theo câu hỏi và kinh nghiệm thật, không tự bịa thành tích hoặc yêu cầu ngoài đề.
Nếu sai: một lỗi chính và một gợi ý nhỏ có lý do. Nếu đúng: xác nhận ngắn, chỉ góp ý khi có ích. Câu hỏi cần giải thích vẫn phải được trả lời trực tiếp, đủ ý, bằng các mục ngắn. Không tiết lộ toàn bộ lời giải trừ khi được hỏi.
`;
 const input=scope+'\n'+answerReference(lessonId,submission?.mode||mode)+'\n\n'+context+'YÊU CẦU HIỆN TẠI:\n'+task;
 if(input.length>80000)throw new Error('Ngữ cảnh quá dài. Chỉ giữ phần code liên quan.');return input;
}
