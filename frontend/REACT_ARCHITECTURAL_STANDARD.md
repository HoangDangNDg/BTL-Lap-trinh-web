<!-- ============================================================================== -->
<!-- HƯỚNG DẪN DÀNH CHO AI (AI CODING INSTRUCTIONS & OPERATING SYSTEM PROMPT)        -->
<!-- Bất cứ khi nào bạn (AI) thực hiện viết code, refactor, sửa lỗi, tạo component   -->
<!-- hoặc thiết kế màn hình cho Frontend này, bạn BẮT BUỘC PHẢI tuân thủ 100%      -->
<!-- các tiêu chuẩn kỹ thuật được quy định trong tài liệu này.                     -->
<!-- ============================================================================== -->

# BỘ QUY CHUẨN KIẾN TRÚC VÀ QUY TẮC PHÁT TRIỂN DỰ ÁN REACT TỐI ƯU (REACT ARCHITECTURAL STANDARD)

---

## 1. TỔNG QUAN VÀ MỤC TIÊU DỰ ÁN

Tài liệu này đóng vai trò là kim chỉ nam kỹ thuật (Technical Blueprint & Standard Operating Procedure) cho toàn bộ lập trình viên và hệ thống AI tham gia phát triển dự án. Hệ thống được thiết kế nhằm đạt được 4 mục tiêu cốt lõi:
- **Tối ưu hóa hiệu năng render (Virtual DOM Optimization):** Giảm thiểu tối đa tình trạng re-render dư thừa, triệt tiêu việc tạo rác bộ nhớ (Garbage Collection spikes), duy trì tốc độ khung hình ổn định 60fps trên mọi thiết bị.
- **Tính toàn vẹn và an toàn dữ liệu (Type Safety & Data Integrity):** Phân định rõ ràng giữa tầng logic xử lý mạng I/O và tầng định kiểu dữ liệu (Data Contract). Kiểm soát chặt chẽ schema payload vào/ra.
- **Bảo mật tối đa (Enterprise Security):** Triệt tiêu rủi ro Cross-Site Scripting (XSS) và giảm thiểu rủi ro Cross-Site Request Forgery (CSRF) bằng chiến lược HTTPS kết hợp Secure HttpOnly Cookie. Tuyệt đối không lưu token xác thực trong Web Storage.
- **Khả năng mở rộng (Scalability & Maintainability):** Cấu trúc module hóa Feature-based, phân tách trách nhiệm (Separation of Concerns), dễ dàng bảo trì và mở rộng khi quy mô ứng dụng tăng lên hàng trăm màn hình nghiệp vụ.

---

## 2. CẤU TRÚC THƯ MỤC DỰ ÁN (PROJECT DIRECTORY STRUCTURE)

Dự án áp dụng mô hình Feature-based kết hợp Layered Architecture, phân chia ranh giới vật lý rõ ràng giữa logic gọi API (JavaScript) và mô hình định nghĩa dữ liệu (TypeScript):

