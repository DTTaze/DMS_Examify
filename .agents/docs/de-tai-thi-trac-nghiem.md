# Tài liệu yêu cầu đề tài: Thi trắc nghiệm

Nguồn: `ĐỀ TÀI MÔN HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU SQL SERVER.docx`

## 1. Tổng quan

Đề tài xây dựng chương trình **thi trắc nghiệm các môn học theo nhiều trình độ khác nhau**. Chương trình cần hỗ trợ nhập câu hỏi thi, đăng ký lịch thi, tổ chức thi trắc nghiệm, xem lại bài thi và in bảng điểm.

Tên cơ sở dữ liệu theo đề bài: `THI_TRAC_NGHIEM`.

## 2. Mục tiêu chính

- Quản lý lớp, sinh viên, giáo viên, môn học.
- Quản lý ngân hàng câu hỏi trắc nghiệm theo môn học, trình độ và giáo viên soạn.
- Cho phép giáo viên đăng ký lịch thi cho lớp theo môn học, trình độ, lần thi, số câu và thời gian làm bài.
- Cho phép sinh viên đăng nhập, chọn kỳ thi hợp lệ và làm bài trắc nghiệm.
- Chấm điểm, thông báo điểm ngay sau khi thi và ghi kết quả vào bảng điểm.
- Hỗ trợ xem lại bài thi đã làm và in bảng điểm môn học.
- Phân quyền theo nhóm người dùng: `PGV`, `Giangvien`, `Sinhvien`.

## 3. Cơ sở dữ liệu

### 3.1. Bảng `LOP`

| Cột | Kiểu dữ liệu | Ràng buộc |
| --- | --- | --- |
| `MALOP` | `nChar(8)` | Khóa chính, chữ in |
| `TENLOP` | `nVarchar(40)` | Duy nhất, không null |

### 3.2. Bảng `MONHOC`

| Cột | Kiểu dữ liệu | Ràng buộc |
| --- | --- | --- |
| `MAMH` | `nChar(5)` | Khóa chính, chữ in |
| `TENMH` | `nVarchar(40)` | Duy nhất, không null |

### 3.3. Bảng `SINHVIEN`

| Cột | Kiểu dữ liệu | Ràng buộc |
| --- | --- | --- |
| `MASV` | `nChar(8)` | Khóa chính |
| `HO` | `nVarchar(40)` |  |
| `TEN` | `nVarchar(10)` |  |
| `NGAYSINH` | `Date` |  |
| `DIACHI` | `nVarchar(100)` |  |
| `MALOP` | `nChar(8)` | Khóa ngoại đến `LOP` |

### 3.4. Bảng `GIAOVIEN`

| Cột | Kiểu dữ liệu | Ràng buộc |
| --- | --- | --- |
| `MAGV` | `nChar(8)` | Khóa chính |
| `HO` | `nVarchar(40)` |  |
| `TEN` | `nVarchar(10)` |  |
| `SODTLL` | `nChar(15)` | Số điện thoại liên lạc |
| `DIACHI` | `nVarchar(50)` |  |

### 3.5. Bảng `GIAOVIEN_DANGKY`

| Cột | Kiểu dữ liệu | Ràng buộc |
| --- | --- | --- |
| `MAGV` | `nChar(8)` | Khóa ngoại đến `GIAOVIEN` |
| `MALOP` | `nChar(8)` | Khóa ngoại đến `LOP` |
| `MAMH` | `nChar(5)` | Khóa ngoại đến `MONHOC` |
| `TRINHDO` | `nChar(1)` | Chỉ nhận `A`, `B`, `C` |
| `NGAYTHI` | `DateTime` | Mặc định `GETDATE()` |
| `LAN` | `SmallInt` | Từ 1 đến 2 |
| `SOCAUTHI` | `SmallInt` | Từ 10 đến 100 |
| `THOIGIAN` | `SmallInt` | Từ 5 đến 60 phút |

Khóa chính: `MALOP + MAMH + LAN`.

### 3.6. Bảng `BODE`

