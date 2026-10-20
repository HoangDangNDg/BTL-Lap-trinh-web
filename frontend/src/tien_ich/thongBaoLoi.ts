export interface ChiTietLoi {
  maLoi: number | string;
  loaiLoi: 'CANH_BAO' | 'NGUY_HIEM' | 'XAC_THUC' | 'MANG' | 'THONG_TIN';
  tieuDe: string;
  thongDiepKyThuat?: string;
  thongDiepThanThien: string;
  loiKhuyen: string;
  thoiGian?: Date;
}

export const SU_KIEN_BAO_LOI_TOAN_CUC = 'HE_THONG_BAO_LOI_TOAN_CUC';

/**
 * Bảng từ điển dịch mã lỗi Backend sang thông điệp nhẹ nhàng, thân thiện
 */
export function phanLoaiVaDichLoi(error: any): ChiTietLoi {
  // 1. Mất kết nối mạng / Không phản hồi từ máy chủ
  if (!error?.response && (error?.message?.includes('Network Error') || error?.code === 'ERR_NETWORK')) {
    return {
      maLoi: 'MANG_OFFLINE',
      loaiLoi: 'MANG',
      tieuDe: 'Gián đoạn kết nối',
      thongDiepKyThuat: error?.message || 'Network unreachable',
      thongDiepThanThien: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng hoặc WiFi của bạn.',
      loiKhuyen: 'Hệ thống sẽ tự động thử kết nối lại khi mạng ổn định.',
    };
  }

  const status = error?.response?.status || error?.status || 500;
  const backendMessage = error?.response?.data?.message || error?.data?.message || error?.message || '';

  switch (status) {
    case 400:
      return {
        maLoi: 400,
        loaiLoi: 'CANH_BAO',
        tieuDe: 'Thông tin chưa hợp lệ',
        thongDiepKyThuat: backendMessage,
        thongDiepThanThien: backendMessage || 'Một số thông tin nhập vào chưa đúng định dạng. Vui lòng kiểm tra lại biểu mẫu.',
        loiKhuyen: 'Kiểm tra kỹ các trường có dấu hoa thị (*) hoặc định dạng ngày tháng/số điện thoại.',
      };

    case 401:
      return {
        maLoi: 401,
        loaiLoi: 'XAC_THUC',
        tieuDe: 'Phiên làm việc hết hạn',
        thongDiepKyThuat: backendMessage,
        thongDiepThanThien: 'Phiên đăng nhập của bạn đã hết hạn để bảo vệ dữ liệu an toàn.',
        loiKhuyen: 'Hệ thống đang tự động khôi phục phiên hoặc bạn có thể đăng nhập lại.',
      };

    case 403:
      return {
        maLoi: 403,
        loaiLoi: 'CANH_BAO',
        tieuDe: 'Chưa đủ quyền truy cập',
        thongDiepKyThuat: backendMessage,
        thongDiepThanThien: 'Tài khoản của bạn hiện chưa được phân quyền để thực hiện thao tác hoặc xem dữ liệu này.',
        loiKhuyen: 'Vui lòng liên hệ Quản trị viên chi nhánh hoặc Chủ doanh nghiệp nếu bạn cần quyền truy cập.',
      };

    case 404:
      return {
        maLoi: 404,
        loaiLoi: 'THONG_TIN',
        tieuDe: 'Không tìm thấy dữ liệu',
        thongDiepKyThuat: backendMessage,
        thongDiepThanThien: backendMessage || 'Mục bạn đang tìm kiếm hiện không tồn tại hoặc đã được chuyển sang danh mục khác.',
        loiKhuyen: 'Hãy kiểm tra lại bộ lọc tìm kiếm hoặc quay lại trang trước đó.',
      };

    case 409:
      return {
        maLoi: 409,
        loaiLoi: 'CANH_BAO',
        tieuDe: 'Dữ liệu đã tồn tại',
        thongDiepKyThuat: backendMessage,
        thongDiepThanThien: backendMessage || 'Thông tin bạn vừa nhập bị trùng lặp (ví dụ: Số điện thoại, CCCD hoặc trùng phòng/ca học).',
        loiKhuyen: 'Vui lòng kiểm tra lại để tránh tạo trùng bản ghi trong trung tâm.',
      };

    case 422:
      return {
        maLoi: 422,
        loaiLoi: 'CANH_BAO',
        tieuDe: 'Quy định nghiệp vụ',
        thongDiepKyThuat: backendMessage,
        thongDiepThanThien: backendMessage || 'Thao tác không thể hoàn tất do vi phạm ràng buộc đào tạo (ví dụ: Lớp đã đủ sĩ số, còn học sinh chưa thể xóa).',
        loiKhuyen: 'Vui lòng kiểm tra lại các điều kiện liên kết dữ liệu trước khi thực hiện.',
      };

    case 500:
    case 502:
    case 503:
    default:
      return {
        maLoi: status,
        loaiLoi: 'NGUY_HIEM',
        tieuDe: 'Hệ thống đang bận',
        thongDiepKyThuat: backendMessage,
        thongDiepThanThien: 'Hệ thống đang đồng bộ dữ liệu hoặc xử lý quá tải. Đừng lo lắng, dữ liệu của bạn vẫn an toàn.',
        loiKhuyen: 'Vui lòng bấm "Thử lại" sau vài giây hoặc liên hệ bộ phận kỹ thuật nếu tình trạng tiếp diễn.',
      };
  }
}

/**
 * Phát sự kiện lỗi toàn cục để bất kỳ component nào cũng có thể lắng nghe
 */
export function phatSuKienLoi(error: any) {
  const chiTiet = phanLoaiVaDichLoi(error);
  chiTiet.thoiGian = new Date();
  
  if (typeof window !== 'undefined') {
    const customEvent = new CustomEvent(SU_KIEN_BAO_LOI_TOAN_CUC, { detail: chiTiet });
    window.dispatchEvent(customEvent);
  }
  return chiTiet;
}