```text
frontend/
├── public/
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── api/                    # TẦNG GỌI MẠNG (JAVASCRIPT THUẦN)
│   │   ├── axiosClient.js      # Cấu hình Axios instance tập trung (withCredentials, interceptors)
│   │   ├── endpoints.js        # Khai báo hằng số URL endpoint chuẩn hóa
│   │   └── modules/            # Các service gọi API phân tách theo từng module
│   │       ├── authService.js
│   │       ├── userService.js
│   │       ├── daoTaoService.js
│   │       ├── taiChinhService.js
│   │       └── doanhNghiepService.js
│   │
│   ├── types/                  # TẦNG DATA CONTRACT (TYPESCRIPT ĐỊNH NGHĨA DỮ LIỆU)
│   │   ├── common.ts           # Types dùng chung (ApiResponse<T>, Pagination, BaseFilter)
│   │   ├── auth.ts             # Type payload xác thực, user session, quyền hạn
│   │   ├── user.ts             # Type thực thể giáo viên, quản lý, học sinh, phụ huynh
│   │   ├── daoTao.ts           # Type khóa học, lớp học, thời khóa biểu, buổi học
│   │   └── taiChinh.ts         # Type phiếu thu, sổ quỹ, lương, giao dịch
│   │
│   ├── components/             # REUSABLE UI COMPONENTS (ATOMIC & FUNCTIONAL)
│   │   ├── common/             # UI nguyên tử: Button, Modal, Input, Badge, Table, Alert
│   │   ├── layout/             # Header, Sidebar, Footer, LayoutWrapper, Navigation
│   │   └── ui/                 # Thiết kế giao diện hiệu ứng (LiquidGlass, Droplet, Tabs)
│   │
│   ├── features/               # CÁC MÀN HÌNH CHỨC NĂNG NGHIỆP VỤ (FEATURE MODULES)
│   │   ├── quan-ly-dao-tao/
│   │   │   ├── components/     # Sub-components chuyên trách cho tính năng đào tạo
│   │   │   ├── hooks/          # Custom hooks phục vụ nghiệp vụ (useLopHoc, useKhoaHoc)
│   │   │   └── LopHocView.tsx  # View hiển thị chính nhận & hiển thị data
│   │   ├── quan-ly-nhan-su/
│   │   ├── quan-ly-tai-chinh/
│   │   └── quan-ly-doanh-nghiep/
│   │
│   ├── hooks/                  # CUSTOM HOOKS TOÀN CỤC DÙNG CHUNG
│   │   ├── useDebounce.ts      # Chống spam API khi tìm kiếm
│   │   ├── useIntersection.ts  # Lazy load danh sách, quan sát viewport
│   │   └── useAuth.ts          # Truy xuất thông tin phiên làm việc
│   │
│   ├── constants/              # HẰNG SỐ CẤU HÌNH, STATUS ENUMS, STORAGE KEYS
│   ├── utils/                  # HÀM BỔ TRỢ HELPER THUẦN TÚY (Format tiền, ngày tháng)
│   ├── App.tsx                 # Root Router & Providers Component
│   ├── main.tsx                # Client Entry Point
│   └── vite-env.d.ts
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

---

## 3. NGUYÊN TẮC PHÂN CHIA JAVASCRIPT & TYPESCRIPT

### 3.1. Tầng Gọi API (JavaScript - `.js`)
- **Phạm vi áp dụng:** Thư mục `src/api/`.
- **Lý do & Tiêu chuẩn:**
  - Tầng này chỉ làm nhiệm vụ thực thi HTTP Request thông qua thư viện Axios, chuyển tiếp dữ liệu thô (raw payload) và bắt mã lỗi mạng I/O.
  - Không nhúng chặt types nội bộ của component vào đây nhằm duy trì tính linh hoạt, tốc độ biên dịch nhanh (Fast Compilation) và tách biệt hoàn toàn giữa giao thức vận chuyển (Transport Layer) và cấu trúc hiển thị UI (Presentation Layer).
  - Mọi hàm gọi API bắt buộc hỗ trợ truyền tham số `signal` (thuộc `AbortController`) để có thể hủy request khi component bị unmount hoặc người dùng đổi bộ lọc.

```javascript
// Ví dụ chuẩn: src/api/modules/userService.js
import axiosClient from '../axiosClient';
import { ENDPOINTS } from '../endpoints';

export const userService = {
  getTeachers: (params = {}, signal) => {
    return axiosClient.get(ENDPOINTS.TEACHERS, { params, signal });
  },
  createTeacher: (data, signal) => {
    return axiosClient.post(ENDPOINTS.TEACHERS, data, { signal });
  }
};
```

### 3.2. Tầng Hứng và Định Kiểu Dữ Liệu (TypeScript - `.ts` / `.tsx`)
- **Phạm vi áp dụng:** Thư mục `src/types/` và toàn bộ các file giao diện UI `.tsx`.
- **Lý do & Tiêu chuẩn:**
  - Định nghĩa chuẩn hoá Data Contract giữa Backend (Spring Boot) và Frontend (React).
  - Mọi phản hồi từ backend bắt buộc phải kế thừa generic interface cấu trúc chuẩn của hệ thống:
    - Mã trạng thái thành công/thất bại (`success: boolean`).
    - Mã định danh phản hồi (`code: string | number`).
    - Thông điệp phản hồi (`message: string`).
    - Dữ liệu thực thi nghiệp vụ (`data: T`).
  - **Tuyệt đối cấm sử dụng kiểu `any`**. Mọi trường dữ liệu không bắt buộc phải đánh dấu optional `?` hoặc `null`.
  - Phân loại rõ ràng giữa kiểu dữ liệu Entity (tương ứng với bảng DB / Backend DTO) và kiểu State phục vụ riêng cho UI hiển thị (View State).

```typescript
// Ví dụ chuẩn: src/types/common.ts
export interface ApiResponse<T> {
  success: boolean;
  code: string | number;
  message: string;
  data: T;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
}
```

---

## 4. QUY CHUẨN BẢO MẬT: HTTPS, AXIOS & COOKIE TOKEN

### 4.1. Cấu Hình Đường Truyền HTTPS Bắt Buộc
- Mọi kết nối đến Backend bắt buộc phải thông qua giao thức HTTPS (TLS 1.2/1.3 trở lên).
- Cấu hình Content Security Policy (CSP) trên server hoặc meta header để chặn tuyệt đối mọi request dạng `http://` trong môi trường sản phẩm (Production).

