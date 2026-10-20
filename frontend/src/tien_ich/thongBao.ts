/**
 * BỘ THÔNG BÁO CHUYÊN BIỆT CHO TRUNG TÂM GIÁO DỤC
 * Thay thế hoàn toàn các lệnh alert() và confirm() mặc định của trình duyệt.
 */

export type LoaiThongBao = 'success' | 'error' | 'warning' | 'info';

export interface ThongBaoToastOptions {
  id?: string;
  loai?: LoaiThongBao;
  tieuDe?: string;
  thongDiep: string;
  thoiGian?: number; // ms, mặc định 4000ms
  hanhDong?: {
    nhan: string;
    onClick: () => void;
  };
}

export interface ItemChiTietHoanTat {
  nhan: string;
  giaTri: string | number;
  noiBat?: boolean;
}

export interface ModalHoanTatConfig {
  tieuDe: string;
  thongDiep?: string;
  thongTinChiTiet?: ItemChiTietHoanTat[];
  nutDong?: string;
  nutPhu?: {
    nhan: string;
    onClick: () => void;
  };
  onDong?: () => void;
}

export interface ModalXacNhanConfig {
  tieuDe: string;
  thongDiep: string;
  loai?: 'danger' | 'warning' | 'info';
  nhanXacNhan?: string;
  nhanHuy?: string;
  onXacNhan: () => void | Promise<void>;
  onHuy?: () => void;
}

// Các tên sự kiện window toàn cục
export const SU_KIEN_TOAST_CHUYEN_BIET = 'HE_THONG_TOAST_CHUYEN_BIET';
export const SU_KIEN_MODAL_HOAN_TAT = 'HE_THONG_MODAL_HOAN_TAT';
export const SU_KIEN_MODAL_XAC_NHAN = 'HE_THONG_MODAL_XAC_NHAN';

/**
 * Dispatcher thông báo chuyên biệt
 */
export const thongBao = {
  /**
   * Hiển thị Toast thông báo ngắn
   */
  toast: (options: ThongBaoToastOptions) => {
    if (typeof window === 'undefined') return;
    const detail: ThongBaoToastOptions = {
      id: options.id || 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      loai: options.loai || 'info',
      tieuDe: options.tieuDe,
      thongDiep: options.thongDiep,
      thoiGian: options.thoiGian ?? 4000,
      hanhDong: options.hanhDong
    };
    window.dispatchEvent(new CustomEvent(SU_KIEN_TOAST_CHUYEN_BIET, { detail }));
  },

  /**
   * Thông báo hoàn tất / thành công ngắn (Toast)
   */
  success: (thongDiep: string, options?: Partial<ThongBaoToastOptions>) => {
    thongBao.toast({
      loai: 'success',
      tieuDe: options?.tieuDe || 'Thao tác hoàn tất',
      thongDiep,
      ...options
    });
  },

  /**
   * Thông báo lỗi (Toast)
   */
  error: (thongDiep: string, options?: Partial<ThongBaoToastOptions>) => {
    thongBao.toast({
      loai: 'error',
      tieuDe: options?.tieuDe || 'Đã có lỗi xảy ra',
      thongDiep,
      thoiGian: options?.thoiGian ?? 6000,
      ...options
    });
  },

  /**
   * Thông báo cảnh báo (Toast)
   */
  warning: (thongDiep: string, options?: Partial<ThongBaoToastOptions>) => {
    thongBao.toast({
      loai: 'warning',
      tieuDe: options?.tieuDe || 'Lưu ý kiểm tra',
      thongDiep,
      thoiGian: options?.thoiGian ?? 5000,
      ...options
    });
  },

  /**
   * Thông báo thông tin (Toast)
   */
  info: (thongDiep: string, options?: Partial<ThongBaoToastOptions>) => {
    thongBao.toast({
      loai: 'info',
      tieuDe: options?.tieuDe || 'Thông tin',
      thongDiep,
      ...options
    });
  },

  /**
   * MỞ MODAL THÔNG BÁO HOÀN TẤT CHUYÊN BIỆT
   * Phù hợp cho các thao tác lớn như lập phiếu thu, đóng học phí thành công, xuất hóa đơn...
   */
  hoanTat: (config: ModalHoanTatConfig) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(SU_KIEN_MODAL_HOAN_TAT, {
      detail: {
        hienThi: true,
        ...config
      }
    }));
  },

  /**
   * Đóng Modal Hoàn Tất
   */
  dongModalHoanTat: () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(SU_KIEN_MODAL_HOAN_TAT, {
      detail: { hienThi: false }
    }));
  },

  /**
   * MỞ MODAL XÁC NHẬN CHUYÊN BIỆT (Thay thế window.confirm)
   */
  xacNhan: (config: ModalXacNhanConfig) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(SU_KIEN_MODAL_XAC_NHAN, {
      detail: {
        hienThi: true,
        ...config
      }
    }));
  },

  /**
   * Đóng Modal Xác Nhận
   */
  dongModalXacNhan: () => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent(SU_KIEN_MODAL_XAC_NHAN, {
      detail: { hienThi: false }
    }));
  }
};
