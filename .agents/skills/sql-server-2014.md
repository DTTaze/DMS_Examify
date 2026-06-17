---
name: sql-server-2014
description: Skill/tài liệu tham chiếu tổng hợp đầy đủ từ thư mục BaiGiangSQLServer2014, bao gồm SQL Server 2014, T-SQL, DDL, DML, security, backup/restore, replication, transaction, isolation level, cursor, trigger và UDF.
source_folder: BaiGiangSQLServer2014
generated_at: 2026-06-17
---

# SQL Server 2014 - Skill tổng hợp đầy đủ

File này tổng hợp nội dung từ thư mục `BaiGiangSQLServer2014` thành một tài liệu skill Markdown duy nhất cho agent/học tập/lập trình. Phần đầu là bản đồ kiến thức có cấu trúc; phần sau giữ lại toàn bộ text và bảng đã trích xuất từ từng tài liệu nguồn để tra cứu chi tiết.

## 1. Cách dùng skill này

- Khi cần trả lời hoặc triển khai chức năng liên quan SQL Server 2014, đọc phần bản đồ kiến thức trước để định vị chủ đề.
- Khi cần chi tiết cú pháp, ví dụ hoặc đoạn lệnh, tra phần `Nội dung chi tiết theo nguồn` ở cuối file.
- Ưu tiên ngữ cảnh SQL Server 2014 và T-SQL; nếu dùng phiên bản SQL Server mới hơn, cần kiểm tra lại khác biệt cú pháp/tính năng.
- Với bài tập hoặc dự án ASP.NET/SQL Server, dùng các phần DDL, DML, security, backup/restore, trigger, UDF, transaction, isolation và replication làm checklist đối chiếu.
- Không tự suy diễn phần không có trong tài liệu nguồn; nếu cần thao tác giao diện dựa trên ảnh minh họa, mở lại file Word/PowerPoint gốc trong `BaiGiangSQLServer2014`.

## 2. Phạm vi và độ bao phủ nguồn

Nguồn chính là các bản `.docx` vì chúng là bản chuyển đổi mới hơn và có nội dung text/bảng đọc được bằng OOXML. Các bản `.doc` cũ trùng tên đã được kiểm tra bằng Word COM: số từ khớp với bản `.docx` tương ứng, nên không lặp lại để tránh nhân đôi nội dung. File `Cursor.ppt` được trích riêng vì là nguồn slide độc lập. File tạm `~$L1_SRVR2014.docx` bị hỏng/corrupt và là lock file của Word nên bị loại khỏi tổng hợp.

| Nguồn | Chủ đề | Đoạn | Bảng | Ảnh/media | Từ trích xuất |
| --- | --- | ---: | ---: | ---: | ---: |
| `SQL1_SRVR2014.docx` | Chương 1 - Tổng quan về SQL Server | 214 | 4 | 9 | 5515 |
| `SQL2_SRVR2014.docx` | Chương 2 - Cài đặt, SSMS, quản lý server và database | 82 | 0 | 23 | 1263 |
| `SQL3_SRVR2014.docx` | Chương 3 - DDL và đối tượng cơ sở dữ liệu | 247 | 7 | 4 | 2795 |
| `SQL4_SRVR2014.docx` | Chương 4 - DML và Stored Procedure | 337 | 0 | 3 | 4201 |
| `SQL5_SRVR2014.docx` | Chương 5 - Cơ chế bảo mật trong SQL Server | 99 | 3 | 6 | 2134 |
| `SQL6_SRVR2014.docx` | Chương 6 - Backup và Restore | 231 | 1 | 11 | 3663 |
| `SQL7_SRVR2014.docx` | Chương 7 - Nhân bản dữ liệu | 22 | 0 | 0 | 797 |
| `SQL8_UDF.docx` | Chương 8 - User Defined Function | 146 | 6 | 0 | 2608 |
| `SQL8_TRIGGER_UDF.docx` | Chương 8 - Trigger và UDF | 235 | 6 | 0 | 3526 |
| `C5_CacMucBaoMat.docx` | Các mức bảo mật | 36 | 0 | 0 | 380 |
| `Các-Mức-Isolation-Level.docx` | Các mức Isolation Level | 74 | 1 | 0 | 1732 |
| `GiaoTac_PhanTan.docx` | Giao tác phân tán | 185 | 2 | 0 | 2793 |
| `Cursor.docx` | Transact-SQL Cursor | 197 | 3 | 1 | 2195 |
| `HuongDan_NhanBanCSDL-2014.docx` | Hướng dẫn nhân bản CSDL SQL Server 2014 | 31 | 1 | 46 | 708 |
| `Cursor.ppt` | Slide báo cáo Cursor | 25 slide | 0 | slide source | 1299 |

Lưu ý về ảnh/media: tài liệu Word có tổng cộng 103 ảnh/đối tượng media nhúng. File skill này ghi nhận số lượng ảnh và giữ toàn bộ text/bảng trích xuất được; các bitmap/screenshot không được OCR tự động để tránh đọc sai nội dung hình.

## 3. Bản đồ kiến thức tổng hợp

### 3.1. Tổng quan SQL Server và kiến trúc

- SQL Server dùng kiến trúc client/server: ứng dụng client gọi API dữ liệu như OLE DB, ODBC hoặc DB-Library; thư viện mạng client dùng IPC/network protocol để truyền yêu cầu đến server network library; SQL Server xử lý qua Database Engine/Open Data Services và trả kết quả ngược lại.
- Các giao thức/kênh kết nối được nhắc đến gồm Shared Memory, TCP/IP, Named Pipes, IPX/SPX, AppleTalk; trong thực hành hiện đại thường cần bật TCP/IP và cấu hình SQL Server Configuration Manager.
- Database Engine chịu trách nhiệm lưu trữ, bảo mật, xử lý transaction và thực thi lệnh SQL/T-SQL.
- SQL Server Agent dùng để lên lịch job, cảnh báo, tự động hóa backup và hỗ trợ replication.
- MSDTC dùng cho distributed transaction trên nhiều server/tài nguyên.
- SQL Server hỗ trợ default instance và named instance; mỗi instance có system database và user database riêng.
- T-SQL là phần mở rộng SQL của Microsoft, hỗ trợ DDL, DML, DCL, transaction, stored procedure, trigger, cursor, function và các cấu trúc điều khiển.

### 3.2. Quản trị SSMS, server và database

- SQL Server Management Studio dùng để đăng ký/hủy đăng ký server, chỉnh tùy chọn môi trường, query execution, designer và quản lý Object Explorer.
- Khi quản lý server cần chú ý thuộc tính server, dịch vụ đang chạy, cấu hình kết nối, database, security, replication, management, SQL Server Agent.
- Cơ sở dữ liệu gồm data file, log file, filegroup; các system database như `master`, `model`, `msdb`, `tempdb` có vai trò riêng.
- Các folder/object thường gặp trong database: Tables, Views, Stored Procedures, Functions, Triggers, Security, Database Diagrams, Synonyms, Service Broker, Storage.

### 3.3. DDL và đối tượng cơ sở dữ liệu

- `CREATE DATABASE` định nghĩa data file/log file, kích thước ban đầu, tăng trưởng, filegroup; `ALTER DATABASE` thêm/xóa/sửa file hoặc filegroup.
- `CREATE TABLE` định nghĩa cột, kiểu dữ liệu, `NULL/NOT NULL`, khóa chính, khóa ngoại, unique, check constraint, computed column và cascade update/delete.
- Ràng buộc có thể được thêm/xóa bằng `ALTER TABLE ... ADD/DROP CONSTRAINT`; có thể dùng `WITH CHECK`, `CHECK CONSTRAINT`, `NOT FOR REPLICATION` theo tình huống.
- View có thể đơn giản hoặc lấy từ nhiều bảng. View chứa join/group/subquery có thể bị read-only hoặc bị hạn chế cập nhật.
- Index có thể clustered hoặc nonclustered; tạo bằng `CREATE [CLUSTERED] INDEX ... ON table(columns)`. Index hỗ trợ truy vấn nhanh nhưng cần cân nhắc chi phí cập nhật.
- Quyền trên object được cấp/thu hồi bằng `GRANT`, `REVOKE`, có thể ở mức table/column và quyền tạo object như view, procedure, database, table.

### 3.4. DML, truy vấn và Stored Procedure