### 4.2. Quản Lý Token Qua HttpOnly Cookie
- **Cơ chế lưu trữ:** 
  - Token xác thực (JWT Access Token & Refresh Token) tuyệt đối **KHÔNG LƯU** trong `localStorage`, `sessionStorage`, hoặc gán vào biến toàn cục (`window.*`).
  - Token phải do máy chủ Backend thiết lập thông qua HTTP Header `Set-Cookie` đi kèm đầy đủ các flags bảo vệ:
    - `HttpOnly`: Ngăn chặn hoàn toàn việc script độc hại hoặc kẻ tấn công XSS truy cập `document.cookie`.
    - `Secure`: Chỉ cho phép truyền tải cookie qua kênh mã hóa HTTPS.
    - `SameSite=Strict` (hoặc `SameSite=Lax` khi có redirect SSO): Ngăn chặn triệt để tấn công Cross-Site Request Forgery (CSRF).
- **Cấu hình Axios Client:**
  - Thiết lập `withCredentials: true` trên Axios instance toàn cục.
  - Cài đặt này hướng dẫn trình duyệt tự động đính kèm cookie chứa token hợp lệ vào phần header của mỗi request mà không cần can thiệp thủ công bằng JavaScript.

### 4.3. Quản Lý Phiên Làm Việc và Interceptors
- **Request Interceptor:** Bổ sung Correlation ID (UUID) hoặc Trace ID vào header `X-Correlation-ID` để phục vụ việc truy vết nhật ký lỗi (Distributed Tracing).
- **Response Interceptor:**
  - Trả về trực tiếp `response.data` để tầng component tiếp nhận ngay cấu trúc `ApiResponse<T>`.
  - **Xử lý `401 Unauthorized`:** Khi access token hết hạn, interceptor kích hoạt cơ chế tự động gửi request làm mới token đến endpoint `/api/auth/refresh` (cookie refresh token tự động gửi đi). Nếu làm mới thành công, thực hiện lại request ban đầu. Nếu thất bại, chuyển hướng người dùng về trang `/login` và dọn dẹp state ứng dụng.
  - **Xử lý `403 Forbidden`:** Báo lỗi không đủ thẩm quyền, không làm sập ứng dụng.
  - **Xử lý lỗi mạng / `5xx`:** Chuyển đổi thành thông điệp thân thiện, phát sự kiện thông báo toàn cục (Global Toast / Error Boundary).

```javascript
// Ví dụ chuẩn: src/api/axiosClient.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // BẮT BUỘC: Đính kèm HttpOnly Cookie tự động
});

axiosClient.interceptors.request.use(
  (config) => {
    config.headers['X-Request-Id'] = crypto.randomUUID();
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axiosClient.post('/auth/refresh');
        return axiosClient(originalRequest);
      } catch (refreshErr) {
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
```

---

## 5. QUY CHUẨN FUNCTIONAL COMPONENT VÀ STATE MANAGEMENT

### 5.1. Khởi Tạo và Quản Lý State Dữ Liệu
- Mọi State hứng dữ liệu từ API đều phải định kiểu tường minh thông qua Generic TypeScript: `useState<T | null>(null)` hoặc `useState<T[]>([])`.
- Khởi tạo giá trị ban đầu là `null` hoặc mảng rỗng `[]`, tuyệt đối không để `undefined`.
- Tách bạch rõ 3 trạng thái bất biến của dữ liệu màn hình:
  - `data`: Chứa payload thực tế từ API.
  - `isLoading`: Cờ trạng thái đang tải (phục vụ Skeleton Loading hoặc Spinner).
  - `error`: Lưu trữ thông tin lỗi chuẩn hóa khi request thất bại.

### 5.2. Quản Lý Vòng Đời Request và Tránh Rò Rỉ Bộ Nhớ (Memory Leaks)
- Mọi hàm gọi API trong `useEffect` bắt buộc phải triển khai cơ chế dọn dẹp (cleanup function) sử dụng `AbortController`.
- Khi người dùng điều hướng rời màn hình hoặc component unmount trước khi API kịp phản hồi, tín hiệu `abort()` phải được kích hoạt để:
  - Hủy ngay lập tức luồng mạng (network stream) đang chờ.
  - Tránh lỗi nguy hiểm trong React: *"Can't perform a React state update on an unmounted component"*.

