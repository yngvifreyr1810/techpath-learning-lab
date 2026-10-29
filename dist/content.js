/* Authored curriculum. SQL solutions stay hidden until explicitly requested. */
window.TECHPATH = {
  version: 1,
  seed: `-- SupportLab: dữ liệu giả lập dùng để học. Đơn vị tiền quy ước.
-- Nếu đã tạo SupportLab trong buổi trước, không cần chạy lại.
IF DB_ID(N'SupportLab') IS NULL
    EXEC(N'CREATE DATABASE SupportLab');
GO
USE SupportLab;
GO
IF OBJECT_ID(N'dbo.Customers') IS NOT NULL
 OR OBJECT_ID(N'dbo.Orders') IS NOT NULL
 OR OBJECT_ID(N'dbo.Payments') IS NOT NULL
    THROW 50001, 'Lab tables already exist. No existing data was changed.', 1;

CREATE TABLE dbo.Customers (
 customer_id INT PRIMARY KEY, customer_name NVARCHAR(100) NOT NULL,
 email NVARCHAR(150) NULL
);
CREATE TABLE dbo.Orders (
 order_id INT PRIMARY KEY, customer_id INT NOT NULL,
 order_date DATE NOT NULL, order_status VARCHAR(20) NOT NULL,
 order_total DECIMAL(12,2) NOT NULL
);
CREATE TABLE dbo.Payments (
 payment_id INT PRIMARY KEY, order_id INT NOT NULL,
 payment_date DATE NULL, payment_status VARCHAR(20) NOT NULL,
 payment_amount DECIMAL(12,2) NOT NULL
);
-- Cố ý chưa có foreign key và CHECK constraint để luyện phát hiện lỗi dữ liệu.
INSERT INTO dbo.Customers VALUES
(1,N'An Nguyen',N'an.nguyen@email.com'),(2,N'Bao Tran',N'bao.tran@email.com'),
(3,N'Chi Le',N'chi.le@email.com'),(4,N'Dung Pham',N'duplicate@email.com'),
(5,N'Em Vo',N'duplicate@email.com'),(6,N'Giang Ho',NULL);
INSERT INTO dbo.Orders VALUES
(1001,1,'20261001','Paid',120),(1002,2,'20261002','Paid',250),
(1003,3,'20261003','Paid',0),(1004,4,'20261004','Paid',180),
(1005,5,'20261005','Pending',75),(1006,99,'20261006','Paid',140),
(1007,1,'20261007','Cancelled',-50),(1008,6,'20261008','Paid',95);
INSERT INTO dbo.Payments VALUES
(1,1001,'20261001','Succeeded',120),(2,1002,'20261002','Succeeded',200),
(3,1004,'20261004','Succeeded',200),(4,1005,NULL,'Pending',75),
(5,1008,'20261008','Succeeded',95);
GO`,
  modules: [
    {id:'sql',name:'SQL & Data Quality',icon:'SQL',tag:'NỀN TẢNG CHÍNH',desc:'Từ query đúng đến dữ liệu đáng tin. Tiếp nối SupportLab đã thực hành trong chat.',goal:'Tự viết query, đọc lỗi và giải thích được logic.'},
    {id:'systems',name:'Windows & Troubleshooting',icon:'>_',tag:'KỸ NĂNG VẬN HÀNH',desc:'Tìm nguyên nhân từ triệu chứng, kiểm tra log, network và môi trường Windows.',goal:'Điều tra có bằng chứng, viết được ticket rõ ràng.'},
    {id:'reporting',name:'Excel & Power BI',icon:'BI',tag:'KIỂM TRA & TRÌNH BÀY',desc:'Đối soát bằng Excel, chuẩn bị dữ liệu và xây báo cáo vận hành.',goal:'Chứng minh số liệu đúng trước khi trình bày.'},
    {id:'career',name:'Portfolio & Interview',icon:'↗',tag:'CHUẨN BỊ ĐI LÀM',desc:'Biến lab thành minh chứng kỹ năng và luyện giải thích cách giải quyết vấn đề.',goal:'Giới thiệu project trung thực, có quy trình.'}
  ],
  glossary: [
    ['LEFT JOIN','Giữ mọi dòng bên trái; phần bên phải không khớp được biểu diễn bằng NULL.','SQL'],
    ['Join predicate','Điều kiện ON xác định những dòng nào có thể khớp khi nối bảng.','SQL'],
    ['CTE','Common Table Expression: kết quả query có tên, dùng trong một statement theo sau; không phải bảng tạm vật lý.','SQL'],
    ['Reconciliation','Đối soát: so sánh hai nguồn số liệu theo cùng quy tắc và cùng mức chi tiết.','Data'],
    ['Grain','Mỗi dòng đại diện cho điều gì: một order, một customer hay một lỗi của một bản ghi.','Data'],
    ['NULL','Giá trị thiếu hoặc chưa biết; không tự đồng nghĩa với 0 hay chuỗi rỗng.','SQL'],
    ['COALESCE','Trả về biểu thức không NULL đầu tiên. Chỉ thay NULL bằng 0 khi quy tắc bài toán cho phép.','SQL'],
    ['Type precedence','Thứ tự ưu tiên kiểu dữ liệu khi SQL Server chuyển kiểu ngầm định.','SQL'],
    ['Stored procedure','Nhóm lệnh được lưu trong database, có thể nhận tham số và gọi bằng EXEC.','SQL'],
    ['Severity','Mức nghiêm trọng của vấn đề; tùy ảnh hưởng nghiệp vụ, không phải thuộc tính cố định của mọi lỗi.','Support'],
    ['Root cause','Nguyên nhân gốc được xác nhận bằng bằng chứng, khác với triệu chứng quan sát được.','Support'],
    ['DNS','Domain Name System: phân giải tên miền thành địa chỉ IP.','Network'],
    ['Authentication / Authorization','Xác thực: bạn là ai. Phân quyền: bạn được phép làm gì.','Systems'],
    ['Execution plan','Kế hoạch SQL Server dùng để thực hiện query. Cần dữ liệu, số lần đọc và thời gian để đánh giá hiệu năng.','SQL'],
    ['Power Query','Công cụ lấy và biến đổi dữ liệu trong Excel/Power BI bằng chuỗi bước có thể chạy lại.','BI'],
    ['Measure','Phép tính DAX được đánh giá theo filter context trong báo cáo Power BI.','BI'],
    ['Spaced practice','Ôn lại sau một khoảng thời gian, thay vì chỉ làm nhiều lần liên tiếp trong một buổi.','Learning'],
    ['Transfer task','Bài chuyển giao: dùng ý tưởng đã học để giải một yêu cầu mới, giúp phát hiện việc chỉ nhớ đáp án.','Learning']
  ],
  lessons: []
};
const addLesson = (id,module,title,minutes,summary,body,task,hints,solution,expected,checks,transfer,resources=[],prior=false) => TECHPATH.lessons.push({id,module,title,minutes,summary,body,task,hints,solution,expected,checks,transfer,resources,prior});

