USE [THITRACNGHIEM]
GO
/****** Object:  StoredProcedure [dbo].[usp_LayDanhSachDeThi]    Script Date: 06/05/2026 10:50:30 SA ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE usp_LayDanhSachDeThi @MaGV nchar(8) as
begin
	Select [MAMH]
      ,[MALOP]
      ,[TRINHDO]
      ,[NGAYTHI]
      ,[LAN]
      ,[SOCAUTHI]
      ,[THOIGIAN] from dbo.GIAOVIEN_DANGKY where MAGV = @MaGV
end
go