```tsx
// Ví dụ chuẩn: Hủy request an toàn với AbortController
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await userService.getTeachers({ idDn }, controller.signal);
      if (res.success) {
        setTeachers(res.data);
      }
    } catch (err: any) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        setError(err.message || 'Lỗi khi tải danh sách giáo viên');
      }
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();

  return () => {
    controller.abort(); // Cleanup hủy request khi unmount
  };
}, [idDn]);
```

---

## 6. CHIẾN LƯỢC TỐI ƯU HÓA VIRTUAL DOM (VIRTUAL DOM OPTIMIZATION)

Khi một component nhận dữ liệu phức tạp dạng Object hoặc Array từ State, việc render không kiểm soát sẽ gây tắc nghẽn Virtual DOM. Dưới đây là các quy tắc bất biến:

### 6.1. Triệt Tiêu Khởi Tạo Object/Array Inline Trong Giao Diện Render
- **Quy tắc:** Không khởi tạo object hoặc mảng mới trực tiếp tại phần JSX props.
  - ❌ **CẤM:** `<Component style={{ margin: 0 }} items={list || []} />`
  - ❌ **CẤM:** `<Button onClick={() => handleDelete(item.id)} />` trực tiếp trong vòng lặp `.map()`
- **Hệ quả:** Object/Array inline luôn tạo ra một địa chỉ vùng nhớ mới (New Reference Pointer) sau mỗi lần component cha chạy qua, khiến thuật toán Reconciliation của Virtual DOM ngộ nhận là dữ liệu thay đổi và ép buộc toàn bộ nhánh con render lại dù giá trị bên trong không đổi.
- **Biện pháp:** Sử dụng hook `useMemo` để ghi nhớ (memoize) các cấu trúc object hoặc danh sách tính toán:

```tsx
// Chuẩn hóa: Dùng useMemo để ổn định tham chiếu
const emptyList = useMemo(() => [], []);
const containerStyle = useMemo(() => ({ margin: 0, padding: '1rem' }), []);
```

### 6.2. Bao Bọc Component Con Hiển Thị Bằng `React.memo`
- Chia nhỏ màn hình hiển thị thành các Presentational Components (Atomic UI).
- Bọc toàn bộ các sub-component chuyên trách hiển thị object/danh sách bằng `React.memo`.
- `React.memo` mặc định thực hiện so sánh nông (`shallow comparison` theo `Object.is`). Nhờ có `useMemo` và tham chiếu ổn định từ State, component con sẽ bỏ qua hoàn toàn giai đoạn tính toán lại cây Virtual DOM khi các state khác của component cha thay đổi.

```tsx
// Ví dụ chuẩn: Sub-component được bọc React.memo
interface TeacherItemProps {
  teacher: GiaoVienDto;
  onSelect: (id: number) => void;
}

export const TeacherItem = React.memo<TeacherItemProps>(({ teacher, onSelect }) => {
  return (
    <div className="teacher-card">
      <h4>{teacher.hoTen}</h4>
      <p>{teacher.sdt}</p>
      <button onClick={() => onSelect(teacher.idGv)}>Chi tiết</button>
    </div>
  );
});
```

### 6.3. Khóa Tham Chiếu Hàm Bằng `useCallback`
- Bất kỳ function nào được truyền dưới dạng prop xuống component con (ví dụ: `onSelect`, `onUpdate`, `onDelete`) **bắt buộc phải được bọc trong `useCallback`**.
- Điều này bảo đảm function reference không bị tạo lại, giúp `React.memo` ở component con phát huy tối đa tác dụng và không bị re-render vô ích.

```tsx
// Khóa tham chiếu callback
const handleSelectTeacher = useCallback((idGv: number) => {
  setSelectedId(idGv);
}, []);
```

### 6.4. Định Danh Danh Sách Với Phím Duy Nhất (`key` Prop)
- Khi render danh sách mảng dữ liệu từ API (`.map(...)`), bắt buộc sử dụng định danh duy nhất và bất biến (ví dụ: `item.id`, `item.idGv`, `UUID`).
- **Nghiêm cấm tuyệt đối:** Sử dụng index của mảng (`key={index}`) đối với các danh sách có khả năng lọc (filter), sắp xếp (sort), thêm hoặc xóa phần tử. Việc dùng index làm key sẽ phá vỡ thuật toán so khớp Virtual DOM, dẫn đến lỗi hiển thị sai lệch trạng thái nội bộ của phần tử con.