addLesson('sql-join','sql','LEFT JOIN: tìm phần dữ liệu còn thiếu',30,'Phân biệt điều kiện trong ON và WHERE qua đơn Paid không có payment thành công.',
`<ul><li>Trong SupportLab, Orders là danh sách cần kiểm tra.</li><li>Một đơn có thể có nhiều lần thanh toán với trạng thái khác nhau.</li><li>Quy tắc cần tìm là <strong>không tồn tại payment Succeeded</strong>, thay vì chỉ không có bất kỳ payment nào.</li></ul><ul><li>Điều kiện ở ON quyết định payment nào được nối vào.</li><li>Sau khi nối, WHERE chọn những dòng cần giữ.</li><li>Lọc trạng thái bên Payments trong WHERE có thể loại các dòng NULL mà ta muốn tìm.</li></ul><blockquote>Hãy mô tả tập dòng cần giữ trước khi viết điều kiện. NULL ở payment_id sau phép nối nghĩa là không tìm thấy payment thỏa điều kiện ON.</blockquote>`,
'Tìm order Paid không có payment Succeeded. Trả về order_id và order_total. Không thay đổi dữ liệu.',
['Bảng nào chứa toàn bộ những đơn bạn muốn kiểm tra? Bảng đó nên nằm bên nào của LEFT JOIN?','Một payment Pending có được coi là khớp không? Điều kiện nào quyết định việc khớp?','Sau khi chỉ nối payment Succeeded, cột khóa bên Payments sẽ là gì khi không có payment phù hợp?'],
`SELECT o.order_id, o.order_total
FROM dbo.Orders AS o
LEFT JOIN dbo.Payments AS p
    ON o.order_id = p.order_id
    AND p.payment_status = 'Succeeded'
WHERE o.order_status = 'Paid'
  AND p.payment_id IS NULL;`,
'order_id 1003 và 1006. Thứ tự dòng có thể khác nếu chưa ORDER BY.',
['Giải thích được vì sao Succeeded ở ON.','Query vẫn phát hiện đơn có payment Pending nhưng chưa có Succeeded.','Không dùng = NULL để kiểm tra dữ liệu thiếu.'],
'Viết lại yêu cầu bằng NOT EXISTS. Giải thích vì sao cách này vẫn giữ một dòng cho mỗi order khi có nhiều payment.',[],true);

