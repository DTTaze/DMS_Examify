create procedure usp_LayDanhSachTrinhDo as
begin
	Select distinct TRINHDO AS MaTrinhDo, 
	case TRINHDO 
		when 'A' then N'A - Đại học chuyên ngành'
		when 'B' then N'B - Đại học không chuyên ngành'
		when 'C' then N'C - Cao đẳng'
		else TRINHDO
	end as TenTrinhDo
	from dbo.BODE
	order by TRINHDO ASC
end