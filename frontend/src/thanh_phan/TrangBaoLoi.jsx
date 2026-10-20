import React from 'react';
import { 
  ShieldAlert, 
  WifiOff, 
  FileQuestion, 
  Lock, 
  ServerCrash, 
  RefreshCw, 
  Home, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { phanLoaiVaDichLoi } from '../tien_ich/thongBaoLoi';

/**
 * Component Báo Lỗi Tái Sử Dụng (Reusable Error Page / Section View)
 * 
 * @param {number|string|object} loi - Mã lỗi (404, 403, 500, 'MANG_OFFLINE') hoặc Error object
 * @param {string} tieuDe - Tiêu đề tùy biến (nếu không truyền sẽ tự lấy từ từ điển lỗi)
 * @param {string} thongDiep - Dòng text mô tả nhẹ nhàng, không gây ức chế
 * @param {Function} onThuLai - Callback hàm gọi lại API nạp dữ liệu
 * @param {boolean} fullPage - true: chiếm toàn màn hình; false: dạng khung/card trong trang
 */
const TrangBaoLoi = ({
  loi = 404,
  tieuDe,
  thongDiep,
  loiKhuyen,
  onThuLai,
  fullPage = false,
  nutHanhDong = null
}) => {
  const navigate = useNavigate();

  // Chuẩn hóa chi tiết lỗi từ helper
  const chiTiet = typeof loi === 'object' && loi?.maLoi
    ? loi
    : phanLoaiVaDichLoi(typeof loi === 'object' ? loi : { response: { status: Number(loi) || 500 } });

  const tieuDeHienThi = tieuDe || chiTiet.tieuDe;
  const thongDiepHienThi = thongDiep || chiTiet.thongDiepThanThien;
  const loiKhuyenHienThi = loiKhuyen || chiTiet.loiKhuyen;

  // Lấy icon và màu sắc phù hợp
  const getIconConfig = () => {
    switch (chiTiet.maLoi) {
      case 403:
        return {
          icon: <Lock size={44} />,
          color: '#D97706',
          bg: '#FEF3C7',
          badgeText: 'Bảo mật & Phân quyền'
        };
      case 404:
        return {
          icon: <FileQuestion size={44} />,
          color: '#0284C7',
          bg: '#E0F2FE',
          badgeText: 'Liên kết không tồn tại'
        };
      case 'MANG_OFFLINE':
        return {
          icon: <WifiOff size={44} />,
          color: '#64748B',
          bg: '#F1F5F9',
          badgeText: 'Mất kết nối mạng'
        };
      case 500:
      default:
        return {
          icon: <ServerCrash size={44} />,
          color: '#DC2626',
          bg: '#FEE2E2',
          badgeText: 'Máy chủ đang xử lý'
        };
    }
  };

  const { icon, color, bg, badgeText } = getIconConfig();

  const noiDung = (
    <div
      className="droplet-card animate-fade-in"
      style={{
        width: '100%',
        maxWidth: fullPage ? '580px' : '100%',
        margin: '0 auto',
        padding: fullPage ? '3rem 2.25rem' : '2.5rem 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        borderRadius: '24px'
      }}
    >
      {/* 1. Biểu tượng lỗi giọt nước quang học */}
      <div
        className="droplet-circle"
        style={{
          width: '84px',
          height: '84px',
          backgroundColor: bg,
          color: color,
          border: `2px solid rgba(255, 255, 255, 0.95)`,
          boxShadow: `0 10px 24px -4px ${color}30, inset 2.5px 2.5px 4px rgba(255,255,255,1), inset -2px -2px 4px rgba(0,0,0,0.06)`
        }}
      >
        {icon}
      </div>

      {/* 2. Badge Mã Lỗi */}
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '0.25rem 0.85rem',
          borderRadius: '9999px',
          backgroundColor: bg,
          color: color,
          border: '1px solid rgba(255, 255, 255, 0.8)'
        }}
      >
        {badgeText} {chiTiet.maLoi !== 'MANG_OFFLINE' && `• Mã #${chiTiet.maLoi}`}
      </span>

      {/* 3. Tiêu đề lỗi */}
      <h2
        style={{
          fontSize: fullPage ? '1.5rem' : '1.25rem',
          fontWeight: '800',
          color: '#0F172A',
          margin: 0,
          lineHeight: 1.3
        }}
      >
        {tieuDeHienThi}
      </h2>

      {/* 4. DÒNG TEXT CHUYÊN DỤNG GIẢI THÍCH NHẸ NHÀNG (Tránh khó chịu cho người dùng) */}
      <p
        style={{
          fontSize: '0.925rem',
          color: '#475569',
          lineHeight: 1.6,
          maxWidth: '460px',
          margin: 0,
          fontWeight: '500'
        }}
      >
        {thongDiepHienThi}
      </p>

      {/* 5. Gợi ý hành động êm dịu */}
      {loiKhuyenHienThi && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            fontSize: '0.825rem',
            color: '#64748B'
          }}
        >
          <Sparkles size={15} style={{ color: '#10B981', flexShrink: 0 }} />
          <span>{loiKhuyenHienThi}</span>
        </div>
      )}

      {/* 6. Các nút hành động khôi phục */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '0.5rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}
      >
        {onThuLai && (
          <button
            onClick={onThuLai}
            className="droplet-pill droplet-pill-mint"
            style={{
              padding: '0.65rem 1.35rem',
              fontSize: '0.875rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <RefreshCw size={16} />
            <span>Thử tải lại</span>
          </button>
        )}

        <button
          onClick={() => navigate(-1)}
          className="droplet-pill"
          style={{
            padding: '0.65rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: '700',
            color: '#334155',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>

        {fullPage && (
          <button
            onClick={() => navigate('/')}
            className="droplet-pill"
            style={{
              padding: '0.65rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: '700',
              color: '#0284C7',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <Home size={16} />
            <span>Về trang chủ</span>
          </button>
        )}

        {nutHanhDong}
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          boxSizing: 'border-box'
        }}
      >
        {noiDung}
      </div>
    );
  }

  return noiDung;
};

export default TrangBaoLoi;