addLesson('sql-reconcile','sql','Đối soát số tiền theo từng đơn',40,'SUM, GROUP BY, HAVING và ý nghĩa nghiệp vụ khi thay NULL bằng 0.',
`<ul><li>Chọn mức chi tiết: <strong>mỗi dòng là một order Paid</strong>.</li><li>Cộng những payment thành công theo từng đơn trước khi so sánh.</li><li>Với lab này, không có payment Succeeded được hiểu là tổng tiền thành công bằng 0.</li></ul><p>WHERE lọc dòng trước gom nhóm; HAVING lọc nhóm sau khi tính tổng. Công thức difference = total_payment - order_total: âm là thiếu, dương là thừa.</p><p>Đơn 1003 có tổng đơn 0 và tổng payment 0 nên không lệch tiền. Nó vi phạm một quy tắc khác: đơn Paid phải có tổng dương.</p>`,
'Trả về order_id, order_total, total_payment, difference cho đơn Paid có chênh lệch. Mọi phép tính và cột hiển thị phải xử lý NULL nhất quán.',
['Nếu một đơn có hai payment thành công, bạn cần so sánh từng payment hay tổng cả hai?','Đơn không có payment phải còn trong dữ liệu trước GROUP BY. Kiểm tra lại ON và WHERE.','Biểu thức SUM cần được xử lý NULL ở cả SELECT và điều kiện HAVING.'],
`SELECT o.order_id, o.order_total,
       COALESCE(SUM(p.payment_amount), 0) AS total_payment,
       COALESCE(SUM(p.payment_amount), 0) - o.order_total AS difference
FROM dbo.Orders AS o
LEFT JOIN dbo.Payments AS p
  ON o.order_id = p.order_id AND p.payment_status = 'Succeeded'
WHERE o.order_status = 'Paid'
GROUP BY o.order_id, o.order_total
HAVING COALESCE(SUM(p.payment_amount), 0) <> o.order_total;`,
'1002: 250 / 200 / -50; 1004: 180 / 200 / 20; 1006: 140 / 0 / -140.',
['Không bỏ sót đơn không có payment.','Một order có nhiều payment được cộng đúng.','Giải thích được vì sao 1003 không xuất hiện.'],
'Yêu cầu mới: hiển thị thêm nhãn Underpaid / Overpaid bằng CASE, chỉ cho đơn lệch. Sau đó thử viết bằng một CTE tổng payment.',[],true);

addLesson('sql-rules','sql','Ba quy tắc kiểm tra chất lượng dữ liệu',30,'Tách điều kiện kỹ thuật khỏi quy tắc nghiệp vụ cần xác nhận.',
`<p>Quy tắc của lab: (1) đơn Paid phải có tổng lớn hơn 0; (2) customer_id trong order phải tồn tại; (3) email không NULL chỉ được dùng cho một customer.</p><p>Trong hệ thống thật, email trùng có thể hợp lệ (ví dụ tài khoản gia đình). Không tự xóa bản ghi dựa trên một query phát hiện lỗi; cần xác nhận quy tắc và người có quyền quyết định.</p><p>Foreign key có thể ngăn orphan record. Lab cố ý chưa tạo constraint để có dữ liệu lỗi cho bài học.</p>`,
'Viết ba query riêng: Paid total <= 0; order thiếu customer; email không NULL có COUNT(*) > 1.',
['Với rule 1, hai điều kiện nào phải cùng đúng?','Với rule 2, cần xem khóa phía Customers có NULL sau LEFT JOIN hay không.','Rule 3 dùng WHERE để bỏ NULL trước khi GROUP BY và HAVING.'],
`SELECT order_id, order_total FROM dbo.Orders
WHERE order_status = 'Paid' AND order_total <= 0;

SELECT o.order_id, o.customer_id
FROM dbo.Orders o LEFT JOIN dbo.Customers c ON o.customer_id = c.customer_id
WHERE c.customer_id IS NULL;

SELECT email, COUNT(*) AS email_count FROM dbo.Customers
WHERE email IS NOT NULL GROUP BY email HAVING COUNT(*) > 1;`,
'Rule 1: 1003; rule 2: order 1006 với customer_id 99; rule 3: duplicate@email.com, số lần 2.',
['Đọc được ý nghĩa của mỗi dòng output.','Không gọi bản ghi bất thường là chắc chắn sai khi chưa có quy tắc.','Phân biệt customer_id bên order và customer_id bên customer.'],
'Tìm customer chưa có đơn hàng. Sau đó nêu một lý do vì sao trường hợp này có thể hoàn toàn hợp lệ.',[],true);

addLesson('sql-cte','sql','CTE: từ nhóm email đến từng customer',30,'Chọn đúng grain của báo cáo và nối lại dữ liệu chi tiết.',
`<ul><li>Query GROUP BY email trả về một dòng cho mỗi email.</li><li>Người xử lý lại cần biết ID của từng customer.</li><li>Dùng CTE tìm tập email trùng, rồi nối với Customers để lấy chi tiết.</li></ul><p>CTE chỉ có hiệu lực với statement ngay sau nó. Nó giúp đặt tên cho một bước logic; không mặc nhiên chạy nhanh hơn subquery.</p>`,
'Trả về customer_id, customer_name, email của từng customer có email trùng; sắp xếp email và customer_id tăng dần.',
['Tách thành hai câu hỏi: email nào trùng, và customer nào có các email đó?','CTE chỉ cần cột email. Kết quả chi tiết lấy từ Customers.','Hai tập dữ liệu dùng email làm điều kiện INNER JOIN.'],
`;WITH DuplicateEmails AS (
 SELECT email FROM dbo.Customers
 WHERE email IS NOT NULL GROUP BY email HAVING COUNT(*) > 1
)
SELECT c.customer_id, c.customer_name, c.email
FROM dbo.Customers c INNER JOIN DuplicateEmails d ON c.email = d.email
ORDER BY c.email, c.customer_id;`,
'Customer 4: Dung Pham; customer 5: Em Vo; cùng email duplicate@email.com.',
['Không dùng COUNT làm customer_id.','Nêu được grain của CTE và grain của output.','Không cho rằng CTE là bảng tạm được lưu trong database.'],
'Viết cùng output bằng COUNT(*) OVER (PARTITION BY email) trong CTE. Lọc số lần trùng ở query ngoài.',[],true);

