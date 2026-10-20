# BẢN ĐỒ TỔNG THỂ KIẾN TRÚC NGHIỆP VỤ & CƠ SỞ DỮ LIỆU TOÀN HỆ THỐNG
> **Dự án**: Hệ thống Quản trị Trung tâm Giáo dục Đa chi nhánh  
> **Kiến trúc**: .NET Backend (REST Web API, EF Core 10) ↔ React Frontend (Vite, TSX) ↔ MySQL DBv4  
> **Quy chuẩn**: Bám sát 100% logic nghiệp vụ Java Backend và Schema CSDL thực tế.

---

## 📌 BẢNG THEO DÕI TIẾN ĐỘ TỪNG NHÓM TÀI LIỆU NGHIỆP VỤ

| STT | Mã Module & Tên File | Các Bảng DB Liên Quan | Service Chính Phụ Trách | Trạng Thái Tiến Độ |
| :---: | :--- | :--- | :--- | :---: |
| **01** | [`01_HE_THONG_TAI_KHOAN_SECURITY.md`](file:///c:/D/btlwebtrentruong/docs/nghiep_vu/01_HE_THONG_TAI_KHOAN_SECURITY.md) | `tai_khoan`, `refresh_token`, `tai_khoan_admin`, `tai_khoan_ccd`, `tai_khoan_gv`, `tai_khoan_ql`, `admin` | `TaiKhoanService`, `AdminService` | `[Đã hoàn thành]` |
| **02** | [`02_DOANH_NGHIEP_CO_DONG_CHI_NHANH.md`](file:///c:/D/btlwebtrentruong/docs/nghiep_vu/02_DOANH_NGHIEP_CO_DONG_CHI_NHANH.md) | `doanh_nghiep`, `chu_co_dong`, `gop_von_so_huu`, `chi_nhanh`, `quan_ly` | `DoanhNghiepService` | `[Đã hoàn thành]` |
| **03** | [`03_NHAN_SU_GIAO_VIEN_HO_SO.md`](file:///c:/D/btlwebtrentruong/docs/nghiep_vu/03_NHAN_SU_GIAO_VIEN_HO_SO.md) | `giao_vien`, `chi_tiet_gv`, `chung_chi_giao_vien`, `giao_vien_chi_nhanh`, `giao_vien_chuyen_mon`, `nhan_cong_khac` | `NhanSuService` | `[Đã hoàn thành]` |
| **04** | [`04_HOC_SINH_PHU_HUYNH_DANG_KY_HOC.md`](file:///c:/D/btlwebtrentruong/docs/nghiep_vu/04_HOC_SINH_PHU_HUYNH_DANG_KY_HOC.md) | `hoc_sinh`, `phu_huynh`, `phu_huynh_hoc_sinh`, `hoc_sinh_khoa_hoc`, `dang_ky_hoc` | `HocSinhService` | `[Đã hoàn thành]` |
| **05** | [`05_CO_SO_VAT_CHAT_KHUNG_DAO_TAO.md`](file:///c:/D/btlwebtrentruong/docs/nghiep_vu/05_CO_SO_VAT_CHAT_KHUNG_DAO_TAO.md) | `phong_hoc`, `nam_hoc`, `ky_hoc`, `tuan_hoc`, `thang_hoc`, `bo_mon`, `chuyen_mon`, `mon_hoc` | `CoSoVatChatService` | `[Đã hoàn thành]` |
| **06** | [`06_DAO_TAO_LOP_HOC_THOI_KHOA_BIEU.md`](file:///c:/D/btlwebtrentruong/docs/nghiep_vu/06_DAO_TAO_LOP_HOC_THOI_KHOA_BIEU.md) | `lop_hoc`, `khoa_hoc`, `thoi_khoa_bieu_tuan`, `khung_lich_hoc_co_dinh`, `buoi_hoc`, `dang_ky_hoc` | `DaoTaoService` | `[Đã hoàn thành]` |
| **07** | [`07_DIEM_DANH_BUOI_HOC.md`](file:///c:/D/btlwebtrentruong/docs/nghiep_vu/07_DIEM_DANH_BUOI_HOC.md) | `diem_danh_hoc_sinh`, `diem_danh_giao_vien` | `DiemDanhService` | `[Đã hoàn thành]` |
| **08** | [`08_TAI_CHINH_HOC_PHI_LUONG_ROLLUP.md`](file:///c:/D/btlwebtrentruong/docs/nghiep_vu/08_TAI_CHINH_HOC_PHI_LUONG_ROLLUP.md) | `phieu_thu_hoc_phi`, `thanh_toan_giao_vien`, `so_quy_thu_chi`, `bao_luu_khoa_hoc`, 4 bảng `thu_chi_*` | `TaiChinhService` | `[Đã hoàn thành]` |
| **09** | [`09_MA_TRAN_PHAN_QUYEN_RBAC_API.md`](file:///c:/D/btlwebtrentruong/docs/nghiep_vu/09_MA_TRAN_PHAN_QUYEN_RBAC_API.md) | Toàn bộ 48 bảng & 31 Controllers | Toàn bộ 9 Services & Controllers | `[Đã hoàn thành]` |

---

## 🗂️ SƠ ĐỒ CÂY THƯ MỤC TÀI LIỆU

```
c:/D/btlwebtrentruong/docs/
└── nghiep_vu/
    ├── README.md                                    # Mục lục & Tiến độ tổng thể
    ├── 01_HE_THONG_TAI_KHOAN_SECURITY.md            # [Đã hoàn thành] Tài khoản, JWT, Phân quyền
    ├── 02_DOANH_NGHIEP_CO_DONG_CHI_NHANH.md         # [Đã hoàn thành] Doanh nghiệp, Cổ phần, Cơ sở
    ├── 03_NHAN_SU_GIAO_VIEN_HO_SO.md                # [Đã hoàn thành] Nhân sự, Bằng cấp, Import GV
    ├── 04_HOC_SINH_PHU_HUYNH_DANG_KY_HOC.md         # [Đã hoàn thành] Hồ sơ 360, Quan hệ đa Phụ huynh
    ├── 05_CO_SO_VAT_CHAT_KHUNG_DAO_TAO.md           # [Đã hoàn thành] Phòng học, Chu kỳ 36 tuần, Cây môn
    ├── 06_DAO_TAO_LOP_HOC_THOI_KHOA_BIEU.md         # [Đã hoàn thành] Lớp, TKB, Chống trùng lịch
    ├── 07_DIEM_DANH_BUOI_HOC.md                     # [Đã hoàn thành] Điểm danh batch, Lịch sử buổi học
    ├── 08_TAI_CHINH_HOC_PHI_LUONG_ROLLUP.md         # [Đã hoàn thành] Thu chi, Bảo lưu, Rollup 4 cấp
    └── 09_MA_TRAN_PHAN_QUYEN_RBAC_API.md            # [Đã hoàn thành] Ma trận Phân quyền & Điều khiển API
```
