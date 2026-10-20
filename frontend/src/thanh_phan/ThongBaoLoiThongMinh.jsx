import React, { useState, useEffect, useCallback } from 'react';
import { 
  AlertCircle, 
  ShieldAlert, 
  WifiOff, 
  Info, 
  CheckCircle2, 
  X, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { SU_KIEN_BAO_LOI_TOAN_CUC } from '../tien_ich/thongBaoLoi';

const ThongBaoLoiThongMinh = () => {
  const [errorInfo, setErrorInfo] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const dongThongBao = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setErrorInfo(null);
      setShowDetail(false);
    }, 300);
  }, []);

  useEffect(() => {
    const handleGlobalError = (event) => {
      const detail = event.detail;
      // Bỏ qua mã 401 vì Axios đã tự động refresh token trong nền
      if (detail.maLoi === 401) return;

      setErrorInfo(detail);
      setIsVisible(true);
      setShowDetail(false);

      // Tự động đóng sau 7 giây nếu không phải lỗi nguy hiểm
      if (detail.loaiLoi !== 'NGUY_HIEM') {
        const timer = setTimeout(() => {
          dongThongBao();
        }, 7000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener(SU_KIEN_BAO_LOI_TOAN_CUC, handleGlobalError);
    return () => window.removeEventListener(SU_KIEN_BAO_LOI_TOAN_CUC, handleGlobalError);
  }, [dongThongBao]);

  if (!errorInfo) return null;

  // Cấu hình màu sắc & biểu tượng theo loại lỗi
  const getTheme = () => {
    switch (errorInfo.loaiLoi) {
      case 'CANH_BAO':
        return {
          bg: 'linear-gradient(135deg, rgba(254, 243, 199, 0.95) 0%, rgba(253, 230, 138, 0.85) 100%)',
          border: 'rgba(245, 158, 11, 0.6)',
          textColor: '#92400E',
          iconColor: '#D97706',
          icon: <AlertCircle size={22} className="shrink-0" />,
          badge: 'Gợi ý kiểm tra',
          badgeBg: '#FEF3C7'
        };
      case 'MANG':
        return {
          bg: 'linear-gradient(135deg, rgba(241, 245, 249, 0.96) 0%, rgba(226, 232, 240, 0.9) 100%)',
          border: 'rgba(148, 163, 184, 0.6)',
          textColor: '#334155',
          iconColor: '#64748B',
          icon: <WifiOff size={22} className="shrink-0" />,
          badge: 'Đường truyền',
          badgeBg: '#E2E8F0'
        };
      case 'THONG_TIN':
        return {
          bg: 'linear-gradient(135deg, rgba(224, 242, 254, 0.95) 0%, rgba(186, 230, 253, 0.85) 100%)',
          border: 'rgba(2, 132, 199, 0.5)',
          textColor: '#075985',
          iconColor: '#0284C7',
          icon: <Info size={22} className="shrink-0" />,
          badge: 'Thông báo',
          badgeBg: '#E0F2FE'
        };
      case 'NGUY_HIEM':
      default:
        return {
          bg: 'linear-gradient(135deg, rgba(254, 226, 226, 0.96) 0%, rgba(254, 202, 202, 0.88) 100%)',
          border: 'rgba(239, 68, 68, 0.5)',
          textColor: '#991B1B',
          iconColor: '#DC2626',
          icon: <ShieldAlert size={22} className="shrink-0" />,
          badge: 'Hệ thống bận',
          badgeBg: '#FEE2E2'
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.25rem',
        left: '50%',
        transform: isVisible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-30px)',
        opacity: isVisible ? 1 : 0,
        zIndex: 9999,
        width: 'calc(100% - 2rem)',
        maxWidth: '680px',
        transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
      <div
        className="droplet-card"
        style={{
          background: theme.bg,
          border: `1.5px solid ${theme.border}`,
          borderRadius: '20px',
          padding: '0.9rem 1.25rem',
          boxShadow: '0 12px 36px -4px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(0,0,0,0.06), inset 2px 2px 4px rgba(255,255,255,0.95), inset -2px -2px 4px rgba(0,0,0,0.04)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: theme.textColor
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.85rem' }}>
          {/* Biểu tượng lỗi */}
          <div style={{ color: theme.iconColor, marginTop: '2px' }}>
            {theme.icon}
          </div>

          {/* Nội dung thông điệp chính & Lời khuyên êm dịu */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '0.15rem 0.55rem',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                color: theme.textColor
              }}>
                {theme.badge} #{errorInfo.maLoi}
              </span>
              <h4 style={{ margin: 0, fontSize: '0.925rem', fontWeight: '800', color: theme.textColor }}>
                {errorInfo.tieuDe}
              </h4>
            </div>

            {/* DÒNG TEXT CHUYÊN DỤNG THÂN THIỆN (Tránh gây khó chịu cho người dùng) */}
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '600', lineHeight: 1.45, color: theme.textColor }}>
              {errorInfo.thongDiepThanThien}
            </p>

            {/* Lời khuyên nhẹ nhàng */}
            {errorInfo.loaiKhuyen && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                marginTop: '0.35rem',
                fontSize: '0.775rem',
                opacity: 0.88,
                fontStyle: 'italic'
              }}>
                <Sparkles size={13} className="shrink-0" />
                <span>{errorInfo.loaiKhuyen}</span>
              </div>
            )}

            {/* Chi tiết kỹ thuật thu gọn dành cho Developer / Debug */}
            {errorInfo.thongDiepKyThuat && errorInfo.thongDiepKyThuat !== errorInfo.thongDiepThanThien && (
              <div style={{ marginTop: '0.4rem' }}>
                <button
                  onClick={() => setShowDetail(prev => !prev)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.725rem',
                    fontWeight: '700',
                    color: theme.textColor,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    textDecoration: 'underline'
                  }}
                >
                  {showDetail ? 'Ẩn chi tiết kỹ thuật' : 'Xem chi tiết phản hồi từ máy chủ'}
                  {showDetail ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                {showDetail && (
                  <pre style={{
                    margin: '0.4rem 0 0',
                    padding: '0.45rem 0.65rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.06)',
                    borderRadius: '8px',
                    fontSize: '0.725rem',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    maxHeight: '120px',
                    overflowY: 'auto'
                  }}>
                    {errorInfo.thongDiepKyThuat}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Nút đóng nhanh */}
          <button
            onClick={dongThongBao}
            className="droplet-circle"
            style={{
              width: '28px',
              height: '28px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              color: theme.textColor,
              flexShrink: 0
            }}
            title="Đóng thông báo"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThongBaoLoiThongMinh;


