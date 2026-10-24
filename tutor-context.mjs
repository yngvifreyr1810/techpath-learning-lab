export function sharedContext({prompt,contextPrompt,history,grading}){
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
 const input=scope+'\n'+context+'YÊU CẦU HIỆN TẠI:\n'+task;
 if(input.length>80000)throw new Error('Ngữ cảnh quá dài. Chỉ giữ phần code liên quan.');return input;
}