const report = `;WITH DuplicateEmails AS (
 SELECT email FROM dbo.Customers
 WHERE email IS NOT NULL GROUP BY email HAVING COUNT(*) > 1
)
SELECT 'Paid order has nonpositive total' AS issue_type,
       'Order' AS record_type, o.order_id AS record_id,
       CAST(o.order_total AS NVARCHAR(150)) AS observed_value,
       'High' AS severity
FROM dbo.Orders o
WHERE o.order_status = 'Paid' AND o.order_total <= 0
UNION ALL
SELECT 'Order references missing customer', 'Order', o.order_id,
       CAST(o.customer_id AS NVARCHAR(150)), 'High'
FROM dbo.Orders o
LEFT JOIN dbo.Customers c ON o.customer_id = c.customer_id
WHERE c.customer_id IS NULL
UNION ALL
SELECT 'Customer email is duplicated', 'Customer', c.customer_id,
       CAST(c.email AS NVARCHAR(150)), 'Medium'
FROM dbo.Customers c
INNER JOIN DuplicateEmails d ON c.email = d.email;`;

addLesson('sql-report','sql','UNION ALL: một danh sách lỗi để xử lý',40,'Gộp các rule theo một cấu trúc nhất quán và tránh chuyển kiểu ngầm định.',
`<ul><li>Mỗi dòng report đại diện cho <strong>một lỗi của một bản ghi</strong>.</li><li>Một order có hai lỗi được phép xuất hiện hai dòng.</li><li>Dùng UNION ALL để giữ mọi lỗi; UNION có thể loại dòng trùng.</li></ul><p>Mỗi SELECT phải cùng số cột và kiểu dữ liệu tương thích theo vị trí. observed_value có thể là tiền, ID hoặc email: hãy chuyển rõ sang NVARCHAR để giữ cả Unicode.</p><p>Severity hôm nay là quy ước của lab: lỗi order là High, email trùng là Medium. Trong thực tế, mức độ phụ thuộc ảnh hưởng nghiệp vụ.</p>`,
'Gộp ba rule thành issue_type, record_type, record_id, observed_value. Nếu muốn, thêm severity đúng vị trí trong mọi nhánh.',
['Viết một SELECT với text cố định mô tả lỗi trước; chạy đúng rồi mới nối nhánh tiếp theo.','Record ID của rule customer thiếu phải là order_id; observed_value lấy customer_id từ Orders.','Rule email trùng phải JOIN Customers với CTE, không trả COUNT(*) làm record_id.'],
report,
'4 dòng: order 1003 (0.00); order 1006 (99); customer 4 và 5 (duplicate@email.com). Severity là phần mở rộng.',
['Mọi nhánh cùng số cột.','observed_value là text ở mọi nhánh.','record_id là khóa của bản ghi cần kiểm tra.'],
'Thêm rule Customer email is missing cho customer có email NULL, severity Low. Tổng report lúc này có 5 lỗi.',[],true);

addLesson('sql-proc','sql','Đóng gói report thành stored procedure',45,'Bài tiếp nối hiện tại: lưu logic kiểm tra để gọi bằng một lệnh.',
`<ul><li>Stored procedure lưu nhóm lệnh trong database.</li><li>CREATE OR ALTER tạo mới hoặc cập nhật; EXEC thực thi.</li><li>Bài này chỉ đọc dữ liệu và trả report.</li></ul><ul><li>Chọn database SupportLab trước.</li><li>CREATE OR ALTER PROCEDURE phải bắt đầu một batch riêng.</li><li>Trong SSMS, GO phân tách batch; nó không phải lệnh T-SQL của database engine.</li></ul><p>SET NOCOUNT ON ngăn các thông báo số dòng bị tác động, không ẩn result set của SELECT. dbo là schema tổ chức object; usp_ là quy ước tên của lab.</p><blockquote>Khung: USE SupportLab → GO → CREATE OR ALTER PROCEDURE ... AS BEGIN ... END → GO → EXEC ...</blockquote>`,
'Tạo dbo.usp_GetDataQualityIssues bằng report ba rule. Thêm severity High/High/Medium. Gọi EXEC và kiểm tra 4 lỗi, rồi xem nội dung lưu bằng sys.sp_helptext.',
['Bắt đầu với report đang chạy đúng. Bạn cần đặt nó ở vị trí nào bên trong BEGIN ... END?','Nếu lỗi “must be the first statement in a query batch”, xem có cần GO trước CREATE OR ALTER không.','Chỉnh SELECT chưa cập nhật procedure cho đến khi bạn chạy lại CREATE OR ALTER. Sau đó mới EXEC.'],
`USE SupportLab;
GO
CREATE OR ALTER PROCEDURE dbo.usp_GetDataQualityIssues
AS
BEGIN
 SET NOCOUNT ON;
 ${report.split('\n').join('\n ')}
END;
GO
EXEC dbo.usp_GetDataQualityIssues;
EXEC sys.sp_helptext N'dbo.usp_GetDataQualityIssues';`,
'4 dòng lỗi, 5 cột gồm severity. Hai High và hai Medium. Procedure được lưu trong SupportLab, không phải master.',
['Tự phân biệt tạo/cập nhật với thực thi procedure.','Giải thích được GO và NOCOUNT.','Đóng query cũ vẫn gọi lại EXEC được.'],
'Yêu cầu mới: đồng nghiệp muốn report có thêm Low cho email NULL. Tự cập nhật procedure, dự đoán số dòng rồi chạy lại.',
[['Tạo stored procedure · Microsoft Learn','https://learn.microsoft.com/en-us/sql/relational-databases/stored-procedures/create-a-stored-procedure']]);