```tsx
// ❌ CẤM:
{teachers.map((t, index) => <TeacherItem key={index} teacher={t} />)}

// ✅ CHUẨN:
{teachers.map((t) => <TeacherItem key={t.idGv} teacher={t} onSelect={handleSelectTeacher} />)}
```

---

## 7. MẪU TRIỂN KHAI TOÀN DIỆN (GOLD STANDARD IMPLEMENTATION)

Dưới đây là một màn hình mẫu hoàn chỉnh kết hợp đầy đủ mọi quy chuẩn kiến trúc trên:

```tsx
// src/features/quan-ly-nhan-su/UserView.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { userService } from '@/api/modules/userService';
import { ApiResponse } from '@/types/common';
import { GiaoVienDto } from '@/types/user';
import { TeacherItem } from './components/TeacherItem';
import { Spinner } from '@/components/common/Spinner';

export const UserView: React.FC = () => {
  const [teachers, setTeachers] = useState<GiaoVienDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<number>(1);

  // 1. Tối ưu khóa tham chiếu callback
  const handleSelect = useCallback((idGv: number) => {
    console.log('Selected teacher ID:', idGv);
  }, []);

  // 2. Fetch API với AbortController an toàn
  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res: ApiResponse<GiaoVienDto[]> = await userService.getTeachers(
          { branchId: selectedBranchId },
          controller.signal
        );
        if (res.success) {
          setTeachers(res.data || []);
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          setError(err.message || 'Không thể tải danh sách giáo viên');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      controller.abort();
    };
  }, [selectedBranchId]);

  // 3. Tối ưu danh sách hiển thị với useMemo
  const renderedList = useMemo(() => {
    if (teachers.length === 0) {
      return <p className="text-muted">Không tìm thấy giáo viên nào.</p>;
    }
    return teachers.map((teacher) => (
      <TeacherItem
        key={teacher.idGv}
        teacher={teacher}
        onSelect={handleSelect}
      />
    ));
  }, [teachers, handleSelect]);

  if (isLoading) return <Spinner text="Đang tải dữ liệu..." />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="feature-container">
      <header className="flex justify-between items-center mb-4">
        <h2>Quản Lý Đội Ngũ Giáo Viên</h2>
      </header>
      <div className="teacher-grid">
        {renderedList}
      </div>
    </div>
  );
};
```

---

## 8. CHECKLIST KIỂM THỬ VÀ REVIEW MÃ NGUỒN (PULL REQUEST & AI CHECKLIST)

Mỗi khi AI sinh mã hoặc lập trình viên gửi Pull Request, bắt buộc phải đối chiếu qua danh mục tiêu chí sau:

### Bảo Mật & Mạng (Security & Networking)
- [ ] Endpoint có bắt đầu bằng `https://` (hoặc proxy `/api`) không?
- [ ] Axios client đã bật `withCredentials: true` chưa?
- [ ] Có tồn tại bất kỳ đoạn mã nào lưu trữ token vào `localStorage` hay `sessionStorage` không? *(Nếu có: TỪ CHỐI mã nguồn ngay lập tức)*.
- [ ] Các cuộc gọi API trong `useEffect` đã có `AbortController` ở hàm cleanup chưa?

### Định Kiểu & Hợp Đồng Dữ Liệu (TypeScript & Contracts)
- [ ] Có xuất hiện kiểu `any` trong code không? *(Phải thay thế bằng interface cụ thể hoặc generic `T`)*.
- [ ] Dữ liệu API trả về đã được hứng bằng Generic `ApiResponse<T>` chuẩn chưa?
- [ ] Tầng API (JavaScript `.js`) và tầng Types (TypeScript `.ts`) có nằm đúng thư mục quy định không?

### Hiệu Năng & Virtual DOM (Performance)
- [ ] Các component con nhận object/array đã được bọc bằng `React.memo` chưa?
- [ ] Có khai báo object/array/function inline trực tiếp trong JSX props không?
- [ ] Các hàm callback truyền xuống props con đã bọc `useCallback` chưa?
- [ ] Thuộc tính `key` trong danh sách lặp có phải là ID độc nhất bất biến không? *(Nghiêm cấm dùng `index`)*.

---

*Tài liệu ban hành phục vụ quy chuẩn phát triển phần mềm nội bộ - Phiên bản 1.0.0.*

