using System.Collections.Generic;

namespace DMS_Examify.Models
{
    public class DangKyThiViewModel
    {
        public List<GiaoVienDangKy> DangKyList { get; set; } = new();
        public List<Lop> LopList { get; set; } = new();
        public List<MonHoc> MonHocList { get; set; } = new();
        public List<TrinhDo> TrinhDoList { get; set; } = new();
        public List<GiaoVienDropdownItem> GiaoVienList { get; set; } = new();
        public bool IsPGV { get; set; }
    }
}