addLesson('sql-params','sql','Tham số: lọc report theo severity',45,'Từ report cố định đến yêu cầu linh hoạt mà không copy nhiều query.',
`<ul><li>Tham số là dữ liệu đầu vào của procedure, ví dụ @Severity VARCHAR(10) = NULL.</li><li>Quy ước NULL nghĩa là lấy mọi mức.</li><li>Đưa toàn bộ UNION ALL vào CTE Issues, rồi SELECT bên ngoài để lọc.</li></ul><p>Đừng thêm WHERE chỉ ở SELECT cuối của UNION ALL: nó chỉ lọc nhánh cuối. Điều kiện OR @Severity IS NULL cho phép bật/tắt bộ lọc.</p>`,
'Nâng cấp usp_GetDataQualityIssues: không truyền tham số trả 4 lỗi, High trả 2 lỗi, Medium trả 2 lỗi, Low trả 0 trên dataset gốc.',
['Cần lọc toàn bộ kết quả hợp nhất. Bạn có thể đặt kết quả ấy vào một CTE có tên Issues không?','Tham số đứng sau tên procedure, trước AS. Default NULL cho phép không truyền giá trị.','Điều kiện ở SELECT ngoài: @Severity IS NULL OR severity = @Severity.'],
`-- Cấu trúc: giữ ba SELECT từ bài trước bên trong Issues.
CREATE OR ALTER PROCEDURE dbo.usp_GetDataQualityIssues
 @Severity VARCHAR(10) = NULL
AS
BEGIN
 SET NOCOUNT ON;
 ;WITH DuplicateEmails AS (
  SELECT email FROM dbo.Customers WHERE email IS NOT NULL
  GROUP BY email HAVING COUNT(*) > 1
 ), Issues AS (
  SELECT 'Paid order has nonpositive total' AS issue_type,
   'Order' AS record_type, o.order_id AS record_id,
   CAST(o.order_total AS NVARCHAR(150)) AS observed_value, 'High' AS severity
  FROM dbo.Orders o WHERE o.order_status = 'Paid' AND o.order_total <= 0
  UNION ALL
  SELECT 'Order references missing customer', 'Order', o.order_id,
   CAST(o.customer_id AS NVARCHAR(150)), 'High'
  FROM dbo.Orders o LEFT JOIN dbo.Customers c ON o.customer_id = c.customer_id
  WHERE c.customer_id IS NULL
  UNION ALL
  SELECT 'Customer email is duplicated', 'Customer', c.customer_id,
   CAST(c.email AS NVARCHAR(150)), 'Medium'
  FROM dbo.Customers c JOIN DuplicateEmails d ON c.email = d.email
 )
 SELECT * FROM Issues WHERE @Severity IS NULL OR severity = @Severity;
END;
GO
EXEC dbo.usp_GetDataQualityIssues @Severity = 'High';`,
'Dataset gốc: tất cả 4; High 2; Medium 2; Low 0. Không thêm rule Low trước khi đối chiếu kỳ vọng này.',
['Bộ lọc áp dụng mọi nhánh.','Không truyền tham số vẫn chạy.','Biết empty result khác lỗi thực thi.'],
'Thêm @RecordType để lọc Order/Customer; dự đoán số dòng của các tổ hợp trước khi chạy.');

