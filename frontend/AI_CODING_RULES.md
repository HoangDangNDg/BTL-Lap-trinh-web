# ==============================================================================
# QUY TẮC SINH MÃ FRONTEND DÀNH CHO AI (AI FRONTEND CODING RULES)
# ==============================================================================

> **LƯU Ý BẮT BUỘC DÀNH CHO AI:** Bất cứ khi nào bạn (AI) thực hiện viết code, tạo component, sửa lỗi (bug fix), refactor hoặc thiết kế kiến trúc cho phần **Frontend React**, bạn **BẮT BUỘC PHẢI TUÂN THỦ 100%** toàn bộ các quy chuẩn trong tài liệu:
> 📖 [REACT_ARCHITECTURAL_STANDARD.md](./REACT_ARCHITECTURAL_STANDARD.md)

---

## TÓM TẮT 6 NGUYÊN TẮC BẤT BIẾN (IMMUTABLE RULES):

1. **Phân chia ranh giới JS vs TS:**
   - Tầng mạng HTTP / Axios: Viết bằng **JavaScript thuần (`.js`)** tại `src/api/`. Mọi hàm đều phải nhận tham số `signal` (`AbortController`).
   - Tầng định kiểu dữ liệu (Data Contract) & Giao diện UI: Viết bằng **TypeScript (`.ts`, `.tsx`)** tại `src/types/` và `src/features/`. Tuyệt đối **KHÔNG DÙNG `any`**.
2. **Bảo mật Enterprise (Secure HttpOnly Cookie):**
   - Không bao giờ lưu trữ Token trong `localStorage`, `sessionStorage` hay biến JavaScript toàn cục.
   - Bắt buộc cấu hình Axios `withCredentials: true` để trình duyệt tự động gửi/nhận Secure HttpOnly Cookie.
3. **Quản lý vòng đời & Chống rò rỉ bộ nhớ (Memory Leak):**
   - Mọi `useEffect` gọi API bắt buộc phải triển khai hàm cleanup kích hoạt `controller.abort()`.
4. **Tối ưu hóa Virtual DOM (Zero Unnecessary Re-renders):**
   - Triệt tiêu hoàn toàn object / array inline trong JSX props. Sử dụng `useMemo` để ổn định tham chiếu.
   - Bọc toàn bộ các presentational sub-components bằng `React.memo`.
   - Mọi function/callback truyền xuống prop của component con bắt buộc phải bọc trong `useCallback`.
   - Vòng lặp `.map(...)` bắt buộc sử dụng ID duy nhất làm `key`. **Tuyệt đối cấm dùng `key={index}`**.
5. **Đồng bộ hóa Data Contract với Backend Spring Boot:**
   - Luôn sử dụng Generic Wrapper `ApiResponse<T>`:
     ```typescript
     export interface ApiResponse<T> {
       success: boolean;
       code: string | number;
       message: string;
       data: T;
     }
     ```
   - Tuân thủ chính xác tên trường thực tế từ Backend (ví dụ: `idKhoaHoc`, `sdt`, `tenCn`, `idPhieuThu`, `idGiaoDich`, `soTienThu`,...).
6. **Phân quyền Route và API chính xác theo Role:**
   - `ROLE_ADMIN` $\rightarrow$ `/api/admin/**`
   - `ROLE_CHU_DOANH_NGHIEP` $\rightarrow$ `/api/doanh-nghiep/**`, `/api/thong-ke/**`
   - `ROLE_QUAN_LY` $\rightarrow$ `/api/quan-ly/**`
   - `ROLE_GIAO_VIEN` $\rightarrow$ `/api/giao-vien/**`
   - Tuyệt đối không gọi chéo API phân quyền sai Role để tránh lỗi `403 Forbidden`.

---
*Chi tiết hướng dẫn kỹ thuật và ví dụ mẫu hoàn chỉnh xem tại [REACT_ARCHITECTURAL_STANDARD.md](./REACT_ARCHITECTURAL_STANDARD.md).*

