# BẢN BÀN GIAO HIỆN TRẠNG DỰ ÁN (PROJECT HANDOVER SNAPSHOT)

- **Thời gian lập**: 19/10/2026
- **Thư mục gốc dự án**: `c:/D/btlwebtrentruong`

---

## 1. DỊCH VỤ ĐANG CHẠY (RUNNING SERVICES)

| Dịch vụ | Thư mục | Port / URL | Lệnh khởi chạy | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **Backend .NET** | `c:/D/btlwebtrentruong/dotnet_backend` | `http://localhost:5120` | `dotnet run --launch-profile http` | Đã build và mapping chuẩn DTO, API JWT |
| **Frontend Vite** | `c:/D/btlwebtrentruong/frontend` | `http://localhost:5173` | `npm run dev` | HMR tự động reload |
| **Database** | MySQL local | Port 3306 | Tự động kết nối | Database: `trung_tam_giao_duc_dbv4` |

---

## 2. THÔNG TIN XÁC THỰC KIỂM THỬ (TEST CREDENTIALS)

- **Tài khoản**: `admin_an`
- **Mật khẩu**: `123456`
- **Vai trò**: `CHU_DOANH_NGHIEP` (Chủ doanh nghiệp)
- **ID Doanh nghiệp (`idDn`)**: `1`
- **Tên người dùng**: Nguyễn Văn An

---

## 3. CÁC TÁC VỤ VỪA HOÀN THÀNH (RECENT COMPLETED WORK)

1. **Sửa dứt điểm lỗi hiển thị năm học (`undefined-undefined`)**:
   - Backend: Bổ sung `NamBatDau` và `NamKetThuc` vào `NamHocDto` trong `dotnet_backend/DTOs/CoSoVatChatDtos.cs` và ánh xạ trong `dotnet_backend/Services/CoSoVatChatService.cs`.
   - Frontend: Thêm `tenNamHoc?: string;` vào interface `frontend/src/kieu_du_lieu/tao_tu_dong/NamHoc.ts`.
   - Cập nhật cơ chế hiển thị an toàn (ưu tiên `tenNamHoc`, có fallback dự phòng) tại các component dropdown và badge.

2. **Sửa dứt điểm lỗi tải lớp học trên Trang Điểm Danh & Thu Học Phí (Hiển thị 0 lớp)**:
   - Nguyên nhân: API `/api/dao-tao-chung/lop-hoc` trả về cấu trúc phân trang `ApiResponse<PagedResult<LopHocDto>>` (`{ success: true, data: { items: [...], totalCount: ... } }`), trong khi Frontend trước đó chỉ kiểm tra `Array.isArray(res) ? res : res?.data`. Dẫn đến `res?.data` là undefined (do đã bị `unwrap`), làm danh sách lớp rỗng `[]`.
   - Đã xử lý:
     - `frontend/src/dich_vu/dichVuDaoTaoChung.ts`: Cập nhật hàm `unwrap` và `getDanhSachLopHoc` để bóc tách tự động `items` từ `PagedResult` và truyền `pageSize: 200`.
     - `frontend/src/trang/quan_ly_dao_tao/TrangDiemDanh.jsx`: Bổ sung trích xuất an toàn `res?.items || res?.data?.items || res?.data || []`, hỗ trợ lọc theo chuyên môn và năm học.
     - `frontend/src/trang/quan_ly_tai_chinh/TrangPhieuThuHocPhi.jsx` & `KhungTacVuChuDoanhNghiep.tsx`: Cập nhật trích xuất an toàn tương tự.
     - Backend: Bổ sung `IdBoMon`, `TenBoMon`, `IdNamHoc`, `TenNamHoc` vào `LopHocDto` và `DaoTaoService.cs` để phục vụ đầy đủ bộ lọc chuyên môn và năm học.

---

## 4. BẢN ĐỒ CẤU TRÚC THƯ MỤC CỐT LÕI (CORE ARCHITECTURE MAP)

```
c:/D/btlwebtrentruong/
├── dotnet_backend/                          # Backend .NET Core API (Port: 5120)
│   ├── Controllers/                         # Controllers REST API
│   ├── DTOs/                                # Data Transfer Objects
│   ├── Services/                            # Business Logic Services
│   └── Data/AppDbContext.cs                 # Entity Framework Core Context
└── frontend/                                # Frontend React + Vite (Port: 5173)
    └── src/
        ├── bo_cuc/                          # Layout chính, Thanh điều hướng (DieuHuongChucNang.tsx)
        ├── kieu_du_lieu/                    # TypeScript interfaces & DTOs
        ├── dich_vu/                         # Axios API Clients
        ├── thanh_phan/                      # Reusable Components (Bộ chọn năm/kỳ, tác vụ chủ doanh nghiệp,...)
        ├── trang/                           # Các màn hình phân hệ nghiệp vụ
        └── trang_thai/                      # State Management (Zustand: useNamHocKyHocStore,...)
```

---

## 5. ĐỀ XUẤT CÁC MODULE TIẾP THEO (NEXT MILESTONES)

Khi mở phiên chat mới, bạn có thể chọn một trong các module sau để giải quyết dứt điểm từng phần:
1. **Module 1**: Kiểm tra & hoàn thiện trang **Quản lý Lớp học** (`TrangLopHoc.jsx`).
2. **Module 2**: Kiểm tra & hoàn thiện trang **Thời khóa biểu** (`TrangThoiKhoaBieu.jsx`).
3. **Module 3**: Hoàn thiện nghiệp vụ **Điểm danh & Báo cáo** (`TrangDiemDanh.jsx`).
4. **Module 4**: Kiểm tra phân hệ **Học sinh & Học phí** (`TrangHocSinh.jsx`, `TrangPhieuThuHocPhi.jsx`).