addLesson('sql-debug','sql','Đọc lỗi và chọn bước kiểm tra tiếp theo',35,'Luyện conversion error, invalid column và kết quả sai dù query chạy được.',
`<p>Đọc lỗi theo ba phần: thông báo nói gì, biểu thức nào liên quan, và cách kiểm chứng giả thuyết. “Conversion failed” thường cần xem kiểu dữ liệu, thứ tự cột UNION và giá trị thực tế.</p><ul><li>Lỗi logic không luôn có thông báo: WHERE lọc payment Succeeded có thể làm mất đơn thiếu payment.</li><li>Muốn đánh giá “tối ưu”, cần query, schema/index, execution plan và số liệu thực thi.</li><li>Chỉ nhìn câu SQL không đủ kết luận nhanh/chậm.</li></ul>`,
'Giải thích vì sao SELECT CAST(0.00 AS VARCHAR(30)) UNION ALL SELECT 99 gây conversion error. Sửa cho observed_value là text. Viết ticket ngắn: triệu chứng, giả thuyết, kiểm chứng, cách sửa.',
['Hai SELECT có cùng vị trí cột nhưng cùng kiểu chưa?','INT được ưu tiên hơn VARCHAR khi UNION chọn kiểu chung. Chuỗi 0.00 có chuyển trực tiếp thành INT không?','Thử ép cả hai phía sang NVARCHAR, rồi đối chiếu với mục tiêu hiển thị.'],
`SELECT CAST(0.00 AS NVARCHAR(150)) AS observed_value
UNION ALL
SELECT CAST(99 AS NVARCHAR(150));`,
'Hai dòng text 0.00 và 99; ticket phân biệt lỗi chuyển kiểu với lỗi dữ liệu nghiệp vụ.',
['Chỉ rõ biểu thức cần kiểm tra.','Đề xuất được một bước xác minh.','Không tự kết luận hiệu năng khi chưa có bằng chứng.'],
'Một query trả 10 dòng thay vì 5 sau JOIN: nêu 3 điều cần kiểm tra trước khi dùng DISTINCT.');

addLesson('win-evidence','systems','Windows: điều tra từ triệu chứng',35,'Thu thập bằng chứng trước khi thay đổi cấu hình.',
`<ul><li>Tình huống: máy chậm sau khi đăng nhập.</li><li>Tách chậm CPU, RAM, disk, network hay một ứng dụng cụ thể.</li><li>Ghi thời điểm, ứng dụng và phạm vi trước khi thử cách sửa.</li></ul><ul><li>Task Manager và Resource Monitor giúp quan sát tài nguyên; Event Viewer giúp đối chiếu sự kiện cùng thời điểm.</li><li>Một Event ID đơn lẻ chưa chứng minh nguyên nhân.</li><li>Ghi lại thay đổi và cách quay về trạng thái trước nếu cần.</li></ul>`,
'Chọn một lần máy/ứng dụng chậm mà bạn từng gặp. Viết kế hoạch kiểm tra 5 bước, ghi bằng chứng quan sát từ Task Manager. Không cần cố tạo lỗi trên máy đang dùng.',
['Chậm toàn máy hay chỉ một app? Từ khi nào? Sau thay đổi gì?','Nếu CPU bình thường nhưng disk busy cao, giả thuyết nào đáng kiểm tra tiếp?','Mỗi bước cần nêu bạn muốn chứng minh hoặc loại trừ điều gì.'],
`Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 Name, Id, CPU
Get-Service | Where-Object Status -eq 'Running' | Select-Object -First 10 Name, Status
# CPU ở Get-Process là thời gian CPU tích lũy (giây), không phải CPU % hiện tại.
# Dùng Task Manager để xem CPU % hiện tại.`,
'Một ghi chép có triệu chứng, phạm vi, thời điểm, 2 bằng chứng và bước tiếp theo. Chưa đủ bằng chứng thì ghi “chưa xác nhận”.',
['Phân biệt triệu chứng và nguyên nhân.','Không gọi dữ liệu CPU tích lũy là CPU %.','Mỗi giả thuyết có cách kiểm chứng.'],
'Chỉ trình duyệt chậm còn app offline bình thường: sửa kế hoạch điều tra cho tình huống này.');

addLesson('win-network','systems','Network: IP, gateway và DNS',40,'Khoanh vùng lỗi “không vào được mạng” bằng các phép kiểm tra có mục đích.',
`<ul><li>Máy có IP chưa?</li><li>Gateway có hợp lý không?</li><li>Truy cập tên miền thất bại do kết nối hay DNS?</li><li>Test từng lớp giúp thu hẹp phạm vi.</li></ul><p>Ping thất bại không đủ kết luận máy đích mất mạng: ICMP có thể bị chặn. nslookup kiểm tra phân giải tên; Test-NetConnection kiểm tra kết nối TCP đến một cổng cụ thể.</p>`,
'Ghi IP/gateway/DNS bằng ipconfig /all. Thử nslookup example.com và kiểm tra cổng 443. Viết mỗi lệnh đang kiểm tra điều gì; che IP nội bộ nếu chia sẻ bản ghi.',
['IP, gateway và DNS phục vụ ba nhiệm vụ gì khác nhau?','Nếu nslookup thất bại nhưng TCP tới một IP hợp lệ thành công, bạn nghi ngờ lớp nào?','Không dùng ping làm bằng chứng duy nhất; chọn phép kiểm tra sát ứng dụng.'],
`ipconfig /all
nslookup example.com
# PowerShell:
Test-NetConnection example.com -Port 443`,
'Bảng 3 cột: lệnh / điều kiểm tra / kết quả. Nếu mạng ổn, vẫn hoàn thành bài qua diễn giải kết quả.',
['Phân biệt DNS với đường truyền.','Hiểu giới hạn của ping.','Đề xuất bước tiếp theo theo kết quả quan sát.'],
'Máy vào được web nhưng một app không kết nối database. Bạn cần hỏi thêm hostname, port, VPN và thông báo lỗi như thế nào?');

