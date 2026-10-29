'use strict';
(() => {
 const C=window.TECHPATH;
 const root='https://github.com/rohitg00/ai-engineering-from-scratch/tree/main/phases/';
 const sources={setup:root+'00-setup-and-tooling/01-dev-environment',python:root+'00-setup-and-tooling/13-python-for-ai-engineering',api:root+'00-setup-and-tooling/04-apis-and-keys',math:root+'01-math-foundations',ml:root+'02-ml-fundamentals',llm:root+'11-llm-engineering',map:'https://roadmap.sh/ai-engineer'};
 const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 C.modules.push({id:'ai-foundations',name:'Hiểu AI từ đầu',icon:'AI',tag:'LỘ TRÌNH 12 TUẦN',desc:'Giải thích ngắn, ví dụ gần gũi và câu hỏi kiểm tra trước khi thực hành.',goal:'Hiểu mình đang làm gì và vì sao.'});
 const q=(prompt,options,answer,explanation,review)=>({prompt,options,answer,explanation,review});
 function theory(id,title,goal,knowledge,example,task,questions,source='setup'){
  C.lessons.push({id,module:'ai-foundations',kind:'knowledge',contentVersion:1,title,summary:goal,minutes:12,task,expected:'Đọc giải thích, chọn câu trả lời và tự giải thích lại.',body:`<h2>Mục tiêu</h2><p>${goal}</p><h2>Kiến thức cần biết</h2>${knowledge}<h2>Ví dụ có giải thích</h2>${example}`,questions,hints:[],solution:'',checks:[],resources:[['AI Engineering from Scratch',sources[source]],['Bản đồ AI Engineer',sources.map]],sourceKind:'Chuyển soạn và ví dụ TechPath',reflectionModel:task,prior:false});
 }
 theory('ai-role','AI Engineer làm gì?','Phân biệt chương trình thường, mô hình AI và ứng dụng dùng AI.',
  '<ul><li><strong>AI</strong> là tên gọi rộng cho những hệ thống làm các việc như nhận biết hình ảnh hay xử lý ngôn ngữ.</li><li><strong>Machine learning (ML)</strong> là cách tạo mô hình bằng cách học từ dữ liệu.</li><li><strong>LLM</strong> là mô hình chuyên xử lý và tạo ngôn ngữ.</li></ul><p>AI Engineer ghép mô hình với code, dữ liệu và giao diện để giải quyết một việc cụ thể. Mô hình là một phần của ứng dụng.</p>',
  '<p>Bạn hỏi “Biến trong Python là gì?”. Một trợ lý học tập nhận câu hỏi, tìm ghi chú, gửi phần phù hợp cho mô hình rồi hiện câu trả lời.</p><p>Mô hình viết lời giải thích. Code của ứng dụng lo việc tìm ghi chú, gửi yêu cầu và báo lỗi.</p>',
  'Giải thích mô hình làm gì và code ứng dụng làm gì trong trợ lý học tập.',[
   q('Phần nào thường do code ứng dụng phụ trách?',['Tự học mọi kiến thức khi mở app','Tìm ghi chú và hiển thị lỗi kết nối','Đảm bảo mô hình luôn đúng'],1,'Code điều phối dữ liệu và xử lý lỗi. Mô hình không thay thế toàn bộ ứng dụng.','ai-role'),
   q('LLM thường dùng để làm gì?',['Xử lý và tạo ngôn ngữ','Cất file thay cho ổ cứng','Đảm bảo đáp án đúng tuyệt đối'],0,'LLM hữu ích với văn bản, nhưng vẫn có thể trả lời sai.','ai-role'),
   q('Một lần AI trả lời đúng chứng minh điều gì?',['Mọi câu sau đều đúng','Không cần kiểm tra nữa','Đúng với ví dụ vừa kiểm tra'],2,'Cần nhiều tình huống khác nhau trước khi kết luận về chất lượng.','ai-role')]);
 theory('ai-model-data','Dữ liệu, học và sử dụng mô hình','Hiểu training và inference bằng một ví dụ quen thuộc.',
  '<ul><li><strong>Dữ liệu</strong> là thông tin như câu chữ, hình hoặc số.</li><li><strong>Training</strong> là quá trình dùng dữ liệu để điều chỉnh mô hình.</li><li><strong>Inference</strong> là dùng mô hình đã có để tạo kết quả cho dữ liệu mới.</li></ul><p>Khi hỏi một chatbot, bạn thường đang sử dụng mô hình. Việc bạn gửi một ghi chú không có nghĩa mô hình lập tức được huấn luyện lại.</p>',
  '<p>Hình dung bạn luyện nhận biết mèo bằng nhiều ảnh: đó là ví dụ để hiểu việc học. Sau đó nhìn một ảnh mới và đoán: đó là ví dụ để hiểu việc sử dụng điều đã học.</p><p>Trong trợ lý học tập, đưa ghi chú vào câu hỏi giúp mô hình có thông tin để trả lời lần đó.</p>',
  'Nêu một ví dụ training và một ví dụ inference; giải thích vì sao gửi ghi chú chưa phải huấn luyện lại.',[
   q('Gửi câu hỏi cho mô hình đã có thường là…',['Training','Inference','Tạo database'],1,'Bạn dùng mô hình đã có để tạo câu trả lời.','ai-model-data'),
   q('Đưa ghi chú vào yêu cầu có tác dụng gì?',['Cung cấp thông tin cho lần trả lời','Luôn sửa kiến thức lâu dài của mô hình','Làm câu trả lời chắc chắn đúng'],0,'Ngữ cảnh hỗ trợ câu trả lời; không tự đảm bảo đúng và không đồng nghĩa training.','ai-model-data'),
   q('Nếu mô hình trả lời rất tự tin thì…',['Không cần đối chiếu','Luôn có nguồn thật','Vẫn cần kiểm tra'],2,'Giọng văn tự tin không phải bằng chứng đúng.','ai-model-data')]);
 theory('ai-environment','Python nào đang chạy code của bạn?','Hiểu file code, interpreter và môi trường ảo trên Windows.',
  '<ul><li>File <code>.py</code> chứa code.</li><li><strong>Interpreter</strong> là chương trình Python đọc và chạy file đó.</li><li>PyCharm là nơi soạn code và chọn interpreter.</li></ul><ul><li><strong>Môi trường ảo — venv</strong> giữ bộ thư viện riêng cho một dự án.</li><li>Hai dự án có thể dùng hai interpreter khác nhau.</li><li>Đừng cài lại Python chỉ vì hai nơi chạy khác nhau.</li></ul>',
  '<p>Trong PyCharm, mở Settings → Project → Python Interpreter để xem đường dẫn. Trong PowerShell, <code>py -3 --version</code> xem phiên bản Python được launcher chọn.</p><p>TechPath chạy Python qua launcher trên máy. Số phiên bản giống nhau chưa chứng minh hai công cụ dùng cùng một môi trường.</p>',
  'Phân biệt nơi viết code với chương trình chạy code. Ghi đường dẫn interpreter của bạn nếu đã kiểm tra được.',[
   q('Interpreter có vai trò nào?',['Lưu tất cả ghi chú','Đọc và chạy code Python','Là một tên khác của file .py'],1,'File là nội dung; interpreter là chương trình chạy nội dung đó.','ai-environment'),
   q('Môi trường ảo giúp gì?',['Giữ thư viện riêng cho dự án','Tự sửa mọi lỗi code','Bắt buộc cần GPU'],0,'Các dự án có thể cần phiên bản thư viện khác nhau.','ai-environment'),
   q('PyCharm và PowerShell chạy khác nhau: nên kiểm tra gì trước?',['Xóa cả dự án','Cài lại mọi thứ','Interpreter mà mỗi nơi dùng'],2,'Đối chiếu môi trường chạy trước khi sửa hoặc cài đặt.','ai-environment')]);
 theory('ai-import','Dùng công cụ có sẵn với import','Hiểu import trước khi đọc JSON bằng Python.',
  '<p><strong>Module</strong> là một bộ code có thể dùng lại. <code>import json</code> đưa công cụ json có sẵn của Python vào chương trình.</p><p>Dấu chấm trong <code>json.loads(...)</code> có nghĩa là dùng hàm loads trong module json. Bạn sẽ học hàm tự viết ở tuần 4; lúc này chỉ cần biết cách gọi công cụ có sẵn.</p>',
  '<pre class="sample-code">import json\ntext = \'["Python", "SQL"]\nsubjects = json.loads(text)\nprint(subjects[0])</pre><p>loads đọc chuỗi JSON thành dữ liệu Python. Dòng cuối đọc phần tử đầu, nên in Python.</p>',
  'Giải thích import json và dấu chấm trong json.loads.',[
   q('import json dùng để…',['Gửi mạng ngay lập tức','Đưa module json vào dùng','Tạo mô hình AI'],1,'json là module có sẵn trong Python; import không phải một request mạng.','ai-import'),
   q('json.loads đọc gì?',['Chuỗi chứa JSON','Tên interpreter','Một lỗi Python'],0,'Hàm chuyển chuỗi JSON thành dữ liệu Python.','ai-import'),
   q('json.loads thuộc về…',['Một biến bắt buộc tên loads','PyCharm','Module json'],2,'Dấu chấm giúp truy cập hàm của module.','ai-import')],'python');
 theory('ai-json','JSON: cách gửi một nhóm thông tin','Đọc JSON và hiểu vì sao API hay trả về định dạng này.',
  '<ul><li><strong>JSON</strong> là cách viết dữ liệu thành văn bản.</li><li>Một object gồm các cặp tên–giá trị, như <code>{"title": "Biến"}</code>.</li><li>Tên key và chuỗi dùng dấu nháy kép.</li></ul><p><code>json.loads(text)</code> chuyển object JSON thành dictionary Python, hoặc array JSON thành list. Chuỗi JSON và dictionary không phải cùng một kiểu dữ liệu.</p>',
  '<pre class="sample-code">import json\ntext = \'{"title": "Biến"}\nnote = json.loads(text)\nprint(note["title"])</pre><p>Dòng cuối in Biến. API trả văn bản JSON; sau khi đọc, bạn lấy thông tin theo tên key.</p>'.replace('Biến"}\n','Biến"}\'\n'),
  'Giải thích bước chuyển từ response JSON sang dictionary rồi lấy một giá trị.',[
   q('JSON nào viết đúng?',["{'title': 'Biến'}",'{"title": "Biến"}','{title = Biến}'],1,'JSON yêu cầu dấu nháy kép cho tên key và chuỗi.','ai-json'),
   q('Sau json.loads của một object JSON, ta thường có…',['Dictionary','Một file Python mới','Một model'],0,'Object JSON được đọc thành dictionary Python.','ai-json'),
   q('Muốn lấy title từ dictionary note, dùng…',['note[0]','print("note")','note["title"]'],2,'Dùng key để lấy giá trị trong dictionary.','ai-json')],'api');

 // Public fixtures: the server substitutes only the declared input assignments.
 // Students see every fixture and the grading contract before submitting.
 const groups={
  compare:{title:'So sánh',knowledge:'<p><code>&gt;=</code> hỏi “có lớn hơn hoặc bằng không?”. Kết quả là <code>True</code> (đúng) hoặc <code>False</code> (sai), gọi là Boolean.</p><p>Khác với dấu = dùng để gán, phép so sánh trả về một kết quả để bạn kiểm tra.</p>',example:'minutes = 30\nprint(minutes >= 20)',output:'True',explain:'30 lớn hơn hoặc bằng 20, nên in True.',use:'Kiểm tra bạn đã học đủ số phút dự định chưa.'},
  equal:{title:'Bằng nhau hay không',knowledge:'<p><code>==</code> so sánh hai giá trị có bằng nhau không. <code>=</code> vẫn là gán giá trị.</p><p>Chuỗi được so sánh đúng chữ hoa/thường. Có thể giữ kết quả True/False trong một biến rồi print biến đó.</p>',example:'topic = "SQL"\nis_python = topic == "Python"\nprint(is_python)',output:'False',explain:'SQL khác Python. is_python giữ False.',use:'Kiểm tra một ghi chú có đúng chủ đề cần tìm không.'},
  choice:{title:'if và else',knowledge:'<ul><li><code>if</code> nghĩa là “nếu”.</li><li>Sau điều kiện có dấu <code>:</code>.</li><li>Dòng cần làm khi đúng thụt vào 4 dấu cách.</li></ul><ul><li><code>else:</code> là phần làm khi điều kiện sai.</li><li>Nó đứng thẳng hàng với if.</li><li>Chỉ một trong hai nhánh chạy.</li></ul>',example:'minutes = 15\nif minutes >= 20:\n    print("Đủ")\nelse:\n    print("Chưa đủ")',output:'Chưa đủ',explain:'15 chưa tới 20, nên chỉ nhánh else in Chưa đủ.',use:'Hiện lời nhắc phù hợp với số phút bạn đã học.'},
  list:{title:'List: nhiều thông tin theo thứ tự',knowledge:'<p><strong>List</strong> giữ nhiều giá trị trong <code>[...]</code>, ngăn bằng dấu phẩy. Ví dụ <code>["Python", "SQL"]</code>.</p><p>Vị trí đầu tiên là <code>0</code>, vị trí thứ hai là <code>1</code>. <code>subjects[0]</code> lấy giá trị đầu tiên. Vị trí không tồn tại gây IndexError.</p>',example:'subjects = ["Python", "SQL"]\nprint(subjects[1])',output:'SQL',explain:'Vị trí 1 là phần tử thứ hai, nên in SQL.',use:'Giữ một danh sách môn học và chọn một môn.'},
  dict:{title:'Dictionary: thông tin có tên',knowledge:'<p><strong>Dictionary</strong> giữ các cặp key–value trong <code>{...}</code>. Key là tên để tìm giá trị, ví dụ <code>{"title": "Biến"}</code>.</p><ul><li><code>note["title"]</code> lấy giá trị của key title.</li><li>Key chưa tồn tại gây KeyError.</li><li>Dấu hai chấm nối key với value; dấu phẩy tách các cặp.</li></ul>',example:'note = {"title": "Biến", "topic": "Python"}\nprint(note["title"])',output:'Biến',explain:'Đọc theo tên title, không theo vị trí số như list.',use:'Giữ tiêu đề và chủ đề của một ghi chú.'},
  json:{title:'Đọc JSON',knowledge:'<p>Ôn <code>import json</code> và dictionary. Dùng <code>json.loads(text)</code> để đọc chuỗi JSON, rồi lấy giá trị theo key.</p><p>Giữ dấu nháy kép bên trong JSON; có thể dùng nháy đơn bao quanh cả chuỗi Python. JSON viết sai sẽ có JSONDecodeError.</p>',example:'import json\ntext = \'{"title": "So sánh"}\'\nnote = json.loads(text)\nprint(note["title"])',output:'So sánh',explain:'Đọc JSON thành note, rồi lấy title để in So sánh.',use:'Lấy tên hoặc tiêu đề từ dữ liệu API trả về.'},
  recap:{title:'Kiểm tra lại',knowledge:'<ul><li>Dùng lại kiến thức đã học.</li><li>Viết code đọc biến để tạo kết quả; không in sẵn đáp án.</li><li>Nộp bài sẽ thử thêm dữ liệu đã liệt kê trong đề.</li></ul>',example:'name = "Minh"\nprint(f"Chào {name}")',output:'Chào Minh',explain:'Đổi name thì lời chào đổi theo.',use:'Kiểm tra xem bạn có dùng lại được cách làm trong một tình huống khác không.'}
 };
 function exercise(id,title,group,seed,solution,expected,other,week,reviewOf){
  const g=groups[group],prefix=Object.entries(seed).map(([k,v])=>`${k} = ${JSON.stringify(v)}`).join('\n');
  const cases=[{name:'Dữ liệu trong đề',inputs:seed,expected},...other.map(([inputs,expected],i)=>({name:'Biến thể '+(i+1),inputs,expected}))];
  const task=`${title}. Bắt đầu bằng các biến mẫu ở đề, rồi viết cách xử lý để kết quả thay đổi theo dữ liệu.`;
  C.lessons.push({id,module:'python',title,summary:g.use,minutes:10,contentVersion:1,roadmapWeek:week,pythonGroup:'roadmap-'+group,pythonGroupTitle:g.title,groupStep:1,
   body:`<h2>Mục tiêu</h2><p>${esc(title)}.</p><p><strong>Dùng để làm gì?</strong> ${g.use}</p><h2>Kiến thức cần biết</h2>${g.knowledge}<h2>Ví dụ có giải thích</h2><pre class="sample-code">${esc(g.example)}</pre><p>${g.explain}</p><p>Kết quả:</p><pre class="sample-code">${esc(g.output)}</pre>`,
   task,expected,solution,starter:prefix,roadmapCases:cases,reviewOf,practiceRule:'Giữ tên các biến đầu vào trong đề. Nộp bài thay giá trị của chúng để thử các biến thể công khai bên dưới.',
   hints:['Đọc dữ liệu mẫu và xác định giá trị cần lấy hoặc điều kiện cần kiểm tra.','Dùng lại cách viết trong ví dụ; thay tên biến hoặc key theo đề.','Thử lần lượt từng bộ dữ liệu trong đề. Đừng chỉ in sẵn kết quả của bộ đầu.'],checks:[task],transfer:'',prior:false,
   resources:[['AI Engineering from Scratch · Python',sources.python]],sourceKind:'Bài luyện bổ sung TechPath'});
 }
 const add=(...a)=>exercise(...a);
 for(const [slug,noun,variable,value,threshold] of [['minutes','phút học','minutes',25,20],['pages','trang sách','pages',8,10],['notes','ghi chú','count',3,3]]){
  add('python-compare-'+slug,'Kiểm tra '+noun+' có đạt '+threshold+' không','compare',{[variable]:value},`${variable} = ${value}\nprint(${variable} >= ${threshold})`,value>=threshold?'True':'False',[[{[variable]:threshold-1},'False'],[{[variable]:threshold},'True']],2);
 }
 for(const [slug,variable,value,target] of [['topic','topic','Python','Python'],['status','status','Đang học','Đã xong'],['title','title','Biến','Biến']]){
  add('python-equal-'+slug,`So sánh ${variable} có bằng “${target}” không`,'equal',{[variable]:value},`${variable} = ${JSON.stringify(value)}\nmatched = ${variable} == ${JSON.stringify(target)}\nprint(matched)`,value===target?'True':'False',[[{[variable]:target},'True'],[{[variable]:'Khác'},'False']],2);
 }
 for(const [slug,v,n,t] of [['minutes','minutes',25,20],['pages','pages',8,10],['notes','count',3,3]]){
  add('python-choice-'+slug,`Nếu ${v} >= ${t}, in Đủ; ngược lại in Chưa đủ`,'choice',{[v]:n},`${v} = ${n}\nif ${v} >= ${t}:\n    print("Đủ")\nelse:\n    print("Chưa đủ")`,n>=t?'Đủ':'Chưa đủ',[[{[v]:t-1},'Chưa đủ'],[{[v]:t},'Đủ']],2,'python-compare-'+slug);
 }
 for(const [slug,values,index] of [['first',['Python','SQL'],0],['second',['Biến','Điều kiện'],1],['third',['Python','SQL','API'],2]]){
  const changed=['Đọc','Viết','Ôn'];
  add('python-list-'+slug,'In phần tử ở vị trí '+index+' của items','list',{items:values},`items = ${JSON.stringify(values)}\nprint(items[${index}])`,values[index],[[{items:changed},changed[index]],[{items:['A','B','C']},['A','B','C'][index]]],3);
 }
 for(const [slug,key,value] of [['title','title','Biến'],['topic','topic','Python'],['author','author','Lan']]){
  add('python-dict-'+slug,'In '+key+' của note','dict',{note:{[key]:value}},`note = ${JSON.stringify({[key]:value})}\nprint(note["${key}"])`,value,[[{note:{[key]:'Mới'}},'Mới'],[{note:{[key]:'Khác'}},'Khác']],3);
  const text=JSON.stringify({[key]:value});
  add('python-json-'+slug,'Đọc text JSON rồi in '+key,'json',{text},`import json\ntext = ${JSON.stringify(text)}\nnote = json.loads(text)\nprint(note["${key}"])`,value,[[{text:JSON.stringify({[key]:'Mới'})},'Mới'],[{text:JSON.stringify({[key]:'Khác'})},'Khác']],3,'python-dict-'+slug);
 }
 add('python-check-w1-name','In lời chào dạng Chào + tên trong name','recap',{name:'Mai'},'name = "Mai"\nprint(f"Chào {name}")','Chào Mai',[[{name:'An'},'Chào An'],[{name:'Bình'},'Chào Bình']],1,'python-fstring-greeting');
 add('python-check-w1-sum','Cộng morning và evening rồi in tổng phút','recap',{morning:15,evening:20},'morning = 15\nevening = 20\nprint(morning + evening)','35',[[{morning:0,evening:10},'10'],[{morning:25,evening:30},'55']],1,'python-add-minutes');
 add('python-check-w1-topic','In giá trị của topic','recap',{topic:'Ôn bài'},'topic = "Ôn bài"\nprint(topic)','Ôn bài',[[{topic:'Python'},'Python'],[{topic:'API'},'API']],1,'python-variable-topic');
 add('python-check-w2-compare','In kết quả pages >= 12','compare',{pages:15},'pages = 15\nprint(pages >= 12)','True',[[{pages:11},'False'],[{pages:12},'True']],2,'python-compare-pages');
 add('python-check-w2-equal','In kết quả topic == SQL','equal',{topic:'Python'},'topic = "Python"\nprint(topic == "SQL")','False',[[{topic:'SQL'},'True'],[{topic:'sql'},'False']],2,'python-equal-topic');
 add('python-check-w2-choice','Nếu minutes >= 30 in Xong; ngược lại in Học tiếp','choice',{minutes:30},'minutes = 30\nif minutes >= 30:\n    print("Xong")\nelse:\n    print("Học tiếp")','Xong',[[{minutes:29},'Học tiếp'],[{minutes:40},'Xong']],2,'python-choice-minutes');
 add('python-check-w3-list','In phần tử ở vị trí 1 của topics','list',{topics:['Toán','API']},'topics = ["Toán", "API"]\nprint(topics[1])','API',[[{topics:['A','SQL']},'SQL'],[{topics:['Python','B']},'B']],3,'python-list-second');
 add('python-check-w3-dict','In title trong note','dict',{note:{title:'Vòng lặp'}},'note = {"title": "Vòng lặp"}\nprint(note["title"])','Vòng lặp',[[{note:{title:'Biến'}},'Biến'],[{note:{title:'API'}},'API']],3,'python-dict-title');
 add('python-check-w3-json','Đọc text JSON rồi in topic','json',{text:'{"topic":"SQL"}'},'import json\ntext = \'{"topic":"SQL"}\'\nnote = json.loads(text)\nprint(note["topic"])','SQL',[[{text:'{"topic":"Python"}'},'Python'],[{text:'{"topic":"API"}'},'API']],3,'python-json-topic');

 const rows=[
  ['Hiểu hướng đi và môi trường','AI/ML/LLM, interpreter, biến và kiểu dữ liệu.','Giải thích code chạy thế nào; sửa chương trình đơn giản.','setup'],
  ['Chương trình biết lựa chọn','So sánh, Boolean, if/else; request/response và HTTP status.','Phản hồi theo dữ liệu; đọc request và response.','python'],
  ['Làm việc với nhiều thông tin','List, dictionary, JSON; ôn SQL chọn và lọc.','Lấy đúng thông tin từ ghi chú hoặc response JSON.','python'],
  ['Lặp và tổ chức code','for, hàm, tham số và return.','Viết hàm xử lý nhiều ghi chú và sửa lỗi logic.','python'],
  ['Dữ liệu có thể thiếu hoặc sai','Tệp UTF-8, JSON/CSV, try/except và SQL NULL.','Đọc dữ liệu và báo lỗi dễ hiểu.','python'],
  ['Kết nối bằng API','POST, headers, xác thực, Python gọi API lab, timeout.','Gửi request, đọc JSON và xử lý lỗi HTTP.','api'],
  ['Dữ liệu và toán trực quan','Trung bình, tỉ lệ, vector; SQL tổng hợp và JOIN.','Tính thống kê và nhận biết JOIN tăng số dòng.','math'],
  ['AI học và được kiểm tra thế nào','Feature/label, training/inference, train/test, overfitting, baseline.','Kiểm tra một bộ phân loại nhỏ và giải thích giới hạn.','ml'],
  ['Làm việc với LLM','Token, context, prompt, hallucination; gọi nguồn gia sư đã chọn.','Nhận câu trả lời và kiểm tra nội dung, không chỉ định dạng.','llm'],
  ['Đưa tài liệu cho AI','Tìm từ khóa, chọn ngữ cảnh, dẫn nguồn; giới thiệu embeddings/RAG.','Tìm đoạn liên quan và chỉ ra nguồn trả lời.','llm'],
  ['Hoàn thiện trợ lý học tập','Ghép dữ liệu → tìm kiếm → mô hình → câu trả lời.','Xử lý thiếu căn cứ, lỗi dịch vụ và nội dung gây nhiễu.','llm'],
  ['Kiểm chứng và bàn giao','10 tình huống kiểm tra, Git, README và giới hạn.','Có prototype, hướng dẫn chạy và bảng kiểm chứng.','llm']
 ];
 const session=(title,lessons,kind='learn')=>({title,lessons,kind,minutes:[45,60]});
 const group=g=>C.lessons.filter(l=>l.pythonGroup==='roadmap-'+g&&!l.id.includes('-check-')).map(l=>l.id);
 const weeks=rows.map(([title,topics,outcome,source],i)=>({number:i+1,title,topics,outcome,available:i<3,source:sources[source],sessions:[],checkpoint:null}));
 weeks[0].sessions=[
  session('AI Engineer và trợ lý học tập',['ai-role','ai-model-data','python-basic-print']),
  session('Môi trường và biến',['ai-environment','python-variable-name','python-variable-topic']),
  session('Số nguyên và thập phân',['python-integer-notebooks','python-float-distance','python-two-variables-name-city']),
  session('Đưa biến vào câu và cộng số',['python-fstring-greeting','python-fstring-minutes','python-add-minutes']),
  session('Luyện tổng hợp',['python-review-fruit','python-two-variables-study','python-review-walk'],'practice'),
  session('Kiểm tra và ôn tuần 1',['python-check-w1-name','python-check-w1-sum','python-check-w1-topic'],'checkpoint')];
 weeks[1].sessions=[session('So sánh và Boolean',group('compare')),session('Bằng nhau hay không',group('equal')),session('Chọn một trong hai việc',group('choice')),session('Nhìn request và response',['api-get-hello','api-get-profile','api-get-topic']),session('Đường dẫn và trạng thái',['api-path-python','api-path-sql','api-status-not-found'],'practice'),session('Kiểm tra và ôn tuần 2',['python-check-w2-compare','python-check-w2-equal','python-check-w2-choice'],'checkpoint')];
 weeks[2].sessions=[session('Một danh sách theo thứ tự',group('list')),session('Thông tin có tên',group('dict')),session('Đọc dữ liệu JSON',['ai-import','ai-json',...group('json')]),session('Chọn và lọc dữ liệu SQL',['sql-basic-select-customers','sql-basic-select-orders','sql-basic-where-paid']),session('Ôn dữ liệu và query parameter',['api-query-python','api-query-sql','api-query-api'],'practice'),session('Kiểm tra và ôn tuần 3',['python-check-w3-list','python-check-w3-dict','python-check-w3-json'],'checkpoint')];
 const by=id=>C.lessons.find(l=>l.id===id);
 weeks[0].checkpoint={questions:[by('ai-role').questions[0],by('ai-model-data').questions[0],by('ai-environment').questions[0],q('print("name") in gì?',['Giá trị của name','Chữ name','Không bao giờ chạy được'],1,'Dấu nháy đánh dấu chuỗi; muốn đọc biến dùng print(name).','python-variable-name'),q('3 + 2 cho kết quả gì?',['32','"3 + 2"','5'],2,'Hai số nguyên được cộng thành 5.','python-add-minutes')],practical:weeks[0].sessions[5].lessons};
 weeks[1].checkpoint={questions:[q('20 >= 20 trả về…',['True','False','20'],0,'Lớn hơn hoặc bằng bao gồm trường hợp bằng.','python-compare-minutes'),q('Dấu nào dùng để so sánh bằng?',['=','==',':'],1,'= gán; == so sánh.','python-equal-topic'),q('Nếu điều kiện if sai thì…',['Cả hai nhánh chạy','Không bao giờ có output','Nhánh else chạy nếu có'],2,'Một trong hai nhánh được chọn.','python-choice-minutes'),q('GET thường dùng để…',['Xin đọc thông tin','Huấn luyện mô hình','Luôn tạo dữ liệu mới'],0,'GET yêu cầu đọc một tài nguyên.','api-get-hello'),q('404 trong bài tìm sách không tồn tại nghĩa là…',['Mọi code đều sai','Không tìm thấy tài nguyên','Đã tạo sách'],1,'404 có thể là kết quả đúng khi đề yêu cầu tài nguyên không tồn tại.','api-status-not-found')],practical:weeks[1].sessions[5].lessons};
 weeks[2].checkpoint={questions:[q('Phần tử đầu tiên của list ở vị trí…',['1','0','-2'],1,'Python đếm vị trí từ 0.','python-list-first'),q('Lấy title từ dictionary note bằng…',['note["title"]','note[0]','note.title()'],0,'Đọc dictionary bằng key.','python-dict-title'),by('ai-json').questions[0],by('ai-import').questions[1],q('WHERE trong SQL dùng để…',['Chọn database','Đổi tên Python','Lọc các dòng theo điều kiện'],2,'WHERE giữ những dòng thỏa điều kiện.','sql-basic-where-paid')],practical:weeks[2].sessions[5].lessons};
 for(const w of weeks.filter(w=>w.available)){
  w.prerequisites=w.number===1?[]:['week-'+(w.number-1)];
  for(const [i,s] of w.sessions.entries()){s.id=`w${w.number}-s${i+1}`;s.prerequisites=i?[w.sessions[i-1].id]:w.prerequisites;s.outcome=i===5?w.outcome:'Làm các bài trong buổi, giải thích một điều vừa hiểu và ghi chỗ cần ôn.';}
 }
 const mapped=new Set(weeks.flatMap(w=>w.sessions.flatMap(s=>s.lessons)));
 for(const w of weeks)w.optionalReview=[];
 for(const l of C.lessons){
  if(mapped.has(l.id)||l.roadmapWeek||l.kind==='knowledge')continue;
  const number=l.module==='python'?1:l.module==='api'?6:l.foundation?(l.foundationIndex<=8?3:l.foundationIndex<=12?5:7):null;
  if(number)weeks[number-1].optionalReview.push(l.id);
 }
 const models={
  'ai-role':'Mô hình tạo lời giải thích. Code tìm ghi chú, gửi yêu cầu và hiện kết quả hoặc lỗi. Một ứng dụng cần cả hai phần.',
  'ai-model-data':'Training dùng dữ liệu để điều chỉnh mô hình. Inference dùng mô hình đã có cho đầu vào mới. Gửi ghi chú làm ngữ cảnh không đồng nghĩa huấn luyện lại.',
  'ai-environment':'File .py chứa code; interpreter chạy code; PyCharm giúp soạn code và chọn interpreter. Môi trường ảo giữ bộ thư viện riêng cho dự án.',
  'ai-import':'import json đưa module json vào dùng. json.loads là hàm loads thuộc module đó, dùng để đọc chuỗi JSON.',
  'ai-json':'API có thể trả văn bản JSON. json.loads đọc object JSON thành dictionary; dùng note["title"] để lấy giá trị của key title.'
 };
 for(const [id,answer] of Object.entries(models))by(id).reflectionModel=answer;
 C.roadmap={id:'ai-foundations-12w',version:1,sources,weeks,minutes:[45,60],daysPerWeek:6,hours:[54,72],
  destination:'Tự hoàn thiện một trợ lý học từ ghi chú có dùng mô hình AI, dựa trên khung hướng dẫn.',
  level8:'Nền tảng lập trình và dữ liệu ban đầu: viết chương trình nhỏ, đọc lỗi và hiểu training khác inference.',
  level12:'Người mới có nền tảng xây ứng dụng AI: hoàn thiện prototype có hướng dẫn, biết kiểm tra và nêu giới hạn. Chưa chứng nhận đủ năng lực làm AI Engineer độc lập.',
  next:['Củng cố Python, testing, Git và cấu trúc ứng dụng.','Học embeddings, tìm kiếm ngữ nghĩa và RAG có đánh giá.','Triển khai, logging, chi phí, bảo mật và theo dõi chất lượng.','Học tool calling/agents; hoặc đi sâu Math → ML → Deep Learning.']};
})();
