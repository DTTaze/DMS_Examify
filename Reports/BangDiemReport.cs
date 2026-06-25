using DevExpress.XtraReports.UI;
using System;
using System.Drawing;
using DMS_Examify.Models;

namespace DMS_Examify.Reports
{
    public class BangDiemReport : XtraReport
    {
        public BangDiemReport()
        {
            // Initialize parameters
            var paramTenLop = new DevExpress.XtraReports.Parameters.Parameter
            {
                Name = "TenLop",
                Type = typeof(string),
                Value = "",
                Visible = false
            };
            var paramTenMH = new DevExpress.XtraReports.Parameters.Parameter
            {
                Name = "TenMH",
                Type = typeof(string),
                Value = "",
                Visible = false
            };
            var paramLan = new DevExpress.XtraReports.Parameters.Parameter
            {
                Name = "Lan",
                Type = typeof(int),
                Value = 1,
                Visible = false
            };
            var paramTongSo = new DevExpress.XtraReports.Parameters.Parameter
            {
                Name = "TongSo",
                Type = typeof(int),
                Value = 0,
                Visible = false
            };

            Parameters.Add(paramTenLop);
            Parameters.Add(paramTenMH);
            Parameters.Add(paramLan);
            Parameters.Add(paramTongSo);

            // Report settings
            this.PaperKind = DevExpress.Drawing.Printing.DXPaperKind.A4;
            this.Margins = new System.Drawing.Printing.Margins(50, 50, 50, 50); // 0.5 inch
            this.PageWidth = 827; // A4 width in hundredths of an inch
            this.PageHeight = 1169; // A4 height in hundredths of an inch

            // Styles
            var styleTitle = new XRControlStyle
            {
                Name = "TitleStyle",
                Font = new Font("Arial", 16, FontStyle.Bold),
                TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter
            };
            var styleSubTitle = new XRControlStyle
            {
                Name = "SubTitleStyle",
                Font = new Font("Arial", 11, FontStyle.Regular),
                TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter
            };
            var styleHeader = new XRControlStyle
            {
                Name = "HeaderStyle",
                Font = new Font("Arial", 10, FontStyle.Bold),
                TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter,
                BackColor = Color.FromArgb(240, 240, 240),
                Borders = DevExpress.XtraPrinting.BorderSide.All,
                BorderColor = Color.Black
            };
            var styleDetail = new XRControlStyle
            {
                Name = "DetailStyle",
                Font = new Font("Arial", 10, FontStyle.Regular),
                TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter,
                Borders = DevExpress.XtraPrinting.BorderSide.Left | DevExpress.XtraPrinting.BorderSide.Right | DevExpress.XtraPrinting.BorderSide.Bottom,
                BorderColor = Color.Black
            };

            this.StyleSheet.AddRange(new XRControlStyle[] { styleTitle, styleSubTitle, styleHeader, styleDetail });

            // Bands
            var topMargin = new TopMarginBand { HeightF = 50 };
            var bottomMargin = new BottomMarginBand { HeightF = 50 };
            var reportHeader = new ReportHeaderBand { HeightF = 110 };
            var pageHeader = new PageHeaderBand { HeightF = 35 };
            var detail = new DetailBand { HeightF = 25 };
            var reportFooter = new ReportFooterBand { HeightF = 80 };

            this.Bands.AddRange(new Band[] { topMargin, bottomMargin, reportHeader, pageHeader, detail, reportFooter });

            // Report Header Labels
            var lblUniversity = new XRLabel
            {
                Text = "TRƯỜNG ĐẠI HỌC",
                Font = new Font("Arial", 10, FontStyle.Regular),
                LocationF = new PointF(0, 0),
                SizeF = new SizeF(300, 20),
                TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft
            };

            var lblTitle = new XRLabel
            {
                Text = "BẢNG ĐIỂM THI HẾT MÔN",
                StyleName = "TitleStyle",
                LocationF = new PointF(0, 25),
                SizeF = new SizeF(727, 30)
            };

            var lblSubInfo = new XRLabel
            {
                StyleName = "SubTitleStyle",
                LocationF = new PointF(0, 60),
                SizeF = new SizeF(727, 25),
                TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter
            };
            // Bind subtitle to parameters using Concat
            lblSubInfo.ExpressionBindings.Add(new ExpressionBinding("BeforePrint", "Text", 
                "Concat('Lớp: ', ?TenLop, '    |    Môn thi: ', ?TenMH, '    |    Lần thi: ', ?Lan)"));

            reportHeader.Controls.AddRange(new XRControl[] { lblUniversity, lblTitle, lblSubInfo });

            // Page Header Table
            var tblHeader = new XRTable
            {
                LocationF = new PointF(0, 0),
                SizeF = new SizeF(727, 35),
                StyleName = "HeaderStyle"
            };
            var rowHeader = new XRTableRow();

            var cellSTT = new XRTableCell { Text = "STT", WidthF = 60 };
            var cellMaSV = new XRTableCell { Text = "MSSV", WidthF = 120 };
            var cellHo = new XRTableCell { Text = "HỌ", WidthF = 200, TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft, Padding = new DevExpress.XtraPrinting.PaddingInfo(5, 5, 0, 0) };
            var cellTen = new XRTableCell { Text = "TÊN", WidthF = 120, TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft, Padding = new DevExpress.XtraPrinting.PaddingInfo(5, 5, 0, 0) };
            var cellDiem = new XRTableCell { Text = "ĐIỂM", WidthF = 110 };
            var cellDiemChu = new XRTableCell { Text = "ĐIỂM CHỮ", WidthF = 117 };

            rowHeader.Cells.AddRange(new XRTableCell[] { cellSTT, cellMaSV, cellHo, cellTen, cellDiem, cellDiemChu });
            tblHeader.Rows.Add(rowHeader);
            pageHeader.Controls.Add(tblHeader);

            // Detail Table
            var tblDetail = new XRTable
            {
                LocationF = new PointF(0, 0),
                SizeF = new SizeF(727, 25),
                StyleName = "DetailStyle"
            };
            var rowDetail = new XRTableRow();

            var cellDetailSTT = new XRTableCell { WidthF = 60 };
            cellDetailSTT.ExpressionBindings.Add(new ExpressionBinding("BeforePrint", "Text", "[STT]"));

            var cellDetailMaSV = new XRTableCell { WidthF = 120, Font = new Font("Arial", 10, FontStyle.Bold) };
            cellDetailMaSV.ExpressionBindings.Add(new ExpressionBinding("BeforePrint", "Text", "[MaSV]"));

            var cellDetailHo = new XRTableCell { WidthF = 200, TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft, Padding = new DevExpress.XtraPrinting.PaddingInfo(5, 5, 0, 0) };
            cellDetailHo.ExpressionBindings.Add(new ExpressionBinding("BeforePrint", "Text", "[Ho]"));

            var cellDetailTen = new XRTableCell { WidthF = 120, TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft, Padding = new DevExpress.XtraPrinting.PaddingInfo(5, 5, 0, 0) };
            cellDetailTen.ExpressionBindings.Add(new ExpressionBinding("BeforePrint", "Text", "[Ten]"));

            var cellDetailDiem = new XRTableCell { WidthF = 110, Font = new Font("Arial", 10, FontStyle.Bold) };
            cellDetailDiem.ExpressionBindings.Add(new ExpressionBinding("BeforePrint", "Text", "Iif(IsNull([Diem]), 'Chưa thi', FormatString('{0:0.0}', [Diem]))"));
            // Color logic for score: Green (>= 8), Orange (>= 5), Red (< 5), Gray (chưa thi)
            cellDetailDiem.ExpressionBindings.Add(new ExpressionBinding("BeforePrint", "ForeColor", "Iif(IsNull([Diem]), 'Gray', Iif([Diem] >= 8.0, 'Green', Iif([Diem] >= 5.0, 'Orange', 'Red')))"));

            var cellDetailDiemChu = new XRTableCell { WidthF = 117 };
            cellDetailDiemChu.ExpressionBindings.Add(new ExpressionBinding("BeforePrint", "Text", "Iif(IsNull([Diem]), '', [DiemChu])"));

            rowDetail.Cells.AddRange(new XRTableCell[] { cellDetailSTT, cellDetailMaSV, cellDetailHo, cellDetailTen, cellDetailDiem, cellDetailDiemChu });
            tblDetail.Rows.Add(rowDetail);
            detail.Controls.Add(tblDetail);

            // Report Footer Labels
            var lblTongSo = new XRLabel
            {
                Font = new Font("Arial", 10, FontStyle.Italic),
                LocationF = new PointF(0, 20),
                SizeF = new SizeF(300, 20),
                TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft
            };
            lblTongSo.ExpressionBindings.Add(new ExpressionBinding("BeforePrint", "Text", "Concat('Tổng số sinh viên: ', ?TongSo)"));

            var lblNgayIn = new XRLabel
            {
                Font = new Font("Arial", 10, FontStyle.Italic),
                LocationF = new PointF(427, 20),
                SizeF = new SizeF(300, 20),
                TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleRight
            };
            lblNgayIn.Text = $"Ngày in: {DateTime.Now:dd/MM/yyyy}";

            reportFooter.Controls.AddRange(new XRControl[] { lblTongSo, lblNgayIn });
        }
    }
}