| Cột | Kiểu dữ liệu | Ràng buộc |
| --- | --- | --- |
| `MAMH` | `Char(5)` | Khóa ngoại đến `MONHOC` |
| `CAUHOI` | `Int` | Tự động tăng, khóa chính |
| `TRINHDO` | `Char(1)` | `A`, `B`, `C` |
| `NOIDUNG` | `NVarChar(200)` | Nội dung câu hỏi |
| `A` | `NVarChar(50)` | Đáp án A |
| `B` | `NVarChar(50)` | Đáp án B |
| `C` | `NVarChar(50)` | Đáp án C |
| `D` | `NVarChar(50)` | Đáp án D |
| `DAP_AN` | `NChar(1)` | Chỉ nhận `A`, `B`, `C`, `D` |
| `MAGV` | `NChar(8)` | Khóa ngoại đến `GIAOVIEN` |

Quy ước trình độ:

- `A`: Đại học, chuyên ngành.
- `B`: Đại học, không chuyên ngành.
- `C`: Cao đẳng.

### 3.7. Bảng `BANGDIEM`

| Cột | Kiểu dữ liệu | Ràng buộc |
| --- | --- | --- |
| `MASV` | `nChar(8)` | Khóa ngoại đến `SINHVIEN` |
| `MAMH` | `nChar(5)` | Khóa ngoại đến `MONHOC` |
| `LAN` | `SmallInt` | Từ 1 đến 2 |
| `NGAYTHI` | `Date` | Mặc định `GETDATE()` |
| `DIEM` | `Float` | Từ 0 đến 10 |

Khóa chính: `MASV + MAMH + LAN`.

## 4. Chức năng chương trình

### 4.1. Đăng nhập

Người dùng phải đăng nhập trước khi sử dụng chương trình.

Màn hình đăng nhập có lựa chọn loại người dùng:

- `GIẢNG VIÊN`
- `SINH VIÊN`

Thông tin đăng nhập:

- `Login`
- `Password`

Đối với sinh viên, tất cả sinh viên dùng chung login `sv` để kết nối. Khi chọn đăng nhập sinh viên, nhãn `Login` chuyển thành `Mã SV`.

### 4.2. Nhập môn học

Form cho phép nhập và quản lý các môn học sẽ thi trắc nghiệm.

Chức năng bắt buộc:

- Thêm.
- Xóa.
- Hiệu chỉnh.
- Phục hồi.
- Tìm.
- Ghi.

### 4.3. Nhập sinh viên

Form cho phép nhập lớp và sinh viên của lớp. Giao diện yêu cầu trình bày sinh viên dưới dạng subform theo lớp.

Chức năng bắt buộc:

- Thêm.
- Xóa.
- Hiệu chỉnh.
- Phục hồi.
- Tìm.
- Ghi.

### 4.4. Nhập giáo viên

Form cho phép nhập và quản lý thông tin giáo viên.

Chức năng bắt buộc:

- Thêm.
- Xóa.
- Hiệu chỉnh.
- Phục hồi.
- Tìm.
- Ghi.

### 4.5. Nhập câu hỏi thi

Form cho phép giáo viên nhập ngân hàng câu hỏi trắc nghiệm.

Yêu cầu:

- Câu hỏi được ghi vào bảng `BODE`.
- Câu hỏi phải thuộc một môn học.
- Câu hỏi phải có trình độ `A`, `B` hoặc `C`.
- Câu hỏi có 4 lựa chọn `A`, `B`, `C`, `D`.
- Đáp án đúng chỉ được thuộc một trong 4 lựa chọn.
- Cần lưu giáo viên soạn câu hỏi thông qua `MAGV`.

### 4.6. Đăng ký thi

Giáo viên đăng ký lịch thi cho một lớp.

Thông tin cần nhập:

- Tên lớp.
- Môn học.
- Trình độ.
- Lần thi.
- Số câu thi.
- Ngày thi.
- Thời gian thi.

Kết quả đăng ký được ghi vào bảng `GIAOVIEN_DANGKY`.

