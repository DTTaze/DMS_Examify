CREATE PROCEDURE [dbo].[SP_TAOTAIKHOAN]
    @LGNAME VARCHAR(50),      -- Tên đăng nhập (Login name)
    @PASS VARCHAR(50),        -- Mật khẩu
    @USERNAME VARCHAR(50),    -- Tên User trong database (thường chính là Mã Giáo Viên - MAGV)
    @ROLE VARCHAR(50)         -- Tên nhóm quyền ('PGV' hoặc 'Giangvien')
AS
BEGIN
    -- 1. Kiểm tra xem Login name đã tồn tại trên Server chưa
    IF EXISTS (SELECT * FROM sys.server_principals WHERE name = @LGNAME)
        RETURN 1; -- Trả về 1: Lỗi do Login name đã tồn tại
        
    -- 2. Kiểm tra xem User (Mã Giáo Viên) đã được cấp tài khoản trong Database chưa
    IF EXISTS (SELECT * FROM sys.database_principals WHERE name = @USERNAME)
        RETURN 2; -- Trả về 2: Lỗi do User này đã có tài khoản rồi
        
    BEGIN TRY
        -- 3. Tạo Login ở mức Server
        EXEC sp_addlogin @loginame = @LGNAME, @passwd = @PASS;
        
        -- 4. Tạo User ở mức Database, liên kết với Login vừa tạo
        EXEC sp_adduser @loginame = @LGNAME, @name_in_db = @USERNAME;
        
        -- 5. Gán User vào Role (Nhóm quyền PGV hoặc Giangvien)
        EXEC sp_addrolemember @rolename = @ROLE, @membername = @USERNAME;
        
        -- Nếu mọi thứ suôn sẻ
        RETURN 0; 
    END TRY
    BEGIN CATCH
        -- Xử lý nếu có lỗi bất ngờ xảy ra trong quá trình tạo
        -- Xóa login nếu bị lỗi giữa chừng để tránh rác hệ thống
        IF EXISTS (SELECT * FROM sys.server_principals WHERE name = @LGNAME)
            EXEC sp_droplogin @loginame = @LGNAME;
            
        RETURN 3; -- Trả về 3: Lỗi hệ thống trong quá trình thực thi
    END CATCH
END
GO