- DML gồm `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `MERGE`; tài liệu có nhiều ví dụ điều kiện, subquery, aggregate, `CASE`, join và thao tác dữ liệu.
- `INSERT` có thể chèn giá trị trực tiếp hoặc chèn từ `SELECT`; `UPDATE` cập nhật theo điều kiện; `DELETE` xóa dữ liệu theo điều kiện.
- `MERGE` dùng để đồng bộ source/target: nếu match thì update, nếu not match thì insert, hoặc xử lý delete tùy kịch bản.
- Stored Procedure giúp đóng gói logic, tăng tái sử dụng, bảo mật và tối ưu hóa. SP có thể có input/output parameter, return value, biến cục bộ, cấu trúc điều khiển `IF`, `WHILE`, `BEGIN...END`.
- Tài liệu nhấn mạnh cách gọi SP, truyền tham số, dùng output parameter và viết SP phục vụ nghiệp vụ.

### 3.5. Security, login, user và role

- SQL Server có nhiều lớp bảo mật: Windows/user hệ điều hành, login server, user database, role, owner và quyền trên object.
- Login là danh tính ở cấp server; database user ánh xạ login vào từng database; role gom quyền để cấp/thu hồi dễ hơn.
- System Administrator có quyền cao nhất; Database Owner sở hữu và quản trị database.
- Các stored procedure hệ thống trong tài liệu: tạo login, đổi password, cấp truy cập database, đưa login vào server role, xóa login, tạo/xóa role, thêm/xóa thành viên role.
- Quyền cần được kiểm soát theo nguyên tắc cấp vừa đủ: chỉ cấp quyền cần thiết cho user/role, thu hồi quyền không dùng.

### 3.6. Backup, restore và SQL Server Agent job

- Backup dùng để bảo vệ dữ liệu và phục hồi sau lỗi. Có thể backup toàn bộ database, differential, transaction log, file/filegroup.
- Backup device có thể tạo bằng `sp_addumpdevice`; backup cũng có thể trực tiếp ra disk/tape với `BACKUP DATABASE ... TO DISK`.
- Restore có các tùy chọn quan trọng như `NORECOVERY`, `RECOVERY`, `REPLACE`, `FILE`, `FILEGROUP`, restore full + differential + log.
- Khi restore cần chú ý database đang dùng, quyền thực hiện, thứ tự restore, trạng thái recovery và có ghi đè database hiện có hay không.
- SQL Server Agent job có thể tự động backup định kỳ: tạo job, step chạy lệnh backup, schedule theo thời gian, owner có quyền phù hợp.

### 3.7. Replication và nhân bản dữ liệu

- Replication dùng để sao chép/phân phối dữ liệu giữa server/database. Các vai trò chính gồm Publisher, Distributor, Subscriber, Publication, Article, Subscription.
- Các kiểu replication: Snapshot Replication, Transactional Replication, Merge Replication.
- Merge Replication phù hợp khi nhiều nơi có thể cập nhật và cần đồng bộ/hợp nhất thay đổi.
- Tài liệu hướng dẫn tạo publication/articles và các bước chuẩn bị môi trường nhân bản CSDL SQL Server 2014.

### 3.8. Transaction, distributed transaction và lock

- Transaction đảm bảo tính nhất quán khi thao tác nhiều bước; dùng `BEGIN TRANSACTION`, `COMMIT`, `ROLLBACK`, `SAVE TRANSACTION`.
- `BEGIN TRANSACTION WITH MARK` đánh dấu transaction trong log để phục hồi theo mốc.
- Distributed transaction dùng `BEGIN DISTRIBUTED TRANSACTION` và cần MS DTC điều phối commit/rollback giữa nhiều server.
- `SAVE TRANSACTION` không hỗ trợ trong môi trường distributed transaction; transaction-level snapshot isolation cũng không hỗ trợ distributed transactions trong tài liệu.
- Locking kiểm soát đồng thời; có thể dùng `@@LOCK_TIMEOUT` và `SET LOCK_TIMEOUT` để xem/đặt thời gian chờ lock.

### 3.9. Isolation level

- `READ UNCOMMITTED` cho phép dirty read, ít khóa nhưng rủi ro đọc dữ liệu chưa commit.
- `READ COMMITTED` tránh dirty read và là mức mặc định phổ biến, nhưng vẫn có thể gặp non-repeatable read/phantom tùy tình huống.
- `REPEATABLE READ` giữ khóa đọc để tránh non-repeatable read nhưng vẫn có thể có phantom.
- `SERIALIZABLE` cô lập mạnh nhất theo lock-based isolation, tránh phantom nhưng giảm concurrency.
- `SNAPSHOT` dùng row versioning để đọc snapshot nhất quán, cần bật cấu hình database phù hợp.

### 3.10. Cursor

- Cursor quản lý tập record trả về từ `SELECT`, cho phép xử lý từng dòng hoặc block nhỏ tại một thời điểm, thường dùng trong stored procedure/trigger khi logic set-based không phù hợp.
- Các bước chuẩn: `DECLARE CURSOR`, `OPEN`, `FETCH`, xử lý dòng, `CLOSE`, `DEALLOCATE`.
- Cursor có loại/thuộc tính như `LOCAL/GLOBAL`, `FORWARD_ONLY/SCROLL`, `STATIC/KEYSET/DYNAMIC/FAST_FORWARD`, `READ_ONLY/SCROLL_LOCKS/OPTIMISTIC`.
- `@@FETCH_STATUS` cho biết trạng thái lần fetch cuối; các thủ tục như `sp_cursor_list`, `sp_describe_cursor`, `sp_describe_cursor_columns`, `sp_describe_cursor_tables` giúp giám sát cursor.
- Cursor có thể được trả về từ stored procedure thông qua parameter `CURSOR VARYING OUTPUT`.

### 3.11. Trigger

- Trigger là đoạn T-SQL tự chạy khi có thao tác dữ liệu như `INSERT`, `UPDATE`, `DELETE` trên table/view.
- Trigger dùng bảng logic `inserted` và `deleted` để kiểm tra dữ liệu mới/cũ.
- Có thể dùng trigger để kiểm tra thao tác cập nhật dữ liệu, ràng buộc nghiệp vụ phức tạp, đồng bộ dữ liệu hoặc ghi log.
- Cần tránh trigger quá nặng hoặc giả định chỉ có một dòng, vì trigger trong SQL Server chạy theo tập dòng.

### 3.12. User Defined Function và built-in functions

- SQL Server hỗ trợ built-in functions và user-defined functions.
- UDF đóng gói logic thường dùng; có thể không có hoặc có tham số, trả về scalar hoặc table.
- UDF trả về table có thể được dùng trong mệnh đề `FROM`, khác với stored procedure trả result set.
- Nhóm quyền tạo hàm trong tài liệu: `db_owner`, `db_ddladmin`.
- Tài liệu có ví dụ `CubicVolume`, `FN_CHUANHOA` và các nhóm hàm Date/Time (`DATEADD`, `DATEDIFF`, `DATEPART`, `GETDATE`), Mathematical Functions, String Functions.

## 4. Nội dung chi tiết theo nguồn

Phần này giữ toàn bộ text và bảng đã trích xuất từ các file nguồn theo thứ tự bài học. Đây là phần tra cứu chi tiết khi cần cú pháp, ví dụ hoặc đoạn giải thích nguyên văn.

---

## 4.1. Chương 1 - Tổng quan về SQL Server

Nguồn: BaiGiangSQLServer2014/SQL1_SRVR2014.docx.

_Nguồn: BaiGiangSQLServer2014/SQL1_SRVR2014.docx._

## CHƯƠNG 1. TỔNG QUAN VỀ SQL SERVER

Mục đích: Biết được các thành phần thiết yếu của SQL SERVER

### I. KIẾN TRÚC MẠNG CỦA SQL SERVER

Kiến trúc của SQL SERVER phân chia các ứng dụng truy xuất cơ sở dữ liệu qua bộ điều khiển cơ sở dữ liệu (database engine). SQL SERVER chạy trên hệ điều hành NT cho phép kết nối đến nhiều hệ thống client qua mạng LAN hay Ethernet. Hệ thống client thông thường là các PCs chạy trên phần mềm client của SQL SERVER. SQL SERVER hỗ trợ cho các client trên các hệ điều hành sau:

Hình 1.1 : Hệ điều hành mà Client và Server của SQL Server có thể hoạt động

Bộ điều khiển cơ sở dữ liệu SQL SERVER chạy trên WINDOWS NT hay WINDOWS 9x. Các user truy xuất  cơ sở dữ liệu của SQL SERVER thông qua hệ thống client của nó. Nói cách khác, các client chạy trên các hệ thống client mạng của nó, trong khi đó, thành phần database server chỉ chạy trên hệ thống Server của SQL SERVER.

SQL SERVER sử dụng các mạng phổ biến như là Ethernet và Token Ring. SQL SERVER cũng sử dụng các giao thức phổ biến:  TCP/IP, Named Pipe, IPX/SPX, Apple’s AppleTalk.

Một trong những thuận lợi chính của SQL SERVER là nó có thể hợp nhất với các công cụ phát triển client/server và các ứng dụng như Excel, và Access. Cơ sở dữ liệu của SQL SERVER cũng có thể được truy xuất qua các ứng dụng: Visual Basic , Visual Foxpro, Visual C++, C#, Delphi, PowerBuilder…

Cơ sở dữ liệu của SQL SERVER có thể  được truy xuất với bộ điều khiển MicroSoft Jet Engine, Data Access Objects (DAO), Remote Data Objects (RDO), Activex Data Objects (ADO), ODBC, thư viện có sẵn của SQL SERVER, ….

SQL Server ComputerClient Computer

Hình 1.2-  Kiến trúc cilent/server của SQL SERVER.

Hình 1.2 minh họa chi tiết kiến trúc client/server của SQL SERVER. Trong phần trên của hình, ta thấy các ứng dụng client khác nhau sử dụng các giao tiếp lập trình ứng dụng  để truy xuất dữ liệu mà SQL SERVER cung cấp (API- Application Programming Interface). SQL SERVER có 3 API truy xuất dữ liệu chính : OLE DB, ODBC, và DB Library. Đối với các client trên Windows, tất cả các API này được cài đặt như thư viện kết nối động ( dynamic link library – DLL) và chúng liên lạc với SQL SERVER thông qua thư viện mạng client. Thư viện mạng client sử dụng 1 phương thức liên lạc bên trong mạng (IPC – interprocess communication) để giao tiếp với thư viện mạng của server (server network library).

Thư viện mạng của server nhận gói dữ liệu gởi từ client và trao chúng cho các dịch vụ mở dữ liệu  ( Open Data Services – ODS ; bao gồm tập hợp các macro và hàm trong C++). Bản thân SQL SERVER là 1 ứng dụng ODS, nó chấp nhận lời gọi ODS, xử lý chúng, và trả kết quả về cho ODS.

**Việc liên lạc giữa SQL server  và các các client được thực hiện theo thứ tự như sau:**

Ứng dụng client gọi OLE DB, ODBC, thư viện DB, hay API chứa SQL. Hành động này khởi tạo: bộ cung cấp OLE DB (OLE DB provider ), ODBC  driver, hay DB-Library DLL, để sử dụng cho các truyền thông của SQL server .

Bộ phận cung cấp OLE DB, ODBC driver  hay DB-Library DLL gọi một thư viện mạng client .Và sau đó thư viện mạng client gọi tới một IPC API.

Lời gọi của Client đến IPC API được truyền đến một thư viện mạng server bằng một IPC nằm bên dưới. Nếu nó là một IPC cục bộ ,thì lời gọi được truyền đi bằng cách sử dụng Windows operating IPC như: bộ nhớ chia sẻ hay local named pipes. Nếu nó là một IPC mạng, chồng giao thức mạng trên client sẽ sử dụng mạng để lin lạc với chồng giao thức mạng trn server.

Thư viện mạng server chuyển những yêu cầu của client đến CSDL SQL server.

Quá trình trả lời từ SQL server cho client sẽ theo chuỗi các hành động ngược lại như trên .

**II. CÁC DỊCH VỤ TRONG SQL SERVER:**

SQL SERVER có các dịch vụ (Hình 1.3)

Hình 1.3 Các dịch vụ của SQL Server

1.  Database Engine: Thành phần này chịu trách nhiệm lưu trữ, bảo mật dữ liệu và xử lý giao dịch nhanh chóng.

#### 2. Dịch vụ  tìm kiếm (Full text Search Service):

Dịch vụ  tìm kiếm Microsoft l một bộ máy tìm kiếm với chỉ mục   bằng văn bản (full-text).

Sử dụng Full-text Search bạn có thể tăng thêm chỉ mục trong một chuỗi, đặc biệt là giữ được từ trong chuỗi tìm kiếm bạn cần, mặt khác Full-text Search cũng không giới hạn chiều dài và dạng chuỗi tìm kiếm. Kỹ thuật này có khả năng tìm kiếm một ký tự , một từ, hay thậm chí cả một chuỗi.

3. Dịch vụ SQL Server (SQL Server Service): quản lý tất cả các file cơ sở dữ liệu. Nó có nhiệm vụ thi hành tất cả  các phát biểu SQL và cấp phát tài nguyên hệ thống.

Bộ xử  lý cơ sở dữ liệu SQL Server hoạt động như một dịch vụ trên Hệ điều hành Windows.

Khi nhiều Server của SQL server chạy trên cùng một máy tính thì mỗi Server có dịch vụ  SQL Server của riêng nó.

Lưu ý:  Muốn Start hay Stop một dịch vụ trong SQL Server, ta vào SQL Server Configuration Manager. Bảng dưới đây là các file của 5 version có trong dĩa C khi ta setup SQL Server:

**Bảng trích từ tài liệu:**

| SQL SERVER CONFIGURATION MANAGER |  |
| --- | --- |
| Version | Path |
| SQL Server 2019 | C:\Windows\SysWOW64\SQLServerManager15.msc |
| SQL Server 2017 | C:\Windows\SysWOW64\SQLServerManager14.msc |
| SQL Server 2016 | C:\Windows\SysWOW64\SQLServerManager13.msc |
| SQL Server 2014 (12.x) | C:\Windows\SysWOW64\SQLServerManager12.msc |
| SQL Server 2012 (11.x) | C:\Windows\SysWOW64\SQLServerManager11.msc |

SQL Server hỗ trợ 3 loại giao thức kết nối:

Shared Memory: client - SQL Server chạy trên cùng một máy, giao tiếp với nhau bằng shared memory protocol

TCP/IP: client - SQL Server tương tác với nhau ở mạng LAN, WAN

Named Pipes: client - SQL Server giao tiếp thông qua mạng LAN.

Dịch vụ SQL Server quản lý tất cả các file trong cơ sở dữ liệu của các Server SQL server . Đây là thành phần xử lý tất cả các câu lệnh giao tác được gởi đến từ các ứng dụng client và server. SQL server cũng hỗ trợ cho các truy vấn phân tán lấy dữ liệu từ nhiều nguồn tài nguyên khác ngoài SQL server.

Dịch vụ SQL Server chỉ ra vị trí các tài nguyên cho nhiều người dùng. Nó cũng áp đặt các luật hoạt động (business rules) được định nghĩa trong các thủ tục lưu trữ và các trigger, để bảo đảm tính nhất quán của dữ liệu ,và ngăn chặn các vấn đề luận lý xảy ra như có hai người cùng cố gắng để cập nhật cùng một dữ liệu tại một thời điểm .

#### 4. Dịch vụ SQL Server Agent:

SQL server Agent hỗ trợ các đặc tính cho phép lên kế hoạch sẵn cho các hoạt động theo chu kỳ trên SQL server, và khai báo đến người quản trị hệ thống các vấn đề xảy ra với server. Dịch vụ này cũng cần thiết trong lệnh nhân bản database (Replication). Các thành phần SQL server thực hiện chức năng này là :

Jobs:

Định nghĩa các đối tượng mà đối tượng này bao gồm một hay nhiều bước thực thi. Các bước là các câu lệnh giao tác SQL sẽ được thực thi. Các công việc có thể được lên kế hoạch để thực thi tại một thời điểm chỉ định trước,

**Alerts:**

Các cảnh báo được đưa ra khi các sự kiện xảy ra, như khi lỗi xảy ra, hay khi một cơ sở dữ liệu đạt tới một giới hạn vì bộ nhớ trống có sẵn không còn đủ nữa. Cảnh báo có thể được xác định để đưa ra các hành động giải quyết như gởi một email hay thực hiện một công việc nào đó để giải quyết vấn đề xảy ra.

5. MSDTC (MicroSoft Distributed Transaction Coordinator- Điều phối các lệnh trong giao tác phân tán): quản lý các giao tác, có trách nhiệm điều phối các giao tác của cơ sở dữ liệu trên nhiều server.

Bộ theo dõi hoạt động của giao tác phân tán Microsoft (The Microsoft Distributed Transaction Coordinator (MS DTC))  l một bộ quản lý giao tác cho phép các ứng dụng client tập hợp các tài nguyên dữ liệu phân tán cho một giao tác. Các MS DTC theo dõi việc chuyển các giao tác phân tán đến nơi an toàn xuyên qua các server tham gia trong giao tác

.

Các ứng dụng SQL server cũng có thể gọi trực tiếp MS DTC để bắt đầu một giao tác ngay lập tức. Một hay nhiều các server đang chạy SQL server có thể được chỉ dẫn để tuyển vào một giao tác phân tán và hoàn tất theo đúng cách của giao tác MS DTC.

#### Nhiều Server của Server SQL trên cùng một máy tính (Multiple Instances of SQL Server)

**1. Khái  niệm:**

SQL Server hỗ trợ nhiều Server của SQL Server chạy đồng thời trên cùng một máy tính. Mỗi Server của SQL server có cơ sở dữ liệu hệ thống của riêng nó và các cơ sở dữ liệu người dùng không được chia sẻ giữa các Server. Các ứng dụng có thể kết nối đến các Server trên một máy tính theo nhiều cách giống như dùng để kết nối các SQL Server đang chạy trên các máy tính khác nhau .

Có hai loại Server SQL Server:

**Server  mặc định (Default Instance )**

Server mặc định của SQL Server hoạt động giống như các bộ xử lý cơ sở dữ liệu trong các phiên bản trước đó của SQL Server. Server mặc định được nhận diện bằng tên của máy tính, không có một tên riêng biệt cho Server loại này. Khi các ứng dụng chỉ định tên máy tính để kết nối đến SQL server, thì các thành phần SQL Server client sẽ kết nối đến Server mặc định trên máy tính đó.

**Các Server đặt tên (Named Instance)**

Tất cả các Server khác của bộ xử lý cơ sở dữ liệu ngoài Server mặc định được nhận diện bằng tên của chúng. Các ứng dụng phải cung cấp cả tên máy tính và tên của Server đặt tên mà chúng muốn kết nối đến. Tên máy tính và tên Server được chỉ định có định dạng :  computer_name\instance_name.

Có thể có nhiều Server đặt tên chạy trên một máy tính. Khi bạn cài đặt nhiều Server, mỗi Server có một tên duy nhất.

**Làm việc với nhiều Server (Working with Multiple Instances)**

Các Server đặt tên hoạt động gần giống như các Server mặc định.Chỉ khác là phải có cả tên máy tính và tên của Server để nhận diện một Server đặt tên. Nếu chỉ định tên máy tính,thì ta sẽ làm việc với Server mặc định. Nếu chỉ định cả computername\instancename thì ta sẽ làm việc với Server đặt tên.

**SQL Server Management Studio.**

Bằng cách sử dụng SQL Server Management Studio bạn có thể đăng ký mỗi Server với các quyền hạn cho phép. Sau khi một Server được đăng ký, bạn có thể tạo, chỉnh sửa hay xóa bỏ các đối tượng trong các CSDL quan hệ với Server đó .

**Nhận diện các Server (Identifying Instances)**

Biến hệ thống @@SERVERNAME nhận diện tên của Server ở dạng servername\instancename khi kết nối đến một Server đặt tên. Nếu kết nối đến một Server mặc định @@SERVERNAME chỉ nhận diện servername.

### IV. TRANSACT-SQL   ( T-SQL)

SQL (Structured Query Language) là 1 ngôn ngữ cho phép truy xuất dữ liệu trong 1 cơ sở dữ liệu  quan hệ. Trong SQL SERVER, SQL được gọi là Transact-SQL; Transact SQL cũng tuân thủ các cú pháp của SQL chuẩn; Ngoài ra, nó còn cung cấp 1 số option mở rộng giúp ta truy vấn dữ liệu dễ dàng.

Transact-SQL thường được dùng trong các công việc để quản trị cơ sở dữ liệu như tạo bảng, tạo field, xóa field, xóa bảng..viết các thủ tục. Nó còn cho phép thay đổi cấu hình của SQL SERVER. Transact-SQL có 3 loại:

- Data Definition Language (DDL): create  database, create table, create view ….

- Data Manipulation Language (DML): select, update, delete, insert into, merge

- Data Control Language (DCL): dùng để điều khiển cho phép truy xuất dến các đối tượng cơ sở dữ liệu qua các lệnh GRANT và REVOKE.

### V. KIẾN TRÚC CƠ SỞ DỮ LIỆU TRONG SQL SERVER:

### Hình 1.8: Kiến trúc cơ sở dữ liệu trong Sql Server

1. Server: bộ điều khiển cơ sở dữ liệu. Bộ điều khiển cơ sở dữ liệu có nhiệm vụ xử lý các yêu cầu về cơ sở dữ liệu, và trả kết quả sau khi xử lý cho client.

2. Cơ sở dữ liệu : Mỗi SQL SERVER chứa nhiều cơ sở dữ liệu, trong đó, mỗi cơ sở dữ liệu được duy trì trong 1 hoặc nhiều file. Mặc định, tiến trình cài đặt SQL SERVER tạo 4  cơ sở dữ liệu hệ thống:  master, model, msdb, và tempdb. Mỗi cơ sở dữ liệu sẽ có 1 file nhật ký (log file) tương ứng để chứa các giao tác trên cơ sở dữ liệu.  Ta có 2 loại cơ sở dữ liệu : SystemDatabase và User database

master: cơ sở dữ liệu ghi tất cả những thông tin mức hệ thống của SQL Server. Nó ghi tất cả login accounts và tất cả những lựa chọn cấu hình hệ thống. master là một cơ sở dữ liệu ghi sự tồn tại của tất cả những cơ sở dữ liệu khác, bao gồm vị trí của file cơ sở dữ liệu, thông tin khởi tạo cho SQL Server,.Ví dụ, một số Table của master chứa các thông tin hệ thống như:

**Bảng trích từ tài liệu:**

| Tên Table | Mô tả |
| --- | --- |
| sysconfigures | Mỗi row chứa tuỳ chọn cấu hình được thiết lập sẵn bởi SQL Server |
| sysdatabases | Mỗi row chứa thông tin một cơ sở dữ liệu của SQL Server. Khi vừa được cài đặt, sysdatabase được khởi tạo với thông tin của các cơ sở dữ liệu master, model, msdb, tempdb |
| syslogins | Mỗi row chứa một login account để đăng nhập vào SQL Server |
| sysusers | Mỗi row chứa tên một user có thể truy cập tới cơ sở dữ liệu. |
| sysservers | Mỗi row chứa một server mà SQL Server có thể truy cập tới. |
| sysobjects | Mỗi row chứa tên 1 đối tượng trong cơ sở dữ liệu: tên user table (xtype =’U’), tên view (xtype =’V’), tên Stored Procedure (xtype =’P’), … |

Tip: Không được thay đổi master database, và nên tạo bản backup của master database thường xuyên.

Model Database: là 1 template cơ sở dữ liệu mà SQL SERVER dùng để hỗ trợ tạo cơ sở dữ liệu mới. Khi 1 cơ sở dữ liệu của user được tạo, SQL SERVER sẽ tạo 1 bản copy của model database. Model database chứa các bảng hệ thống được dùng trong mỗi database.

Các table hệ thống theo dõi các option của cơ sở dữ liệu (thiết lập mặc định, quyền hạn của user (user authority, và các ràng buộc trong cơ sở dữ liệu). Thay đổi model database sẽ ảnh hưởng tới tất cả các cơ sở dữ liệu được tạo mới.

Tip: Ta có thể trao các giá trị ngầm định, ràng buộc toàn vẹn, và quyền truy xuất của user cho các cơ sở dữ liệu mới bằng cách thay đổi model database.

msdb: được dùng bởi SQL Server Agent để lập lịch cho alert và job, và ghi những toán tử. Ví dụ như Table backupset chứa thông tin các tập sao lưu (backup set) với các trường như:

name: tên tập sao lưu

description: những mô tả về tập sao lưu

user_name: tên của user thực hiện quá trình sao lưu

database_creation_date: ngày & giờ tạo cơ sở dữ liệu gốc

backup_start_date: ngày & giờ tiến trình sao lưu bắt đầu

backup_finish_date: ngày & giờ tiến trình sao lưu hoàn tất

type: kiểu sao lưu

Tempdb database: để SQL SERVER lưu trữ các table tạm. Nó được tạo lại mỗi lần SQL SERVER khởi động. Tempdb là 1 tài nguyên dùng chung, do đó, tất cả các user đều có quyền truy xuất tới nó. Tất cả các table được tạo trong tempdb đều được tự động xóa khi user thoát khỏi SQL SERVER.

Mỗi cơ sở dữ liệu trong SQL Server chứa những Table hệ thống ghi dữ liệu cần thiết cho những thành phần SQL Server. Sự điều hành thành công của SQL Server tuỳ thuộc vào sự toàn vẹn thông tin trong những Table hệ thống; vì thế, Microsoft không hỗ trợ user cập nhật trực tiếp những thông tin trong Table hệ thống.

3. Các đối tượng cơ sở dữ liệu:  Cơ sở dữ liệu của SQL SERVER có các đối tượng để lưu trữ dữ liệu, các ràng buộc về dữ liệu (Diagrams, Table, Column), và các đối tượng xử lý dữ liệu( View, Stored Procedures, User Defined Function, Trigger ).

a. Table:  là thành phần lưu trữ dữ liệu chính của cơ sở dữ liệu. Tất cả dữ liệu trong cơ sở dữ liệu của SQL Server được chứa trong Table. Mỗi Table biểu diễn một vài loại đối tượng có ý nghĩa đối với user. Ví dụ như trong cơ sở dữ liệu trường học  sẽ tìm thấy một Table LOP, một Table GIAOVIEN, một Table SINHVIEN…

Những Table SQL Server có 2 thành phần chính :

Cột : mỗi cột biểu diễn một thuộc tính nào đó của đối tượng được xây dựng trong Table, ví dụ như trong Table có những cột cho ID(mã), họ, tên…

Hàng : mỗi hàng biểu diễn cho một sự xuất hiện riêng lẻ của đối tượng được xây dựng trong Table, ví dụ như trong Table CONGTY có một hàng đại diện cho một công ty.

SQL Server có 3 loại Table: Table hệ thống, Table tạm  và Table của user.

**Những Table hệ thống:**

SQL Server lưu trữ dữ liệu định nghĩa cấu hình của server và tất cả những Table của nó trong một tập những Table đặc biệt được biết đến như là những Table hệ thống (bắt đầu bởi sys). User không thể cập nhật những Table hệ thống này một cách trực tiếp. Những Table hệ thống có thể thay đổi từ phiên bản này đến phiên bản khác.

**Bảng trích từ tài liệu:**

| Sysallocations | Sysdevices | Syscolumns |
| --- | --- | --- |
| Sysmembers | syslanguages | sysprocesses |
| Syscharsets | Syslockinfo | sysremotelogins |
| Sysconfigs | Syslogins | sysservers |
| Syscurconfigs | Sysusers | Sysdatabases |

Các table hệ thống trong cơ sở dữ liệu master

**Table tạm :**

SQL Server hỗ trợ những Table tạm. Những Table này có tên bắt đầu với một ký hiệu (#). Nếu một Table tạm không bị xóa trước khi user ngắt kết nối, SQL Server tự động huỷ Table tạm này. Những Table tạm không được lưu trữ trong cơ sở dữ liệu hiện hành, chúng được lưu trữ trong cơ sở dữ liệu tempdb.

Có 2 loại Table tạm:

Table tạm cục bộ: tên của những Table này bắt đầu với một ký hiệu (#). Những Table này chỉ hữu hình với những kết nối tạo ra chúng.

Table tạm toàn cục: tên của những Table này bắt đầu với 2 ký hiệu (##). Những Table này hữu hình với tất cả các kết nối. Nếu những Table này không bị huỷ trước khi kết nối tạo ra chúng bị ngắt, chúng sẽ tự động bị huỷ ngay sau khi user tạo ra nó kết thúc kết nối.

Lưu ý: Lệnh tạo table tạm không được đặt trong View

**Làm việc với Table của user:**

User làm việc với dữ liệu trong Table bằng cách sử dụng ngôn ngữ thao tác dữ liệu (DML) của phát biểu SQL

-- Lấy danh sách tất cả nhân viên có tên Smith:

SELECT emp_first_name, emp_last_name

FROM employee

WHERE emp_last_name = 'Smith'

-- Xóa một nhân viên:

DELETE employee

WHERE emp_id = 'OP123'

-- Thêm một nhân viên mới:

INSERT INTO employee

VALUES ( 'OP456', 'Dean', 'Straight', '01/01/1960')

-- Thay đổi tên nhân viên:

UPDATE employee

SET emp_last_name = 'Smith'

WHERE emp_id = 'OP456'.

b. Column: Mỗi table có nhiều cột liên hệ với nhau. Mỗi cột (field) sẽ có tên và kiểu dữ liệu tương ứng. Dưới đây là các kiểu dữ liệu được dùng trong SQL SERVER:

**Bảng trích từ tài liệu:**

| Binary | Date | Bit | Char | datetime |
| --- | --- | --- | --- | --- |
| Decimal | Float | Image | Int, Bigint | Money |
| Nchar | ntext | nvarchar | Numeric | Real |
| Smalldatetime | smallint | Smallmoney | SQL_variant | sysname |
| Text | timestamp | Tinyint | varbinary | varchar |
| Uniqueidentifier | Time |  |  |  |

SQL Server cũng hỗ trợ kiểu Table mà có thể được dùng để lưu trữ tập kết quả của một phát biểu SQL. Kiểu dữ liệu Table này không thể dùng cho một cột trong Table. Nó chỉ có thể dùng cho những tham biến của Transact-SQL hoặc những giá trị trả về của một hàm do user định nghĩa.

User cũng có thể tạo ra những kiểu dữ liệu của họ do chính user định nghĩa, ví dụ như:

-- Tạo kiểu dữ liệu birthday cho phép giá trị NULL.

EXEC sp_addtype birthday, datetime, 'NULL'

**GO**

-- Tạo một Table sử dụng kiểu dữ liệu mới.

CREATE TABLE employee

(emp_id         char(5),

emp_first_name   char(30),

emp_last_name   char(40),

emp_birthday      birthday)

Một kiểu dữ liệu do user định nghĩa tạo ra một cấu trúc Table có ý nghĩa hơn cho những người lập trình viên giúp bảo đảm rằng những cột lưu giữ các lớp dữ liệu giống nhau có cùng kiểu dữ liệu cơ bản.

Kiểu dữ liệu SQL-variant của SQL Server là một kiểu dữ liệu đặc biệt mà cho phép lưu trữ những giá trị của nhiều kiểu dữ liệu cơ bản trong cùng một cột. Ví dụ có thể lưu trữ những giá trị kiểu nchar, kiểu int , kiểu decimal trong cùng một cột.

**Giá trị NULL:**

Giá trị NULL là một giá trị đặc biệt trong cơ sở dữ liệu, nó biểu diễn khái niệm về một giá trị chưa biết. NULL không giống với một ký tự khoảng trắng (blank) hay một ký tự 0. Khoảng trắng thực chất l một ký tự hợp lệ và 0 là một số hợp lệ. NULL biểu diễn một cách đơn giản việc chúng ta không biết giá trị này là cái gì. NULL cũng khác với một chuỗi có độ dài bằng 0. Nếu định nghĩa một cột có mệnh đề NOT NULL, nghĩa là không thể thêm những hàng có giá trị NULL trên cột đó. Nếu định nghĩa một cột có từ khoá NULL, nó chấp nhận những giá trị NULL.

Việc cho phép những giá trị NULL trong một cột có thể làm tăng sự phức tạp của những so sánh luận lý sử dụng trong cột đó. Để tính tóan ta phải dùng hàm IsNull( thamsố1, thamsố2) để chuyển NULL về 1 giá trị xác định.

Hàm IsNull sẽ kiểm tra nếu thamsố1=NULL thì hàm sẽ trả về giá trị của thamsố2; ngược lại thì hàm sẽ trả về giá trị của thamsố1.

c. Index:  để tăng tốc độ truy xuất dữ liệu trong SQL SERVER. Có 2 kiểu index trong SQL SERVER:

Cluster Index (mặc định theo khóa chính của Table): yêu cầu SQL SERVER lưu trữ dữ liệu trong table cơ sở theo thứ tự như cluster index. Phụ thuộc vào phương thức truy xuất dữ liệu, mà ta có thể cải thiện đáng kể tốc độ truy xuất.  Mỗi table chỉ có duy nhất 1 cluster index.

Noncluster Index: không thay đổi cách thức dữ liệu được lưu trữ trong base table. Một noncluster index có thể có 1 hay nhiều field, cùng với 1 con trỏ chỉ tới dữ liệu được chứa trong table. Có tối đa 1024 noncluster index trong 1 table.  Loại chỉ mục này được dùng để tăng hiệu suất truy vấn, hoặc thay cho Order By trong lệnh Select (Order By thuộc 1 trong các trường hợp làm Select chậm)

d. View: Một View có thể hiểu là một Table ảo hoặc là một truy vấn (query) được lưu trữ. View trả về một tập kết quả của phát biểu SELECT tạo thành Table ảo. User có thể dùng những Table ảo này bằng cách tham chiếu đến tên View trong những phát biểu Transact-SQL tương tự như tham chiếu một Table. Một View được dùng để thực hiện bất kỳ hoặc tất cả các chức năng sau:

Giới hạn một user chỉ đọc được những hàng trong một Table: ví dụ, cho phép chỉ xem những nhân viên hiện còn đang làm việc tại công ty .

Giới hạn một user chỉ định những cột: ví dụ, cho phép những nhân viên không làm việc trên Table lương: được xem những cột: tên, văn phòng, số điện thoại làm việc, và phòng ban trong Table Nhân viên, nhưng không cho phép họ xem bất kỳ cột nào chứa thông tin lương.

Nhóm những cột từ nhiều Table để xem như một Table.

Thống kê thông tin thay cho những chi tiết cung cấp: ví dụ, biểu diễn tổng của một cột, hoặc giá trị lớn nhất / nhỏ nhất của một cột.

Những View được tạo bằng việc định nghĩa phát biểu SELECT sẽ tìm kiếm dữ liệu cho View đó hiển thị và những Table được tham chiếu bởi phát biểu SELECT đó gọi là những Table cơ sở (base table) của View đó. Trong ví dụ này, V_CT_DATHANG titleview trong cơ sở dữ liệu QLVT là một View lọc ra dữ liệu từ 3 Table cơ sở để biểu diễn một Table ảo của dữ liệu các đơn đặt hàng, và chi tiết của đơn đặt hàng:

CREATE VIEW V_CT_DATHANG

AS

SELECT DH.MasoDDH, NV.MANV, HO, TEN, MAVT, CT.SOLUONG, CT.DONGIA,

TRIGIA=CT.SOLUONG * CT.DONGIA

FROM DonDatHang DH

INNER JOIN NhanVien NV ON DH.MANV=NV.MANV

INNER JOIN CTDDH CT ON DH.MasoDDH=CT.MasoDDH

Ta có thể tham chiếu đến V_CT_DATHANG trong những phát biểu tương tự như tham chiếu đến một Table:

SELECT *

FROM V_CT_DATHANG

View trong tất cả những phiên bản của SQL Server đều có thể cập nhật (có thể thực hiện những phát biểu UPDATE, DELETE hoặc INSERT), cùng với những thay đổi ảnh hưởng đến một vài Table gốc mà được tham chiếu bởi View. Ví dụ: Thay đổi tên của nhân viên có mã NV =4

UPDATE V_CT_DATHANG

SET HO=N'Thái Hoàng'

WHERE MANV=4

Nhưng chúng ta không thể cập nhật dữ liệu đối với những View có hàm thống kê.

Lưu ý: View không chấp nhận tham số từ user truyền vào.

e. Constraint (Ràng buộc): đảm bảo sự toàn vẹn về dữ liệu trong table. Ràng buộc thường được đưa vào khi ta tạo cấu trúc cho Database, và chúng tồn tại dưới 2 mức: table và column. SQL SERVER hỗ trợ 5 loại ràng buộc cứng sau:

i/ Primary Key : khóa chính

ii/ Foreign key : khóa ngoại

iii/ Unique key: khóa duy nhất; nó không cho phép dữ liệu trùng trên 1 cột nào đó; không giống như  Primary key, Unique key cho phép dữ liệu null.

iv/ Check: ràng buộc về miền giá trị

v/ Not Null: yêu cầu dữ liệu trong 1 field không được chứa giá trị Null.

f. Rule: giới hạn các giá trị đưa vào field. Nhưng không giống như Check, 1 rule có thể giới hạn dữ liệu qua 1 biểu thức điều kiện hay qua 1 danh sách các giá trị.

Ví dụ: tạo một Rule mà khi thực thi thì có chức năng giới hạn cust_id trong phạm vi từ 0 đến 10000.

CREATE RULE id_chk AS @id BETWEEN 0 and 10000

**GO**

CREATE TABLE cust_sample

(

cust_id            int   PRIMARY KEY,

cust_name         char(50),

cust_address         char(50),

cust_credit_limit   money,

)

**GO**

sp_bindrule id_chk, 'cust_sample.cust_id'

**GO**

Muốn bỏ Rule đã áp dụng trên field :
sp_unbindrule  'cust_sample.cust_id'

g. Default: dùng để gán giá trị ngầm định cho 1 field khi field đó chưa có dữ liệu.

Giá trị Default có thể là : Hằng số, hàm được xây dựng sẵn, biểu thức

Có 2 cách để áp dụng Default:

Tạo một định nghĩa Default dùng từ khoá DEFAULT trong CREATE TABLE để ấn định biểu thức hằng là Default trên một cột. Đây là một phương pháp chuẩn thường được sử dụng.

Tạo một đối tượng Default sử dụng phát biểu CREATE DEFAULT, sau đó liên kết nó với cột trong table qua  SP hệ thống sp_bindefault. Đây là tính năng cho phép có thể thay đổi giá trị mặc định cho hàng loạt các cột trong các tables 1 cách nhanh chóng.

Ví dụ sau đây tạo ra một Table sử dụng một trong những loại Default. Nó tạo ra một đối tượng Default để ấn định Default cho một danh hiệu, và gắn đối tượng Default đó vào cột. Sau đó nó kiểm tra việc chèn thêm mà không xác định giá trị cho những cột với những Default.

USE pubs

**GO**

CREATE TABLE test_defaults

(keycol      smallint,

process_id   smallint DEFAULT @@SPID,   --định nghĩa Default

date_ins   datetime DEFAULT getdate(),   --định nghĩa Default

mathcol      smallint DEFAULT 10 * 2,   --định nghĩa Default

char1      char(3),

char2      char(3) DEFAULT 'xyz') --định nghĩa Default

**GO**

/* Chỉ minh họa, thay cho sử dụng định nghĩa Default.*/

CREATE DEFAULT abc_const AS 'abc'

**GO**

sp_bindefault abc_const, 'test_defaults.char1'

**GO**

INSERT INTO test_defaults(keycol) VALUES (1)

**GO**

SELECT * FROM test_defaults

**GO**

h. Thủ tục (Stored Procedure):  là 1 nhóm các phát biểu Transact-SQL đã được compile thành 1 chương trình con. Thủ tục là 1 công cụ rất mạnh và linh hoạt được dùng để thực hiện việc quản trị cơ sở dữ liệu, cũng như thao tác trên dữ liệu như tạo table ảo, cấp quyền, cập nhật dữ liệu…

Khi 1 thủ tục đã được compile, SQL Server sẽ tối ưu việc truy xuất dữ liệu mà thủ tục sẽ thực hiện. Các thủ tục có thể trả về các tham số, 1 tập các giá trị, hoặc đơn giản chỉ thi hành 1 công việc tự động nào đó ngầm trong hệ thống. Một thủ tục có thể được dùng chung cho nhiều user. Mỗi thủ tục có thể nhận tối đa 1024 tham số, và nó có thể được thực hiện trên 1 hệ thống SQL Server cục bộ hay từ xa.

i. Trigger: Một trigger là 1 thủ tục được tự động thực hiện khi ta thay đổi dữ liệu trong 1 table của SQL SERVER qua các lệnh Update, Insert, hay Delete. Giống như 1 thủ tục thông thường, 1 trigger sẽ chứa 1 tập các phát biểu của Transact-SQL. Trigger thường được dùng để kiểm tra các ràng buộc toàn vẹn trong cơ sở dữ liệu, hoặc tự động thực thi 1 nhiệm vụ nào đó để đảm bảo sự nhất quán về dữ liệu.

## j. Hàm do người dùng định nghĩa (User-defined Functions- UDF):

## Microsoft SQL Server hỗ trợ 2 loại hàm:

## Những hàm được cài đặt sẵn (Built-in Functions): có sẵn của hệ thống, ví dụ như IsNull, getdate, datediff, dateadd…

## Những hàm người dùng định nghĩa (User-defined Functions): cho phép định nghĩa những hàm Transact-SQL qua phát biểu CREATE FUNCTION.

## Những hàm do người dùng định nghĩa có thể không có hoặc có tham số vào , và trả về một giá trị đơn giản như int, char, decimal…hoặc có thể trả về 1 tập các records.

_Tài liệu có 9 ảnh/đối tượng media nhúng; phần chữ đã được trích xuất từ OOXML, ảnh được ghi nhận theo thống kê nguồn._

---

## 4.2. Chương 2 - Cài đặt, SSMS, quản lý server và database

Nguồn: BaiGiangSQLServer2014/SQL2_SRVR2014.docx.

_Nguồn: BaiGiangSQLServer2014/SQL2_SRVR2014.docx._

CHƯƠNG 2.	HỆ QUẢN TRỊ SQL SERVER

**I. CÀI ĐẶT SQL SERVER: Xem file hướng dẫn cài đặt**

II. CÁC THUỘC TÍNH CỦA MS SQL Server Management Studio: cho phép người phát triển hệ thống cấu hình lại trình quản lý theo ý mình

Chọn lệnh: Tools / Options từ cửa sổ chính của MS SQL Server Management Studio.

**Environment/ General:**

**Query Execution:**

a. General:  thiết lập số dòng tối đa trả về trước khi server dừng thực thi truy vấn. Nếu ta muốn khống chế số dòng tối đa được xử lý trong 1 lệnh DML thì dùng lệnh SET ROWCOUNT <n>.

b. Advanced: thiết lập các thông số khi thực thi query :

- SET NOCOUNT ON vào Stored Procedures để dừng thông báo về số dòng được thực thi bởi câu lệnh T-SQL. Điều này làm giảm giao dịch mạng, bởi vì máy khách sẽ không nhận được thông báo về số dòng bị tác động bởi câu lệnh T-SQL.

-Khi SET NOEXEC ON được đặt ở đầu truy vấn, truy vấn sẽ được biên dịch nhưng không được thực thi.

- Khi SET CONCAT_NULL_YIELDS_NULL được BẬT (ON), việc nối giá trị null với một chuỗi sẽ mang lại kết quả NULL. Ví dụ: SELECT 'abc' + NULL trả lại NULL. Khi SET CONCAT_NULL_YIELDS_NULL TẮT, việc ghép một giá trị null với một chuỗi sẽ tạo ra chính chuỗi đó (giá trị null được coi là một chuỗi trống). Ví dụ: SELECT 'abc' + NULL trả lại abc.

**c. Designers/Table and Database Designers:**

**d. SQL Server Object Explorer/Command**

**III. ĐĂNG KÝ VÀ HỦY ĐĂNG KÝ MỘT SERVER TRONG SQL Server Management Studio:**

**1. Đăng ký Server:**

Để có thể quản lý 1 Server cục bộ (local) hay từ xa (remote) với MS SQL Server Management Studio, ta phải đăng ký server đó với MS SQL Server Management Studio. Ta chọn lệnh View / Registered  Server:

Để đăng ký, right click trên cửa sổ, chọn New Server Registration

- Server Name : Nhập vào tên Server muốn đăng ký.

- Authentication:

+ Windows Authentication: sử dụng user name của Win làm login name

+ SQL Server Authentication: đặt 1 login name và 1 password để truy cập tới SQL Server .

Hủy đăng ký: Muốn hủy thông tin đăng ký, right click trên tên Server , chọn Delete  .

**IV. THIẾT LẬP CÁC THUỘC TÍNH CỦA SERVER:**

Lệnh: Trong cửa sổ Object Explorer, right click trên tên server / Properties

Cửa sổ thuộc tính của server có 8 tabs: General, Memory, Processors, Security, Connections,  Database Settings, Advanced và Permissions.

General: cho ta biết thông tin của sản phẩm và thông tin về phần cứng cũng như hệ điều hành;

2. Memory: cho phép ta chỉ ra bộ nhớ cần thiết cho server họat động. Tốt nhất ta nên chấp nhận giá trị mặc định của SQL Server.

Ví dụ: Nếu ta đang chạy các application khác trên cùng 1 NT Server và muốn giới hạn bộ nhớ tối đa mà SQL Server dùng thì điều chỉnh trong Maximum (MB)

.

3. Processor: chỉ ra SQL Server dùng 1 con vi xử lý hay nhiều con vi xử lý như thế nào? Trong 1 môi trường đa xử lý, ta có thể chỉ ra SQL Server sử dụng con vi xử lý nào.

Security:  cho phép ta xác định quyền vào SQL Server.

5. Connection : cung cấp các options cho việc kết nối giữa client và remote server, và các thiết lập mặc định khi thực thi các thủ tục trên Server.

6. Database setting : cho phép ta chỉ ra giá trị mặc định trong việc tạo index, thực hiện việc backup/restoring dữ liệu .

7. Advanced:

**V. QUẢN LÝ CƠ SỞ DỮ LIỆU VÀ CÁC ĐỐI TƯỢNG CƠ SỞ DỮ LIỆU:**

1. Tạo mới cơ sở dữ liệu: Tạo cơ sở dữ liệu QLVT để chứa các Table  : Right click folder Database / New Database

General : ta nhập vào tên cơ sở dữ liệu ở textbox Database Name

Nút lệnh Add cho phép thêm file vào cơ sở dữ liệu.

Click …cho phép ta thiết lập cách thức SQL Server sẽ cấp phát thêm dung lượng cho file để lưu dữ liệu.

Option :

Options:

-  Restrict access: giới hạn quyền truy xuất dữ liệu.
	+ Restricted Users : chỉ có các user là thành viên của các nhóm db_owner, dbcreator, or sysadmin mới được sử dụng cơ sở dữ liệu (đề nghị : chọn khi cần)

+ Single user : tại 1 thời điểm, chỉ 1 user được truy xuất cơ sở dữ liệu  (đề nghị : chọn khi cần)

+ Multi User : giá trị mặc định

- Database Read-Only = True : các user chỉ được quyền lấy dữ liệu từ cơ sở dữ liệu  nhưng không được hiệu chỉnh. (đề nghị : chọn khi cần)

**2. Các folder trong cơ sở dữ liệu :**

Ta có thể thực hiện 1 số thao tác chung trên các folder hay trên các đối tượng của chúng:

- Tạo 1 đối tượng mới : right click trên folder / New <Object>

- Hiển thị hay thay đổi thuộc tính của đối tượng : double click trên đối tượng.

- Copy table, view, diagram : Right click / copy

- Đổi tên Table, View, Stored Procedure, Rule , Default … : Right click / Rename

- Xóa đối tượng: chọn đối tượng, ấn phím Del hay Right click/Delete

a. Tạo Table : cho phép ta định nghĩa tên field và thuộc tính của field

Ví dụ: Tạo cấu trúc Table Sinhvien:

* Các kiểu dữ liệu của Field:

Bit 	: 0, 1

Binary (length) 	: 1.. 8000 bytes (Fix)

VarBinary(max_length) 	: 1..8000 bytes

Image 	: lên tới 2,147,483,647 bytes

Char, nChar (length) 	: 1.. 8000 bytes (Fix)

Varchar, nVarchar (max_length) 	: 1..8000 bytes

Text, nText 	: lên tới 2,147,483,647 bytes

Dec (precision, scale) 	: precision là số các chữ số (1..38). scale là số các chữ số 		   bên phải dấu chấm thập phân (0.. precision)

TinyInt 	: 1 byte , 0..255

SmallInt 	: 2 bytes, -32768.. 32767

Int  	: bốn bytes, -2,147,483,648.. 2,147,483,647

Float 	: số bit để biểu diễn số thực động

Double Precision 	: giống với float

Real 	: tương đương với Float(24), có 7 chữ số phần nguyên

SmallMoney 	: có 4 chữ số phần thập phân (-214,748.3648 .. 214,748.3647)

Money 		: có 8 chữ số phần thập phân 			(922,337,203,685,477.5808 	922,337,203,685,477.5807)

SmallDateTime 		: 1-1-1900 .. 6-6-2079

Date Time 		: 1-1-1753 .. 31-12-9999

Để cấp quyền truy cập table SINHVIEN : vào trang thuộc tính của table, chọn  Permission, chọn user muốn cấp quyền:

Nếu ta click trên nút lệnh Column Permissions thì ta sẽ phân quyền trên từng cột của Table:

b. Thay đổi cấu trúc table : Right click trên tên table / Design Table

Hiện lại cửa sổ như ta nhập cấu trúc mới cho table.

c. Xóa table : Right click trên tên tabler muốn xóa, chọn Delete

d. Đổi tên table : Right click trên tên tabler muốn đổi tên, chọn Rename.

**e. Các đối tượng cơ sở dữ liệu thường dùng:**

- View, Stored Procedure, Function: lưu tên các đối tượng xử lý dữ liệu của cơ sở dữ liệu.

- Security: lưu tên các nhóm (role), người dùng (user) được quyền xử lý dữ liệu của cơ sở dữ liệu.

_Tài liệu có 23 ảnh/đối tượng media nhúng; phần chữ đã được trích xuất từ OOXML, ảnh được ghi nhận theo thống kê nguồn._

---

## 4.3. Chương 3 - DDL và đối tượng cơ sở dữ liệu

Nguồn: BaiGiangSQLServer2014/SQL3_SRVR2014.docx.

_Nguồn: BaiGiangSQLServer2014/SQL3_SRVR2014.docx._

## CHƯƠNG 3. SQL Primer: Data Definition Language (DDL)

## CÁC ĐỐI TƯỢNG CƠ SỞ DỮ LIỆU

I. TẠO CƠ SỞ DỮ LIỆU: Để tạo được cơ sở dữ liệu, ta login vào với loginname là sa hay với 1 loginname có quyền tạo cơ sở dữ liệu.

Cú pháp:  Create Database <tenCSDL>

Ví dụ1: Create Database QLVT

- Trên dĩa sẽ có 2 files: qlvt_data.mdf và qlvt_log.ldf

Ngoài ra, ta có thể chỉ định các tham số cần thiết cho việc tạo cơ sở dữ liệu, chẳng hạn như:

**Create Database QLVT**

### On Primary

( Name = Qlvt1,

Filename	= 'c:\thu\data\qlvt1.mdf' ,

Size	= 10MB ,

MaxSize	= 100MB,

FileGrowth	= 10MB)

**Log On**

( Name 	= QlvtlLog,

Filename	= 'c:\thu\data\qlvt1_log.ldf' ,

Size	= 10MB ,

MaxSize	= 100MB,

FileGrowth	= 10MB)

Các giá trị mặc định:

- Size: dựa vào kích thước của file model.mdf

- MaxSize : không giới hạn

- FileGrowth : 10%

Sau khi tạo xong 1 cơ sở dữ liệu, ta có thể:

* Thêm 1 file vào  cơ sở dữ liệu đã được tạo:

### Alter Database QLVT

**Add File**

( Name = Qlvt2,

Filename	= 'c:\thu\data\qlvt2.Ndf' ,

Size	= 10MB ,

MaxSize	= 100MB,

FileGrowth	= 10MB)

*  Xóa 1 file khỏi cơ sở dữ liệu QLVT:

**Alter Database QLVT**

**Remove  File Qlvt2**

* Hiệu chỉnh lại các tùy chọn đã định:

**Alter Database QLVT**

**Modify  File**

( Name = Qlvt1,

FileGrowth	= 5MB)

* Xóa toàn bộ cơ sở dữ liệu : Drop Database QLVT

Lưu ý: Ta có thể tạo 1 cơ sở dữ liệu trong SQL Server qua công cụ Enterprise Manager (xem V trong chương 2)

**II. TẠO TABLE:**

Cho cơ sở dữ liệu QLVT, trong đó có các Table sau :

a.  Table Nhanvien

**Bảng trích từ tài liệu:**

| Field Name | Type | Constraint |
| --- | --- | --- |
| MANV | int | Primary key |
| HO | nvarchar(40) | Not Null |
| TEN | nvarchar(10) | Not Null |
| PHAI | nvarchar(3) | Default : ‘Nam’ |
| DIACHI | nvarchar(50) | Not Null, Default : ‘ ‘ |
| NGAYSINH | Date |  |
| LUONG | Money | >=5000000 và <=20000000 Default : 5000000 |
| GHICHU | nText |  |

**b.  Table Kho:**

**Bảng trích từ tài liệu:**

| Field Name | Type | Constraint |
| --- | --- | --- |
| MAKHO | nChar(2) | Primary Key |
| TENKHO | nvarchar(30) | Unique, Not Null |
| DIACHI | nvarchar(70) | Not Null |

**c. Table Vattu:**

**Bảng trích từ tài liệu:**

| Field Name | Type | Constraint |
| --- | --- | --- |
| MAVT | nChar(4) | Primary Key |
| TENVT | nvarchar(30) | Unique, Not Null |
| DVT | nvarchar(15) | Default : ‘ ‘; Description : đơn vị tính |

d. Table Phatsinh:

**Bảng trích từ tài liệu:**

| Field Name | Type | Constraint |
| --- | --- | --- |
| PHIEU | nChar(8) | Primary Key |
| NGAY | DateTime | Default : GETDATE() |
| LOAI | nChar(1) | chỉ nhận ‘N’, ‘X’, ‘T’, ‘C’ Default : ‘N’ |
| HOTEN | nvarchar (40) | Description: ho ten khach hang |
| MANV | int | Foreign key |

-Table CT_Phatsinh:

**Bảng trích từ tài liệu:**

| Field Name | Type | Properties |
| --- | --- | --- |
| PHIEU | nChar(8) | Foreign key |
| MAVT | nChar(4) | Foreign key |
| SOLUONG | int | >0 |
| DONGIA | money | >0 |
| MAKHO | nChar(2) | Foreign Key |
| LYDO | varchar(30) |  |

Khóa chính : PHIEU+MAVT

Cú pháp: Ta xem cú pháp của lệnh Tạo Table qua ví dụ sau:

Ví dụ 2: Tạo table Vattu với khóa chính là MAVT.

**USE QLVT**

**Create Table Vattu**

( MAVT 	nChar (4)   ,

TENVT	nVarChar (30)	unique Not Null,

DVT	nVarChar (15)  Default ' '

Constraint PK_Vattu  Primary Key (MAVT) )

Ví dụ 3: Tạo cấu trúc Table NhanVien

**Create  Table QLVT.dbo.Nhanvien**

( MANV 	int	Primary key,

HO	nVarChar (40)	Not Null,

TEN	nVarChar(10) Not Null,

Phai 	nVarchar(3) Not Null

Default 'Nam' ,

DIACHI	nVarChar (50)  Default ' '  ,

NGAYSINH	Date ,

LUONG 	Money    Default 800000

Check ( Luong >=800000 And Luong <=6000000) ,

GHICHU 	nText )

Trong lệnh Create Table, ta có thể :

**1. Tạo ràng buộc về khóa ngoại và field tự động tính.**

Ví dụ 4: Xem ví dụ tạo table CT_Phatsinh, trong đó có thêm field

TRIGIA = SOLUONG*DONGIA:

Create Table QLVT.dbo.CT_PhatSinh

( PHIEU 	nChar(8) Not Null,

MAVT	nChar(4) Not Null,

MAKHO	nChar(2) Not Null,

SOLUONG	int  Not Null Check (SOLUONG > 0 ) ,

DONGIA	float  Not Null Check (DONGIA > 0 ) ,

**TRIGIA 	As	SOLUONG * DONGIA ,**

LYDO	varchar(30)

Constraint  PK_CTPS Primary Key (PHIEU, MAVT) ,

**Constraint  FK_CTPS_PS Foreign Key (PHIEU)**

**References dbo.PHATSINH(PHIEU)**

**ON DELETE CASCADE ON UPDATE CASCADE,**

Constraint  FK_CTPS_VT Foreign Key (MAVT)

References dbo.VATTU(MAVT)

ON DELETE CASCADE ON UPDATE CASCADE,

Constraint  FK_CTPS_KHO Foreign Key (MAKHO)

References dbo.KHO(MAKHO)

ON DELETE CASCADE ON UPDATE CASCADE

**)**

**2. Tạo Unique Key :**

Ví dụ 5: Cho tên kho là field không được trùng

….

**Constraint UK_TENKHO  UNIQUE (TENKHO)**

…

**3. Kiểm tra dữ liệu ở mức record:**

**Constraint <tênRB> Check  (đk)**

<đk> trong  Constraint Check chỉ hoạt động khi nào ta ghi dữ liệu đang nhập vào table.

**4. Bỏ qua việc kiểm tra các ràng buộc trong nhân bản dữ liệu:**

**Constraint <tênRB> Check  Not For Replication (đk)**

Sau khi tạo xong Table, ta có thể:

*** Thêm hay xóa 1 ràng buộc:**

Ví dụ 6: Xóa ràng buộc FK_CTPS_Kho trong table CT_PhatSinh

- Alter Table QLVT.dbo.CT_PhatSinh

**Drop Constraint FK_CTPS_Kho**

- Thêm ràng buộc về khóa ngoại trên field MAKHO của table CT_PhatSinh.

**Alter Table QLVT.dbo.CT_PhatSinh**

**Add Constraint  FK_CTPS_KHO Foreign Key (MAKHO)**

**References dbo.KHO(MAKHO)**

Lưu ý: Để kiểm tra tất cả các records đã có trong table phải thỏa 1 ràng buộc nào đó thì ta thêm vào tùy chọn With Check

Ví dụ 7: Alter Table QLVT.dbo.CT_PhatSinh

**With check**

**Check Constraint FK_CTPS_KHO**

*** Thêm, Xóa, thay đổi field trong Table:**

- Thêm 1 field :

Ví dụ 8: Thêm Field Dongia vào Table Vattu

Alter Table QLVT.dbo.Vattu

**Add Dongia	Int   Check ( Dongia > 0)**

- Thay đổi kiểu của Field

Ví dụ 9: Cho độ rộng của TENVT là 40 ký tự

Alter Table QLVT.dbo.VATTU

Alter Column TENVT Varchar (40)  Not Null

Lưu ý: ta không thể thay đổi trên các field có kiểu Text, Image, Timestamp, các field tự động tính và các field dùng trong việc nhân bản dữ liệu. Ta cũng không thể thay đổi trên các field có dùng trong field tự động tính, dùng trong 1 ràng buộc hay trong 1 chỉ mục.

- Xóa 1 field:

Ví dụ 10:  Xóa field DONGIA trong table VATTU

**Alter Table QLVT.dbo.VATTU**

**Drop Column Dongia**

* Xóa Table:  xóa table VATTU khỏi cơ sở dữ liệu QLVT.

### Drop Table QLVT.dbo.VATTU

III. TẠO VIEW: Trong SQL, 1 view là 1 đối tượng xuất hiện như table ảo để user thực hiện 1 query hay thực hiện trong 1 chương trình ứng dụng. Tuy nhiên, view không chứa dữ liệu, mà chứa mã lệnh xử lý dữ liệu. View được định nghĩa trên 1 hay nhiều table cơ sở (hay trên các view khác), và vì vậy ta có thể xem như view là 1 phương tiện để truy nhập tới các table cơ sở. Ta có thể dùng View thực hiện các việc sau:

- Chọn ra 1 tập các records trong 1 table cơ sở

- Tạo ra các cột mới dựa trên các cột đã có trong các table cơ sở

- Kết nối nhiều records từ các table cơ sở thành 1 record trong view

- Nối các record từ nhiều table

- Thay đổi dữ liệu trên table .

Ví dụ 11:  Chọn ra các nhân viên Nam trong cơ sở dữ liệu QLVT

**Create View V_NV_nam**

**As**

Select * From Nhanvien

Where Phai='Nam'

Hay:

**Create View V_NV_nam As**

Select * From [QLVT].dbo.Nhanvien

Where Phai='Nam'

Sau khi cho lệnh này thực hiện, ta sẽ có 1 View tên V_NV_Nam trong đối tượng View. Và từ đây về sau, ta có thể dùng nó như 1 table trong 1 phát biểu SQL khác.

Ví dụ 12: Tăng lương nam nhân viên tên Thu thêm 1%

**Update V_NV_Nam**

Set Luong = Luong + Luong *0.01

Where Ten=’Thu’

Ta lưu ý rằng trong điều kiện của lệnh Update ta không đưa vào điều kiện Phai='Nam' vì điều kiện này ta đã có trong View V_NV_Nam, và do đó, ta sẽ kế thừa điều kiện Phai='Nam' trong câu lệnh Update.

Ví dụ 13: Tạo View tên NV_Nam_Luong2000000 chứa các nam nhân viên có lương 2000000 đồng

Create View NV_Nam_Luong2000000 AS

SELECT * FROM V_NV_NAM WHERE LUONG =2000000

*** Dữ liệu trong View có thể lấy từ nhiều Table:**

Ví dụ 14.  Tạo view tên Vattu_Nhap có các cột sau: Số phiếu, Tên vt, Solg, dongia, tên kho, Họ NV, Tên NV

Create View Vattu_Nhap   As

Select dbo.Phatsinh.Phieu, Tenvt, Soluong, dongia,  Ho, Ten

From dbo.Phatsinh, dbo.CT_Phatsinh,

dbo.Vattu, dbo.Nhanvien

Where dbo.Phatsinh.Phieu = dbo.CT_Phatsinh.Phieu

AND dbo.CT_Phatsinh.MAVT = dbo.Vattu.MAVT

AND  dbo.Phatsinh.MANV = dbo.Nhanvien.MANV

AND Loai = 'N'

*** Nếu mệnh đề Select trong 1 view có dùng Group by thì view đó  có thuộc tính Read Only.**

Ví dụ 15: Tạo View tên V_TriGia_Phieu cho biết trị giá của các phiếu xuất đã lập.

Create View V_TriGia_Phieu    As

Select Phieu, Sum(SOLG * DONGIA)  as ThanhTien

From CT_Phatsinh Where Loai=’X’

Group By Phieu

### * View chứa Subquery cũng có thuộc tính ReadOnly

* With Check Option: Nếu trong View có thêm tùy chọn With Check Option thì các lệnh Insert, Update trên view này sẽ không thực hiện trên các Field làm vi phạm điều kiện của View.

Ví dụ 16: Ta có View sau:

Create View NV_nam As

Select * From [QLVT].dbo.Nhanvien

Where Phai='Nam'

With Check Option

thì câu lệnh sau sẽ không thực hiện:

Update Nv_nam

Set Phai ='Nu'

Lưu ý: Tùy chọn này sẽ ảnh hưởng trên tất cả View được tạo từ View chứa nó.

* Derived Column : field mới được xây dựng từ các field đã có .

Ví dụ 17: Tạo View ghép họ và tên nhân viên lại thành 1 field

Create View dbo.Luong_nv  As

Select MANV, HOTEN=HO + ' '+ TEN , LUONG From Nhanvien

* Xóa 1 View: Drop View <tên view>

**IV. TẠO  INDEX:**

Thông thường, khi ta tạo table có khóa chính (Primary Key) hay Unique thì SQL Server đã tự động tạo 1 chỉ mục trên table đó. Nhưng trong thực tế, đôi khi ta muốn tạo 1 chỉ mục trên các field không phải là khóa để tăng hiệu quả truy xuất; lúc này, ta dùng lệnh Create Index

Cú pháp:

**Create [Clustered] Index  <tên Index>**

**On < tên csdl >.dbo.< tên table>**

**(danh sách các field trong index)**

**[On <tên file nhóm chứa index>]**

Ví dụ 18:  Tạo chỉ mục tên IX_Tenho_nv theo thứ tự Ten tăng dần, trùng tên thì sắp qua họ.

Create Index IX_Tenho_nv

On QLVT.dbo.Nhanvien    (Ten, Ho)

Muốn xóa 1 index : Drop Index Table_name.Index_name

Liệt kê danh sách nhân viên theo thứ tự ten, ho:
Select * from Nhanvien with (index(IX_Tenho_nv))

Lưu y: Phải thận trọng khi dùng lệnh Drop vì khi ta xóa 1 đối tượng thì tất cả các đối tượng có liên quan đến đối tượng đó cũng sẽ mất theo. Ví dụ như khi ta xóa 1 table thì các constraint, index định nghĩa trên table đó cũng sẽ mất theo.

**V. CẤP VÀ XÓA QUYỀN TRÊN TABLE CHO USER:**

Muốn cấp, thu hồi quyền thực hiện các lệnh trên từng table, ta có thể dùng công cụ Enterprise Manager.  Giả sử trong cơ sở dữ liệu QLDSV, ta đã có 1 user kythu và 1 nhóm PDT. Ta muốn cấp quyền/ thu hồi quyền select , insert, update, delete, exec cho user/nhóm nào trên table Sinhvien thì: right click trên table Sinhvien, chọn Properties / Permissions:

Click Search, để chọn User hoặc Role: click nút Browse để tìm danh sách các User/Role

Sau đó, ta đánh dấu check trên từng quyền muốn cấm (Deny) hoặc cho phép (Grant)

Ngoài ra, ta còn có thể thực hiện việc cấp/ xóa quyền qua lệnh Grant / Revoke

**1. Cấp quyền:**

Grant <danh sách các quyền>

On <tên đối tượng>

To <danh sách các users>

- Bảng sau đây cho ta biết từ khóa sử dụng trong danh sách các quyền :

**Bảng trích từ tài liệu:**

| Từ khóa | Lệnh Sql được quyền thực hiện hay bị cấm thực hiện trên đối tượng |
| --- | --- |
| Delete | Delete |
| Insert | Insert |
| References | Add 1 Foreign Key |
| Select | Select , Create View |
| Update | Update |
| With Grant | Grant |
| Option | Revoke |
| All | Tất cả các lệnh |

- Tên đối tượng : có thể là tên của table, view, Stored Procedure

Ví dụ 19: Cho user lnkthu chỉ được quyền xem dữ liệu trên các table Nhanvien

**Grant Select**

**On Nhanvien**

**To lnkthu**

**2. Thu hồi quyền:**

Revoke <danh sách các quyền>

On <tên đối tượng>

To <danh sách các users>

*** Column-Level Security:**

Lệnh Grant/ Revoke còn cho phép ta cấp quyền trên từng Field của table. Điều này sẽ giúp người quản trị cơ sở dữ liệu bảo mật dữ liệu cao hơn.

Ví dụ 20: Cho user lnkthu chỉ được quyền  hiệu chỉnh dữ liệu trên các field (HO, TEN, PHAI, DIACHI, NGAYSINH, GHICHU) của table Nhanvien.

**Grant Select**

(MANV, HO, TEN, PHAI, DIACHI, NGAYSINH, LUONG, GHICHU)

On Nhanvien

To lnkthu

**Grant Update**

(HO, TEN, PHAI, DIACHI, NGAYSINH, GHICHU)

On Nhanvien

To lnkthu

*** Cấp/ thu hồi quyền tạo các đối tượng:**

Ví dụ 21: Người chủ cơ sở dữ liệu có thể cấp quyền tạo View, Stored Procedure cho 1 user nào đó (lnkthu) qua câu lệnh sau:

**Grant Create View,**

**Create Procedure**

**To lnkthu**

Các lệnh SQL sau có thể dùng được trong lệnh Grant/Revoke:

**Create Database, Create Table, Create View, Create Procedure, Create Default, Create Rule, Backup Database, Backup Log.**

Lưu ý:  Trong mỗi cơ sở dữ liệu đều có 1 tập các table hệ thống, các table này lưu trữ các thông tin mà ta đã mô tả trong quá trình tạo cơ sở dữ liệu (cấp phát vùng nhớ cho cơ sở dữ liệu, các cột của table, các ràng buộc, và chỉ mục…. )

**Bảng sau đây cho ta biết các table hệ thống đó (gọi là catalog)**

**Bảng trích từ tài liệu:**

| Table | Nội dung |
| --- | --- |
| sysallocations | Cấp phát vùng nhớ cho file cơ sở dữ liệu |
| syscolumns | Mô tả định nghĩa các cột |
| syscomments | Mô tả views, rules, default, trigger, check constraint, và Stored Procedure. |
| sysconstraint | Anh xạ các constraint tới các đối tượng. |
| sysfiles, sysfiles1 | Thông tin về tên file cơ sở dữ liệu trên dĩa, và vị trí của chúng |
| sysforeignkeys | Các định nghĩa về khóa ngoại |
| sysmembers | Thông tin về thành viên của nhóm |
| sysusers | Chứa các user và các roles |

VI. TẠO DIAGRAMS: Diagram là đối tượng dùng để tạo, quản lý, và xem các đối tượng cơ sở dữ liệu dưới dạng sơ đồ. Khi ta tạo các khóa ngoại thì thực chất ta đã thiết lập đối tượng diagram bằng lệnh.

Khi tạo các mối quan hệ giữa các table trên diagram, SQL Server sẽ tự động phát sinh các trigger kiểm tra các ràng buộc dữ liệu về khóa ngoại tương ứng, và điều này giúp bảo vệ sự toàn vẹn về dữ liệu.

Cách tạo:

Right click trên đối tượng Diagram/ New Database Diagram, chọn các table cần tạo mối quan hệ, sau đó ta dùng mouse drag tên field là khóa chính trên table A qua field ở table còn lại.

Sau khi hoàn thành, ta có diagram sau:

Lưu ý: Trong diagram, ta có thể hiển thị cấu trúc của table theo nhiều dạng khác nhau, và thêm vào các chú giải.

_Tài liệu có 4 ảnh/đối tượng media nhúng; phần chữ đã được trích xuất từ OOXML, ảnh được ghi nhận theo thống kê nguồn._

---

## 4.4. Chương 4 - DML và Stored Procedure

Nguồn: BaiGiangSQLServer2014/SQL4_SRVR2014.docx.

_Nguồn: BaiGiangSQLServer2014/SQL4_SRVR2014.docx._

## CHƯƠNG 4.	 DATA MANIPULATION LANGUAGE (DML)

Ngôn ngữ thao tác dữ liệu có các lệnh chính:

- Select

- Insert,  Update, Delete, Merge

I. LÊNH SELECT : Chọn ra các mẫu tin từ 1 hay nhiều table.

Cú pháp:

Select [Distinct] [Top n / Top n Percent]

danh sách_cột

[ INTO # | ##  <table ảo> ]

From  danhsách_nguồndữliệu

[Where  điều kiện]

[FOR XML PATH(‘’)]

[Group by cột_nhóm   [Having điều kiện]]

[Order By  <cột> [DESC]  [, <cột> [DESC] ]…. ]

* Các toán tử dùng trong điều kiện:

> 	>=   (!<)	 < 	<=  (!>)	=	<>  (!=)

Is Null   	: WHERE  Ghichu Is Null

Is Not Null	: WHERE  Ghichu Is Not Null

Between … And …	: WHERE  Luong Between 8000000 AND 15000000

In (danh sách các trị) 	: WHERE  Loai IN (‘N’, ‘X’)

Like   : _ đại diện 1 ký tự   	: WHERE  Sodt Like ‘091%5’

% đại diện 1 string

Not     And    Or : thứ tự ưu tiên thực hiện: NOT, kế tiếp And, cuối cùng là OR

* Một cột trong lệnh Select có thể là: 1 field trong table, 1 hằng, 1 biểu thức, hay 1 hàm aggregate function (Count, Sum, Avg, Max, Min), Select-Stmt

* Một table trong danhsách_nguồndữliệu của lệnh Select có thể là 1: table hệ thống, user table, table ảo, view, UDF,  Select-Stmt.

Ví dụ: Đếm số nhân viên trong table Nhanvien

Select 'So cac nhan vien trong cong ty ',  Count(*)

From Nhanvien

Ví dụ: Hãy chọn ra các phiếu nhập hàng mà nhân viên có mã nhân viên = 1 đã lập

Select * From PhatSinh

Where MANV = 1 and Loai=’N’

* SubQuery: để thi hành 1 SubQuery ta dùng các toán tử so sánh, và một số toán tử tập hợp sau: Exists, Not Exists, ALL , ANY, IN

Ví dụ : Chọn ra các  nhân viên chưa từng lập phiếu trong công ty

Select  *

From Nhanvien

Where MANV Not IN ( Select MANV

**From Phatsinh )**

Ví dụ:  Liệt kê Hoten, Luong của các nhân viên có lập phiếu nhập cho kho ‘TK’

SELECT HOTEN=HO+ ' '+ TEN, LUONG

FROM NhanVien

WHERE 'TK'  IN (SELECT MAKHO FROM PhieuNhap WHERE NhanVien.MANV=PhieuNhap.MANV)

Hoặc:

SELECT HOTEN=HO+ ' '+ TEN, LUONG

FROM NhanVien

WHERE Exists (SELECT MAPN FROM PhieuNhap WHERE NhanVien.MANV=PhieuNhap.MANV AND MAKHO='TK')

* FOR XML PATH(‘’): dữ liệu kết xuất theo dạng XML, mỗi field là 1 thẻ. Ví dụ với lệnh: SELECT MAPN, MAVT   FROM CTPN   FOR XML PATH('')

Thì kết quả :

<MAPN>PN01    </MAPN>

<MAVT>MG01</MAVT>

<MAPN>PN01    </MAPN>

<MAVT>MS01</MAVT>

<MAPN>PN02    </MAPN>

<MAVT>MS01</MAVT>

<MAPN>PN02    </MAPN>

<MAVT>MU01</MAVT>

Ta có thể áp dụng For XML Path để nối dữ liệu nhiều dòng thuộc 1 cột thành 1 ô với cùng cột nhóm id.

Ví dụ: Ta muốn nối các vật tư thuộc cùng 1 phiếu nhập vào 1 ô thì thực hiện lệnh sau:

SELECT MAPN, DS_VT =

STUFF( (SELECT DISTINCT ', ' + TENVT

FROM CTPN B INNER JOIN VATTU ON B.MAVT=VATTU.MAVT

WHERE b.MAPN = a.MAPN

FOR XML PATH('')

) , 1, 2, '')

FROM CTPN A

GROUP BY MAPN

Kết quả sau khi thực hiện:

* Biểu thức Case: SQL cung cấp cấu trúc Case để thay thế 1 trị có sẵn trong cơ sở dữ liệu bằng 1 biểu thức khác. Cấu trúc Case có dạng sau:

**Case**

**When  đk1 Then Expr1**

**When  đk2 Then Expr2**

**…**

**When  đkn Then Exprn**

**Else Exprx**

**End**

Ví dụ: Hãy hiển thị thêm cột LoaiNV để xếp lọai nhân viên dựa vào doanh số bán hàng  trong tháng 3/2016 của từng nhân viên theo quy tắc sau:

Doanh số  < 20000000 	-> LoaiNV =1

Doanh số  >=20000000  và <50000000  	-> LoaiNV =2

Doanh số  >=50000000  	-> LoaiNV =3

SELECT MANV, DOANHSO=SUM (THANHTIEN)

INTO #TAM

FROM PHIEUXUAT

WHERE MONTH(NGAY) = 3 AND YEAR (NGAY) = 2016

GROUP BY MANV

SELECT #TAM.* ,

LOAINV = (Case

When DOANHSO < 20000000  Then 1

When DOANHSO < 50000000 Then   2

Else 3

End )

FROM  #TAM

* Lưu ý: Trong trường hợp ta đã tạo các Noncluster Index, và ta muốn liệt kê các records theo thứ tự đã chỉ định trong các Index thì ta viết câu lệnh Select như sau: 
	Select * from table WITH (INDEX = ten_index)

**II. DÙNG DML ĐỂ HIỆU CHỈNH DỮ LIỆU:**

1. Lệnh Insert : thêm 1 record mới  vào table

Cú pháp:

**Insert Into <table> (danh sách field)**

**Values (Danh sách các giá trị)**

Ví dụ: Thêm 1 vật tư mới vào table VATTU :
INSERT INTO VATTU (MAVT, TENVT, DVT)

Values (‘VT01’, ‘Máy giặt LG cửa trên’, ‘Cái’)

Lệnh Insert còn cho phép lấy dữ liệu từ các table khác chuyển vào qua cú pháp : 
  INSERT INTO <table> (ds field)

**SELECT <ds cột> …**

Ví dụ: Lệnh Insert sau sẽ copy tất cả các record từ 1 version cũ của table Nhanvien (OldEmp) vào version  mới của Nhanvien (có thêm field NoiSinh  với giá trị là ‘ ‘)

Insert  Into Nhanvien (MANV, HO, TEN, NOISINH  )

Select MANV, HO, TEN,’ ‘

From OldEmp

Lưu ý: Lệnh Select Into  để tạo ra 1 table mới có các mẩu tin lấy từ 1 hoặc nhiều tables.

Ví dụ: Đưa các mã nhân viên có doanh số bán hàng  từ 50000000 trở lên trong tháng 3/2016  vào 1 bảng riêng tên NV_DOANHSO_CAO

SELECT *

INTO   NV_DOANHSO_CAO

FROM  #TAM WHERE DOANHSO >=50000000

2. Lệnh Update: để thay đổi giá trị của 1 hay nhiều cột trong table thỏa điều kiện

Ví dụ: Hãy đổi tên của nhân viên  có mã số = 1 sang tên mới Huỳnh Vân Diệp

**Update Nhanvien**

**Set 	Name = N’Huỳnh Vân Diệp’**

**Where MANV =1**

3. Lệnh Delete: Xóa các mẫu tin thỏa điều kiện

Ví du : Xóa nhân viên có mã số = 2

Delete From Nhanvien Where Manv = 2

Ta có thể lưu dữ liệu đã xóa vào 1 bảng tạm theo cú pháp Delete … Output … Into:

declare @del_table TABLE (MA_NV INT, HO NVARCHAR(40), TEN NVARCHAR(10), LUONG FLOAT)

DELETE NhanVien

OUTPUT deleted.MANV, deleted.HO, deleted.TEN, deleted.LUONG INTO @del_table

WHERE LUONG<=5000000

SELECT * FROM @del_table

SELECT COUNT(*) FROM @del_table

Ta có thể xóa toàn bộ dữ liệu trong table:

Delete From <tên Table>

hay

Truncate Table <tên Table>

Lưu ý:

Lệnh Truncate Table <tên Table> thực thi nhanh hơn lệnh Delete From <tên Table> vì xóa theo trang dữ liệu.

Muốn xóa hẳn dữ liệu lẫn  cấu trúc  của Table:  Drop Table <tên Table>

4. Lệnh Merge : Lệnh Merge kết hợp các câu lệnh INSERT, UPDATE và DELETE vào trong 1 lệnh duy nhất, tùy thuộc vào sự tồn tại của một bản ghi.

Ví dụ sau đây sẽ chèn vật tư ‘Đường Biên Hòa ’,mã ‘VT20’, DVT là ‘Kg’  (Source) vào table VATTU (Target) nếu mã vật tư ‘VT20’ chưa có trong table VATTU; ngược lại lệnh Merge sẽ Update SOLUONGTON =20.

MERGE  INTO dbo.VATTU  AS Target

USING (SELECT  MAVT='VT20',  TENVT=N'ĐƯỜNG BIÊN HÒA', DVT=N'KG', SLT=  0  ) 												AS Source

ON Target.MAVT= Source.MAVT

WHEN MATCHED THEN

UPDATE SET TARGET.SOLUONGTON =20

WHEN NOT MATCHED THEN

INSERT (MAVT, TENVT, DVT, SOLUONGTON)

VALUES (Source.MAVT, Source.TENVT, Source.DVT, Source.SLT) ;

**Lưu ý: Nếu Source  là 1 table thì câu lệnh sẽ lấy từng mẫu tin trong Source để Insert/Update vào Target.**

III. STORED PROCEDURE:

Một stored procedure là một nhóm các câu lệnh Transact-SQL đã được biên dịch và chứa trong SQL Server dưới một tên, và được xử lý như một đơn vị (chứ không phải nhiều câu lệnh SQL riêng lẻ).

Một stored procedure có thể chứa tất cả các lệnh SQL (ngoại trừ các lệnh CREATE DEFAULT, CREATE PROCEDURE, CREATE RULE, CREATE TRIGGER, CREATE VIEW, USE). Trong stored procedure có các tham số đầu vào, các tham số đầu ra, biến cục bộ, lệnh gán, các thao tác lên cơ sở dữ liệu và cấu trúc điều khiển việc thực thi.

Các stored procedure của Microsoft® SQL Server™ trả về dữ liệu theo 4 dạng:

Các output parameter có thể là:

dữ liệu (ký tự hay số)

một biến con trỏ (các con trỏ là các tập kết quả được rút trích mỗi lần một dòng).

Mã trả về của lệnh return (số nguyên).

Một tập kết quả cho mỗi câu lệnh SELECT chứa trong stored procedure hay trong những stored procedure khác được gọi bởi stored procedure.

Một con trỏ tòan cục có thể được tham khảo bên ngoài stored procedure.

Ví dụ: stored procedure đơn giản sau đây minh hoạ 3 phương cách mà stored procedure có thể trả dữ liệu về:

Đầu tiên stored procedure dùng câu lệnh SELECT để trả về một tập kết quả tổng kết hoạt động bán hàng theo từng nhân viên trong bảng PHATSINH.

Sau đó, một câu lệnh SELECT khác để gán vào tham biến số lượng các phiếu xuất đã tạo.

Cuối cùng, stored procedure trả về một số nguyên qua phát biểu RETURN. Việc trả về số nguyên thường được dùng để trả về các thông tin kiểm tra lỗi.

USE QLVT

GO

DROP PROCEDURE sp_ThongKe_XuatHang

GO

CREATE PROC sp_ThongKe_XuatHang

@SoCacPX   INT    OUTPUT

AS

-- SELECT để trả về một tập kết quả tổng kết trị giá  của các phiếu xuất theo từng

-- nhân viên . Kết xuất : MaNV	Tong Tri gia

SELECT MANV,  SUM(SOLUONG*DONGIA) as TongTriGia

FROM PhatSinh PS, CT_PHATSINH CT

Where Loai =’X’ AND PS.PHIEU = CT.PHIEU

GROUP BY MANV

ORDER BY MANV

SELECT @SoCacPX = Count(Phieu) FROM PHATSINH WHERE LOAI =’X’

-- hoặc có thể viết:

-- SET @SoCacPX = (SELECT Count(Phieu) FROM PHATSINH WHERE LOAI =’X’)

-- Trả về 0 để báo là thành công

RETURN 0

GO

-- Kiểm tra stored procedure vừa viết,  ta khai báo các biến, và gọi như sau:

DECLARE @Maloi INT

DECLARE @ SoCacPX   INT

-- Thực thi thủ tục, trả về tập kết quả từ câu lệnh SELECT đầu  tiên.

EXEC @Maloi = sp_ThongKe_XuatHang @SoCacPX  OUTPUT

### 1. Ưu Điểm Của Stored Procedure

Stored procedure có một số ưu điểm chính như sau:

Hiệu quả thực thi (performance): Khi thực thi một câu lệnh SQL thì SQL Server phải kiểm tra permission(quyền thực hiện) xem user gửi câu lệnh đó có được phép thực thi câu lệnh hay không, đồng thời kiểm tra cú pháp rồi mới tạo ra một kế hoạch thực thi (excute plan) và thực thi. Nếu có nhiều câu lệnh như vậy gửi qua mạng có thể sẽ làm giảm tốc độ làm việc của server. SQL Server sẽ làm việc hiệu quả hơn nếu dùng stored procedure vì người gửi chỉ gửi một tập các câu lệnh đơn và SQL Server chỉ cần kiểm tra một lần sau đó tạo ra một kế hoạch thực thi và thực thi. Nếu stored procedure được gọi nhiều lần thì kế hoạch thực thi có thể sử dụng lại stored procedure đã biên dịch do vậy hiệu quả làm việc sẽ nhanh hơn. Ngoài ra cú pháp của các câu lệnh SQL đã được SQL Server kiểm tra trước khi save nên không cần kiểm tra lại mỗi lần thực thi.

Tạo khung sườn trong lập trình(Programming Framework): Một khi stored procedure được tạo ra nó có thể được sử dụng lại. Điều này sẽ làm cho việc bảo trì( maintainability) dễ dàng hơn do việc tách rời giữa các luật business (business rules _ những luật thể hiện bên trong stored procedure ) và cơ sở dữ liệu. Ví dụ nếu có một sự thay đổi nào đó về mặt logic thì ta chỉ việc thay đổi code bên trong stored procedure mà thôi. Những ứng dụng dùng stored procedure này có thể sẽ không cần thay đổi mà vẫn tương thích với các business rule mới.

Bảo mật: Giả sử chúng ta muốn giới hạn việc truy xuất dữ liệu trực tiếp của một user nào đó vào một số bảng, ta có thể viết một stored procedure để truy xuất dữ liệu và chỉ cho phép user đó được sử dụng stored procedure đã viết sẵn, user không thể đụng đến các bảng trực tiếp. Ngoài ra stored procedure có thể được mã hóa (encrypt) để tăng thêm tính bảo mật.

### 2. Các loại Stored Procedure:

Stored procedure có thể được chia thành 5 nhóm sau:

System stored procedure : Là những stored procedure chứa trong cơ sở dữ liệu master và thường bắt đầu bằng tiếp đầu ngữ sp_. Các stored procedure này thuộc loại built-in và chủ yếu dùng trong việc quản trị cơ sở dữ liệu cũng như quản trị bảo mật. Ví dụ bạn có thể kiểm tra tất cả các tiến trình đang sử dụng bởi user DomainName\Administrators nhờ vào câu lệnh EXEC sp_who @lginame=’DomainName\Administrators’. Có hàng trăm stored procedure hệ thống trong SQL Server .

Local stored procedure : Đây là loại thường dùng nhất. Chúng được chứa trong cơ sở dữ liệu do user tạo và thường được viết để thực hiện một công việc nào đó. Thông thường người ta nói đến stored procedure là nói đến loại này. Stored procedure cục bộ thường được viết bởi người quản trị hệ cơ sở dữ liệu hoặc lập trình viên.

Temporary stored procedure :   Là những stored procedure tương tự như stored procedure cục bộ nhưng chỉ tồn tại cho đến khi kết nối tạo ra chúng bị đóng lại.. Các stored procedure này được tạo ra trên cơ sở dữ liệu temdb của SQL Server nên chúng sẽ bị xoá khi kết nối tạo ra chúng bị ngắt hay khi SQL Server down. Temporary stored procedure được chia làm 3 loại: local (bắt đầu bằng dấu #), global bắt đầu bằng dấu ##) và stored procedure được tạo ra trực tiếp trên cơ sở dữ liệu tempdb. Loại local chỉ được sử dụng bởi kết nối đã tạo và bị xóa khi disconnect, loại global có thể được sử dụng bởi bất kỳ kết nối nào. Quyền thực thi cho loại global mặc định không thay đổi cho nhóm public. Lỗi stored procedure được tạo trực tiếp trên cơ sở dữ liệu tempdb khác với 2 loại trên ở chỗ ta có thể set permission, chúng tồn tại kể cả sau khi kết nối tạo ra chúng bị ngắt và chỉ biến mất khi SQL Server shutdown.

Extended stored procedure : Đây là một loại stored procedure sừ dụng chương trình ngoại vi (external program) vốn được biên dịch thành một DLL để mở rộng chức năng hoạt động của SQL Server. Loại này thường bắt đầu bằng tiếp đầu ngữ xp_. Ví dụ, xp_sendmail dùng để gửi mail cho một người nào đó hay xp_cmdshell dùng để chạy một DOS command … (xp_cmdshell ‘dir:\c’).

Remote stored procedure : Gọi stored procedure ở server khác, lúc này ta phải tạo Link Server đến Server chứa Stored Procedure.

3. Tạo 1 Stored Procedure: Mở 1 cửa sổ Query , và nhập vào lệnh tạo Stored Procedure theo cú pháp sau:

**CREATE PROCEDURE  procedure_name 
[ { @parameter  data_type [ = default ] [ OUTPUT ] ]**

[ WITH { RECOMPILE | ENCRYPTION | RECOMPILE , ENCRYPTION}]                                                                                              AS sql_statement

**Các đối số:**

Procedure_name: là tên của stored procedure mới. Các procedure tạm cục bộ và toàn cục được tạo bằng cách thêm dấu # phía trước tên như #procedure_name đối với stored procedure tạm cục bộ, ##procedure_name đối với các stored procedure tạm toàn cục. Tên đầy đủ của stored procedure bao gồm cả dấu # không được vượt quá 128 ký tự. Việc  chỉ định người tạo stored procedure là tuỳ chọn.

@parameter: Là tham số trong stored procedure . Giá trị của mỗi tham số được khai báo phải được cung cấp bởi người dùng khi stored procedure được thực thi (nếu tham số không được định nghĩa giá trị mặc định). Một stored procedure có thể lên đến tối đa 2100 tham số.

Xác định một tên tham số bằng cách thêm vào ký hiệu @ trước ký tự đầu tiên. Tên tham số phải phù hợp với các luật dành cho những định danh. Các tham số cục bộ trong procedure, các tên tham số giống nhau có thể được dùng ở những stored procedure khác nhau.

data_type: kiểu dữ liệu của tham số.

default: là giá trị mặc định dành cho tham số. Giá trị mặc định phải là một hằng và có thể là NULL. Nó có thể chứa các ký tự như %, _, [], and [^] nếu procedure sử dụng tham số với từ khoá LIKE.

OUTPUT: Chỉ định tham số thuộc loại tham biến.

{RECOMPILE | ENCRYPTION | RECOMPILE, ENCRYPTION}

RECOMPILE cho biết SQL Server không lưu lại kế hoạch dành cho stored procedure này và stored procedure này phải được tái biên dịch lại tại mỗi  thời điểm chạy.

ENCRYPTION cho biết SQL Server mã hóa trong bảng syscomments chứa văn bản của câu lệnh CREATE PROCEDURE .

Sql_statement: các lệnh trong Sql

Note : Tạo một stored procedure sử dụng công cụ QUERY ANALYZER

Kết nối với Server có chứa cơ sở dữ liệu cần tạo stored procedure.

Trong cửa sổ Query, đánh câu lệnh Transact-SQL tạo một stored procedure mới.

Click nút kiểm tra cú pháp câu lệnh () hay ấn tổ hợp phím Ctrl-F5 .

Click nút thực thi () hay ấn phím F5 để tạo một stored procedure mới.

Note: Sau khi tạo 1 Stored Procedure, để thi hành nó ta vào cửa sổ Query Analyze và  dùng lệnh Execute:

Thực thi một stored procedure bằng cách sử dụng câu lệnh Transact-SQL EXECUTE.

Cú pháp: 	 EXEC 
{[ @return_status = ] { procedure_name  | @procedure_name_var   } 
[ [ @parameter = ] { value | @variable [ OUTPUT ]  ] 
[ ,...n ] 
[ WITH RECOMPILE ]

**Các đối số:**

@return_status: biến kiểu int nhận trạng thái trả về của một stored procedure bởi lệnh Return.

procedure_name: tên stored procedure cần thực thi.

@procedure_name_var: biến cục bộ lưu  tên của stored procedure muốn chạy.

@parameter

Là tham số trong stored procedure như định nghĩa trong phần câu lệnh CREATE PROCEDURE. Khi được dùng dưới dạng @parameter_name = value , cc tn tham số và các hằng không cầntheo thư tự tham số đ khai bo trong cu lệnh CREATE PROCEDURE. Tuy nhin, nếu dạng @parameter_name = value được dùng cho bất kỳ một tham số, nó phải sử dụng cho tất cả các tham số tiếp theo.

Value: giá trị gởi cho tham số. Nếu tên tham số không được xác định, các giá trị tham số phải được cấp theo đúng thứ tự đã khai báo trong câu lệnh CREATE PROCEDURE .

@variable: gởi giá trị trong biến @variable cho tham số

OUTPUT: chỉ định đây là tham số thực biến

WITH RECOMPILE

Bắt buộc một kế hoạch mới được biên dịch. Sử dụng tuỳ chọn này nếu tham số bạn đang cấp không đúng kiểu hay dữ liệu vừa thay đổi cách đặc biệt. Kế hoạch được thay đổi được dùng trong các thực thi tiếp sau. Tuỳ chọn này dược dùng cho các stored procedure mở rộng. Khuyến nghị hạn chế sử dụng tuỳ chọn này.

Ví dụ:

CREATE PROCEDURE List_Cust 	-- tên stored procedure

@MinDiscount Dec(5,3) = 0.1	-- tham số

AS				-- bắt đầu phần thân của Stored Procedure

Select *

From Customer  Where Discount  >= @MinDiscount

Để thi hành Stored Procedure trên, ta nhập vào: Execute List_Cust

a. Tham số : 1 Stored Procedure có thể có tới 2100 tham số; mỗi tham số có dạng:

@ten_tham_so  kiểu_dữ_liệu

Ta có thể định nghĩa 1 giá trị input mặc định (default input value) trong trường hợp khi gọi 1 Stored Procedure mà không cung cấp giá trị cho tham số hình thức .

Cú pháp : @ten_tham_so  kiểu_dữ_liệu = gia_tri

Ví dụ: Trong ví dụ trên ta tạo 1 tham số mặc định như sau:

@MinDiscount Dec(5,3) = 0.01

Tất cả tham số được xem như là input; để 1 tham số đóng vai trò là output , ta thêm từ khóa Output vào sau  khai báo của nó.

Ví dụ: Tạo 1 Stored Procedure tên GetCustDiscount để trả về mức giảm giá của 1 khách hàng có mã do ta gởi vào.

CREATE PROCEDURE GetCustDiscount

@MaKH Int,

**@GiamGia Dec (5,3) Output**

AS

Set @Giamgia = (Select Discount  From Customer Where CustID = @MaKH)

Khi gọi Stored Procedure trên:

Execute GetCustDiscount 246900, @GiamGia Output

với @GiamGia là 1 biến

Ví dụ áp dụng: Tạo Stored Procedure tên ListLowHighDiscount cho biết các khách hàng có mức giảm giá <0.01 và mức giảm giá >=0.1

c. Phát biểu Return: kết thúc procedure và trả về 1 trị nguyên cho người gọi.

Ví dụ:

CREATE PROCEDURE ListCustWithDiscount

@MinDiscount Dec(5,3) = 0.0001

AS

If (@MinDiscount >1) Return   1

Select * From Customer Where Discount >=@MinDiscount

Return (0)

Lệnh gọi:

Execute @Status = ListCustWithDiscount 0.03

**Trong Stored Procedure có các lệnh sau:**

- Khai báo biến :

Declare @dem int

- Lệnh gán :

Set @dem = 1

Ví dụ:

CREATE Procedure GetNameAndDiscount

@CustID int, @Name varchar (30) Output , @Discount Dec(5,3) Output

As

Select @Name = Name, @Discount = Discount

From Customer

Where CustID = @CustID

- Khối lệnh : Trong 1 cấu trúc nếu có nhiều lệnh thì đặt các lệnh đó trong

## Begin

lệnh1

lệnh 2

## End

**4. Cấu trúc trong SP:**

- Cấu trúc If :

If <dieukien>

Lệnh thực hiện khi điều kiện đúng

Else

Lệnh thực hiện khi điều kiện sai

Ví dụ:

If (Select Avg(Diem) From Diem Where Masv='95Q10001') < 5

PRINT ‘Khong duoc thi tot nghiep’

Else

PRINT ‘Duoc thi tot nghiep’

- Vòng lặp While :

WHILE <đk>

BEGIN

Lệnh

[BREAK]

[CONTINUE]

END

- Label và Goto:

Ví dụ:

SkipNextStep:

….

Goto SkipNextStep

* Giao tác (Transaction): Khi thay đổi dữ liệu trên nhiều table hay nhiều records trên 1 table, ta phải đảm bảo tính nhất quán về dữ liệu trên cơ sở dữ liệu. Ví dụ ta đang thực hiện việc tăng mức giảm giá cho các customer thì tiến trình đang thi hành bị ngắt quãng vì 1 nguyên nhân nào đó (mất nguồn). Như vậy, rõ ràng là chỉ có 1 số khách hàng được tăng Discount, còn 1 số khách hàng khác thì không ; điều này sẽ dẫn đến không nhất quán về dữ liệu.

Để tránh tình trạng này xảy ra, SQL Server cung cấp 1 khả năng cho phép ta phục hồi lại dữ liệu cũ nếu công việc đang thi hành bị lỗi: giao tác.

Một công việc của ta có khả năng là 1 lệnh hay nhiều lệnh SQL tác động lên nhiều Table; một công việc như vậy ta gọi là 1 giao tác. Để bắt đầu 1 giao tác, ta dùng: Begin Transaction; xác nhận 1 giao tác đã hoàn thành : Commit; hủy bỏ giao tác và trả lại dữ liệu cũ : RollBack.

Ví dụ: Trong ngân hàng, 1 giao tác là việc chuyển số tiền từ tài khoản tiết kiệm của khách hàng có tài khoản @TKCHUYEN qua tài khoản @TKNHAN với số tiền @SOTIEN:

CREATE PROC [dbo].[SP_CHUYENTIEN]

@TKCHUYEN NVARCHAR (10) , @TKNHAN NVARCHAR (10), @SOTIEN BIGINT

AS

SET XACT_ABORT ON

BEGIN TRAN

BEGIN TRY

UPDATE TAIKHOAN

SET SODU = SODU+ @SOTIEN

WHERE SOTK= @TKNHAN

UPDATE TAIKHOAN

SET SODU = SODU -  @SOTIEN

WHERE SOTK= @TKCHUYEN

COMMIT

END TRY

BEGIN CATCH

ROLLBACK

DECLARE @ErrorMessage VARCHAR(2000)

SELECT @ErrorMessage = 'Lỗi: ' + ERROR_MESSAGE()

RAISERROR(@ErrorMessage, 16, 1)

END CATCH

* Ghi chú Về tùy chọn XACT_ABORT: Đây là tùy chọn ở mức kết nối, chỉ có tác dụng trong phạm vi kết nối của ta. XACT_ABORT nhận hai giá trị ON hoặc OFF (OFF là giá trị mặc định). Khi tùy chọn này được đặt là OFF, SQL Server sẽ chỉ hủy bỏ lệnh gây ra lỗi trong transaction và vẫn cho các lệnh khác thực hiện tiếp, nếu lỗi xảy ra được đánh giá là không nghiêm trọng. Khi XACT_ABORT được đặt thành ON, SQL Server mới xử lý đúng như mong đợi – khi gặp bất kỳ lỗi nào nó hủy bỏ toàn bộ transaction và đưa dữ liệu quay lui về trạng thái như lúc ban đầu.

Nếu ta muốn lưu kết quả trả về bởi lệnh Select trong SP để xử lý tiếp thì tạo 1 table tạm, sau đó gọi lệnh INSERT INTO … EXEC :

Tạo table tạm:

CREATE TABLE #AB (

HOCKY INT, HELOP INT, TONG_GGQC FLOAT

)

Đưa kết quả trả về vào Table tạm:

INSERT INTO #AB (HOCKY, HELOP, TONG_GGQC)

EXEC SP_THONG_KE_GGQC_HVCS_THEO_HKY_HEDT_TRONG_NK '2021 - 2022'

– SP này trả về 3 cột, nên ta tạo table tạm #AB để lưu dữ liệu trả về của SP

Bài tập:

Viết SP tên sp_Tao_Phieu_Nhap dựa vào đơn đặt hàng. SP này có các tham số (MSDDH nvarchar(8), MAPN nvarchar(8), NgayNhap Date, MANV int , MAKHO nvarchar(4).

Yêu cầu: Tạo phiếu nhập, và sao chép các vật tư từ đơn đặt hàng qua phiếu nhập.

_Tài liệu có 3 ảnh/đối tượng media nhúng; phần chữ đã được trích xuất từ OOXML, ảnh được ghi nhận theo thống kê nguồn._

---

## 4.5. Chương 5 - Cơ chế bảo mật trong SQL Server

Nguồn: BaiGiangSQLServer2014/SQL5_SRVR2014.docx.

_Nguồn: BaiGiangSQLServer2014/SQL5_SRVR2014.docx._

## CHƯƠNG 5.	CƠ CHẾ ĐẢM BẢO AN TOÀN TRONG

## SQL SERVER

Để đảm bảo sự an toàn cho hệ thống thì ta phải cung cấp login name, password của mình cho hệ thống biết  khi làm việc với SQL Server. Sau khi login, ta sẽ điều khiển được cơ sở dữ liệu theo kiểu mà người quản trị hệ thống cấp cho.

Các mức bảo mật:

Server : Login name

Database  : User Name

Table : Grant / Revoke:
  USER BINH chỉ được quyền xem điểm, toàn quyền trên SINHVIEN

không được quyền thao tác trên LOP, MONHOC

Field : Grant / Revoke :  SINHVIEN : user HOANG chỉ được quyền hiệu chỉnh field HO, TEN, không được xem NGAYSINH

**I. CÁC CƠ CHẾ AN TOÀN:**

1. Login vào Server của HĐH (WINNT) : Khi login vào HĐH, ta phải cung cấp cho máy biết user name của mình và password.

2. Login vào SQL Server: Tương tự như NT Server, SQL Server cũng đòi hỏi khi ta login  vào hệ thống thì phải có 1 danh hiệu cụ thể. Ta có thể đặt cấu hình của SQL Server để nó lấy thông tin login của NT Server hay đòi user phải vào login name. Một login của SQL Server là 1 đối tượng chứa login name, password, và các thuộc tính khác cho phép truy xuất cơ sở dữ liệu của SQL Server. Các login name phải khác nhau cho mỗi server.

Ta cần phải phân biệt rõ 1 số khái niệm giữa NT Server và SQL Server :

**Bảng trích từ tài liệu:**

| Thuật ngữ trong NT Server | Thuật ngữ trong SQL Server | Mục đích | Ghi chú |
| --- | --- | --- | --- |
| User (còn gọi là user account) | Login | Đối tượng chứa danh hiệu, password và các thuộc tính của user | - Login của SQL Server đại diện cho 1 người sử dụng đăng nhập vào SQL Server - Một user của SQL Server đại diện cho 1 user của 1 cơ sở dữ liệu. |
| User Name | Login name | Danh hiệu | - UserName : tối đa 20 ký tự. - LoginName: tối đa 128 ký tự, chứa mọi ký tự, ngọai trừ ‘\’ |
| Group | Role | Đối tượng chứa danh hiệu và các thuộc tính đại diện cho 1 nhóm các user |  |

3. Nhóm trong SQL Server ( Role):  Role trong SQL Server  là 1 đối tượng có các đối tượng user, hoặc role khác là thành viên

- Một user theo mặc định sẽ có tất cả các quyền mà nhóm nó thuộc về có. Nếu 1 user  thuộc nhiều nhóm, user đó sẽ có tất cả các quyền mà các nhóm đó có.

- Nếu 1 user  thuộc 1 nhóm A và nhóm A đó thuộc về 1 hay nhiều nhóm khác, thì user sẽ có các quyền của các nhóm khác mà user không thuộc về trực tiếp.

Như vậy, nhóm cung cấp 1 phương tiện đơn giản để quản lý sự an toàn, vì ta có thể tạo ra các nhóm để phản ánh các công việc cần làm, sau đó cho các user làm thành viên của nhóm.

Có 3 loại role trong SQL Server:

- Role trên server  (được định nghĩa sẵn bởi hệ thống)

- Role trên cơ sở dữ liệu (được định nghĩa sẵn bởi hệ thống)

- Nhóm user sử dụng cơ sở dữ liệu.

i. Role trên server: có 9 nhóm. Ta không thể thay đổi, xóa role trên server. Nhà quản trị hệ thống có quyền thêm, xóa login, các thành viên của 1 server role. Một login có tất cả các quyền của các server role mà nó thuộc về.

**Bảng trích từ tài liệu:**

| Role Name | Khả năng |
| --- | --- |
| dbcreator | Tạo và thay đổi cơ sở dữ liệu, phục hồi cơ sở dữ liệu. |
| diskadmin | Quản lý các file trên dĩa |
| processadmin | Quản lý các tiến trình đang hoạt động trong SQL Server |
| securityadmin | Quản lý việc logon cho server, thay đổi mật khẩu |
| serveradmin | Thiết lập cấu hình cho server |
| setupadmin | Có thể cài đặt việc nhân bản dữ liệu và quản lý các thủ tục mở rộng |
| Sysadmin | Thực hiện mọi thao tác trên server. |

ii. Role trên cơ sở dữ liệu (được định nghĩa bởi hệ thống): đối với cơ sở dữ liệu, SQL Server cung cấp 10 nhóm.

**Bảng trích từ tài liệu:**

| Role Name | Khả năng |
| --- | --- |
| db_accessadmin | Thêm hay xóa các user khỏi cơ sở dữ liệu. |
| db_backupoperator | Có thể backup cơ sở dữ liệu. |
| db_datareader | Đọc tất cả dữ liệu từ các bảng trong cơ sở dữ liệu. |
| db_datawriter | Thêm, hiệu chỉnh, xóa dữ liệu trong các bảng của cơ sở dữ liệu. |
| db_ddladmin | Tạo, thay đổi, xóa các đối tượng trong cơ sở dữ liệu. |
| db_denydatareader | Không thể đọc dữ liệu trong cơ sở dữ liệu. |
| db_denydatawriter | Không thể hiệu chỉnh dữ liệu trong cơ sở dữ liệu. |
| db_owner | Được thực hiện tất cả các thao tác trên cơ sở dữ liệu. |
| db_securityadmin | Cho phép quản lý nhóm, và các thành viên của nhóm trong cơ sở dữ liệu; cấp và thu hồi quyền lên các đối tượng trong cơ sở dữ liệu. |
| public | Cho phép thực hiện các thao tác với các quyền đã được cho. |

iii. Nhóm user sử dụng cơ sở dữ liệu:  Người tạo ra cơ sở dữ liệu có thể tạo ra các nhóm thao tác trên cơ sở dữ liệu, và gán các quyền cho các nhóm này. Mỗi user được đưa vào cơ sở dữ liệu đều tự động là thành viên của loại nhóm này, và người tạo cơ sở dữ liệu có thể đưa  username vào bất kỳ nhóm nào trong cơ sở dữ liệu.

Ghi chú: Cách tạo 1 nhóm sử dụng cơ sở dữ liệu xem ở phần sau trong chương này.

**4. Nhà quản trị hệ thống (System Administrator):**

- SQL Server có 1 nhà quản trị hệ thống mặc định với login name là sa. sa login là 1 thành viên của nhóm sysadmin, và có toàn quyền truy xuất tất cả đối tượng của SQL Server. Ta có thể cho 1 login vào nhóm sysadmin nhưng ta không thể xóa sa login.

**5. Database Owner (người chủ cơ sở dữ liệu):**

Trong SQL Server, user tên dbo được gọi là database owner. User dbo luôn luôn là 1 thành viên của nhóm db_owner và ta không thể xóa nó khỏi nhóm này.

**II. CÀI ĐẶT CÁC USER CỦA DATABASE:**

Ta có các bước sau để thiết lập các đối tượng an toàn cho cơ sở dữ liệu của mình, và cài đặt các user sẽ truy xuất cơ sở dữ liệu. Sau khi các đối tượng đã được thiết lập, ta có thể cấp các quyền truy xuất cụ thể đến cơ sở dữ liệu để mọi người có thể làm việc với cơ sở dữ liệu theo cơ chế an toàn mà ta đã cho.

1. Thiết lập kiểu an toàn cho SQL Server: có 2 mode: dùng login WINNT  để vào SQL Server  hay phải có login name riêng.

Cách làm:

- Khởi động SQL Server Management Studio, connect vào SQL Server với tên login name là sa.

- Right click trên tên server, chọn Properties / Security. Và chọn kiểu an toàn thích hợp

2. Tạo login SQL Server cho user:

- Khởi động SQL Server Management Studio, connect vào SQL Server với tên login name là sa hoặc tên login cho phép quản lý việc logon vào hệ thống.

- Mở rộng node Security, right click trên folder Logins / New Login (Nhon)

3. Tạo User:  Tạo user Nhon và cho user Nhon thuộc nhóm db_owner. Ta có 2 cách tạo user mới :

- Tạo user khi tạo login : trên cửa sổ login, chọn User Mapping, chọn check trên cơ sở dữ liệu (QLDSV) , ta sẽ thấy mặc định tên user cũng là tên login (ta có thể sửa tên user)

- Tạo user: Right click trên đối tượng User/ New Database User :

Lưu ý:Nếu ta muốn login là 1 thành viên của nhóm SQL Server, ta đưa nó vào nhóm bằng cách click tab Server Role.

**4. Cài đặt các nhóm user sử dụng cơ sở dữ liệu:**

Nếu ta không dùng nhóm NT Server để thiết lập các nhóm logic, ta nên tạo 1 nhóm user sử dụng cơ sở dữ liệu tại bước này.

Cách làm:

- Khởi động SQL Server Enterprise Manager, mở rộng folder database.

Right click Roles/ New Database Role để tạo 1 nhóm user.

Gõ tên nhóm vào Name (CHUYENVIEN), chọn OK

Đưa nhóm CHUYENVIEN vào nhóm db_owner : Right click db_owner/Properties:

Đưa 1 role hoặc 1 user vào nhóm

* Tóm lại: SQL Server Management Studio đã cung cấp cho ta phương tiện thuận lợi để tạo login name, nhóm và user name. Khi thực hiện ta nên cân nhắc các điều sau:

- Nếu ta tạo cơ sở dữ liệu mới với login name mới cho người sử dụng cơ sở dữ liệu, thì tạo cơ sở dữ liệu trước. Kế tiếp, tạo nhóm user-defined. Cuối cùng, mới tạo login name.

-  Ta phải tạo 1 login name trước user name

- Ta có thể đặt login name trùng tên với tên  user liên kết với nó; điều này sẽ tránh nhầm lẫn.

- Login name, username, tên role không nên quá 20 ký tự.

**III. CÁC STORED PROCEDURE LÀM VIỆC VỚI LOGIN:**

**1. Tạo Login:**

return = sp_addLogin ‘ten login’ , ‘password’ , ‘co so du lieu’

Nếu tên login tạo bị trùng thì sp_addLogin trả về 1

**2. Thay đổi password của 1 login:**

sp_password ‘password cũ’, ‘password mới’, ‘login’

Ví dụ: Thay đổi password cho login Victoria : ok.

EXEC sp_password NULL, 'ok', 'Victoria'

**3. Cấp quyền truy xuất dữ liệu cho login:**

return=sp_grantdbaccess ’ten login’[, ‘TEN USER’]

Nếu tên user tạo bị trùng thì sp_ grantdbaccess trả về 1

**4. Đưa một login vào server role :**

sp_addsrvrolemember ‘login’, ‘role’

**5. Xóa login:**

sp_droplogin ‘login’

6. Tạo nhóm: tạo nhóm trong cơ sở dữ liệu hiện hành

sp_addrole ‘role’

**7. Đưa một user vào role:**

sp_addrolemember ‘role’, ‘user’

**8. Xóa nhóm:**

sp_droprole ‘role’

**9. Xóa một thành viên trong nhóm:**

sp_droprolemember ‘role’, ‘user’

Ví dụ:

- Tạo 3  login Nhon, Thao, Trang có chung 1 password l ‘password’ làm việc trên cơ sở dữ liệu QLVT

- Tạo nhóm PKD  cho 2 user Nhon, Thao thuộc nhóm này.

EXEC sp_addlogin ‘Nhon’, ‘password’, ‘QLVT’

EXEC sp_addlogin ‘Thao’, ‘password’, ‘QLVT’

EXEC sp_addlogin ‘Trang’, ‘password’, ‘QLVT’

EXEC sp_grantdbaccess ‘Nhon’

EXEC sp_grantdbaccess @loginame = ‘Thao’

EXEC sp_grantdbaccess @loginame = ‘Trang’

EXEC sp_addrole ‘PKD’

EXEC sp_addrolemember ‘PKD’, ‘Nhon’

EXEC sp_addrolemember ‘PKD’, ‘Thao’

Bài tập:

1.Dùng SQL Server Management Studio để thực hiện việc tạo 2 nhóm PKD, PKT và cho 3 user  Nhon, Thao , Trang thuộc nhóm PKD; cho user Trang thuộc PKT.

2. Bạn hãy cho biết thông tin login của SQL Server được lưu trong table nào? Nếu ta login vào Server với login và password đã tạo từ 1 phần mềm lập trình cơ sở dữ liệu như  Visual Basic hoặc Visual C thì có được hay không?

3. Bạn hãy cho biết thông tin user, role và thông tin user là 1 thành viên của role được lưu vào trong table hệ thống nào?

4. Viết 1 SP Ds_nhom trả về danh sách các nhóm mà 1 @username là 1 thành viên. Kết xuất có dạng : mã nhóm, tên nhóm

5. Viết 1 SP DS_user trả về danh sách các user là thành viên của 1 nhóm @X.

Kết xuất có dạng : username.

Viết stored procedure tên sp_TaoTaiKhoan với các tham số (@LGNAME , @PASS,  @USERNAME , @ROLE) để tạo tài khoản và user tương ứng. 
Nếu @role = ’Admin’ thì tài khoản này được quyền tạo tài khoản mới, được sao lưu và phục hồi cơ sở dữ liệu.

Viết stored procedure tên sp_ThongTinDangNhap @tenlogin để trả  về username , họ tên, rolename của @tenlogin

_Tài liệu có 6 ảnh/đối tượng media nhúng; phần chữ đã được trích xuất từ OOXML, ảnh được ghi nhận theo thống kê nguồn._

---

## 4.6. Chương 6 - Backup và Restore

Nguồn: BaiGiangSQLServer2014/SQL6_SRVR2014.docx.

_Nguồn: BaiGiangSQLServer2014/SQL6_SRVR2014.docx._

### CHÖÔNG 6.	SAO LÖU VAØ PHUÏC HOÀI DÖÕ LIEÄU

**(BACKUP & RESTORE)**

Backup là công việc quan trọng cho mỗi Database Admin (DBA) để đảm bảo an toàn dữ liệu. Khi có sự cố xảy ra, backup file là nguồn duy nhất giúp ta khôi phục dữ liệu trở lại. Trong thời đại dữ liệu trở thành trung tâm của các hoạt động doanh nghiệp, mất mát dữ liệu làm ảnh hưởng nghiêm trọng, thậm chí làm tê liệt hoạt động của công ty. Vì thế không có gì ngạc nhiên khi trong các yêu cầu trách nhiệm của DBA, backup database luôn được liệt kê ở phần đầu.

**I. SAO LƯU DỮ LIỆU:**

Một backup đầy đủ là backup mọi thứ trong hệ thống :

- Phần mềm hỗ trợ

- Chương trình của user

- Đối tượng cơ sở dữ liệu

- Các tài khoản  mà user tạo

Tuy nhiên. lệnh backup ở đây chỉ tạo bản sao của các đối tượng cơ sở dữ liệu như table, view, stored procedure, Function, Trigger, User, Role, Rule, Default, các ràng buộc, nhật ký các giao tác.

1. Thiết bị backup: có thể là:

- File trên dĩa cục bộ

- File trên mạng

Cách tạo 1 thiết bị backup bằng Management Studio:

Khởi động SQL Server Enterprise Management / Server Object. Right click trên Folder Backup / Chọn New Backup Device. Ta nhập vào tên logic đại diện cho device trong textbox Device Name, và chọn tên file để lưu trữ các bản sao. Một backup device có thể chứa nhiều bản sao lưu của nhiều cơ sở dữ liệu.

Cách tạo 1 thiết bị backup bằng T-SQL:

**Cú pháp:**

sp_addumpdevice [@devtype =] 'device_type', 
    [@logicalname =] 'logical_name',
    [@physicalname =] 'physical_name'

Các tham số:

[@devtype =] 'device_type',  là kiểu của backup device. device_type là varchar(20) và thuộc 1 trong các trị sau:

**Bảng trích từ tài liệu:**

| Value | Description |
| --- | --- |
| Disk | backup device là 1 file trên dĩa cứng cục bộ |
| Pipe | backup device là 1 file trên dĩa cứng mạng. |

[@logicalname =] 'logical_name'

là tên logic của backup device và được sử dụng trong các lệnh BACKUP và RESTORE.

Giá trị mã trả về sau khi thực hiện sp_addumpdevice :

0 (thành công) or 1 (thất bại)

Ghi chú:

sp_addumpdevice đưa 1 backup device vào bảng master.dbo.sysdevices, và ta có thể truy vấn từ view sys.sysdevices hoặc view sys.backup_devices

sp_addumpdevice không được thực hiện bên trong 1 transaction.

Ví dụ 1 :  Tạo 1 disk dump device

Tạo 1 backup device có tên MYDISKDUMP, với file lưu là C:\Dump\Dump1.bak.

EXEC sp_addumpdevice 'disk', 'mydiskdump', 'c:\dump\dump1.bak'

Ví dụ 2 : Tạo 1 disk backup device trên mạng

Tạo 1 disk backup device ở xa. Tên file được đề cập ở đây phải được SQL Server có quyền truy xuất.

EXEC sp_addumpdevice ‘pipe’, 'networkdevice',
'\\servername\sharename\path\filename.ext'

**Muốn xóa device đã tạo:**

sp_dropdevice [ @logicalname = ] 'device'

[ , [ @delfile = ] 'delfile' ]

Tham số ‘delfile’ cho phép xóa file backup tương ứng với backup device  .

Ví dụ : Xóa device MYDISKDUMP và file C:\Dump\Dump1.bak tương ứng

EXEC sp_dropdevice 'MYDISKDUMP ', ‘delfile’.

2. Backup: Right click tên cơ sở dữ liệu /Tasks / Back Up…

xem nội dung bản   backup

- Backup type :

Full backup: backup toàn bộ dữ liệu tại thời điểm đó, đây là loại backup được dùng thường xuyên nhất.

Differential backup: backup các trang dữ liệu mới được cập nhật kể từ lần full backup gần nhất trước đó.

Transaction log backup: backup các log record hiện có trong log file, nghĩa là nó sao lưu các hành động (các thao tác xảy ra trên database) chứ không sao lưu dữ liệu. Đồng thời nó cũng cắt bỏ (truncate) log file, loại bỏ các log record vừa được backup ra khỏi log file. Vì thế khi thấy log file tăng quá lớn, có nhiều khả năng là ta chưa từng backup transaction log bao giờ.

- Destination: chỉ ra các device hoặc tên file sẽ chứa bản backup

Ta click nút lệnh Add để chỉ định nơi chứa bản sao, ta có thể chọn nơi chứa dữ liệu backup có thể là 1 file hay 1 backup device  đã định nghĩa trước.

Lưu ý : Nếu ta muốn xem nội dung của file hoặc device chứa các bản backup, ta chọn file hoặc device, sau đó click button Contents:

* Cách backup bằng T-SQL:

Cú pháp:

**Backup toàn bộ database:**

BACKUP DATABASE {database_name | @database_name_var}
TO <backup_device> [,...n]
[WITH 
    [ DESCRIPTION = {text | @text_variable}]
    [[,] DIFFERENTIAL]

[[,] NOINIT | INIT]

[[,]NOSKIP | SKIP]
    [[,] EXPIREDATE = {date | @date_var} 
        | RETAINDAYS = {days | @days_var}]
    [[,] STATS [= percentage]]
]

**Backup files or filegroups:**

BACKUP DATABASE {database_name | @database_name_var}
    <file_or_filegroup> [,...n]
TO <backup_device> [,...n]
[WITH
    [ EXPIREDATE = {date | @date_var} 
        | RETAINDAYS = {days | @days_var}]
    [[,] STATS [= percentage]]
]

Backup a transaction log: (Backup Nhật ký các giao tác)

BACKUP LOG {database_name | @database_name_var}
{
    [WITH      TRUNCATE_ONLY ]
}
{
    TO <backup_device> [,...n] 
    [WITH

[INIT]

[NORECOVERY]
        [NO_TRUNCATE]
        [[,] STATS [= percentage]]
    ]
}

Tham số:

DATABASE

Chỉ ra backup  database. Nếu ta chỉ ra 1 danh sách files và filegroups, thì chỉ có các file này được backup.

database_name  : là tên của cơ sở dữ liệu được backup

<backup_device> : là tên logic của backup device được tạo bởi sp_addumpdevice, hoặc là tên file vật lý bắt đầu với ‘DISK’.

n :cho biết backup cơ sở dữ liệu vào nhiều backup devices. Số backup devices tối đa là 32.

DIFFERENTIAL: các trang dữ liệu mới được cập nhật kể từ lần full backup gần nhất trước đó (mặc định là backup Full)

NOSKIP: yêu cầu lệnh BACKUP kiểm tra ngày hết hạn và tên của tất cả các bộ sao lưu trước khi cho phép chúng bị ghi đè (giá trị mặc định)

INIT:  bản backup mới nhất sẽ ghi đè lên file hiện tại. Nếu có một bản sao lưu chưa hết hạn, thao tác sao lưu sẽ không thành công. Trong trường hợp này, sử dụng kết hợp các tùy chọn SKIP và INIT để |ghi đè lên backup device.  Nếu không có “WITH INIT” này, các bản backup sẽ được ghi nối tiếp nhau trong cùng một file. Sau này, ta có thể cho phục hồi cơ sở dữ liệu về bản backup thứ i (lưu trong thuộc tính position). Mặc định là NOINIT.

NO_TRUNCATE: dùng NO_TRUNCATE nếu ta muốn sao lưu nhật ký giao dịch mà không cắt bớt nó - nghĩa là, tùy chọn này không xóa các giao tác đã commit trong nhật ký. Sau khi thực hiện tùy chọn này, hệ thống ghi tất cả các hoạt động cơ sở dữ liệu gần đây vào nhật ký giao tác. Do đó, tùy chọn NO_TRUNCATE sẽ cho phép ta khôi phục dữ liệu ngay đến thời điểm cơ sở dữ liệu có sự cố.

NORECOVERY: Backup... với norecovery sẽ tiến hành sao lưu rồi đưa cơ sở dữ liệu về trạng thái ‘restoring’. Thường option này được sử dụng nếu thực hiện sao lưu nhật ký trước khi bắt đầu phục hồi. Nó sẽ sao lưu cơ sở dữ liệu và sau đó thay đổi trạng thái cơ sở dữ liệu từ ONLINE sang ‘RESTORING’. Ở trạng thái đó, không ai có thể truy cập được vào cơ sở dữ liệu. Nếu ta sao lưu nhật ký trước khi phục hồi, ta không muốn thực hiện thêm bất kỳ thay đổi nào sau lần sao lưu nhật ký cuối cùng.

Ví dụ:

A. Back up toàn bộ cơ sở dữ liệu:

Câu lệnh sau sẽ tạo 1 backup device tên MyNwind_1 chứa full database backup của cơ sở dữ liệu MyNwind database.

-- Create the backup device for the full MyNwind backup.

USE master

EXEC sp_addumpdevice 'disk', 'MyNwind_1',     'c:\backup\MyNwind_1.dat'

-- Back up the full MyNwind database.

BACKUP DATABASE MyNwind TO MyNwind_1

B. Back up toàn bộ cơ sở dữ liệu và log

Ví dụ sau đây sao lưu cả database và file nhật ký. Database được lưu đến 1 backup device tên MyNwind_2, và file nhật ký được backup đến 1 fie tên  MyNwindLog1.

-- Create the backup device for the full MyNwind backup.

USE master

EXEC sp_addumpdevice 'disk', 'MyNwind_2',     'c:\backup\MyNwind_2.dat'

-- Back up the full MyNwind database.

BACKUP DATABASE MyNwind TO MyNwind_2

-- Create the log backup device.

USE master

EXEC sp_addumpdevice 'disk', 'MyNwindLog1',    'c:\backup\MyNwindLog1.dat'

-- Update activity has occurred before this point.

-- Back up the log of the MyNwind database.

BACKUP LOG MyNwind    TO MyNwindLog1

C. Back up toàn bộ cơ sở dữ liệu vào file: Sao lưu cơ sở dữ liệu QLDSV vào file.

**BACKUP DATABASE QLDSV TO DISK = ‘D:\BACKUP\QLDSV.BAK’**

**Quyền thực hiện:**

Chỉ các user là thành viên của nhóm  db_owner  và db_backupoperator mới được quyền thực hiện BACKUP DATABASE và BACKUP LOG.

Thông tin các bản backup được lưu trong :

msdb.dbo.Backupset

SELECT backup_set_id, media_set_id, position, backup_start_date, backup_finish_date, type, database_name, user_name  FROM MSDB.dbo.backupset

Media_set_id : là id của device backup mới nhất lưu các bản backup của cơ sở dữ liệu.

3. Tổ chức backup:

a) Các sự kiện  đòi hỏi phải backup cơ sở dữ liệu hệ thống: khi ta thao tác 1 số lệnh sau trên master.mdb

- Tạo, thay đổi, xóa cơ sở dữ liệu

- Tạo thay đổi, xóa 1 filegroup

- Thay đổi cấu hình của server hay cơ sở dữ liệu.

b) Các sự kiện đòi hỏi phải backup cơ sở dữ liệu của user:

- Tạo cơ sở dữ liệu

- Thay đổi cấu trúc của cơ sở dữ liệu

- Tạo Index

- Định kỳ

4. Tạo SQL Job Dùng Để Backup Database tự động:

### Ta có thể tạo 1 Job để sao lưu cơ sở dữ liệu tự động một cách dễ dàng thông qua dịch vụ SQL Server Agent. Đây là đối tượng trong SQL Server dùng để tự động thực hiện các tác vụ, tương tự như Scheduled Task của Windows. Giả sử ta muốn tạo 1 Job tự động sao lưu cơ sở dữ liệu QUANLYDIEMSV, vào lúc 1h đêm mỗi ngày.

### Trong Management Studio, ta mở rộng nút “SQL Server Agent”, sau đó click phím phải vào nút “Jobs”, rồi chọn “New Job…”:

### Một cửa sổ mới sẽ hiện ra cho ta nhập thông tin về Job cần tạo. Ở ô Name, ta nhập “Backup – Daily-QUANLYDIEMSV”, và ở Owner ta nhập vào tài khoản được quyền backup DB, ví dụ: “sa”:

Sau đó ở hàng menu bên trái, click chuột vào dòng “Steps”, rồi bấm vào nút “New…”, cửa sổ New Job Step hiện ra . Ở cửa sổ mới này, ở ô “Step name” ta nhập “Backup”, để nguyên các ô còn lại, và ở phần soạn thảo “Command” hãy nhập đoạn code sau:

**BACKUP   DATABASE   QUANLYDIEMSV TO  DEVICE_QUANLYDIEMSV**

Sau khi nhập xong, ta click OK và trở lại màn hình ban đầu. Giờ ở hàng menu bên trái, ta  chọn “Schedules” và click vào “New…” để tạo một lịch làm việc cho Job:

Ở ô “Name” ta nhập vào “Backup – Daily”; ở ô “Occurs” ta chọn “Daily” và “Occurs once at:” ta chọn “1:00:00 AM”; các phần khác giữ nguyên. Như vậy backup job sẽ chạy hàng ngày vào lúc 1h sáng.

Sau đó ta click “OK” để trở về màn hình trước và click “OK” lần nữa để quay trở lại Management Studio. Việc thiết lập như vậy là đã xong, ta đã tạo được một job có tên “Backup – Daily-QUANLYDIEMSV” để backup database và sẽ được chạy hàng ngày vào lúc 1h sáng.

II. PHỤC HỒI CƠ SỞ DỮ LIỆU (RESTORE  DATABASE): SQL Server phục hồi cơ sở dữ liệu qua 2 bước:

Xóa cơ sở dữ liệu lưu dữ liệu phục hồi (nếu đã có trong server). Do đó, nếu ta muốn phục hồi đè lên cơ sở dữ liệu đang có trong Server thì phải ngắt tất cả kết nối đến cơ sở dữ liệu.

Tạo mới cơ sở dữ liệu để lưu dữ liệu trong file backup.

Phục hồi cơ sở dữ liệu từ giao diện:  Right click trên cơ sở dữ liệu muốn restore / Tasks / Restore/ Database.

- Tab General:

Click để chọn device lưu các bản backup.

Sau khi chọn device, ta click chọn 1 bản sao lưu để phục hồi dữ liệu .

Tab Option:

**Restore  cơ sở dữ liệu từ câu lệnh:**

Cú pháp:
RESTORE DATABASE {database_name | @database_name_var}
[FROM <backup_device> [,...n]]
[WITH 
    [DBO_ONLY]

[[,] NORECOVERY]
    [[,] REPLACE]

[[,] FILE = <position>]

Restore specific files or filegroups:

RESTORE DATABASE {database_name | @database_name_var}
    <file_or_filegroup> [,...n]
[FROM <backup_device> [,...n]]
[WITH 
    [DBO_ONLY]

[[,]STOPAT =time]

[[,] NORECOVERY]
    [[,] REPLACE]

Restore a transaction log:

RESTORE LOG {database_name | @database_name_var}
[FROM <backup_device> [,...n]]
[WITH 
    [DBO_ONLY]

[[,]STOPAT =time]

[[,] NORECOVERY]

Tham số:

DATABASE

Phục hồi hoàn toàn database từ 1 backup. Nếu ta chỉ ra 1 danh sách files và filegroups, thì chỉ có các file này được phục hồi.

{database_name }

Là cơ sở dữ liệu  chứa dữ liệu sau khi được phục hồi.

FROM

Chỉ ra backup devices chứa dữ liệu backup

**DBO_ONLY**

Việc phục hồi cơ sở dữ liệu chỉ dành cho người sở hữu cơ sở dữ liệu (database owner)

Option này được sử dụng với RECOVERY option.

STOPAT =time  : Điểm phục hồi là giao tác được commit mới nhất xảy ra vào hoặc trước giá trị ngày giờ được chỉ định theo time

**NORECOVERY**

Chỉ ra thao tác restore không cho dữ liệu được rollback với các giao tác chưa được xác nhận (uncommitted), cơ sở dữ liệu ở trạng thái không hoạt động. Option NORECOVERY phải được dùng nếu  có 1 file nhật ký các giao tác đã được áp dụng.  RECOVERY là giá trị mặc định.

SQL Server yêu cầu option WITH NORECOVERY được dùng trên tất cả các lệnh RESTORE ngoại trừ lệnh RESTORE sau cùng. RESTORE Database WITH NORECOVERY đặt cơ sở dữ liệu vào trạng thái ‘restoring’, để tiếp tục restore từ các bản backups, và users không thể truy xuất cơ sở dữ liệu ở trạng thái này.

RESTORE Database WITH RECOVERY sẽ bỏ qua các giao tác chưa được xác nhận, đưa cơ sở dữ liệu về lại trạng thái ‘online’ để các user sử dụng.

**REPLACE**

SQL Server sẽ tạo ra 1 database và các files có liên hệ. Trong trường hợp tên cơ sở dữ liệu sau khi restore trùng tên với 1 cơ sở dữ liệu trên server thì cơ sở dữ liệu đó sẽ bị xóa. Khi option REPLACE không được chỉ ra, 1 cơ chế an toàn sẽ hoạt động (không cho chép chồng lên 1 cơ sở dữ liệu khác).

FILE = n : n là 1 số nguyên chỉ định lệnh Restore sẽ phục hồi cơ sở dữ liệu về bản backup thứ mấy trong msdb.dbo.backupset.position

**LOG**

Chỉ ra restore từ 1 bản backup transaction log. Transaction logs phải được áp dụng tuần tự theo thứ tự thời gian. Nếu có nhiều transaction logs, ta dùng option NORECOVERY trên tất cả các lệnh restore, ngoại trừ lệnh sau cùng.

Lưu ý:

Trong quá trình restore, database phải ở trạng thái không được sử dụng. Tất cả dữ liệu trong database mà ta chỉ ra trong lệnh restore sẽ được thay thế.

Restore Types

Dưới đây là 1 số kiểu restores mà SQL Server hỗ trợ:

Full database restore : phục hồi toàn bộ database.

Full database restore về differential database restore: phục hồi 1 differential backup

Transaction log restore: phục hồi từ file nhật ký

Quyền sử dụng:

Nếu database được phục hồi không có, user phải có quyền sử dụng lệnh CREATE DATABASE. Nếu database đã có, user sử dụng lệnh RESTORE phải là thành viên của nhóm sysadmin và nhóm db_owner.

Ví dụ:

Ghi chú:  Tất cả ví dụ dưới đây được thực hiện với giả sử 1 lệnh full database backup đã được thực hiện trước đó.

A. Restore a full database

Note: Cơ sở dữ liệu  MyNwind được giả sử là đã có

Ví dụ sau đây sẽ phục hồi 1 full database backup.

RESTORE DATABASE MyNwind     FROM MyNwind_1

**B. Restore a full database and a differential backup**

Ví dụ này phục hồi dữ liệu trên 1 bản full database backup , sau đó phục hồi trên 1 differential backup. The differential backup được nối thêm vào bản backup đang chứa 1 full database backup.

RESTORE DATABASE MyNwind

FROM MyNwind_1

WITH NORECOVERY

RESTORE DATABASE MyNwind

FROM MyNwind_1

WITH FILE = 2

C. Restore a database using RESTART syntax

Ví dụ này dùng option RESTART để khởi động lại tiến trình RESTORE khi tiến trình này bị ngắt bởi lỗi server.

RESTORE DATABASE MyNwind

FROM MyNwind_1

-- Here is the RESTORE RESTART operation.

RESTORE DATABASE MyNwind

FROM MyNwind_1 WITH RESTART

D. Restore a database and move files

Ví dụ sau đây sẽ phục hồi 1 full database and transaction log, và di chuyển cơ sở dữ liệu đã được phục hồi qua thư mục C:\Mssql7\Data directory.

RESTORE DATABASE MyNwind

FROM MyNwind_1    WITH NORECOVERY,

MOVE 'MyNwind' TO 'c:\mssql7\data\NewNwind.mdf',

MOVE 'MyNwindLog1' TO 'c:\mssql7\data\NewNwind.ldf'

RESTORE LOG MyNwind

FROM MyNwindLog1    WITH RECOVERY

E. Restore using DISK syntax

Restores 1 full database backup từ 1 DISK backup device.

RESTORE DATABASE MyNwind

FROM DISK = 'c:\backup\MyNwind.bak'

**F. Restore using FILE and FILEGROUP syntax**

Ví dụ sau đây minh họa việc restore 1 database với 2 files, 1 filegroup, và 1 transaction log.

RESTORE DATABASE MyNwind

FILE = 'MyNwind_data_1',    FILE = 'MyNwind_data_2',

FILEGROUP = 'new_customers'
    FROM MyNwind_1    WITH NORECOVERY

-- Restore the log backup.

RESTORE LOG MyNwind
    FROM MyNwindLog1

Phục hồi cơ sở dữ liệu về thời điểm chưa backup: Để có thể khôi phục lại cơ sở dữ liệu trong trường hợp này, cơ sở dữ liệu phải đáp ứng ba điều kiện sau:

- Database có chế độ RECOVERY MODE là FULL
- Database đã từng được FULL BACKUP và ta có trong tay file backup gần nhất
- Log file chưa từng bị SHRINK kể từ sau lần full backup gần nhất.

Nếu một trong ba điều kiện trên bị vi phạm thì vấn đề kể như hết cách giải cứu.

Vấn đề đặt ra ở đây là khi có sự cố trên cơ sở dữ liệu (thời điểm t2) mà bản sao lưu mới nhất  lại cách thời điểm đó vài tuần (thời điểm t1 , với t1< t2 ) thì làm cách nào ta có thể phục hồi cơ sở dữ liệu về thời điểm t trước khi xảy ra sự cố (t1 < t < t2).

Giả sử cả ba điều kiện trên được thỏa mãn và lần full backup gần đây nhất là đêm hôm trước. Ta có thể khôi phục thông qua các bước sau :

1. Đóng lại tất cả các kết nối đến database để không tiếp nhận thêm dữ liệu
2. Ghi lại thời điểm xảy ra lệnh DELETE lỗi
3. Thực hiện BACKUP LOG cho database
4. Khôi phục lại database theo trình tự sau:

- RESTORE từ bản full backup đêm hôm trước
- RESTORE từ bản log backup với lựa chọn STOPAT = thời điểm ngay trước khi có sự cố.

5. Và khi mọi việc đã hoàn tất, chuyển lại database sang chế độ hoạt động bình thường để các ứng dụng lại có thể kết nối vào database.

**Ví dụ:**

Bản backup thứ 1 lúc 2:21 PM  4/12/18 (vật tư MX01 ..TV02).  (có 5 vật tư)

BACKUP DATABASE QLVT TO DISK = 'D:\Backup\QLVT.bak' WITH INIT

LÚC 3:00 PM , 4/12/18 thêm vật tư (TL01, Tủ lạnh Pana) , vật tư này không có trong backup thứ 1.

Xóa table KHO lúc  7:30 AM 5/12/18
DELETE FROM KHO

Phục hồi DB về thời điểm 7:20 AM 5/12/18; lúc này cơ sở dữ liệu sau khi được phục hồi vẫn giữ được vật tư TL01 và phục hồi lại table KHO

BACKUP LOG QLVT TO DISK = 'D:\backup\QLVT.trn' WITH INIT

Phục hồi lại database theo thứ tự bản full backup trước rồi đến bản log backup:

RESTORE DATABASE QLVT FROM DISK = 'D:\backup\QLVT.bak' WITH NORECOVERY

RESTORE DATABASE QLVT DISK = 'D:\backup\QLVT.trn' WITH STOPAT='2018-12-05 7:20:00'

ALTER DATABASE QLVT SET MULTI_USER

Điểm mấu chốt trong đoạn lệnh trên là mệnh đề STOPAT ở lệnh RESTORE thứ hai. Mục đích của nó là khôi phục lại database từ log backup nhưng dừng lại tại thời điểm được chỉ định. Khi các hành động xảy ra đối với database được lưu vào log file, nó cũng kèm theo thời điểm xảy ra hành động đó. Khi backup log file thì bản backup cũng chứa y nguyên các thông tin này. Vì thế khi restore từ log file với mệnh đề STOPAT, ta đã yêu cầu hệ thống THỰC HIỆN lại các hành động đã được áp dụng đối với database, nhưng dừng lại trước thời điểm có sự cố. Do đó lệnh DELETE trên không được thực hiện lại và bảng đã trở về trạng thái như cũ.

Hãy để ý ở mệnh đề STOPAT, ta đã lùi thời gian lại một chút để đảm bảo thời điểm đó là trước khi xảy ra xóa dữ liệu. Cuối cùng, ta chuyển cơ sở dữ liệu về trạng thái cho sử dụng lại.

**Bài tập:**

Sau khi backup, thông tin về device backup, thông tin về các bản backup được lưu trữ trong các table hệ thống nào?

Viết 1 SP liệt kê ra màn hình [ngày giờ backup], [thứ tự backup] , [user thực hiện] của 1 cơ sở dữ liệu có tên do ta chỉ ra.

_Tài liệu có 11 ảnh/đối tượng media nhúng; phần chữ đã được trích xuất từ OOXML, ảnh được ghi nhận theo thống kê nguồn._

---

## 4.7. Chương 7 - Nhân bản dữ liệu

Nguồn: BaiGiangSQLServer2014/SQL7_SRVR2014.docx.

_Nguồn: BaiGiangSQLServer2014/SQL7_SRVR2014.docx._

## CHƯƠNG 7. 	NHÂN BẢN DỮ LIỆU

I. KHÁI NIỆM: Nhân bản dữ liệu cho phép ta phân bố các bản dữ liệu từ 1 source đến các hệ thống target 1 cách tự động. Nhân bản dữ liệu trong SQL Server dựa trên mô hình push-pull. Trong mô hình này, tiến trình nhân bản sẽ:

- Server nguồn đẩy dữ liệu được nhân bản đến server đích, hoặc

- Server đích kéo dữ liệu từ server nguồn về.

Trong SQL Server, server nguồn được gọi là Publisher, server đích được gọi là Subscriber.

Khi nhân bản dữ liệu, ta phải cân nhắc chọn kiểu nhân bản nào dựa vào 2 yếu tố: dữ liệu tự động đồng bộ giữa các site (Nhất quán trong giao tác) hoặc dữ liệu chỉ đồng bộ theo nhu cầu của user (tự quản).

II. CÁC THÀNH PHẦN CƠ BẢN TRONG REPLICATION:

1. Article là 1 đơn vị dữ liệu cơ sở. Article tiêu biểu cho đối tượng dữ liệu được nhân bản. 1 article có thể là dữ liệu từ 1 table hay 1 đối tượng cơ sở dữ liệu (toàn bộ table hay 1 stored procedure, view, UDF). Tất cả articles phải thuộc về 1 publication

2. Distributor: là hệ thống SQL Server có trách nhiệm chuyển dữ liệu được nhân bản giữa Publisher và Subscriber.

Đối với lượng dữ liệu nhân bản nhỏ, Distributor và Publisher luôn thuộc về 1 hệ thống; trong trường hợp ngược lại, Distributor và Publisher thuộc 2 Server khác nhau.

3. Publication: đại diện cho 1 nhóm các article. Khái niệm Publication cho phép dữ liệu và đối tượng có liên hệ được nhóm lại với nhau để nhân bản.

4. Publisher: là Server  chứa cơ sở dữ liệu gốc để nhân bản. Một SQL Server chỉ có 1 Publisher. Publisher trích thông tin trong cơ sở dữ liệu sẽ được nhân bản và đưa thông tin đó đến Distributor – thường là nằm trên cùng 1 hệ thống.

5. Subscription: database sẽ chứa các articles trong publication.

6. Subscriber: là 1 SQL Server, nó nhận dữ liệu đã được định nghĩa trong Publication. Một scenario replication chỉ có 1 Publisher, nhưng có thể có nhiều Subscriber.

**III. CÁC KIỂU NHÂN BẢN DỮ LIỆU TRONG SQL SERVER :**

1. Snapshot Replication: tạo 1 bản copy dữ liệu được nhân bản tại 1 thời điểm xác định;  toàn bộ dữ liệu được đưa tới Subscriber. Loại nhân bản này thích hợp trong các tình huống không cần tính nhất quán dữ liệu cao.

Ví dụ: Khi ta có 1 hệ thống SQL Server đóng vai trò như 1 hệ thống xử lý giao tác trực tuyến (OLTP- Online Transactional Processing) và 1 hệ thống SQL Server thứ 2 đóng vai trò như hệ hỗ trợ quyết định, và hệ hỗ trợ quyết định này không đòi hỏi dữ liệu mới nhất mà chỉ cần cập nhật dữ liệu vào cuối ngày, thì trong trường hợp này ta dùng snapshot replication.

2. Transactional replication: dùng transaction log để nhân bản các giao tác cá nhân giữa Publisher và Subscriber. Transaction log của Publisher nắm bắt các thay đổi dữ liệu, sau đó sẽ áp dụng các thay đổi đó đến Subscriber theo đúng trình  tự mà chúng thực hiện. Với Transactional replication, sự chuyển dữ liệu giữa Publisher và Subscriber có thể xảy ra hoặc là liên tục, hoặc là định kỳ trong 1 khoảng thời gian.

Ví dụ: Trong tình huống có 2 nơi cùng đặt hàng từ 1 cơ sở dữ liệu mà có chung tồn kho và cả 2 nơi đều cần dữ liệu mới nhất thì ta sẽ dùng Transactional replication.

3. Merge: dạng nhân bản này theo dõi các thay đổi trong cả 2 cơ sở dữ liệu nguồn và đích, và thực hiện sự đồng bộ về dữ liệu giữa Subscriber và Publisher khi cơ sở dữ liệu được nhân bản.

Ví dụ:Áp dụng Merge replication, 1 chi nhánh công ty có thể thực hiện các chức năng trong khi disconnect hoàn toàn với cơ sở dữ liệu đang đặt ở văn phòng trung tâm . Trong ngày, văn phòng chi nhánh dùng cơ sở dữ liệu của mình để thực hiện các công việc. Vào cuối ngày, văn phòng chi nhánh sẽ kết nối với văn phòng trung tâm và merge với cơ sở dữ liệu tại trung tâm về tình hình bán, đặt hàng, thông tin khách hàng mới đã phát sinh trong ngày. Tương tự, các thay đổi đã thực hiện đến khách hàng và tín dụng sẽ được merge  với cơ sở dữ liệu tại văn phòng chi nhánh.

**IV. CÀI ĐẶT MERGE REPLICATION: (xem file Hướng dẫn nhân bản DB)**

---

## 4.8. Chương 8 - User Defined Function

Nguồn: BaiGiangSQLServer2014/SQL8_UDF.docx.

_Nguồn: BaiGiangSQLServer2014/SQL8_UDF.docx._

## CHÖÔNG 8 	USER DEFINED FUNCTION

## (HAØM DO NGÖÔØI DUØNG ÑÒNH NGHÓA)

## I. KHAÙI NIEÄM:

## Những hàm trong ngôn ngữ lập trình là những chöông trình  con được dùng để đóng gói những ñoaïn leänh thực hiện một cách thường xuyên.

## Microsoft SQL Server  hỗ trợ 2 loại hàm:

## Những hàm được cài đặt sẵn (Built-in Functions): được định nghĩa trong Transact-SQL Reference và không thể bổ sung. Những hàm này có thể được tham chiếu trong những phát biểu Transact-SQL sử dụng cú pháp được định nghĩa trong Transact-SQL Reference.

## Những hàm người dùng định nghĩa(User-defined Functions): cho phép định nghĩa những hàm Transact-SQL của chính ta qua phát biểu CREATE FUNCTION.

Tên của “hàm người dùng định nghĩa” (database_name.owner_name.function_name) không được trùng nhau.

Ta phải được cấp quyền trong CREATE FUNCTION để được phép hiệu chỉnh, xoá UDF. Người dùng (ngoài người tạo) phải được cấp quyền hợp lệ trên hàm mới có thể dùng hàm đó trong câu lệnh SQL.

Để tạo hay hiệu chỉnh UDF có tham chiếu đến Tables trong ràng buộc CHECK, mệnh đề DEFAUL, hay định nghĩa 1 calculated column... ta phải dùng quyền REFERENCES trong hàm.

Trong Trigger hay Stored Procedure, nếu câu lệnh nào đó bị lỗi thì câu lệnh tiếp theo trong cùng module sẽ được thực hiện (theo mặc định). Nhưng trong hàm, lỗi sẽ làm dừng hàm, và làm cho câu lệnh gọi hàm bị huỷ bỏ.

UDF  không nhận tham số hoặc nhận nhiều tham số (tối đa 1024 tham số) và trả về một trị vô hướng hoặc một bảng. Khi tham số đầu vào của hàm có giá trị mặc định, ta phải dùng từ khoá DEFAULT khi gọi hàm (khác với tham số có giá trị mặc định trong Stored Procedure sẽ bị bỏ đi). UDF không sử dụng tham biến

UDF trả về bảng có thể thay cho View. Một UDF trả về bảng cũng được dùng thay cho bảng hay View trong truy vấn SQL. View bị giới hạn với một câu lệnh SELECT, nhưng UDF có thể chứa thêm các câu lệnh hiệu quả hơn View.

## UDF trả về một bảng có thể thay cho các Stored Procedure trả về một tập kết quả. Bảng trả về có thể được tham chiếu trong mệnh đề FROM của câu truy vấn SQL, nhưng điều này không thể thực hiện được đối với SP.

### II . Chú ý khi sỬ dỤng UDF

Các loại câu lệnh sau hợp lệ trong một hàm:

Lệnh DECLARE được dùng để định nghĩa biến và con trỏ cục bộ.

Lệnh SET dùng để gán giá trị cho đối tượng cục bộ như gán giá trị cho các biến vô hướng và các biến table ở dạng cục bộ.

Thao tác con trỏ tham chiếu đến con trỏ cục bộ được khai báo, mở, đóng, và cấp lại trong hàm. Lệnh FETCH trả giá trị cho client không được phép. Chỉ có lệnh FETCH gán giá trị cho biến cục bộ dùng mệnh đề INTO thì được phép.

Lệnh điều khiển luồng.

Lệnh SELECT gồm các danh sách chọn với biểu thức gán giá trị cho các biến cục bộ.

Lệnh UPDATE, INSERT, và DELETE hiệu chỉnh biến table cục bộ.

Lệnh EXECUTE gọi một Stored Procedure mở rộng.

## Ví dụ, phát biểu tạo ra hàm CubicVolume đơn giản trả về một giá trị decimal:

CREATE FUNCTION CubicVolume

(@CubeLength decimal(4,1), @CubeWidth decimal(4,1),

@CubeHeight decimal(4,1) )

RETURNS decimal(12,3)

AS

BEGIN

RETURN ( @CubeLength * @CubeWidth * @CubeHeight )

END

Hàm này có thể dùng ở những nơi cho phép sử dụng một biểu thức nguyên, như trong một cột tính toán của một Table:

CREATE TABLE Bricks

(

BrickPartNmbr   int PRIMARY KEY,

BrickColor      nchar(20),

BrickHeight     decimal(4,1),

BrickLength     decimal(4,1),

BrickWidth      decimal(4,1),

BrickVolume AS

(

dbo.CubicVolume(BrickHeight,

BrickLength, BrickWidth)

)

)

SQL Server cũng hỗ trợ những hàm do user định nghĩa mà trả về kiểu dữ liệu một table:

Một hàm có thể khai báo một tham biến table cục bộ, chèn thêm những hàng trong tham biến và sau đó trả về tham biến như những giá trị của nó.

Một lớp những hàm do user định nghĩa được biết đến như những hàm nội tuyến, trả về tập kết quả của phát biểu SELECT như những tham biến của kiểu table

Những hàm này có thể được sử dụng ở những vị trí mà biểu thức Table có thể được chỉ định.

Những hàm do user định nghĩa trả về một table có thể bị thay đổi trong View. Một hàm do user định nghĩa mà trả về một table có thể dùng ở những nơi  mà biểu thức Table hoặc View được phép trong những câu truy vấn Transact-SQL.

Những hàm user định nghĩa mà trả về một table cũng có thể thay thế những SP mà trả về một tập kết quả đơn lẻ. Một table được trả về bởi hàm do user định nghĩa có thể được tham chiếu trong mệnh đề FROM của phát biểu Transact-SQL, nhưng ngược lại SP mà trả về những tập kết quả thì không thể. Ví dụ FN_DSSVLOP là một hàm do user định nghĩa mà trả về một table và có thể đươc gọi bởi phát biểu SELECT:

SELECT *

FROM tb_Employees AS E,

dbo.fn_EmployeesInDept('shipping') AS EID

WHERE E.EmployeeID = EID.EmployeeID

Đây là một ví dụ về một phát biểu mà tạo ra một hàm trong cơ sở dữ liệu QLDSV  mà sẽ trả về một table:

CREATE FUNCTION FN_DSSVLOP (@MALOP NVARCHAR (10))

RETURNS TABLE

AS

RETURN

SELECT MASV, HO, TEN FROM SINHVIEN WHERE MALOP=@MALOP

Lệnh gọi hàm:  SELECT * FROM FN_DSSVLOP ('D08-HTTT')

(Cho lại ví dụ)

ALTER FUNCTION [dbo].[FN_TEST] (@NIENKHOA NVARCHAR(11),  @GV_COHUU BIT)

RETURNS @mytable TABLE

(MA_GV NCHAR(15), HO NVARCHAR(100), TEN NVARCHAR(10))

AS

BEGIN

IF (@GV_COHUU = 'TRUE')

INSERT INTO @mytable( MA_GV, HO, TEN )

SELECT MA_GV, HO, TEN FROM GIANG_VIEN WHERE GV_CO_HUU='TRUE'

ELSE

INSERT INTO @mytable( MA_GV, HO, TEN )

SELECT MA_GV, HO, TEN FROM GIANG_VIEN WHERE GV_CO_HUU='FALSE'

RETURN

END

## Date and Time Functions

These scalar functions perform an operation on a date and time input value and return a string, numeric, or date and time value.

This table lists the date and time functions and their determinism property.

**Bảng trích từ tài liệu:**

| Function | Determinism |
| --- | --- |
| DATEADD | Deterministic |
| DATEDIFF | Deterministic |
| DATEPART | Deterministic except when used as DATEPART (dw, date). dw, the weekday datepart, depends on the value set by SET DATEFIRST, which sets the first day of the week. |
| DAY | Deterministic |
| GETDATE | Nondeterministic |
| GETUTCDATE | Nondeterministic |
| MONTH | Deterministic |
| YEAR | Deterministic |

Returns a new datetime value based on adding an interval to the specified date.

**Syntax**

DATEADD ( datepart , number, date )

**Arguments**

datepart

Is the parameter that specifies on which part of the date to return a new value. The table lists the dateparts and abbreviations recognized by Microsoft® SQL Server™.

**Bảng trích từ tài liệu:**

| Datepart | Abbreviations |
| --- | --- |
| Year | yy, yyyy |
| quarter | qq, q |
| Month | mm, m |
| dayofyear | dy, y |
| Day | dd, d |
| Week | wk, ww |
| Hour | hh |
| minute | mi, n |
| second | ss, s |
| millisecond | ms |

number

Is the value used to increment datepart. If you specify a value that is not an integer, the fractional part of the value is discarded. For example, if you specify day for datepart and1.75 for number, date is incremented by 1.

date

Is an expression that returns a datetime or smalldatetime value, or a character string in a date format. For more information about specifying dates, see datetime and smalldatetime.

If you specify only the last two digits of the year, values less than or equal to the last two digits of the value of the two digit year cutoff configuration option are in the same century as the cutoff year. Values greater than the last two digits of the value of this option are in the century that precedes the cutoff year. For example, if two digit year cutoff is 2049 (default), 49 is interpreted as 2049 and 2050 is interpreted as 1950. To avoid ambiguity, use four-digit years.

**Return Types**

Returns datetime, but smalldatetime if the date argument is smalldatetime.

## DATEDIFF

Returns the number of date and time boundaries crossed between two specified dates.

**Syntax**

DATEDIFF ( datepart , startdate , enddate )

**Arguments**

datepart

Is the parameter that specifies on which part of the date to calculate the difference. The table lists dateparts and abbreviations recognized by Microsoft® SQL Server™.

**Bảng trích từ tài liệu:**

| Datepart | Abbreviations |
| --- | --- |
| Year | yy, yyyy |
| quarter | qq, q |
| Month | mm, m |
| dayofyear | dy, y |
| Day | dd, d |
| Week | wk, ww |
| Hour | hh |
| minute | mi, n |
| second | ss, s |
| millisecond | ms |

startdate

Is the beginning date for the calculation. startdate is an expression that returns a datetime or smalldatetime value, or a character string in a date format.

Because smalldatetime is accurate only to the minute, when a smalldatetime value is used, seconds and milliseconds are always 0.

If you specify only the last two digits of the year, values less than or equal to the last two digits of the value of the two digit year cutoff configuration option are in the same century as the cutoff year. Values greater than the last two digits of the value of this option are in the century that precedes the cutoff year. For example, if the two digit year cutoff is 2049 (default), 49 is interpreted as 2049 and 2050 is interpreted as 1950. To avoid ambiguity, use four-digit years.

For more information about specifying time values, see Time Formats. For more information about specifying dates, see datetime and smalldatetime.

enddate

Is the ending date for the calculation. enddate is an expression that returns a datetime or smalldatetime value, or a character string in a date format.

**Return Types**

integer

**Remarks**

startdate is subtracted from enddate. If startdate is later than enddate, a negative value is returned.

DATEDIFF produces an error if the result is out of range for integer values. For milliseconds, the maximum number is 24 days, 20 hours, 31 minutes and 23.647 seconds. For seconds, the maximum number is 68 years.

The method of counting crossed boundaries such as minutes, seconds, and milliseconds makes the result given by DATEDIFF consistent across all data types. The result is a signed integer value equal to the number of datepart boundaries crossed between the first and second date. For example, the number of weeks between Sunday, January 4, and Sunday, January 11, is 1.

## DATEPART

Returns an integer representing the specified datepart of the specified date.

**Syntax**

DATEPART ( datepart , date )

**Arguments**

datepart

Is the parameter that specifies the part of the date to return. The table lists dateparts and abbreviations recognized by Microsoft® SQL Server™.

**Bảng trích từ tài liệu:**

| Datepart | Abbreviations |
| --- | --- |
| year | yy, yyyy |
| quarter | qq, q |
| month | mm, m |
| dayofyear | dy, y |
| day | dd, d |
| week | wk, ww |
| weekday | dw |
| hour | hh |
| minute | mi, n |
| second | ss, s |
| millisecond | ms |

The week (wk, ww) datepart reflects changes made to SET DATEFIRST. January 1 of any year defines the starting number for the week datepart, for example: DATEPART(wk, 'Jan 1, xxxx') = 1, where xxxx is any year.

The weekday (dw) datepart returns a number that corresponds to the day of the week, for example: Sunday = 1, Saturday = 7. The number produced by the weekday datepart depends on the value set by SET DATEFIRST, which sets the first day of the week.

date

Is an expression that returns a datetime or smalldatetime value, or a character string in a date format. Use the datetime data type only for dates after January 1, 1753. Store dates as character data for earlier dates. When entering datetime values, always enclose them in quotation marks. Because smalldatetime is accurate only to the minute, when a smalldatetime value is used, seconds and milliseconds are always 0.

If you specify only the last two digits of the year, values less than or equal to the last two digits of the value of the two digit year cutoff configuration option are in the same century as the cutoff year. Values greater than the last two digits of the value of this option are in the century that precedes the cutoff year. For example, if two digit year cutoff is 2049 (default), 49 is interpreted as 2049 and 2050 is interpreted as 1950. To avoid ambiguity, use four-digit years.

For more information about specifying time values, see Time Formats. For more information about specifying dates, see datetime and smalldatetime.

**Return Types**

int

**Remarks**

The DAY, MONTH, and YEAR functions are synonyms for DATEPART(dd, date), DATEPART(mm, date), and DATEPART(yy, date), respectively.

## GETDATE

Returns the current system date and time in the Microsoft® SQL Server™ standard internal format for datetime values.

**Syntax**

GETDATE ( )

**Return Types**

datetime

**Remarks**

Date functions can be used in the SELECT statement select list or in the WHERE clause of a query.

In designing a report, GETDATE can be used to print the current date and time every time the report is produced. GETDATE is also useful for tracking activity, such as logging the time a transaction occurred on an account.

**Examples**

## Mathematical Functions

These scalar functions perform a calculation, usually based on input values provided as arguments, and return a numeric value.

**Bảng trích từ tài liệu:**

| ABS | DEGREES | RAND |
| --- | --- | --- |
| ACOS | EXP | ROUND |
| ASIN | FLOOR | SIGN |
| ATAN | LOG | SIN |
| ATN2 | LOG10 | SQUARE |
| CEILING | PI | SQRT |
| COS | POWER | TAN |
| COT | RADIANS |  |

Note  Arithmetic functions, such as ABS, CEILING, DEGREES, FLOOR, POWER, RADIANS, and SIGN, return a value having the same data type as the input value. Trigonometric and other functions, including EXP, LOG, LOG10, SQUARE, and SQRT, cast their input values to float and return a float value.

## String Functions

These scalar functions perform an operation on a string input value and return a string or numeric value.

**Bảng trích từ tài liệu:**

| ASCII | NCHAR | SOUNDEX |
| --- | --- | --- |
| CHAR | PATINDEX | SPACE |
| CHARINDEX | REPLACE | STR |
| DIFFERENCE | QUOTENAME | STUFF |
| LEFT | REPLICATE | SUBSTRING |
| LEN | REVERSE | UNICODE |
| LOWER | RIGHT | UPPER |
| LTRIM | RTRIM |  |

All built-in string functions, except for CHARINDEX and PATINDEX, are deterministic. They return the same value any time they are called with a given set of input values.

---

## 4.9. Chương 8 - Trigger và UDF

Nguồn: BaiGiangSQLServer2014/SQL8_TRIGGER_UDF.docx.

_Nguồn: BaiGiangSQLServer2014/SQL8_TRIGGER_UDF.docx._

## CHƯƠNG 8. 	TRIGGER AND  USER DEFINED FUNCTION (UDF)

**A. TRIGGER.**

Trigger là 1 loại Stored Procedures đặc biệt được thực hiện  1 cách tự động khi user thực hiện việc cập nhật (insert, update, delete) dữ liệu trên table. Trigger nhằm mục đích đảm bảo sự an toàn về ràng buộc toàn vẹn dữ liệu. Mỗi table có thể có nhiều trigger tương ứng với các hành động insert, delete, update trên table.

Ta gõ vào tên trigger thay cho TRIGGER NAME, và gõ vào các câu lệnh sau từ khóa AS.

Để kiểm tra cú pháp của các lệnh trong Trigger, ta click nút lệnh Check Syntax

Để xóa trigger, ta chọn tên trigger, sau đó click nút Delete

**I. CÚ PHÁP:**

CREATE TRIGGER trigger_name  ON { table  | view}
    {FOR BEFORE | AFTER | INSTEAD OF }

{ [DELETE] [,] [INSERT] [,] [UPDATE] }
        [NOT FOR REPLICATION]
        AS
            sql_statement [...n]
    }
   hoặc là
    {FOR { [INSERT] [,] [UPDATE] }  -- không có DELETE nếu có UPDATE(column)
        [NOT FOR REPLICATION]
        AS 
        {    IF UPDATE (column)
            [{AND | OR} UPDATE (column)] 
                [...n]
            | IF (COLUMNS_UPDATED() {bitwise_operator} updated_bitmask) 
                { comparison_operator} column_bitmask [...n]
        }
            sql_statement [ ...n]
    }
}

Các tham số:

- trigger_name : là tên của trigger. Tên trigger phải tuân thủ quy tắc như danh hiệu, và là duy nhất trong cơ sở dữ liệu.

- table , view : là tên của table hoặc view mà trên đó trigger được thực hiện .

- BEFORE : Trigger sẽ hoạt động trước khi thao tác lệnh xảy ra

- FOR, AFTER  : Trigger sẽ hoạt động sau khi thao tác lệnh xảy ra

- INSTEAD OF : Trigger sẽ được thực thi thay thế cho cho các thao tác INSERT, UPDATE hoặc DELETE

- { [DELETE] [,] [INSERT] [,] [UPDATE] } | { [INSERT] [,] [UPDATE]} :  là các từ khóa cho biết trigger sẽ tự động hoạt động theo lệnh nào.

- NOT FOR REPLICATION : trigger sẽ không hoạt động khi tiến trình nhân bản có thay đổi dữ liệu trên table có trigger.

* Một số table đặc biệt được dùng trong lệnh CREATE TRIGGER: deleted and inserted là các table logic. Chúng có cấu trúc tương tự như table mà trigger đang hoạt động, và các table này lưu giữ giá trị cũ hay giá trị mới của các mẫu tin đã được thay đổi bởi hành động của user. Lệnh Update được xem như thao tác xóa dữ liệu cũ, và tạo dữ liệu mới nên bảng deleted chứa dữ liệu trước khi update, và bảng inserted chứa dữ liệu mới.

- IF UPDATE (column) : kiểm tra cột nào đang chịu sự tác động của lệnh INSERT hoặc  UPDATE,  UPDATE(column) không được sử dụng với lệnh DELETE. Ta có thể kiểm tra nhiều cột

- IF (COLUMNS_UPDATED()) : kiểm tra cột nào đang chịu sự tác động của lệnh INSERT hoặc  UPDATE. COLUMNS_UPDATED() trả về 1 trị kiểu varbinary để cho ta biết các cột nào trong table đã được chèn hay được hiệu chỉnh dữ liệu.

Ví dụ: Dùng trigger để nhắc nhở:

Ví dụ này sẽ in 1 thông báo đến client khi có 1 ai đó đang thêm hay thay đổi dữ liệu trong table Nhanvien.

USE QLVT

IF EXISTS (SELECT name FROM sysobjects

WHERE name = 'reminder' AND xtype = 'TR')

DROP TRIGGER reminder

GO

CREATE TRIGGER reminder ON NhanVien

AFTER INSERT, UPDATE

AS RAISERROR (‘Khong duoc them nhan vien moi hoac hieu chinh’, 16, 10)

GO

**II. TRIGGER KIỂM TRA CÁC THAO TÁC CẬP NHẬT DỮ LIỆU:**

Trigger kiểm tra thao tác thêm mẫu tin :Trigger loại này dùng để kiểm tra mẫu tin thêm vào phải tuân thủ các ràng buộc về khoá chính, và khóa ngoại.

Ví dụ: Tạo trigger Test_ThemSV để kiểm tra khi ta thêm 1 sinh viên mới thì mã lớp của sinh viên đó phải có trước trong table Lop. Nếu mã lớp này chưa có trong table Lop, thì báo lỗi và bỏ qua việc  thêm sinh viên đó.

CREATE TRIGGER Test_ThemSV  ON dbo.Sinhvien

**FOR INSERT**

AS

Declare @Loi int=1

If exists( Select * from Lop , inserted

where Lop.malop=inserted.malop)

Set @Loi=0

If @Loi=1

raiserror( 'Khong the them sinh vien vi ma lop chua ton tai ben table  			LOP’,16,1)

Trigger cho thao tác xóa mẫu tin: Trigger loại này thường được dùng để đảm bảo ràng buộc  toàn vẹn. Ví dụ khi ta xóa 1 vật tư trong trong chi tiết phiếu nhập thì giảm số lượng tồn trong bảng VATTU

ALTER TRIGGER [dbo].[XOA_CTPN] ON  [dbo].[CTPN]

AFTER  DELETE

AS

BEGIN

SET NOCOUNT ON;

UPDATE VATTU

SET SOLUONGTON= SOLUONGTON - (SELECT SOLUONG FROM deleted)

WHERE MAVT = (SELECT MAVT FROM deleted)

END

Trigger cho thao tác hiệu chỉnh dữ liệu: Ví dụ ta viết TRIGGER để cập nhật số lượng tồn trong bảng VATTU khi ta thay đổi field số lượng của 1 vật tư nhập trong bảng CTPN.

CREATE TRIGGER  TR_AfterUpdate_SOLUONG_CTPN

ON  CTPN    AFTER  UPDATE

AS

BEGIN

IF (UPDATE(SOLUONG))

BEGIN

UPDATE VATTU

SET SOLUONGTON= SOLUONGTON -(SELECT SOLUONG FROM deleted) + 							(SELECT SOLUONG  FROM inserted)

WHERE MAVT = (SELECT MAVT FROM inserted)

END

-- Trường hợp hiệu chỉnh field ???  sẽ ảnh hưởng tới số lượng tồn

END

Bài tập: TƯƠNG TỰ CHO CÁC THAO TÁC INSERT, UPDATE, DELETE TREN TABLE CTPX

## B. USER DEFINED FUNCTION  	(HAØM DO NGÖÔØI DUØNG ÑÒNH NGHÓA)

## I. KHAÙI NIEÄM:

## Những hàm trong ngôn ngữ lập trình là những chương trình  con được dùng để đóng gói những đoạn lệnh thực hiện một nhiệm vụ.

## Microsoft SQL Server  hỗ trợ 2 loại hàm:

## Những hàm được cài đặt sẵn (Built-in Functions): được định nghĩa sẵn trong Transact-SQL Reference và không thể bổ sung. Những hàm này có thể được tham chiếu trong những phát biểu Transact-SQL sử dụng cú pháp được định nghĩa trong Transact-SQL Reference.

## Những hàm người dùng định nghĩa (User-defined Functions): cho phép định nghĩa những hàm Transact-SQL của chính ta qua phát biểu CREATE FUNCTION.

Tên của “hàm người dùng định nghĩa” (database_name.owner_name.function_name) không được trùng nhau; Tên của UDF được lưu trong table Sys.sysobjects với xtype =’FN’

Ta phải được cấp quyền trong CREATE FUNCTION để được phép hiệu chỉnh, xoá UDF. Người dùng (ngoài người tạo) phải được cấp quyền hợp lệ trên hàm mới có thể dùng hàm đó trong câu lệnh SQL.

Để tạo hay hiệu chỉnh UDF có tham chiếu đến Tables trong ràng buộc CHECK, mệnh đề DEFAUL, hay định nghĩa 1 calculated column... ta phải dùng quyền REFERENCES trong hàm.

Trong Trigger hay Stored Procedure, nếu câu lệnh nào đó bị lỗi thì câu lệnh tiếp theo trong cùng module sẽ được thực hiện (theo mặc định). Nhưng trong hàm, lỗi sẽ làm dừng hàm, và làm cho câu lệnh gọi hàm bị huỷ bỏ.

UDF  không nhận tham số hoặc nhận nhiều tham số (tối đa 1024 tham số) và trả về một trị vô hướng hoặc một bảng. Khi tham số đầu vào của hàm có giá trị mặc định, ta phải dùng từ khoá DEFAULT khi gọi hàm (khác với tham số có giá trị mặc định trong Stored Procedure sẽ bị bỏ đi). UDF không sử dụng tham biến

UDF trả về bảng có thể thay cho View. Một UDF trả về bảng cũng được dùng thay cho bảng hay View trong truy vấn SQL. View bị giới hạn với một câu lệnh SELECT, nhưng UDF có thể chứa thêm các câu lệnh hiệu quả hơn View.

UDF có 2 loại: Scalar trả về 1 giá trị đơn, hoặc Table-valued trả về 1 tập kết quả dưới dạng bảng

## UDF trả về một tập kết quả có thể thay cho các Stored Procedure trả về một tập kết quả. Bảng trả về có thể được tham chiếu trong mệnh đề FROM của câu truy vấn SQL, nhưng điều này không thể thực hiện được đối với Stored Procedure.

### II . Cú pháp:

**CREATE FUNCTION Tên_Hàm**

**( @parameter   type (=default) [, @parameter …] )**

**RETURNS {scalar_type | TABLE]**

**AS  {block | RETURN (select_stmt)}**

@parameter   type: tham số gởi cho hàm để xử lý

RETURNS {scalar_type | TABLE: chỉ ra hàm trả về 1 giá trị đơn hay 1 tập kết quả dưới dạng table

Block:  khối lệnh BEGIN … END chứa cài đặt của hàm. Khối lệnh phải có lệnh return trả về kết quả. Trong khối lệnh có thể có các lệnh:

Lệnh DECLARE để khai báo biến và con trỏ cục bộ.

Lệnh SET dùng để gán giá trị cho cho các biến và các biến table ở dạng cục bộ.

Thao tác con trỏ tham chiếu đến con trỏ cục bộ được khai báo, mở, đóng, và cấp lại trong hàm. Lệnh FETCH gán giá trị cho biến cục bộ dùng mệnh đề INTO.

Cấu trúc While, If

Lệnh SELECT để gán giá trị cho các biến cục bộ.

Lệnh UPDATE, INSERT, và DELETE tác động lên biến table cục bộ.

## Nhóm quyền được tạo hàm:  db_owner, db_ddladmin

## Ví dụ, Hàm CubicVolume đơn giản trả về một giá trị decimal:

**CREATE FUNCTION CubicVolume**

(@CubeLength decimal(4,1), @CubeWidth decimal(4,1),

@CubeHeight decimal(4,1) )

**RETURNS decimal(12,3)**

AS

BEGIN

RETURN ( @CubeLength * @CubeWidth * @CubeHeight )

END

Hàm này có thể dùng ở những nơi cho phép sử dụng một biểu thức số, như trong một cột tính toán của một Table:

CREATE TABLE Bricks

(

BrickPartNmbr   int PRIMARY KEY,

BrickColor      nchar(20),

BrickHeight     decimal(4,1),

BrickLength     decimal(4,1),

BrickWidth      decimal(4,1),

BrickVolume AS

(

dbo.CubicVolume(BrickHeight,

BrickLength, BrickWidth)

)

)

**CREATE FUNCTION [dbo].[FN_CHUANHOA]**

(

@S NVARCHAR(100)  -- Add the parameters for the function here

)

RETURNS NVARCHAR(100)  -- KIEU TRA VE

AS

BEGIN

SET @S= LTRIM(RTRIM(@S))

WHILE PATINDEX('%  %', @S) <> 0  -- tìm 2 khoảng trắng

BEGIN

SET @S=STUFF(@S,PATINDEX('%  %', @S), 1,'')

END

**RETURN @S**

END

SQL Server cũng hỗ trợ hàm UDF trả về kiểu dữ liệu table:

Hàm có thể khai báo một tham số table, chèn thêm những hàng vào tham số và sau đó trả về dữ liệu trong tham số table (multistatement table-valued function).

Hàm do user định nghĩa được biết đến như những hàm inline, trả về tập kết quả qua  phát biểu SELECT

Những hàm này có thể được sử dụng ở những vị trí mà biểu thức Table có thể được chỉ định.

Một hàm UDF mà trả về một table có thể dùng ở những nơi  mà biểu thức Table hoặc View được phép trong những câu truy vấn Transact-SQL.

Ví dụ hàm fn_EmployeesInDept là một hàm UDF trả về một table và có thể đươc gọi bởi phát biểu SELECT:

SELECT *

FROM tb_Employees AS E,

dbo.fn_EmployeesInDept('shipping') AS EID

WHERE E.EmployeeID = EID.EmployeeID

Ví dụ về một hàm trong cơ sở dữ liệu QLDSV  trả về một table:

CREATE FUNCTION FN_DSSVLOP (@MALOP NVARCHAR (20))

RETURNS TABLE  	-- Inline Function

AS

RETURN

SELECT MASV, HO, TEN FROM SINHVIEN WHERE MALOP=@MALOP

Lệnh gọi hàm:  SELECT * FROM DBO.FN_DSSVLOP ('D08-HTTT')

Dưới đây là hàm có giá trị trả về là table @mytable; Trong hàm, ta insert các dòng vào @mytable, và cuối cùng trả về kết quả lưu trong @mytable.

ALTER FUNCTION [dbo].[FN_TEST] (@NIENKHOA NVARCHAR(11),  @GV_COHUU BIT)

RETURNS @mytable TABLE 	–- multistatement table-valued function

(MA_GV NCHAR(15), HO NVARCHAR(100), TEN NVARCHAR(10))

AS

BEGIN

IF (@GV_COHUU = 'TRUE')

INSERT INTO @mytable( MA_GV, HO, TEN )

SELECT MA_GV, HO, TEN FROM GIANG_VIEN_CO_HUU

WHERE	NIENKHOA=@NIENKHOA

ELSE

INSERT INTO @mytable( MA_GV, HO, TEN )

SELECT MA_GV, HO, TEN FROM GIANG_VIEN_THINH_GIANG

WHERE	NIENKHOA=@NIENKHOA

RETURN

END

## Date and Time Functions

These scalar functions perform an operation on a date and time input value and return a string, numeric, or date and time value.

This table lists the date and time functions and their determinism property.

**Bảng trích từ tài liệu:**

| Function | Determinism |
| --- | --- |
| DATEADD | Deterministic |
| DATEDIFF | Deterministic |
| DATEPART | Deterministic except when used as DATEPART (dw, date). dw, the weekday datepart, depends on the value set by SET DATEFIRST, which sets the first day of the week. |
| DAY | Deterministic |
| GETDATE | Nondeterministic |
| GETUTCDATE | Nondeterministic |
| MONTH | Deterministic |
| YEAR | Deterministic |

Returns a new datetime value based on adding an interval to the specified date.

**Syntax**

DATEADD ( datepart , number, date )

**Arguments**

datepart

Is the parameter that specifies on which part of the date to return a new value. The table lists the dateparts and abbreviations recognized by Microsoft® SQL Server™.

**Bảng trích từ tài liệu:**

| Datepart | Abbreviations |
| --- | --- |
| Year | yy, yyyy |
| quarter | qq, q |
| Month | mm, m |
| dayofyear | dy, y |
| Day | dd, d |
| Week | wk, ww |
| Hour | hh |
| minute | mi, n |
| second | ss, s |
| millisecond | ms |

number

Is the value used to increment datepart. If you specify a value that is not an integer, the fractional part of the value is discarded. For example, if you specify day for datepart and1.75 for number, date is incremented by 1.

date

Is an expression that returns a datetime or smalldatetime value, or a character string in a date format. For more information about specifying dates, see datetime and smalldatetime.

If you specify only the last two digits of the year, values less than or equal to the last two digits of the value of the two digit year cutoff configuration option are in the same century as the cutoff year. Values greater than the last two digits of the value of this option are in the century that precedes the cutoff year. For example, if two digit year cutoff is 2049 (default), 49 is interpreted as 2049 and 2050 is interpreted as 1950. To avoid ambiguity, use four-digit years.

**Return Types**

Returns datetime, but smalldatetime if the date argument is smalldatetime.

## DATEDIFF

Returns the number of date and time boundaries crossed between two specified dates.

**Syntax**

DATEDIFF ( datepart , startdate , enddate )

**Arguments**

datepart

Is the parameter that specifies on which part of the date to calculate the difference. The table lists dateparts and abbreviations recognized by Microsoft® SQL Server™.

**Bảng trích từ tài liệu:**

| Datepart | Abbreviations |
| --- | --- |
| Year | yy, yyyy |
| quarter | qq, q |
| Month | mm, m |
| dayofyear | dy, y |
| Day | dd, d |
| Week | wk, ww |
| Hour | hh |
| minute | mi, n |
| second | ss, s |
| millisecond | ms |

startdate

Is the beginning date for the calculation. startdate is an expression that returns a datetime or smalldatetime value, or a character string in a date format.

Because smalldatetime is accurate only to the minute, when a smalldatetime value is used, seconds and milliseconds are always 0.

If you specify only the last two digits of the year, values less than or equal to the last two digits of the value of the two digit year cutoff configuration option are in the same century as the cutoff year. Values greater than the last two digits of the value of this option are in the century that precedes the cutoff year. For example, if the two digit year cutoff is 2049 (default), 49 is interpreted as 2049 and 2050 is interpreted as 1950. To avoid ambiguity, use four-digit years.

For more information about specifying time values, see Time Formats. For more information about specifying dates, see datetime and smalldatetime.

enddate

Is the ending date for the calculation. enddate is an expression that returns a datetime or smalldatetime value, or a character string in a date format.

**Return Types**

integer

**Remarks**

startdate is subtracted from enddate. If startdate is later than enddate, a negative value is returned.

DATEDIFF produces an error if the result is out of range for integer values. For milliseconds, the maximum number is 24 days, 20 hours, 31 minutes and 23.647 seconds. For seconds, the maximum number is 68 years.

The method of counting crossed boundaries such as minutes, seconds, and milliseconds makes the result given by DATEDIFF consistent across all data types. The result is a signed integer value equal to the number of datepart boundaries crossed between the first and second date. For example, the number of weeks between Sunday, January 4, and Sunday, January 11, is 1.

## DATEPART

Returns an integer representing the specified datepart of the specified date.

**Syntax**

DATEPART ( datepart , date )

**Arguments**

datepart

Is the parameter that specifies the part of the date to return. The table lists dateparts and abbreviations recognized by Microsoft® SQL Server™.

**Bảng trích từ tài liệu:**

| Datepart | Abbreviations |
| --- | --- |
| year | yy, yyyy |
| quarter | qq, q |
| month | mm, m |
| dayofyear | dy, y |
| day | dd, d |
| week | wk, ww |
| weekday | dw |
| hour | hh |
| minute | mi, n |
| second | ss, s |
| millisecond | ms |

The week (wk, ww) datepart reflects changes made to SET DATEFIRST. January 1 of any year defines the starting number for the week datepart, for example: DATEPART(wk, 'Jan 1, xxxx') = 1, where xxxx is any year.

The weekday (dw) datepart returns a number that corresponds to the day of the week, for example: Sunday = 1, Saturday = 7. The number produced by the weekday datepart depends on the value set by SET DATEFIRST, which sets the first day of the week.

date

Is an expression that returns a datetime or smalldatetime value, or a character string in a date format. Use the datetime data type only for dates after January 1, 1753. Store dates as character data for earlier dates. When entering datetime values, always enclose them in quotation marks. Because smalldatetime is accurate only to the minute, when a smalldatetime value is used, seconds and milliseconds are always 0.

If you specify only the last two digits of the year, values less than or equal to the last two digits of the value of the two digit year cutoff configuration option are in the same century as the cutoff year. Values greater than the last two digits of the value of this option are in the century that precedes the cutoff year. For example, if two digit year cutoff is 2049 (default), 49 is interpreted as 2049 and 2050 is interpreted as 1950. To avoid ambiguity, use four-digit years.

For more information about specifying time values, see Time Formats. For more information about specifying dates, see datetime and smalldatetime.

**Return Types**

int

**Remarks**

The DAY, MONTH, and YEAR functions are synonyms for DATEPART(dd, date), DATEPART(mm, date), and DATEPART(yy, date), respectively.

## GETDATE

Returns the current system date and time in the Microsoft® SQL Server™ standard internal format for datetime values.

**Syntax**

GETDATE ( )

**Return Types**

datetime

**Remarks**

Date functions can be used in the SELECT statement select list or in the WHERE clause of a query.

In designing a report, GETDATE can be used to print the current date and time every time the report is produced. GETDATE is also useful for tracking activity, such as logging the time a transaction occurred on an account.

**Examples**

## Mathematical Functions

These scalar functions perform a calculation, usually based on input values provided as arguments, and return a numeric value.

**Bảng trích từ tài liệu:**

| ABS | DEGREES | RAND |
| --- | --- | --- |
| ACOS | EXP | ROUND |
| ASIN | FLOOR | SIGN |
| ATAN | LOG | SIN |
| ATN2 | LOG10 | SQUARE |
| CEILING | PI | SQRT |
| COS | POWER | TAN |
| COT | RADIANS |  |

Note  Arithmetic functions, such as ABS, CEILING, DEGREES, FLOOR, POWER, RADIANS, and SIGN, return a value having the same data type as the input value. Trigonometric and other functions, including EXP, LOG, LOG10, SQUARE, and SQRT, cast their input values to float and return a float value.

## String Functions

These scalar functions perform an operation on a string input value and return a string or numeric value.

**Bảng trích từ tài liệu:**

| ASCII | NCHAR | SOUNDEX |
| --- | --- | --- |
| CHAR | PATINDEX | SPACE |
| CHARINDEX | REPLACE | STR |
| DIFFERENCE | QUOTENAME | STUFF |
| LEFT | REPLICATE | SUBSTRING |
| LEN | REVERSE | UNICODE |
| LOWER | RIGHT | UPPER |
| LTRIM | RTRIM |  |

All built-in string functions, except for CHARINDEX and PATINDEX, are deterministic. They return the same value any time they are called with a given set of input values.

---

## 4.10. Các mức bảo mật

Nguồn: BaiGiangSQLServer2014/C5_CacMucBaoMat.docx.

_Nguồn: BaiGiangSQLServer2014/C5_CacMucBaoMat.docx._

Caùc möùc baûo maät:

Server : Login name, Pass

DB : User Name

Table : Grant / Revoke:
  USER BINH chæ ñöôïc quyeàn xem ñieåm, toaøn quyeàn treân SINHVIEN

LOP, MONHOC khoâng ñöôïc quyeàn

Field : Grant / Revoke :  SINHVIEN : user HOANG chæ ñöôïc quyeàn hieäu chænh field HO, TEN, khoâng ñöôïc xem NGAYSINH

Ví dụ:

1. Tạo login thu , pass : 123 là owner của csdl QUANLYDIEMSV:

Tạo nhóm Admin : thuộc nhóm db_owner

Muốn user là owner tạo login mới thì login của owner  ( securityadmin, dbcreator, processadmin)

User của login thu thuộc nhóm Admin

2. Tạo login thinh , pass : 123 là user của csdl QUANLYDIEMSV,  toàn quyền read/write trên csdl, nhưng khg tạo đc login mới, không backup và restore đc csdl.

- Tạo nhóm Nhanvien : thuộc nhóm db_datareader, db_datawriter

- Tạo login Thinh , pass ; user của Thinh thuộc nhóm Nhanvien

3. Không cho login Thinh quyền trên table Bangdiem

4. Không cho login Thinh quyền select/ update trên field Sinhvien.Diachi

BT:

1. Taïo 1 login name 'QLDSV' vôùi user name laø 'OWN' laø chuû csdl QLDSV

2. Ñaêng nhaäp vaøo Server vôùi login QLDSV, taïo 1 user teân HoaAn coù caùc quyeàn sau:
- Chæ xem ñöôïc table ñieåm

Chæ ñöôïc quyeàn hieäu chænh hoï teân sinh vieân

Khoâng ñöôïc quyeàn söûa malop trong table LOP, MAMH trong table MONHOC

Giaû söû csdl QLDSV seõ coù 2 nhoùm ngöôøi duøng: PDT, SINHVIEN.

PDT seõ coù toaøn quyeàn treân CSDL, taïo/xoùa user, ñoåi password cho caùc users, backup/restore CSDL

SINHVIEN chæ ñöôïc quyeàn xem DIEM, ñoåi password cuûa chính mình

YEÂU CAÀU;

Vieát 1 SP teân Tao_Nhom ñeå taïo ñöôïc 2 nhoùm treân

Vieát 1 SP teân TaoLogin coù 4 tham soá : loginname, password, username, rolename thöïc thi caùc yeáu caàu sau:

Kieåm tra loginname ñaõ coù chöa , neáu coù roài traû veà 1 , keát thuùc

Neáu chöa coù thì taïo login vôùi password, username töông öùng (giaû söû username chöa coù)

Neáu rolename = 'PDT' thì:

+ Ñöa username vaøo nhoùm PDT

+ Ñöa Loginname vaøo caùc nhoùm : SecurityAdmin, ProcessAdmin, DBCreator

Neáu rolename ='SINHVIEN' thì:

+ Ñöa username vaøo nhoùm SINHVIEN

+ Ñöa Loginname vaøo nhoùm : SecurityAdmin

RETURN 0

---

## 4.11. Các mức Isolation Level

Nguồn: BaiGiangSQLServer2014/Các-Mức-Isolation-Level.docx.

_Nguồn: BaiGiangSQLServer2014/Các-Mức-Isolation-Level.docx._

### Các Mức Isolation Level

Vũ Huy Tâm

Isolation level là một thuộc tính của transaction, qui định mức độ cô lập của dữ liệu mà transaction có thể truy nhập vào khi dữ liệu đó đang được cập nhật bởi một transaction khác. Khi một transaction cập nhật dữ liệu đang diễn ra, một phần dữ liệu sẽ bị thay đổi (ví dụ một số bản ghi của bảng được sửa đổi hoặc bị xóa bỏ, một số được thêm mới), vậy các transaction hoặc truy vấn khác xảy ra đồng thời và cùng tác động vào các bản ghi đó sẽ diễn ra thế nào? Chúng sẽ phải đợi đến khi transaction đầu hoàn thành hay có thể thực hiện song song, kết quả dữ liệu nhận được là trong khi hay sau khi cập nhật? Bạn có thể điều khiển những hành vi này thông qua việc đặt isolation level của từng transaction. SQL Server cung cấp các mức isolation level sau xếp theo thứ tự tăng dần của mức độ cô lập của dữ liệu: Read Uncommitted, Read Commited, Repeatable Read, và Serializable. Từ bản 2005 bắt đầu bổ sung thêm một loại mới là Snapshot. Phần còn lại của bài này sẽ đi vào chi tiết của từng loại.

#### 1. Read Uncommitted

Khi transaction thực hiện ở mức này, các truy vấn vẫn có thể truy nhập vào các bản ghi đang được cập nhật bởi một transaction khác và nhận được dữ liệu tại thời điểm đó mặc dù dữ liệu đó chưa được commit (uncommited data). Nếu vì lý do nào đó transaction ban đầu rollback lại những cập nhật, dữ liệu sẽ trở lại giá trị cũ. Khi đó transaction thứ hai nhận được dữ liệu sai. Hãy tìm hiểu qua ví dụ sau:

CREATE TABLE dbo.Item (id INT, NAME VARCHAR(50))

INSERT INTO dbo.Item SELECT 1,'a'

INSERT INTO dbo.Item SELECT 2,'b'

INSERT INTO dbo.Item SELECT 3,'c'

SELECT * FROM dbo.Item

Nay bạn hãy mở hai cửa sổ trong Management Studio, ở cửa số thứ nhất bạn nhập vào:

BEGIN TRAN

UPDATE dbo.Item

SET name = 'x'

WHERE id=3

WAITFOR DELAY '00:00:20' --wait for 20 seconds

ROLLBACK

Và ở cửa sổ thứ hai bạn nhập:

SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED

SELECT * FROM dbo.Item

Giờ bạn thực hiện đoạn lệnh ở cửa sổ thứ nhất rồi nhanh chóng chuyển sang thực hiện đoạn lệnh ở cửa sổ thứ hai. Bạn sẽ thấy cửa số thứ hai trả về bản ghi số 3 với name = ‘x’. Tuy nhiên sau đó transaction ở cửa số thứ nhất bị rollback và sau khi cả hai transaction kết thúc, bản ghi số 3 lại trở lại giá trị ban đầu name=’c’. Như vậy là transaction ở cửa sổ thứ hai đã nhận được dữ liệu sai vì dữ liệu này chưa được commit. Hiện tượng này gọi là uncommited read, hay còn gọi là dirty read.  Ưu điểm của mức isolation này là tăng độ tương tranh trong database, các tiến trình đọc không cần đợi đến khi tiến trình ghi hoàn tất mà có thể lấy dữ liệu ra được ngay. Nói nôm na là yêu cầu đọc của nó là “tôi không cần biết dữ liệu có đang được cập nhật hay không, hãy cho tôi dữ liệu hiện có ngay tại thời điểm này”. Tùy theo ứng dụng của bạn mà bạn có thể đặt mức isolation này không, nếu việc đọc sai như trên là không thể chấp nhận được bạn cần đặt mức isolation cao hơn. Còn nếu có thể dung thứ được thì đặt mức này sẽ giúp tăng hiệu năng đọc cho hệ thống.
Chú ý là mức isolation này tương được với gợi ý “NOLOCK” khi truy vấn bảng, đoạn lệnh ở cửa sổ thứ hai tương đương với:

SELECT * FROM dbo.Item WITH (NOLOCK)

#### 2. Read Commited

Đây là mức isolation mặc định, nếu bạn không đặt gì cả thì transaction sẽ hoạt động ở mức này. Transaction sẽ không đọc được dữ liệu đang được cập nhật mà phải đợi đến khi việc cập nhật thực hiện xong. Vì thế nó tránh được dirty read như ở mức trên. Giờ hãy sửa lại đoạn lệnh ở cửa số thứ hai thành:

SET TRANSACTION ISOLATION LEVEL READ COMMITTED

SELECT * FROM dbo.Item

Và thực hiện lại hai cửa sổ theo trình tự như trên, bạn sẽ thấy cửa sổ thứ hai không trả về kết quả ngay mà phải đợi đến khi cửa số thứ nhất thực hiện xong. Và lần này cửa sổ thứ hai trả về dữ liệu đúng.

Tuy nhiên nếu transaction thứ hai insert thêm bản ghi nằm trong phạm vi cập nhật của transaction thứ nhất, nó vẫn được phép làm như vậy và gây nhiễu đến transaction thứ nhất. Giờ hãy sửa lại code ở hai cửa sổ thành:
Cửa sổ 1

BEGIN TRAN

UPDATE dbo.Item

SET name = 'x'

WHERE id=3

WAITFOR DELAY '00:00:10' --wait for 10 seconds

--ROLLBACK

COMMIT

SELECT * FROM dbo.Item

Cửa sổ hai:

SET TRANSACTION ISOLATION LEVEL READ COMMITTED

INSERT INTO dbo.Item SELECT 5,'e'

Sau khi thực hiện cả hai cửa sổ bạn sẽ thấy kết quả trả về có chứa bản ghi 5 với name = ‘e’. Điều này hoàn toàn bất ngờ vì theo trình tự thực hiện đoạn lệnh ở cửa sổ thứ nhất, tất cả các bản ghi với id=3 đều được cập nhật. Trong tình huống trên, bản ghi có id=5 đã xuất hiện sau khi bảng được cập nhật nhưng trước khi transaction kết thúc. Vì thế nó được gọi là bản ghi ma (phantom row).

#### 3. Repeatable read

Mức isolation này hoạt động như mức read commited nhưng nâng thêm một nấc nữa bằng cách ngăn không cho transaction ghi vào dữ liệu đang được đọc bởi một transaction khác cho đến khi transaction khác đó hoàn tất. Trở lại hai cửa sổ:
Cửa số 1:

SET TRANSACTION ISOLATION LEVEL REPEATABLE READ

BEGIN TRAN

SELECT * FROM dbo.Item

WAITFOR DELAY '00:00:20' --wait for 10 seconds

SELECT * FROM dbo.Item

COMMIT

Cửa sổ 2:

UPDATE dbo.Item

SET name = 'x'

WHERE id=3

SELECT * FROM item

Khi thực hiện code ở hai cửa sổ liên tiếp nhau, hai lệnh select ở cửa sổ 1 cho cùng kết quả và cửa sổ 2 phải đợi đến khi cửa sổ 1 hoàn tất mới được thực hiện. Mức isolation này đảm bảo các lệnh đọc trong cùng một transaction cho cùng kết quả, nói cách khác dữ liệu đang được đọc sẽ được bảo vệ khỏi cập nhật bởi các transaction khác. Tuy nhiên nó không bảo vệ được dữ liệu khỏi insert hoặc delete: nếu bạn thay lệnh update ở cửa sổ thứ hai bằng lệnh insert, hai lệnh select ở cửa sổ đầu sẽ cho kết quả khác nhau. Vì thế nó vẫn không tránh được hiện tượng bản ghi ma.

#### 4. Serializable

Mức isolation này tăng thêm một cấp nữa và khóa toàn bộ dải các bản ghi có thể bị ảnh hưởng bởi một transaction khác, dù là UPDATE/DELETE bản ghi đã có hay INSERT bản ghi mới. Nếu bạn thay cửa sổ 1 bằng đoạn code

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE

BEGIN TRAN

UPDATE dbo.Item

SET name = 'x'

WHERE id=3

WAITFOR DELAY '00:00:10' --wait for 10 seconds

SELECT * FROM dbo.Item

--ROLLBACK

COMMIT

SELECT * FROM dbo.Item

và cửa sổ 2 bằng

INSERT INTO dbo.Item SELECT 4,'d'Cửa sổ 2 sẽ bị treo đến khi cửa sổ 1 thực hiện xong, và hai lệnh SELECT trong cửa sổ 1 trả về kết quả giống nhau.

#### 5. Snapshot

Mức độ này cũng đảm bảo độ cô lập tương đương với Serializable, nhưng nó hơi khác ở phương thức hoạt động. Khi transaction đang select các bản ghi, nó không khóa các bản ghi này lại mà tạo một bản sao (snapshot) và select trên đó. Vì vậy các transaction khác insert/update lên các bản ghi đó không gây ảnh hưởng đến transaction ban đầu. Tác dụng của nó là giảm blocking giữa các transaction mà vẫn đảm bảo tính toàn vẹn dữ liệu. Tuy nhiên cái giá kèm theo là cần thêm bộ nhớ để lưu bản sao của các bản ghi, và phần bộ nhớ này là cần cho mỗi transaction do đó có thể tăng lên rất lớn. Để thiết lập isolation mức này bạn cần đặt lại option của database:

ALTER DATABASE TestDB

SET ALLOW_SNAPSHOT_ISOLATION ON

#### Về phạm vi áp dụng các mức isolation

Các mức isolation từ 1 – 4 kể trên tăng theo thứ tự mức độ cô lập dữ liệu, giúp tăng tính toàn vẹn dữ liệu và nhất quán của transaction. Đồng thời nó cũng tăng thời gian chờ lẫn nhau của các transaction. Khi càng lên mức cao, đòi hỏi về tính toàn vẹn dữ liệu càng cao và càng có nhiều tình huống một transaction ngăn không cho các transaction khác truy nhập vào dữ liệu mà nó đang thao tác. Do đó nó càng tăng tình trạng locking và blocking trong database (ngoại trừ với snapshot thì tăng lượng bộ nhớ cần sử dụng). Hiệu năng của hệ thống do đó bị giảm đi. Thông thường, mức isolation read commited (mức mặc định) là phù hợp trong đa số các ứng dụng. Có thể một vài chức năng quan trọng (ví dụ chức năng ở trang admin update dữ liệu có ảnh hưởng đến toàn hệ thống) bạn cần tính toàn vẹn cao và phải chọn mức isolation cao hơn. Hoặc có những chức năng cần ưu tiên tốc độ thực hiện và có thể chấp nhận một chút dữ liệu không nhất quán, bạn có thể đặt xuống mức read uncommited. Bảng dưới đây tóm tắt các tính năng của từng mức isolation.

**Bảng trích từ tài liệu:**

| Mức Isolation | Dirty read | Nonrepeatable read | Phantom read |
| --- | --- | --- | --- |
| Read Uncommitted | Yes | Yes | Yes |
| Read Committed | No | Yes | Yes |
| Repeatable read | No | No | Yes |
| Serializable | No | No | No |
| Snapshot | No | No | No |

---

## 4.12. Giao tác phân tán

Nguồn: BaiGiangSQLServer2014/GiaoTac_PhanTan.docx.

_Nguồn: BaiGiangSQLServer2014/GiaoTac_PhanTan.docx._

**GIAO TÁC PHÂN TÁN**

I. GIAO TÁC TRÊN CƠ SỞ DỮ LIỆU TẬP TRUNG:  T-SQL

1. Biến @@TRANCOUNT: trả về số giao tác đang hoạt động trên kết nối hiện tại

Kiểu trả về : integer

Lệnh  BEGIN TRANSACTION sẽ tăng @@TRANCOUNT thêm 1. ROLLBACK TRANSACTION sẽ cho @@TRANCOUNT về 0. Tuy nhiên, nếu ta dùng ROLLBACK TRANSACTION savepoint_name thì sẽ không ảnh hưởng đến biến @@TRANCOUNT. Lệnh COMMIT TRANSACTION hoặc  COMMIT WORK sẽ giảm bớt 1 trên biến @@TRANCOUNT .

Ví dụ:

Create Proc sp_UpperName

**@ten Nvarchar(50)**

**AS**

BEGIN TRANSACTION

UPDATE nhanvien SET ten = upper(ten)

WHERE ten = @ten

IF @@ROWCOUNT = 2

COMMIT TRAN

IF @@TRANCOUNT > 0

BEGIN			-- update

ROLLBACK TRAN

PRINT 'Lenh da bi huy'

END

Giải thích chức năng của sp_UpperName ?
2. SAVE TRANSACTION

Ghi lại 1 vị trí trong giao tác

Syntax

SAVE TRANSACTION  { savepoint_name | @savepoint_variable }

Arguments

savepoint_name:  là tên được gán cho vị trí mà ta muốn ghi lại. Tên của savepoint giống như tên của id (tối đa là 32 ký tự)

@savepoint_variable : biến chứa tên của savepoint. Biến này chỉ thuộc về các kiểu char, varchar, nchar, or nvarchar .

The savepoint định nghĩa 1 vị trí trong giao tác để ta có thể hủy 1 phần lệnh trong giao tác .

**SAVE TRANSACTION không hỗ trợ trong môi trường distributed transactions .**

Examples

This example changes the royalty (tiền bản quyền) split for the two authors of The Gourmet Microwave. Because the database would be inconsistent between the two updates, they must be grouped into a user-defined transaction.

BEGIN TRANSACTION royaltychange

UPDATE titleauthor

SET royaltyper = 65

WHERE royaltyper = 75

AND title = 'The Gourmet Microwave'

UPDATE titleauthor

SET royaltyper = 35

WHERE royaltyper = 25

AND title = 'The Gourmet Microwave'

SAVE TRANSACTION percentchanged

/*

After having updated the royaltyper entries for the two authors, the

user inserts the savepoint percentchanged, and then determines how a

10-percent increase in the book's price would affect the authors' royalty earnings.

*/

UPDATE titles

SET price = price * 1.1

WHERE title = 'The Gourmet Microwave'

SELECT (price * royalty * ytd_sales) * royaltyper

FROM titles, titleauthor

WHERE title = 'The Gourmet Microwave'

AND titles.title_id = titleauthor.title_id

/* The transaction is rolled back to the savepoint with the ROLLBACK TRANSACTION statement.

*/

ROLLBACK percentchanged

COMMIT TRANSACTION

/* End of royaltychange. */

## 3. BEGIN TRANSACTION WITH MARK

Đánh dấu điểm bắt đầu của 1 giao tác cục bộ. BEGIN TRANSACTION sẽ làm tăng @@TRANCOUNT lên 1.

Syntax

BEGIN TRANSACTION [ transaction_name | @tran_name_variable
    [ WITH MARK [ 'description' ] ] ]

Arguments

transaction_name

Is the name assigned to the transaction. transaction_name must conform to the rules for identifiers but identifiers longer than 32 characters are not allowed. Use transaction names only on the outermost pair of nested BEGIN...COMMIT or BEGIN...ROLLBACK statements.

@tran_name_variable

Is the name of a user-defined variable containing a valid transaction name. The variable must be declared with a char, varchar, nchar, or nvarchar data type.

WITH MARK ['description']

Chỉ ra  transaction được đánh dấu trong file nhật ký. description là 1 chuỗi mô tả ý nghĩa vị trí đánh dấu.

Nếu WITH MARK được dùng, tên giao tác phải có trong câu lệnh. WITH MARK cho phép phục hồi giao tác tới vị trí này

Remarks

BEGIN TRANSACTION represents a point at which the data referenced by a connection is logically and physically consistent. Nếu phát hiện lỗi, tất cả data đã thay đổi sẽ quay trở lại trạng thái ban đầu.

BEGIN TRANSACTION starts a local transaction for the connection issuing the statement. Depending on the current transaction isolation level settings, many resources acquired to support the Transact-SQL statements issued by the connection are locked by the transaction until it is completed with either a COMMIT TRANSACTION or ROLLBACK TRANSACTION statement.

Although BEGIN TRANSACTION starts a local transaction, it is not recorded in the transaction log until the application subsequently performs an action that must be recorded in the log, such as executing an INSERT, UPDATE, or DELETE statement. An application can perform actions such as acquiring locks to protect the transaction isolation level of SELECT statements, but nothing is recorded in the log until the application performs a modification action.

Naming multiple transactions in a series of nested transactions with a transaction name has little effect on the transaction. Only the first (outermost) transaction name is registered with the system. A rollback to any other name (other than a valid savepoint name) generates an error. None of the statements executed before the rollback are in fact rolled back at the time this error occurs. The statements are rolled back only when the outer transaction is rolled back.

BEGIN TRANSACTION starts a local transaction. The local transaction is escalated to a distributed transaction if the following actions are performed before it is committed or rolled back:

An INSERT, DELETE, or UPDATE statement is executed that references a remote table on a linked server. The INSERT, UPDATE, or DELETE statement fails if the OLE DB provider used to access the linked server does not support the ITransactionJoin interface.

A call is made to a remote stored procedure when the REMOTE_PROC_TRANSACTIONS option is set to ON.

The local copy of SQL Server becomes the transaction controller and uses MS DTC to manage the distributed transaction.

Marked Transactions

The WITH MARK option causes the transaction name to be placed in the transaction log. When restoring a database to an earlier state, the marked transaction can be used in place of a date and time. For more information, see Restoring a Database to a Prior State, Recovering to a Named Transaction, and RESTORE.

Additionally, transaction log marks are necessary if you need to recover a set of related databases to a logically consistent state. Marks can be placed in the transaction logs of the related databases by a distributed transaction. Recovering the set of related databases to these marks results in a set of databases that are transactionally consistent. Placement of marks in related databases requires special procedures. For more information, see Backup and Recovery of Related Databases.

The mark is placed in the transaction log only if the database is updated by the marked transaction. Transactions that do not modify data are not marked.

BEGIN TRAN new_name WITH MARK can be nested within an already existing transaction that is not marked. Upon doing so, new_name becomes the mark name for the transaction, despite the name that the transaction may already have been given. In the following example, M2 is the name of the mark.

BEGIN TRAN T1

UPDATE table1 ...

BEGIN TRAN M2 WITH MARK

UPDATE table2 ...

SELECT * from table1

COMMIT TRAN M2

UPDATE table3 ...

COMMIT TRAN T1

Attempting to mark a transaction that is already marked results in a warning (not error) message:

BEGIN TRAN T1 WITH MARK

UPDATE table1 ...

BEGIN TRAN M2 WITH MARK

Server: Msg 3920, Level 16, State 1, Line 3

WITH MARK option only applies to the first BEGIN TRAN WITH MARK.

The option is ignored.

## II. GIAO TÁC PHÂN TÁN :

## 1. Dịch vụ MS DTC

The Microsoft Distributed Transaction Coordinator (MS DTC) là 1 trình quản lý, điều phối các giao tác phân tán, nó cho phép các ứng dụng của client thao tác lên dữ liệu của các data sources trong 1 giao tác phân tán.

The MS DTC service điều phối sự đúng đắn của 1 giao tác phân tán, nó bảo đảm rằng hoặc là tất cả các cập nhật dữ liệu trên tất cả các servers là được thực hiện, hoặc trong trường hợp có lỗi thì xem như chưa thực hiện thao tác gì trên giao tác đó.

## Lưu ý: Nếu dịch vụ MSDTC không hoạt động, Cách khắc phục như sau:
+ Vào CMD và gõ lệnh msdtc.exe -install
+ Sau đó start service tên Distributed Transaction Coordinator
 Nếu không thể khởi động được service thì làm như sau:
 + Vào CMD gõ lệnh: msdtc -resetlog
+ sau đó gõ tiếp lệnh: net start msdtc

## 2. Cú pháp : BEGIN DISTRIBUTED TRANSACTION

Khởi đầu của distributed transaction được quản lý bởi Microsoft Distributed Transaction Coordinator (MS DTC).

**BEGIN DISTRIBUTED { TRAN | TRANSACTION }**

**[ transaction_name | @tran_name_variable ] ;**

## Arguments

transaction_name

là tên giao tác do user định nghĩa; tên giao tác phải tuân thủ qui tắc đặt tên cho danh hiệu và phải  <= 32 ký tự.

@tran_name_variable

là tên của 1 biến chứa tên của giao tác. Biến phải thuộc 1 trong các kiểu char, varchar, nchar, hoặc nvarchar .

## SQL Server Database Engine thực thi lệnh BEGIN DISTRIBUTED TRANSACTION là  transaction gốc và điều khiển việc hoàn thành của transaction. Khi lệnh COMMIT TRANSACTION hoặc ROLLBACK TRANSACTION được thực thi trong  session, server điều khiển sẽ yêu cầu MS DTC hoàn tất distributed transaction trên các  server có liên quan.

**Transaction-level snapshot isolation không hỗ trợ distributed transactions**

The primary way remote instances of the Database Engine are enlisted in a distributed transaction is when a session already enlisted in the distributed transaction executes a distributed query referencing a linked server.

Ví dụ, nếu BEGIN DISTRIBUTED TRANSACTION được thi hành trên ServerA, trong giao tác này gọi 1 stored procedure trên ServerB và gọi 1 stored procedure khác trên ServerC. Stored procedure trên ServerC lại gọi 1 distributed query trên ServerD, và như vậy 4 Servers đều tham gia vào 1 distributed transaction. ServerA là Server chính điều khiển sự hoạt động của transaction.

## Examples

Ví dụ sau sẽ giảm bớt @slgiam (=1) đơn vị của  số lượng vật tư có mã @mavt thuộc bảng CTPN trong 2 phân mảnh. Trong bảng này, ta đã thiết lập 1 Check Constraint SOLUONG > 0. Như vậy, giả sử trong Server hiện tại ta có SOLUONG vật tư @mavt là 3, còn trong SERVER tại LINK1 là 2 thì  giao tác phân tán sẽ COMMIT,nghĩa là sau khi chạy xong SP thì trong Server hiện tại ta sẽ có SOLUONG vật tư @mavt là 2, còn trong SERVER tại LINK1 là 1.

Nhưng nếu thực thi  giao tác này thêm 1 lần nữa thì hệ thống sẽ  roll back  toàn bộ giao tác, nghĩa là  trong Server hiện tại ta vẫn có SOLUONG vật tư @mavt là 2, còn trong SERVER tại LINK1 thì vẫn là 1. Lúc này, ta sẽ nhận 1 thông báo lỗi:

Msg 547, Level 16, State 1, Line 1

The UPDATE statement conflicted with the CHECK constraint "CK_SOLUONG". The conflict occurred in database "QL_VATTU", table "dbo.CTPN", column 'SOLUONG'.

**Bảng trích từ tài liệu:**

| ALTER PROCEDURE SP_GIAM_SLNHAP_MAVT @MAVT NVARCHAR(4), @SLGIAM INTASBEGIN SET XACT_ABORT ON BEGIN DISTRIBUTED TRANSACTION;-- Update SOLUONG from local instance. UPDATE CTPN SET SOLUONG = SOLUONG -@SLGIAM WHERE MAVT = @MAVT; SELECT N'Đã xử lý trên Local Server, đợi 10 giây' WAITFOR DELAY '00:00:10' -- Update SOLUONG from remote instance. UPDATE LINK1.QLVT.DBO.CTPN SET SOLUONG = SOLUONG -@SLGIAM WHERE MAVT = @MAVT; SELECT N'Đã xử lý trên Remote Server, đợi 10 giây' WAITFOR DELAY '00:00:10' COMMIT TRANSACTION;END |
| --- |

SP này khi chạy sẽ mất ít nhất 20 giây. Để tăng tốc độ xử lý, ta sẽ cho các lệnh Update số lượng thực hiện đồng thời cùng 1 lúc trên các Subscriber. Muốn vậy, ta sẽ tạo 2 SP sau trên Server Publisher, sau đó ta sẽ đẩy 2 SP qua các Subscriber:

CREATE PROCEDURE SP_UPDATE_SLNHAP_MAVT

@MAVT NVARCHAR(4), @SLGIAM INT

AS

UPDATE CTPN

SET SOLUONG = SOLUONG -@SLGIAM

WHERE MAVT = @MAVT;

WAITFOR DELAY '00:00:10' -- giả sử SP này chạy mất 10s

Cú pháp: EXEC SP_UPDATE_SLNHAP_MAVT ‘VT01’, 10

## SP thứ 2 muốn gọi SP_UPDATE_SLNHAP_MAVT đồng thời cùng 1 lúc trên các Subscriber thì phải cho sp chạy trong 1 job.

**Bảng trích từ tài liệu:**

| CREATE PROCEDURE SP_GIAM_SLNHAP_MAVT_SONGSONG @MAVT NVARCHAR(4), @SLGIAM INTASBEGIN SET XACT_ABORT ON BEGIN DISTRIBUTED TRANSACTION;-- Update SOLUONG from local instance. DECLARE @STR1 NVARCHAR(4000) SET @STR1='EXEC SP_UPDATE_SLNHAP_MAVT '+'’’'+ @MAVT+''''+','+ STR(@SLGIAM,2) IF EXISTS (SELECT job_id FROM msdb.dbo.sysjobs_view WHERE name = N'Job_1') EXEC msdb.dbo.sp_delete_job @job_name=N'Job_1' execute msdb.dbo.sp_add_job @job_name = N'Job_1', @start_step_id = 1 EXECUTE msdb.dbo.sp_add_jobserver @job_name = N'Job_1', @server_name = @@SERVERNAME execute msdb.dbo.sp_add_jobstep @job_name = N'Job_1' , @step_id = 1, @step_name = 'Update sl', @command = @STR1 , @server = @@SERVERNAME, @database_name = 'QLVT' execute msdb.dbo.sp_start_job @job_name = N'Job_1' -- Update SOLUONG from REMOTE instance. EXEC LINK1.QLVT.DBO.SP_UPDATE_SLNHAP_MAVT @MAVT, @SLGIAM SELECT N'Đã Update xong' COMMIT TRANSACTION;END |
| --- |

## SP_GIAM_SLNHAP_MAVT_SONGSONG do chạy đồng thời trên nhiều Server nên tổng thời gian chạy xem như là thời gian chạy lớn nhất tại 1 Server.

## Locking

Microsoft® SQL Server™  uses locking to ensure transactional integrity and database consistency. Locking prevents users from reading data being changed by other users, and prevents multiple users from changing the same data at the same time. If locking is not used, data within the database may become logically incorrect, and queries executed against that data may produce unexpected results.

Although SQL Server enforces locking automatically, you can design applications that are more efficient by understanding and customizing locking in your applications.

## Customizing the Lock Time-out

When Microsoft® SQL Server™  cannot grant a lock to a transaction on a resource because another transaction already owns a conflicting lock on that resource, the first transaction becomes blocked waiting on that resource. If this causes a deadlock, SQL Server terminates one of the participating transactions (with no time-out involved).

If there is no deadlock, the transaction requesting the lock is blocked until the other transaction releases the lock. By default, there is no mandatory time-out period, and no way to test if a resource is locked before locking it, except to attempt to access the data (and potentially get blocked indefinitely).

Note  The sp_who system stored procedure can be used to determine if a process is being blocked, and who is blocking it.

The LOCK_TIMEOUT setting allows an application to set a maximum time that a statement waits on a blocked resource. When a statement has waited longer than the LOCK_TIMEOUT setting, the blocked statement is canceled automatically, and error message 1222 "Lock request time-out period exceeded" is returned to the application.

However, any transaction containing the statement is not rolled back or canceled by SQL Server. Therefore, the application must have an error handler that can trap error message 1222. If an application does not trap the error, it can proceed unaware that an individual statement within a transaction has been canceled, and errors can occur because statements later in the transaction may depend on the statement that was never executed.

Implementing an error handler that traps error message 1222 allows an application to handle the time-out situation and take remedial action for example, automatically resubmitting the statement that was blocked, or rolling back the entire transaction.

To determine the current LOCK_TIMEOUT setting, execute the @@LOCK_TIMEOUT function, for example:

DECLARE @Timeout int

SELECT @Timeout = @@lock_timeout

SELECT @Timeout

GO

## @@LOCK_TIMEOUT

Returns the current lock time-out setting, in milliseconds, for the current session.

Syntax

@@LOCK_TIMEOUT

Return Types :     integer

Remarks

SET LOCK_TIMEOUT allows an application to set the maximum time that a statement waits on a blocked resource. When a statement has waited longer than the LOCK_TIMEOUT setting, the blocked statement is automatically canceled, and an error message is returned to the application.

At the beginning of a connection, @@LOCK_TIMEOUT returns a value of -1.

Examples

This example shows the result set when a LOCK_TIMEOUT value is not set.

SELECT @@LOCK_TIMEOUT

Here is the result set:

----------------

-1

This example sets LOCK_TIMEOUT to 1800 milliseconds, and then calls @LOCK_TIMEOUT.

SET LOCK_TIMEOUT 1800

SELECT @@LOCK_TIMEOUT

Here is the result set:

------------------------------

1800

## SET LOCK_TIMEOUT

Specifies the number of milliseconds a statement waits for a lock to be released.

Syntax

SET LOCK_TIMEOUT timeout_period

Arguments

timeout_period

Is the number of milliseconds that will pass before Microsoft® SQL Server™ returns a locking error. A value of -1 (default) indicates no time-out period (that is, wait forever).

When a wait for a lock exceeds the time-out value, an error is returned. A value of 0 means not to wait at all and return a message as soon as a lock is encountered.

Remarks

At the beginning of a connection, this setting has a value of -1. After it is changed, the new setting stays in effect for the remainder of the connection.

The setting of SET LOCK_TIMEOUT is set at execute or run time and not at parse time.

The READPAST locking hint provides an alternative to this SET option.

Permissions

SET LOCK_TIMEOUT permissions default to all users.

Examples

This example sets the lock time-out period to 1,800 milliseconds.

SET LOCK_TIMEOUT 1800

GO

---

## 4.13. Transact-SQL Cursor

Nguồn: BaiGiangSQLServer2014/Cursor.docx.

_Nguồn: BaiGiangSQLServer2014/Cursor.docx._

## Transact-SQL Cursors

Transact-SQL cursors là kiểu con trỏ thường được dùng trong stored procedures, triggers. Nó  quản lý 1 tập các  records - là kết quả trả về của 1 phát biểu SQL-Select liên kết với cursor. Ta dùng cursor trong các trường hợp khi muốn xử lý từng mẫu tin trong cursor theo các cách thức khác nhau, hoặc nhận kết quả trả về từ 1 Stored Procedure.

Tiến trình khi sử dụng cursor trong Stored Procedure hoặc Trigger là:

Khai báo các biến để chứa dữ liệu trả về từ cursor. Các biến này phải cùng kiểu dữ liệu với các fields trong SQL-Select.

Liên kết 1 Transact-SQL cursor với 1 SELECT-SQL qua phát biểu DECLARE CURSOR như sau:
DECLARE cursor_name CURSOR 
	[ LOCAL | GLOBAL ] 
	[ FORWARD_ONLY | SCROLL ] 
	[ STATIC | KEYSET | DYNAMIC | FAST_FORWARD ] 
	[ READ_ONLY | SCROLL_LOCKS | OPTIMISTIC ] 
	[ TYPE_WARNING ] 
FOR select_statement 
	[ FOR UPDATE [ OF column_name [ ,...n ] ] ]

Mở cursor :  OPEN  { { [ GLOBAL ] cursor_name } | cursor_variable_name }

Lấy dữ liệu từ  1 mẩu tin trong cursor và đưa dữ liệu đó vào các biến (đã khai báo trong bước 1) qua lệnh FETCH INTO. Transact-SQL cursors không cho phép lấy nhiều mẫu tin cùng 1 lúc.

**Đóng cursor**

I. Khai báo biến dữ liệu : ta dùng lệnh declare để khai báo các biến nhằm để lưu trữ 1 record lấy từ cursor. Các biến này có thể được sử dụng trong các lệnh Transact SQL khác trong Stored Procedure hoặc Trigger.

II. Liên kết 1 Transact-SQL cursor với 1 SQL-SELECT : Ta có thể làm việc trực tiếp trên cursor hoặc qua biến cursor.

1. Làm việc trực tiếp trên cursor :  chẳng hạn như ta tạo 1 cursor tên Employee_Cursor  qua phát biểu Declare như sau:

DECLARE Employee_Cursor CURSOR FOR

SELECT LastName, FirstName FROM Northwind.dbo.Employees

WHERE LastName like 'B%'

OPEN Employee_Cursor   -- Mở cursor

FETCH NEXT FROM Employee_Cursor

WHILE @@FETCH_STATUS = 0

BEGIN

FETCH NEXT FROM Employee_Cursor

END

CLOSE Employee_Cursor   	-- Đóng cursor

DEALLOCATE Employee_Cursor

2. Tạo biến cursor : ta có 2 cách:

a. Tạo trước cursor, sau đó gán nó cho biến cursor:

DECLARE @MyVariable CURSOR

DECLARE MyCursor CURSOR FOR

SELECT LastName FROM Northwind.dbo.Employees

SET @MyVariable = MyCursor

b. Liên kết trực tiếp Select-SQL với biến cursor:

DECLARE @MyVariable CURSOR

SET @MyVariable = CURSOR SCROLL KEYSET FOR

SELECT LastName FROM Northwind.dbo.Employees

Sau khi 1 cursor đã được liên kết với 1 biến cursor, biến cursor có thể được dùng thay cho  tên cursor. Trong Stored procedure, ta cũng có thể khai báo  output parameters có kiểu dữ liệu là cursor và được liên kết với 1 cursor.

Cú pháp lệnh tạo cursor:

DECLARE cursor_name CURSOR 
[ LOCAL | GLOBAL ] 
[ FORWARD_ONLY | SCROLL ] 
[ STATIC | KEYSET | DYNAMIC | FAST_FORWARD ] 
[ READ_ONLY | SCROLL_LOCKS  ] 
FOR select_statement 
[ FOR UPDATE [ OF column_name [ ,...n ] ] ]

- cursor_name : tên cursor do ta đặt.

- LOCAL : phạm vi hoạt động của cursor là cục bộ trong 1 gói, SP, hoặc trigger (nơi mà cursor được tạo) . Cursor  được tự động giải phóng khi ra khỏi phạm vi mà nó được tạo. Đây là giá trị mặc định.

- GLOBAL: phạm vi hoạt động của cursor là toàn cục trên 1 kết nối. Tên cursor có thể được dùng trong trong các SP. Cursor  được tự động giải phóng khi ra khỏi kết nối đó.

- FORWARD_ONLY: ta chỉ được quyền di chuyển con trỏ mẫu tin theo 1 chiều từ mẫu tin đầu đến mẫu tin cuối. Nếu cursor là  FORWARD_ONLY mà không có STATIC, KEYSET, or DYNAMIC , cursor sẽ hoạt động như là 1 DYNAMIC cursor. FORWARD_ONLY là giá trị mặc định, nhưng nếu cursor có kiểu STATIC, KEYSET, or DYNAMIC  thì cursor sẽ là SCROLL.

- KEYSET: các fields và thứ tự của các dòng trong cursor được cố định khi cursor được mở. Tập khóa của các dòng trong cursor được lưu trong 1 table của tempdb  gọi là keyset.

+ Nếu 1 dòng trong table liên kết với cursor bị xóa, lệnh fetch sẽ trả  @@FETCH_STATUS = -2. 
  + Nếu Updates giá trị khóa ở ngoài cursor, sẽ tương đương với việc xóa dòng cũ, thêm dòng, lúc này việc fetch dòng với giá trị cũ sẽ trả về @@FETCH_STATUS = -2. Giá trị mới chỉ thấy được trong cursor, nếu lệnh được thực hiện với WHERE CURRENT OF <tên cursor>.

- DYNAMIC:  Nếu 1 user thay đổi dữ liệu trong base table, thì  cursor kiểu này phản ánh được các dữ liệu đã thay đổi trong base table. Lưu ý rằng Fetch ABSOLUTE không được sử dụng trong trường hợp này.

- FAST_FORWARD: Với FORWARD_ONLY, READ_ONLY cursor sẽ thực thi nhanh, tối ưu hơn. FAST_FORWARD không được sử dụng nếu SCROLL hoặc FOR_UPDATE được sử dụng. FAST_FORWARD và FORWARD_ONLY không được khai báo đồng thời.

- READ_ONLY: không cho hiệu chỉnh các dòng trong cursor. Với READ_ONLY, không thể dùng WHERE CURRENT OF <cursor> trong lệnh Update hoặc Delete.

- SCROLL_LOCKS: các dòng đã cập nhật hoặc xóa trong cursor sẽ bị khóa cho đến khi đóng cursor . SCROLL_LOCKS không thể dùng kèm với  FAST_FORWARD.

select_statement: là 1 phát biểu Select-SQL chuẩn, lệnh select này sẽ định nghĩa 1 tập các mẫu tin cho cursor. Lưu ý: các từ khóa COMPUTE, COMPUTE BY, FOR BROWSE, và INTO không được sử dụng trong select_statement của 1 cursor.

UPDATE [OF column_name [,...n]]: cho phép ta hiệu chỉnh các fields trong cursor. Nếu  OF column_name [,...n] được sử dụng, nghĩa là chỉ có các cột được liệt kê trong OF mới được hiệu chỉnh.

## @@FETCH_STATUS

Trả về 1 số nguyên cho biết trạng thái của phát biểu FETCH:

**Bảng trích từ tài liệu:**

| Return value | Mô tả |
| --- | --- |
| 0 | FETCH thành công. |
| -1 | FETCH không được hoặc đã ra khỏi phạm vi tập mẫu tin. |
| -2 | Mẫu tin cần lấy không có (do đã bị xóa ở base table). |

Lưu ý: @@FETCH_STATUS là biến toàn cục cho tất cả cursor trên 1 kết nối.

## FETCH: lấy dữ liệu của dòng đưa vào các biến

FETCH 
        [ [ NEXT | PRIOR | FIRST | LAST 
                | ABSOLUTE { n | @nvar } 
                | RELATIVE { n | @nvar } 
            ] 
            FROM 
        ] 
{ { cursor_name  | @cursor_variable_name } 
[ INTO @variable_name [ ,...n ] ]

NEXT

Trả về dòng kết quả ngay sau dòng hiện tại và cho dòng kết quả trở thành dòng hiện hành. Nếu FETCH NEXT là lệnh đầu tiên đối với cursor, nó sẽ trả về dòng đầu tiên trong tập kết quả.

PRIOR

Trả về dòng kết quả ngay trước dòng hiện tại và cho dòng kết quả trở thành dòng hiện hành. Nếu FETCH PRIOR là lệnh đầu tiên đối với con trỏ, không có dòng nào được trả về .

FIRST

Trả về dòng đầu tiên của cursor và cho nó làm dòng hiện hành.

LAST

Trả về dòng cuối cùng của cursor và cho nó làm dòng hiện hành.

ABSOLUTE {n | @nvar}

Nếu n hoặc @nvar dương, trả về dòng thứ n tính từ đầu cursor và và cho nó làm dòng hiện hành

RELATIVE {n | @nvar}

Nếu n hoặc @nvar dương, trả về dòng thứ n kể từ vị trí dòng hiện hành và cho nó làm dòng hiện hành mới. Nếu n or @nvar =0 thì trả về dòng hiện hành

GLOBAL

Specifies that cursor_name refers to a global cursor.

cursor_name: tên cursor cung cấp dữ liệu

INTO @variable_name[,...n]

Đưa dữ liệu từ các cột trong cursor vào các  biến. Mỗi biến trong danh sách phải tương ứng với mỗi cột trong cursor từ trái sang phải. Số lượng các biến phải khớp với số lượng cột trong cursor.

Examples

A. Use FETCH to store values in variables

USE pubs

GO

-- Declare the variables to store the values returned by FETCH.

DECLARE @au_lname varchar(40), @au_fname varchar(20)

DECLARE authors_cursor CURSOR FOR

SELECT au_lname, au_fname FROM authors

WHERE au_lname LIKE "B%"

ORDER BY au_lname, au_fname

OPEN authors_cursor

-- Perform the first fetch and store the values in variables.

-- Note: The variables are in the same order as the columns

-- in the SELECT statement.

FETCH NEXT FROM authors_cursor INTO @au_lname, @au_fname

-- Check @@FETCH_STATUS to see if there are any more rows to fetch.

WHILE @@FETCH_STATUS = 0

BEGIN

-- Concatenate and display the current values in the variables.

PRINT "Author: " + @au_fname + " " +  @au_lname

-- This is executed as long as the previous fetch succeeds.

FETCH NEXT FROM authors_cursor

INTO @au_lname, @au_fname

END

CLOSE authors_cursor

DEALLOCATE authors_cursor

GO

Author: Abraham Bennet

Author: Reginald Blotchet-Halls

B. Declare a SCROLL cursor and use the other FETCH options

This example creates a SCROLL cursor to allow full scrolling capabilities through the LAST, PRIOR, RELATIVE, and ABSOLUTE options.

USE pubs

GO

-- Execute the SELECT statement alone to show the

-- full result set that is used by the cursor.

SELECT au_lname, au_fname FROM authors

ORDER BY au_lname, au_fname

-- Declare the cursor.

DECLARE authors_cursor SCROLL CURSOR FOR

SELECT au_lname, au_fname FROM authors

ORDER BY au_lname, au_fname

OPEN authors_cursor

-- Fetch the last row in the cursor.

FETCH LAST FROM authors_cursor

-- Fetch the row immediately prior to the current row in the cursor.

FETCH PRIOR FROM authors_cursor

-- Fetch the second row in the cursor.

FETCH ABSOLUTE 2 FROM authors_cursor

-- Fetch the row that is three rows after the current row.

FETCH RELATIVE 3 FROM authors_cursor

-- Fetch the row that is two rows prior to the current row.

FETCH RELATIVE -2 FROM authors_cursor

CLOSE authors_cursor

DEALLOCATE authors_cursor

GO

Ví dụ : Ta có cơ sở dữ liệu gồm có các table:

LENHDAT: chứa các lệnh đặt mua/bán cổ phiếu của các nhà đầu tư

**Bảng trích từ tài liệu:**

| FieldName | Type | Description |
| --- | --- | --- |
| ID | int | Mã số lệnh đặt, PK |
| MACP | char(7) | Mã cổ phiếu |
| NGAYDAT | datetime |  |
| LOAIGD | nchar(1) | Loại giao dịch : <br> M : lệnh mua B : lệnh bán |
| LOAILENH | nchar(10) | Loại lệnh : <br> LO : khớp lệnh liên tục ATO, ATC : khớp lệnh định kỳ |
| SOLUONG | int | Số lượng đặt |
| GIADAT | float | Giá đặt |
| TRANGTHAILENH | nvarchar(30) | Trạng thái lệnh : Chờ khớp Khớp lệnh 1 phần Khớp hết Đã hủy Chưa khớp |

LENHKHOP: chứa các lệnh khớp khi thỏa qui tắc khớp lệnh

**Bảng trích từ tài liệu:**

| FieldName | Type | Description |
| --- | --- | --- |
| IDKHOP | int | Mã số lệnh khớp, PK |
| NGAYKHOP | datetime |  |
| SOLUONGKHOP | int |  |
| GIAKHOP | float |  |
| IDLENHDAT | int | Mã số lệnh đặt, FK |

Viết Stored Procedure tính số lượng cổ phiếu khớp theo thuật tóan khớp lệnh liên tục khi có 1 lệnh mua hoặc bán được gởi đến bảng LENHDAT

**CREATE PROCEDURE CursorLoaiGD**

@OutCrsr CURSOR VARYING OUTPUT,

@macp NVARCHAR( 10), @Ngay NVARCHAR( 50),  @LoaiGD CHAR

AS

SET DATEFORMAT DMY

IF (@LoaiGD='M')

SET @OutCrsr=CURSOR KEYSET FOR

SELECT NGAYDAT, SOLUONG, GIADAT FROM LENHDAT

WHERE MACP=@macp

AND DAY(NGAYDAT)=DAY(@Ngay)AND MONTH(NGAYDAT)= MONTH(@Ngay) AND YEAR(NGAYDAT)=YEAR(@Ngay)

AND LOAIGD=@LoaiGD AND SOLUONG >0

ORDER BY GIADAT DESC, NGAYDAT

ELSE

SET @OutCrsr=CURSOR KEYSET FOR

SELECT NGAYDAT, SOLUONG, GIADAT FROM LENHDAT

WHERE MACP=@macp

AND DAY(NGAYDAT)=DAY(@Ngay)AND MONTH(NGAYDAT)= MONTH(@Ngay) AND YEAR(NGAYDAT)=YEAR(@Ngay)

AND LOAIGD=@LoaiGD AND SOLUONG >0

ORDER BY GIADAT, NGAYDAT

OPEN @OutCrsr

GO

**CREATE PROC SP_KHOPLENH_LO**

@macp NVARCHAR( 10), @Ngay NVARCHAR( 50),  @LoaiGD CHAR,

@soluongMB INT, @giadatMB FLOAT

AS

BEGIN

SET DATEFORMAT DMY

DECLARE @CrsrVar CURSOR , @ngaydat NVARCHAR( 50), @soluong INT,     @giadat FLOAT,  @soluongkhop INT, @giakhop FLOAT

IF (@LoaiGD='B')

EXEC CursorLoaiGD  @CrsrVar OUTPUT, @macp,@Ngay, 'M'

ELSE

EXEC CursorLoaiGD  @CrsrVar OUTPUT, @macp,@Ngay, 'B'

FETCH NEXT FROM @CrsrVar  INTO  @ngaydat , @soluong , @giadat

--SELECT @ngaydat , @soluong , @giadat

WHILE (@@FETCH_STATUS <> -1 AND @soluongMB >0)

BEGIN

IF  (@LoaiGD='B' )

IF  (@giadatMB <= @giadat)

BEGIN

IF @soluongMB > @soluong  -- khớp hết s.lg lệnh mua đặt trước

BEGIN

SET @soluongkhop = @soluong

SET @giakhop = @giadat

SET @soluongMB = @soluongMB - @soluong

UPDATE dbo.LENHDAT

SET SOLUONG = 0

WHERE CURRENT OF @CrsrVar

END

ELSE

BEGIN

SET @soluongkhop = @soluongMB

SET @giakhop = @giadat

UPDATE dbo.LENHDAT

SET SOLUONG = SOLUONG - @soluongMB

WHERE CURRENT OF @CrsrVar

SET @soluongMB = 0

END

--SELECT  @soluongkhop, @giakhop

-- Cập nhật table LENHKHOP

END

ELSE

GOTO THOAT

-- Còn Trường hợp lệnh gởi vào là lệnh mua

FETCH NEXT FROM @CrsrVar INTO  @ngaydat , @soluong , @giadat

END

THOAT:

CLOSE @CrsrVar

DEALLOCATE @CrsrVar

END

_Tài liệu có 1 ảnh/đối tượng media nhúng; phần chữ đã được trích xuất từ OOXML, ảnh được ghi nhận theo thống kê nguồn._

---

## 4.14. Hướng dẫn nhân bản CSDL SQL Server 2014

Nguồn: BaiGiangSQLServer2014/HuongDan_NhanBanCSDL-2014.docx.

_Nguồn: BaiGiangSQLServer2014/HuongDan_NhanBanCSDL-2014.docx._

**Chuẩn bị :**

- Ta tạo 1 folder D:\ReplData để chứa các dữ liệu trao đổi trong quá trình update dữ liệu từ các phân mảnh về cơ sở dữ liệu gốc, và từ cơ sở dữ liệu gốc đến các phân mảnh

- Tiến hành cho folder này là 1 snapshot folder: thực chất là 1 shared folder trong Windows, cho phép các users được quyền read/write (giả sử shared folder có tên \\THU-PC\REPLDATA)

Right click trên folder REPLDATA, chọn Properties, chọn tab Sharing – Share

Chọn Everyone, click Add, và chọn quyền Read/Write như trong hình. Cuối cùng, click nút lệnh Share.

A. To configure distribution

In Microsoft SQL Server Management Studio, connect to the server that will be the Distributor (in many cases, the Publisher and Distributor are the same server), and then expand the server node.

Right-click the Replication folder, and then click Configure Distribution.

Follow the Configure Distribution Wizard to:

Select a Distributor. To use a local Distributor, select '<ServerName>' will act as its own Distributor; SQL Server will create a distribution database and log.

To use a remote Distributor, select Use the following server as the Distributor, and then select a server. The server must already be configured as a Distributor, and the Publisher must be enabled to use the Distributor.

If you select a remote Distributor, you must enter a password on the Administrative Password page for connections made from the Publisher to the Distributor. This password must match the password specified when the Publisher was enabled at the remote Distributor.

Specify a root snapshot folder (for a local Distributor). The snapshot folder is simply a directory that you have designated as a share; agents that read from and write to this folder must have sufficient permissions to access it. Each Publisher that uses this Distributor creates a folder under the root folder, and each publication creates folders under the Publisher folder in which to store snapshot files.

Specify the distribution database (for a local Distributor). The distribution database stores metadata and history data for all types of replication and transactions for transactional replication.

Optionally enable other Publishers to use the Distributor. If other Publishers are enabled to use the Distributor, you must enter a password on the Distributor Password page for connections made from these Publishers to the Distributor.

Optionally script configuration settings. For more information, see Scripting Replication.

**B. Create publications**

Create publications and define articles with the New Publication Wizard. After a publication is created, view and modify publication properties in the Publication Properties - <Publication> dialog box.

**Bảng trích từ tài liệu:**

| Note: |
| --- |
| Publication and article names cannot include any of the following characters: % , * , [ , ] , \\| , : , " , ? , ' , \ , / , < , >. If objects in the database include any of these characters and you want to replicate them, you must specify an article name that is different from the object name in the Article Properties - <Article> dialog box, which is available from the Articles page in the wizard. |

**To create a publication and define articles**

Connect to the Publisher in Microsoft SQL Server Management Studio, and then expand the server node.

Expand the Replication folder, and then right-click the Local Publications folder.

Click New Publication.

Follow the pages in the New Publication Wizard to:

Lưu ý: bỏ chọn table sysdiagrams

Chọn Next :

click here

Ta đặt tên cho publication. Click chọn View Snapshot Agent Status để xem trạng thái cua Snapshot Agent

- Start : Cho Snapshot Agent hoạt động

- Monitor : mở window theo dõi quá trình đồng bộ dữ liệu .
C. Tạo Subscription

Right Click trên 1 publication, chọn New Subscriptions …

Click chọn nút lệnh Add SQL Server Subcriber để chỉ định 1 Server làm nơi chứa cơ sở dữ liệu phân tán. Sau đó, ta chỉ định tiếp 1 cơ sở dữ liệu làm nơi chứa các Article ( nên là 1 cơ sở dữ liệu mới)

_Tài liệu có 46 ảnh/đối tượng media nhúng; phần chữ đã được trích xuất từ OOXML, ảnh được ghi nhận theo thống kê nguồn._

---

## 4.15. Nội dung trích từ Cursor.ppt

Nguồn: `BaiGiangSQLServer2014/Cursor.ppt`.

_Nguồn: `BaiGiangSQLServer2014/Cursor.ppt`._

## Slide 1
www.themegallery.com

1

Cursor

Giáo viên: Lưu Nguyễn Kỳ Thư
Sinh viên: Trịnh Thanh Sử
Email: sutrinh@gmail.com


## Slide 2
www.themegallery.com

2

Nội dung báo cáo


## Slide 3
www.themegallery.com

3

Giới thiệu Cursor

“Cursor là một con troû thöôøng ñöôïc duøng trong stored procedures, triggers. Noù  quaûn lyù 1 taäp caùc  records - laø keát quaû traû veà cuûa 1 phaùt bieåu SQL-Select lieân keát vôùi cursor .”
Thường dùng trong Stored Procedures và Triggers.
Cursor tương tự như RecordSet hay Dataset trong lập trình.


## Slide 4
www.themegallery.com

4

Giới thiệu Cursor

Có 3 loại Cursor:
Transact-SQL Cursor.
API Cursor.
Client Cursor.


## Slide 5
www.themegallery.com

5

Khi nào dùng Cursor?

Cursor chỉ sử dụng một dòng hoặc một block nhỏ của dòng thỏa mệnh đề Select tại một thời điểm thay vì sử dụng tập kết quả từ lệnh Select.
Cursor được dùng trong nhiều ứng dụng tương tác, các ứng dụng online,…


## Slide 6
www.themegallery.com

6

Đặc điểm

Cho phép định vị đến một dòng bất kì trong tập kết quả.
Có thể truy xuất, hiệu chỉnh đến một dòng hoặc một block các dòng trong tập kết quả.
Hỗ trợ nhiều kiểu truy xuất.
Cursor có thể được dùng như kết quả trả về từ SP (xem ví dụ).


## Slide 7
www.themegallery.com

7

Cursor có thể là đối số trả về từ SP

SP trả về  cursor chứa các lệnh mua/bán của 1 cổ phiếu trong 1 ngày

CREATE PROCEDURE CursorLoaiGD
      @OutCrsr CURSOR VARYING OUTPUT, 
     @macp NVARCHAR( 10), @Ngay NVARCHAR( 12),  @LoaiGD CHAR 
AS
SET DATEFORMAT DMY 
SET @OutCrsr = CURSOR FOR 
  SELECT * FROM LENHDAT  WHERE MACP=@macp 
    AND DAY(NGAYDAT) = DAY(@Ngay) AND MONTH( NGAYDAT) = MONTH( @Ngay) AND YEAR(NGAYDAT) = YEAR(@Ngay)  
    AND LOAIGD =@LoaiGD 
OPEN @OutCrsr
GO


## Slide 8
Nhận cursor trả về từ SP

SET DATEFORMAT DMY
DECLARE @CrsrVar CURSOR 
EXEC CursorLoaiGD  @CrsrVar OUTPUT, 'ACB', '7/2/2019', 'M'

FETCH NEXT FROM @CrsrVar
WHILE (@@FETCH_STATUS <> -1)
BEGIN
   FETCH NEXT FROM @CrsrVar
END
CLOSE @CrsrVar
DEALLOCATE @CrsrVar

www.themegallery.com

8


## Slide 9
www.themegallery.com

9

Các bước để thực hiện một Cursor

Khai báo cursor bằng lệnh DECLARE CURSOR kèm theo lệnh SELECT.
Mở Cursor để đưa dữ liệu trong lệnh Select ở trên vào bộ nhớ (populate data).
Truy xuất (FETCH) dữ liệu.
Ở từng vị trí ta có thể UPDATE, DELETE hay INSERT theo ý muốn.
Đóng Cursor: dùng lệnh CLOSE để giải phóng tài nguyên (nhưng cấu trúc Cursor vẫn còn).
Dùng lệnh DEALLOCATE để giải phóng cả tên Cursor.


## Slide 10
www.themegallery.com

10

Giám sát hoạt động của Cursor

Sp_cursor_list: danh sách các cursor trong kết nối hiện hành.
sp_describe_cursor, sp_describe_cursor_columns, sp_describe_cursor_tables: xem đặc tính của Cursor.
@@CURSOR_ROWS: số dòng trong cursor (để xem dùng sp_cursor_list hoặc sp_describe_cursor).
@@FETCH_STATUS: cập nhật trạng thái của lần truy xuất cuối cùng (để xem dùng sp_describe_cursor).


## Slide 11
www.themegallery.com

11

Khai báo một Cursor (T-SQL)

DECLARE tên_cursor CURSOR [ LOCAL | GLOBAL ] [ FORWARD_ONLY | SCROLL ] [ STATIC | KEYSET | DYNAMIC | FAST_FORWARD] [ READ_ONLY | SCROLL_LOCKS | OPTIMISTIC ] FOR câu_lệnh_Select [ FOR UPDATE [ OF tên_cột [ ,...n ] ] ]


## Slide 12
www.themegallery.com

12

Ví dụ: khai báo Cursor (có 2 cách)

Cách 1: tạo trước biến cursor, cursor , sau đó gán cursor cho biến cursor

DECLARE @MyVariable CURSOR
DECLARE MyCursor CURSOR FOR
		SELECT LastName FROM 			Northwind.dbo.Employees
SET @MyVariable=MyCursor 

Cách 2: liên kết trực tiếp biến Cursor với câu lệnh SELECT.
DECLARE @MyVariable CURSOR
SET @MyVariable=CURSOR SCROLL KEYSET FOR SELECT LastName FROM Northwind.dbo.Employees


## Slide 13
www.themegallery.com

13

Đóng/mở một Cursor và DEALLOCATE

Đóng/mở Cursor.
OPEN/CLOSE <tên_Cursor>
Lưu ý: 
Khi mở một Cursor thì vị trí Cursor là liền trước dòng đầu tiên trong câu lệnh SELECT.
Khi đóng Cursor thì tài nguyên được giải phóng nhưng cấu trúc Cursor vẫn còn.


## Slide 14
www.themegallery.com

14

DEALLOCATE

DEALLOCATE { { [ GLOBAL ] tên_Cursor } | @tên_biến_Cursor } 

		Sau khi đóng Cursor để giải phóng tài nguyên Cursor trong phiên làm việc hiện tại nhưng cấu trúc vẫn còn nên sau khi chạy lại mà không dùng DEALLOCATE thì sẽ bị lỗi vì tên Cursor vẫn còn tồn tại.


## Slide 15
www.themegallery.com

15

@@FETCH_STATUS

@@FETCH_STATUS thường sử dụng trong điều kiện kiểm tra trong vòng lặp.
Giá trị trả về: kiển Int.
Bảng giá trị:




Lưu ý: @@FETCH_STATUS có ý nghĩa toàn cục đối với tất cả Cursor trong một kết nối.


## Slide 16
www.themegallery.com

16

Ví dụ về trạng thái @@FETCH_STATUS

use Northwind
CREATE TABLE SV 
(
	MSSV 	INT 	PRIMARY KEY,
	TEN	NVARCHAR(50)	NOT NULL,
	QUE	NVARCHAR(50)	NULL
)
INSERT INTO SV VALUES(1,'Thanh Su','Dong Thap')
INSERT INTO SV VALUES(2,'Tuan Anh','Dak Lak')
select * from SV
declare c1 cursor scroll for select TEN from SV
open c1
fetch last from c1
select @@fetch_status
delete from SV where MSSV=1
fetch first from c1
select @@fetch_status
fetch last from c1
fetch next from c1
select @@fetch_status
close c1
deallocate c1

0

-2

-1


## Slide 17
www.themegallery.com

17

Các kiểu truy xuất (FETCH)

Cú pháp:

	FETCH         [ [ NEXT | PRIOR | FIRST | LAST                 | ABSOLUTE { n | @nvar }                 | RELATIVE { n | @nvar }             ]             FROM         ] { { [ GLOBAL ] tên_cursor } | @tên_biến_Cursor } [ INTO @tên_biến [ ,...n ] ] 

		Trong đó: n là số nguyên không đổi; @nvar là kiểu int, smallint, tinyint.


## Slide 18
www.themegallery.com

18

Các kiểu truy xuất (FETCH)

FETCH FIRST: truy xuất dòng đầu tiên trong Cursor.
FETCH LAST: truy xuất dòng cuối cùng trong Cursor.
FETCH NEXT: truy xuất dòng liền sau. Nếu đây là lệnh Fetch đầu tiên của cursor thì sẽ truy xuất mẫu tin đầu tiên
FETCH PRIOR: truy xuất dòng liền trước.
FETCH ABSOLUTE n: 
n>0: tới n tính từ dòng đầu tiên của cursor.
n<0: lui n dòng so với dòng cuối cùng của cursor.
n=0: không có dòng nào được truy xuất.
FETCH RELATIVE n:
n>0: tới n dòng so với dòng hiện tại.
n<0: lui n dòng so với dòng hiện tại.
n=0: truy xuất cũng ở vị trí hiện tại.


## Slide 19
www.themegallery.com

19

Ví dụ: các kiểu fetch

select LastName,FirstName from Employees
declare contro scroll cursor for
select LastName,FirstName from Employees
open contro
fetch first from contro
fetch absolute 6 from contro
fetch next from contro
fetch last from contro
fetch relative -4 from contro
fetch prior from contro
close contro
deallocate contro


## Slide 20
www.themegallery.com

20

Demo một số ví dụ về Cursor…


## Slide 21
www.themegallery.com

21

Ví dụ: dùng cursor để update 1 dòng

use pubs
select * from pubs.dbo.Authors
DECLARE contro cursor for
select * from pubs.dbo.Authors
open contro
fetch next from contro
update Authors set City='DongThap' where au_id='172-32-1176'
close contro
deallocate contro
select * from pubs.dbo.Authors


## Slide 22
www.themegallery.com

22

Kiểm tra phạm vi Cursor

USE pubs
GO
CREATE PROCEDURE OpenCrsr1
AS
	DECLARE SampleCrsr CURSOR LOCAL FOR SELECT au_lname FROM authors 
	WHERE au_lname LIKE 'S%'	
	OPEN SampleCrsr
GO

CREATE PROCEDURE ReadCrsr1
AS
	FETCH NEXT FROM SampleCrsr
	WHILE (@@FETCH_STATUS <> -1)
	BEGIN
	   FETCH NEXT FROM SampleCrsr
	END
GO
EXEC OpenCrsr1 
EXEC ReadCrsr1

LỖI

GLOBAL


## Slide 23
www.themegallery.com

23

Xem danh sách Cursor hiện hành

declare c1 cursor for select FirstName from Northwind.dbo.Employees
declare c2 cursor for select LastName from Northwind.dbo.Employees
open c1
open c2
declare @contro cursor
exec sp_cursor_list @cursor_return=@contro output,@cursor_scope=3
fetch next from @contro
while @@fetch_status=0
begin
	fetch next from @contro
end
close @contro
close c1
close c2
deallocate @contro
deallocate c1
deallocate c2


## Slide 24
www.themegallery.com

24

Tài liệu tham khảo

SQL Server Books Online.
MS Press - MCDBA Exam 70-229 SQL Server 2K Database Design and Implementation Second Edition.


## Slide 25
www.themegallery.com

25

Thank You !