addLesson('win-powershell','systems','PowerShell: bản kiểm kê workstation',45,'Đọc thông tin máy và xuất report bằng script nhỏ.',
`<ul><li>PowerShell truyền object qua pipeline.</li><li>Get-Help và Get-Member giúp tìm cú pháp và thuộc tính thay vì đoán.</li><li>Script đầu chỉ đọc thông tin máy và xuất CSV vào thư mục bạn chọn.</li></ul><p>Chọn thuộc tính cần thiết. Không đưa tên máy, user, serial hoặc IP cá nhân lên repo công khai; dùng output giả lập cho portfolio.</p>`,
'Tạo script xuất Windows version, RAM tổng và dung lượng ổ đĩa. Ghi đơn vị GB và giải thích mỗi lệnh. Chạy trong PowerShell bình thường trước khi nghĩ đến quyền admin.',
['Bắt đầu bằng từng lệnh Get-CimInstance Win32_OperatingSystem và Get-Volume để quan sát object.','RAM từ Win32_ComputerSystem được tính bằng byte. Chia cho 1GB và làm tròn.','Gộp thành PSCustomObject rồi Export-Csv -NoTypeInformation.'],
`$os = Get-CimInstance Win32_OperatingSystem
$pc = Get-CimInstance Win32_ComputerSystem
[pscustomobject]@{
 Windows = $os.Caption
 Version = $os.Version
 RAM_GB = [math]::Round($pc.TotalPhysicalMemory / 1GB, 1)
} | Export-Csv -Path .\workstation-summary.csv -NoTypeInformation -Encoding utf8
Get-Volume | Select-Object DriveLetter, FileSystemLabel,
 @{Name='FreeGB';Expression={[math]::Round($_.SizeRemaining/1GB,1)}}`,
'Một script .ps1 và CSV có header đúng. Không cần chạy bằng admin để “cho chắc”.',
['Biết giải thích pipeline.','Có đơn vị rõ ràng.','Không đưa output cá nhân lên GitHub.'],
'Thêm cảnh báo ổ có dung lượng trống dưới 15% mà không tự xóa file.',
[['PowerShell · Microsoft Learn','https://learn.microsoft.com/en-us/training/paths/get-started-windows-powershell/']]);

addLesson('excel-reconcile','reporting','Excel: đối soát hai nguồn',40,'Dùng bảng Excel, SUMIFS và Pivot để kiểm tra kết quả SQL.',
`<ul><li>Xuất Orders và Payments từ SSMS thành CSV.</li><li>Kiểm tra delimiter, decimal và kiểu dữ liệu khi import.</li><li>Biến vùng dữ liệu thành Excel Table để công thức mở rộng ổn định.</li></ul><p>Cần cộng mọi payment Succeeded theo order_id. XLOOKUP một dòng có thể sai nếu một order có nhiều payment; SUMIFS hoặc Pivot phù hợp hơn.</p>`,
'Trong Excel, tạo total_payment và difference cho Orders. Lọc Paid có difference khác 0; đối chiếu kết quả với SQL.',
['Mối quan hệ order → payment là một-nhiều. Công cụ nào cộng được nhiều dòng?','SUMIFS cần hai điều kiện: order_id và payment_status.','Đảm bảo payment_amount là số, không phải text sau import.'],
`=SUMIFS(Payments[payment_amount],Payments[order_id],[@order_id],Payments[payment_status],"Succeeded")
=[@total_payment]-[@order_total]
-- Tùy locale, Excel có thể dùng dấu ; thay cho dấu , trong công thức.`,
'Ba đơn lệch như bài SQL: 1002 (-50), 1004 (+20), 1006 (-140).',
['Không dùng lookup một dòng cho tổng nhiều payment.','Kiểm tra kiểu số sau import.','Giải thích được chênh lệch và dấu âm/dương.'],
'Tạo Pivot đếm số đơn lệch theo trạng thái; giải thích vì sao không cộng số đơn sau JOIN payments.');

addLesson('bi-model','reporting','Power BI: báo cáo vận hành đáng tin',50,'Mô hình dữ liệu, Power Query và measure trước khi trang trí dashboard.',
`<ul><li>Load Customers, Orders và Payments bằng Power Query.</li><li>Gán kiểu dữ liệu đúng; kiểm tra quan hệ một-nhiều.</li><li>Cần ghi rõ khóa lỗi customer 99 thay vì loại dòng ấy một cách vô thức.</li></ul><ul><li>Report đầu chỉ cần số đơn Paid, số order lệch tiền và bảng chi tiết.</li><li>Kiểm chứng với SQL trước khi chọn màu hoặc thêm biểu đồ.</li><li>Measure DAX được tính theo bộ lọc hiện tại.</li></ul>`,
'Tạo report một trang từ SupportLab: tổng order, bảng chi tiết lỗi từ report đã xuất, và bộ lọc severity. Chụp lại report để đưa vào portfolio.',
['Report gốc có 4 lỗi: 2 thuộc Order và 2 thuộc Customer. Hãy định nghĩa chính xác chỉ số bạn đếm.','COUNTROWS(Issues) đếm lỗi, không mặc nhiên đếm order. Một order có thể có nhiều rule.','Kiểm chứng từng measure bằng kết quả SQL và thử filter.'],
`Issue Count = COUNTROWS(Issues)
High Issue Count = CALCULATE([Issue Count], Issues[severity] = "High")
-- Chỉ dùng Record ID cùng Record Type để nhận diện bản ghi giữa các loại.
-- Issue Count = 4; High Issue Count = 2 trên report ba rule.`,
'4 lỗi tổng, 2 High, 2 Medium. Tiêu đề không gọi 4 lỗi là “4 đơn lỗi”.',
['Phân biệt số lỗi, số order và số customer.','Filter hoạt động và được kiểm chứng.','Báo cáo có mô tả nguồn và quy tắc.'],
'Thêm một rule khác cho order 1006. Issue Count tăng; số order khác nhau có tăng không?',
[['Power BI learning paths','https://learn.microsoft.com/en-us/power-bi/fundamentals/power-bi-learning-path-directory']]);