Ràng buộc quan trọng:

- Trước khi ghi đăng ký thi, chương trình phải kiểm tra ngân hàng đề có đủ số câu hỏi theo yêu cầu của giáo viên hay không.
- Số câu thi hợp lệ từ 10 đến 100.
- Thời gian thi hợp lệ từ 5 đến 60 phút.
- Lần thi chỉ từ 1 đến 2.

### 4.7. Thi trắc nghiệm

Luồng thi chính:

1. Chương trình tự động hiển thị mã lớp và tên lớp của sinh viên.
2. Sinh viên chọn môn học, ngày thi và lần thi.
3. Chương trình tự động lấy số câu thi, thời gian thi và trình độ từ đăng ký thi của giáo viên.
4. Sinh viên nhấn `Bắt đầu thi`.
5. Chương trình lọc câu hỏi ngẫu nhiên theo thông số đăng ký.
6. Sinh viên làm bài trong thời gian quy định.
7. Khi hết giờ, chương trình tự động kết thúc bài thi.
8. Chương trình chấm điểm, thông báo điểm ngay và ghi kết quả vào bảng `BANGDIEM`.

Luật chọn câu hỏi:

- Các câu hỏi ngẫu nhiên không được trùng nhau.
- Câu hỏi được lấy theo trình độ `A`, `B` hoặc `C` của đăng ký thi.
- Nếu chọn thi ở trình độ cao, tối thiểu 70% số câu phải đúng trình độ đã chọn.
- Tối đa 30% số câu được phép lấy từ trình độ thấp hơn 1 bậc.
- Diễn giải đề xuất:
  - Thi trình độ `A`: ít nhất 70% câu `A`, tối đa 30% câu `B`.
  - Thi trình độ `B`: ít nhất 70% câu `B`, tối đa 30% câu `C`.
  - Thi trình độ `C`: chỉ lấy câu `C`, vì không còn trình độ thấp hơn.

Luật chấm điểm:

- Điểm lớn nhất là 10.
- Số điểm của các câu là như nhau.
- Điểm có thể tính theo công thức: `DIEM = số câu đúng * 10 / tổng số câu`.

### 4.8. Xem kết quả

Chức năng cho phép xem lại các câu sinh viên đã thi.

Thông tin lọc theo đề bài:

- Tên lớp.
- Môn học.
- Trình độ.
- Login hoặc mã sinh viên của người dùng đã đăng nhập.

Mẫu kết xuất:

```text
Lớp      : xxxxxxxxxxxxxxxxxxxxxxx
Họ tên   : xxxxxxxxxxxxxxxxxxxxxx    Mã số SV:
Môn thi  : xxxxxxxxxxxxxx
Ngày thi : dd/mm/yyyy                Lần thi: ##
```

Bảng chi tiết bài thi:

| STT | Câu số trong bộ đề | Nội dung câu hỏi | A | B | C | D | Trả lời của SV | Đáp án |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 |  |  |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |  |  |

### 4.9. Bảng điểm môn học

Giáo viên chọn:

- Tên lớp.
- Tên môn học.
- Lần thi.

Chương trình in bảng điểm thi hết môn của lớp đã chọn.

Mẫu bảng điểm:

| STT | MASV | Họ | Tên | Điểm | Điểm chữ |
| --- | --- | --- | --- | --- | --- |

### 4.10. Phân quyền

Một tài khoản thuộc một trong các nhóm:

- `PGV`
- `Giangvien`
- `Sinhvien`

| Nhóm | Quyền |
| --- | --- |
| `PGV` | Toàn quyền làm việc; được tạo tài khoản mới cho nhóm `PGV` và `Giangvien`; không có chức năng thi. |
| `Giangvien` | Cập nhật câu hỏi thi; chỉ xem và cập nhật câu hỏi do mình soạn; được thi thử nhưng không ghi điểm; xem lại bài thi của sinh viên; in bảng điểm môn học. |
| `Sinhvien` | Dùng chung một tài khoản đăng nhập; được thi và xem lại bài thi đã thi. |

