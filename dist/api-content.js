'use strict';
(() => {
 const c=window.TECHPATH,esc=v=>String(v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 c.modules.splice(2,0,{id:'api',name:'API Foundations',icon:'API',tag:'REQUEST & RESPONSE',desc:'Gửi yêu cầu và đọc phản hồi bằng dữ liệu mẫu.',goal:'Hiểu GET, đường dẫn, mã trạng thái, query và POST JSON.'});
 const sources=[['freeCodeCamp · APIs for Beginners','https://www.freecodecamp.org/news/apis-for-beginners'],['Postman · Gửi request đầu tiên','https://learning.postman.com/docs/getting-started/quick-start/'],['MDN · HTTP overview','https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview']];
 const book=(id,title,topic)=>({id,title,topic});
 const books=[book(1,'Học Python','python'),book(2,'Học SQL','sql'),book(3,'Làm quen API','api')];
 function group(number,title,knowledge,use,example,explanation,items){items.forEach((item,i)=>{
  const request={method:item.method||'GET',path:item.path,contentType:item.method==='POST'?'application/json':'',body:item.body?JSON.stringify(item.body,null,2):''};
  const expected='HTTP '+item.status+'\n'+JSON.stringify(item.response);
  c.lessons.push({id:'api-'+item.id,module:'api',title:item.title,minutes:8,summary:item.goal,pythonGroupTitle:title,pythonGroup:'api-'+number,groupStep:i+1,apiGroup:number,
   body:`<h2>Mục tiêu</h2><p>${esc(item.goal)}</p><p><strong>Dùng để làm gì?</strong> ${esc(use)}</p><h2>Kiến thức cần biết</h2>${knowledge}<h2>Ví dụ có giải thích</h2><pre class="sample-code">${esc(example)}</pre><p>${esc(explanation)}</p>`,
   task:item.task,expected,expectedStatus:item.status,expectedBody:item.response,apiRequest:request,
   hints:item.hints,solution:JSON.stringify(request,null,2),checks:['Gửi đúng method, đường dẫn và dữ liệu theo yêu cầu.','Đọc HTTP status và response body.'],transfer:'',prior:false,resources:sources
  });
 });}
 group(1,'Gửi GET',
  '<p><strong>API</strong> giúp chương trình trao đổi thông tin: gửi <strong>request</strong> (yêu cầu), nhận <strong>response</strong> (phản hồi).</p><p><strong>GET</strong> lấy thông tin. <strong>Đường dẫn</strong> chỉ thứ muốn lấy, như <code>/hello</code>. Response có mã trạng thái: <code>200</code> nghĩa là thành công.</p><p>Nội dung dạng <strong>JSON</strong> gồm tên và giá trị: <code>{"message": "Chào bạn"}</code>. message là tên thông tin, Chào bạn là giá trị. Bài GET chưa cần viết JSON.</p>',
  'Xin một thông tin từ chương trình khác, giống mở app để xem lời nhắn hoặc thông tin của bạn.',
  'Method: GET\nĐường dẫn: /hello\n\nResponse: HTTP 200\n{"message": "Chào bạn"}',
  'Bạn chọn GET và nhập /hello. API mẫu nhận yêu cầu rồi gửi lại lời chào trong trường message.',[
   {id:'get-hello',title:'API đầu tiên: lấy lời chào',goal:'Gửi một GET request và đọc response.',path:'/hello',status:200,response:{message:'Chào bạn'},task:'Chọn GET, nhập đường dẫn /hello rồi chạy để nhận lời chào',hints:['GET là lấy thông tin.','Đường dẫn cần bắt đầu bằng dấu /.','Nhập /hello, để trống body rồi bấm Chạy.']},
   {id:'get-profile',title:'Luyện GET: xem thông tin mẫu',goal:'Luyện gửi GET tới một đường dẫn khác.',path:'/profile',status:200,response:{name:'Lan',city:'Huế'},task:'Dùng GET với /profile để lấy tên và nơi ở của nhân vật mẫu',hints:['Giữ method GET.','Lần này đường dẫn là /profile.','Response JSON có hai thông tin name và city.']},
   {id:'get-topic',title:'Luyện GET: xem chủ đề học',goal:'Tự gửi lại một GET request.',path:'/topic',status:200,response:{topic:'Python'},task:'Dùng GET với /topic để xem chủ đề học mẫu',hints:['Làm giống hai bài GET trước.','Nhập /topic vào ô đường dẫn.','Đọc topic trong response rồi nộp bài.']}
  ]);
 group(2,'Đường dẫn và trạng thái',
  '<p>Đường dẫn có thể chỉ một món cụ thể: <code>/books/1</code> là sách có mã 1, <code>/books/2</code> là sách có mã 2. Con số này là mã nhận diện — ID.</p><p><code>200 OK</code>: tìm thấy và trả dữ liệu. <code>404 Not Found</code>: không tìm thấy thứ được hỏi. Response lỗi cũng có thể là JSON, với mã riêng như <code>BOOK_NOT_FOUND</code>.</p><p>Mã HTTP nói kết quả gửi request, còn Đạt/Chưa đạt nói bạn làm đúng đề chưa. Nếu đề yêu cầu kiểm tra sách không tồn tại, nhận 404 có thể là kết quả đúng của bài.</p>',
  'Xem đúng một quyển sách và biết khi nào quyển đó không tồn tại.',
  'GET /books/1\n\nHTTP 200\n{"id": 1, "title": "Học Python", "topic": "python"}',
  'Số 1 trong đường dẫn chọn sách có ID 1. Đổi thành 2 sẽ chọn quyển khác.',[
   {id:'path-python',title:'Đường dẫn: xem sách số 1',goal:'Lấy một tài nguyên theo ID.',path:'/books/1',status:200,response:books[0],task:'Gửi GET tới /books/1 để xem sách có ID 1',hints:['Vẫn dùng GET.','Đường dẫn gồm /books/ rồi đến ID.','Dùng /books/1, không cần query hay body.']},
   {id:'path-sql',title:'Luyện đường dẫn: xem sách số 2',goal:'Luyện thay ID để chọn thông tin khác.',path:'/books/2',status:200,response:books[1],task:'Gửi GET tới /books/2 để xem sách có ID 2',hints:['Chỉ thay phần ID của đường dẫn.','ID cần dùng là 2.','Kiểm tra response có id bằng 2.']},
   {id:'status-not-found',title:'Đọc lỗi: sách không tồn tại',goal:'Nhận biết HTTP 404 và mã lỗi của API.',path:'/books/999',status:404,response:{error:'BOOK_NOT_FOUND',message:'Không tìm thấy sách.'},task:'Gửi GET tới /books/999 để kiểm tra một sách không tồn tại. Kết quả bài này cần HTTP 404 và BOOK_NOT_FOUND',hints:['999 là ID không có trong dữ liệu mẫu.','Vẫn gửi GET như bài trước.','Bài này nhận 404 là đúng yêu cầu; đừng đổi sang một ID có thật.']}
  ]);
 group(3,'Lọc bằng query',
  '<p>Muốn lấy danh sách có điều kiện, thêm <strong>query parameter</strong> sau dấu <code>?</code>. Ví dụ <code>/books?topic=python</code> nghĩa là lấy sách có chủ đề python.</p><p><code>topic</code> là tên điều kiện, dấu <code>=</code> nối tên với giá trị. Đường dẫn và query là hai phần khác nhau: /books chọn loại dữ liệu, topic=python lọc dữ liệu đó.</p><p>JSON có <code>[...]</code> là một danh sách. Trong lab này, response trả danh sách sách bên trong trường books.</p>',
  'Lọc một danh sách, giống chỉ xem các sách cùng chủ đề bạn muốn đọc.',
  'GET /books?topic=python\n\nHTTP 200\n{"books": [{"id": 1, "title": "Học Python", "topic": "python"}]}',
  'Dấu ? bắt đầu phần lọc. topic=python giữ lại sách Python, không lấy tất cả sách.',[
   {id:'query-python',title:'Query: tìm sách Python',goal:'Dùng một query parameter để lọc danh sách.',path:'/books?topic=python',status:200,response:{books:[books[0]]},task:'Dùng GET tới /books với query topic=python để lấy sách Python',hints:['Đường dẫn bắt đầu bằng /books.','Dùng ? để mở phần query.','Viết topic=python ngay sau dấu ?.']},
   {id:'query-sql',title:'Luyện query: tìm sách SQL',goal:'Luyện đổi giá trị điều kiện lọc.',path:'/books?topic=sql',status:200,response:{books:[books[1]]},task:'Dùng GET tới /books với query topic=sql để lấy sách SQL',hints:['Giữ /books và tên query topic.','Đổi giá trị sau dấu = thành sql.','Body vẫn để trống vì điều kiện đã nằm trong đường dẫn.']},
   {id:'query-api',title:'Luyện query: tìm sách API',goal:'Tự gửi request lọc một chủ đề khác.',path:'/books?topic=api',status:200,response:{books:[books[2]]},task:'Dùng GET tới /books với query topic=api để lấy sách API',hints:['Ôn lại mẫu /books?topic=...','Giá trị lọc là api, viết thường.','Kiểm tra danh sách response chỉ có sách API.']}
  ]);
 group(4,'Gửi POST và JSON',
  '<p><strong>POST</strong> dùng để gửi dữ liệu cho API xử lý; ở đây là tạo một ghi chú. Đường dẫn <code>/notes</code> cho biết gửi tới phần ghi chú.</p><p><strong>Body</strong> là nội dung gửi kèm. Viết JSON như <code>{"title": "Mua sữa"}</code>: cặp ngoặc nhọn bao thông tin, dấu hai chấm nối tên với giá trị, chuỗi cần dấu nháy kép.</p><p>Header <code>Content-Type: application/json</code> nói body là JSON. Tạo thành công nhận <code>201 Created</code>. Mỗi lần chạy lab dùng dữ liệu mới, nên ID mẫu luôn là 1.</p>',
  'Gửi nội dung bạn vừa viết để chương trình tạo một ghi chú mới.',
  'Method: POST\nĐường dẫn: /notes\nContent-Type: application/json\nBody: {"title": "Mua sữa"}\n\nHTTP 201\n{"id": 1, "title": "Mua sữa"}',
  'POST gửi ghi chú, Content-Type báo kiểu dữ liệu, body giữ nội dung. API mẫu trả ghi chú vừa tạo cùng ID 1.',[
   {id:'post-note',title:'POST: tạo ghi chú mua vở',goal:'Gửi body JSON để tạo ghi chú.',method:'POST',path:'/notes',body:{title:'Mua vở'},status:201,response:{id:1,title:'Mua vở'},task:'Gửi POST /notes, Content-Type application/json, body JSON chỉ có trường title bằng Mua vở',hints:['Chọn POST thay cho GET và nhập /notes.','Điền application/json vào Content-Type.','Body là một object JSON với trường title và giá trị Mua vở.']},
   {id:'post-study',title:'Luyện POST: ghi chú học tập',goal:'Luyện gửi lại JSON với nội dung mới.',method:'POST',path:'/notes',body:{title:'Học Python'},status:201,response:{id:1,title:'Học Python'},task:'Gửi POST /notes, Content-Type application/json, body JSON chỉ có trường title bằng Học Python',hints:['Giữ method, đường dẫn và Content-Type như bài trước.','Chỉ đổi giá trị title trong body.','Dùng dấu nháy kép và đủ cặp ngoặc nhọn.']},
   {id:'post-walk',title:'Luyện POST: ghi chú đi bộ',goal:'Tự tạo một ghi chú và đọc response.',method:'POST',path:'/notes',body:{title:'Đi bộ'},status:201,response:{id:1,title:'Đi bộ'},task:'Gửi POST /notes, Content-Type application/json, body JSON chỉ có trường title bằng Đi bộ',hints:['Ôn lại ba phần: POST /notes, Content-Type và body.','JSON dùng tên trường title.','201 là tạo thành công; đọc lại nội dung response trước khi nộp.']}
  ]);
})();