addLesson('career-ticket','career','Viết ticket và giải thích bằng tiếng Anh',30,'Luyện giao tiếp kỹ thuật có cấu trúc, từ lỗi SupportLab.',
`<ul><li>Mục tiêu không phải nói nhiều.</li><li>Ticket tốt giúp đồng đội tái hiện vấn đề, thấy bằng chứng và biết bước tiếp theo.</li><li>Tách observed facts khỏi hypotheses.</li></ul><p>Khung tiếng Anh: Summary → Impact → Evidence → Investigation → Next step. Đừng gọi dữ liệu giả lập là sự cố production bạn đã xử lý.</p>`,
'Viết ticket 100–150 từ bằng tiếng Anh cho order 1006: Paid, customer_id 99 không tồn tại, không có payment thành công. Chưa xác nhận nguyên nhân, chưa tự sửa dữ liệu.',
['Nêu quan sát cụ thể: order ID, trạng thái, khóa tham chiếu.','Tách hai vấn đề thành hai bằng chứng; chưa biết chúng có cùng nguyên nhân không.','Next step có thể là kiểm tra luồng import và nguồn dữ liệu, thay vì tự gán customer bất kỳ.'],
`Summary: Order 1006 references a missing customer in SupportLab.
Impact: This synthetic record cannot be reliably linked to customer data.
Evidence: Orders.customer_id is 99. No matching Customers row exists.
No successful payment was found in the provided dataset.
Investigation: Read-only joins were used to confirm both observations.
Root cause: Not confirmed. The two issues may have different causes.
Next step: Check the source/import rules and confirm ownership before correcting data.`,
'Ticket phân biệt dữ kiện và giả thuyết; mô tả rõ dataset giả lập, không tự nhận kinh nghiệm production.',
['Có query hoặc cách tái hiện.','Không đoán root cause như một sự thật.','Có bước tiếp theo cụ thể.'],
'Giải thích cùng sự cố trong 60 giây như đang bàn giao cho developer.');

addLesson('career-portfolio','career','GitHub: minh chứng quy trình làm việc',40,'Đóng gói lab và luyện trả lời phỏng vấn từ những gì đã thực sự làm.',
`<ul><li>Repository cần người khác hiểu được bài toán và chạy lại lab.</li><li>Giữ schema, dữ liệu giả lập, report, procedure, ticket và README.</li><li>Những chỗ chưa hiểu ghi vào limitations.</li></ul><ul><li>Câu chuyện phỏng vấn: bài toán → quy tắc → lựa chọn SQL → cách kiểm chứng → giới hạn.</li><li>Đừng chỉ liệt kê công cụ.</li><li>Intern/Fresher vẫn có thể trình bày quá trình điều tra rõ ràng.</li></ul>`,
'Chuẩn bị README với 6 mục: Problem, Dataset, Setup, Rules, Findings, Limitations. Viết câu trả lời: vì sao chọn LEFT JOIN và vì sao UNION ALL?',
['Người đọc chưa biết SupportLab; phải giải thích dữ liệu giả lập và cách chạy trước.','Mỗi ảnh hoặc kết quả nên đi cùng một câu giải thích ý nghĩa.','Thử trả lời khi đóng lời giải: điều gì hỏng nếu đặt Succeeded trong WHERE?'],
`supportlab/
  sql/01_schema_seed.sql
  sql/02_quality_report.sql
  sql/03_procedure.sql
  docs/incident-1006.md
  docs/data-dictionary.md
  README.md

Interview prompts:
1. Explain ON vs WHERE in your missing-payment query.
2. How did you validate the results?
3. What information is needed before claiming a query is optimized?`,
'Repo có hướng dẫn tái tạo và ví dụ output; có thể giải thích 3 quyết định mà không xem đáp án.',
['Nội dung đúng với phần mình đã làm.','Có hướng dẫn chạy và giới hạn.','Không đưa dữ liệu hoặc token riêng tư vào source.'],
'Đề chưa gặp: tìm khách có tổng thanh toán thành công cao nhất theo tháng. Mô tả grain, JOIN và phương pháp xếp hạng trước khi viết code.',
[['GitHub · Getting started with Git','https://docs.github.com/en/get-started/learning-to-code/getting-started-with-git']]);