Ghi chú: Trong đề gốc có câu "PGC không có chức năng thi"; tài liệu này hiểu là `PGV` nếu hệ thống không có nhóm `PGC` riêng.

### 4.11. Tạo tài khoản

Chức năng tạo tài khoản chỉ cho phép tạo tài khoản cho:

- Giảng viên.
- Phòng giáo vụ (`PGV`).

Khi người dùng đăng nhập, hệ thống căn cứ vào nhóm quyền để hiển thị và cho phép sử dụng đúng chức năng tương ứng.

## 5. Luật nghiệp vụ cần kiểm tra kỹ

- Mã lớp và mã môn học nên lưu chữ in theo yêu cầu của đề.
- `TENLOP` và `TENMH` phải duy nhất và không null.
- Mỗi sinh viên bắt buộc thuộc một lớp.
- Mỗi câu hỏi bắt buộc thuộc một môn học và một giáo viên.
- `TRINHDO` chỉ nhận `A`, `B`, `C`.
- `DAP_AN` chỉ nhận `A`, `B`, `C`, `D`.
- Giáo viên chỉ được sửa câu hỏi do chính mình soạn, trừ nhóm toàn quyền nếu hệ thống cho phép.
- Không cho đăng ký thi nếu ngân hàng đề không đủ số câu theo trình độ và tỷ lệ yêu cầu.
- Không chọn trùng câu hỏi trong cùng một đề thi.
- Bài thi phải tự kết thúc khi hết thời gian.
- Kết quả phải ghi nhận theo khóa `MASV + MAMH + LAN`, nên một sinh viên không được có hai điểm cho cùng một môn và cùng một lần thi.
- Giáo viên được thi thử nhưng không ghi điểm vào `BANGDIEM`.

## 6. Checklist triển khai

- Tạo schema và ràng buộc khóa chính, khóa ngoại, unique, check/default đúng theo đề.
- Tạo dữ liệu mẫu cho lớp, môn học, giáo viên, sinh viên và bộ đề.
- Xây dựng đăng nhập theo vai trò.
- Ẩn hoặc khóa chức năng theo nhóm quyền.
- Hoàn thiện CRUD cho môn học, lớp/sinh viên, giáo viên và bộ đề.
- Hoàn thiện đăng ký thi và kiểm tra đủ số câu hỏi.
- Xây dựng thuật toán chọn câu ngẫu nhiên không trùng, đúng tỷ lệ trình độ.
- Xây dựng màn hình làm bài có đếm thời gian.
- Lưu câu trả lời của sinh viên để hỗ trợ xem lại bài thi.
- Chấm điểm theo số câu đúng và lưu điểm vào `BANGDIEM`.
- Xây dựng màn hình xem lại bài thi.
- Xây dựng báo cáo bảng điểm môn học.
- Xây dựng chức năng tạo tài khoản cho `PGV` và `Giangvien`.

## 7. Điểm cần làm rõ thêm khi thiết kế

- Đề bài chưa nêu bảng lưu chi tiết câu trả lời của sinh viên. Để xem lại bài thi, nên bổ sung bảng chi tiết bài thi, ví dụ `CT_BAITHI` hoặc `BAITHI_CHITIET`, lưu `MASV`, `MAMH`, `LAN`, `CAUHOI`, câu trả lời của sinh viên và đáp án tại thời điểm thi.
- Câu "Cho phép user chọn lại các câu đã thi của lần thi trước" cần xác nhận lại ý nghĩa nghiệp vụ: cho phép xem lại câu đã thi, cho phép dùng lại câu trong lần thi sau, hay cho phép sinh viên chọn lại đáp án khi xem bài.
- Cần thống nhất tên cột không dấu trong database/code, ví dụ dùng `DAP_AN` thay cho cách ghi có dấu trong đề gốc.
- Cần xác định có cho sinh viên thi lại cùng môn cùng lần thi hay không. Theo khóa chính `MASV + MAMH + LAN`, hệ thống chỉ lưu một kết quả cho mỗi lần thi.
