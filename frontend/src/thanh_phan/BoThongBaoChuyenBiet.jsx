import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Sparkles,
  Check,
  Receipt,
  HelpCircle
} from 'lucide-react';
import {
  SU_KIEN_TOAST_CHUYEN_BIET,
  SU_KIEN_MODAL_HOAN_TAT,
  SU_KIEN_MODAL_XAC_NHAN
} from '../tien_ich/thongBao';
import styles from './BoThongBaoChuyenBiet.module.css';

/**
 * BỘ THÔNG BÁO CHUYÊN BIỆT
 * Gồm:
 * 1. Toast thông báo góc phải (Tự động đếm lùi và biến mất)
 * 2. Modal Hoàn Tất Giao Dịch Chuyên Biệt (Hiện chi tiết thông tin đã xử lý)
 * 3. Modal Xác Nhận Thao Tác (Thay thế triệt để window.confirm)
 */
const BoThongBaoChuyenBiet = () => {
  const [toasts, setToasts] = useState([]);
  const [modalHoanTat, setModalHoanTat] = useState(null);
  const [modalXacNhan, setModalXacNhan] = useState(null);

  // ── 1. QUẢN LÝ TOAST ──
  const xoaToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handleToastEvent = (e) => {
      const newToast = e.detail;
      if (!newToast) return;

      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Tối đa 5 toast cùng lúc

      if (newToast.thoiGian && newToast.thoiGian > 0) {
        setTimeout(() => {
          xoaToast(newToast.id);
        }, newToast.thoiGian);
      }
    };

    window.addEventListener(SU_KIEN_TOAST_CHUYEN_BIET, handleToastEvent);
    return () => window.removeEventListener(SU_KIEN_TOAST_CHUYEN_BIET, handleToastEvent);
  }, [xoaToast]);

  // ── 2. QUẢN LÝ MODAL HOÀN TẤT ──
  useEffect(() => {
    const handleModalHoanTatEvent = (e) => {
      const config = e.detail;
      if (config?.hienThi) {
        setModalHoanTat(config);
      } else {
        setModalHoanTat(null);
      }
    };

    window.addEventListener(SU_KIEN_MODAL_HOAN_TAT, handleModalHoanTatEvent);
    return () => window.removeEventListener(SU_KIEN_MODAL_HOAN_TAT, handleModalHoanTatEvent);
  }, []);

  // ── 3. QUẢN LÝ MODAL XÁC NHẬN ──
  useEffect(() => {
    const handleModalXacNhanEvent = (e) => {
      const config = e.detail;
      if (config?.hienThi) {
        setModalXacNhan(config);
      } else {
        setModalXacNhan(null);
      }
    };

    window.addEventListener(SU_KIEN_MODAL_XAC_NHAN, handleModalXacNhanEvent);
    return () => window.removeEventListener(SU_KIEN_MODAL_XAC_NHAN, handleModalXacNhanEvent);
  }, []);

  // Lấy cấu hình style class cho từng loại Toast
  const getToastConfig = (loai) => {
    switch (loai) {
      case 'success':
        return {
          toastClass: styles.toastSuccess,
          iconBoxClass: styles.iconSuccess,
          titleClass: styles.titleSuccess,
          textClass: styles.textSuccess,
          progressClass: styles.progressBarSuccess,
          icon: <CheckCircle2 size={20} className="shrink-0" />
        };
      case 'error':
        return {
          toastClass: styles.toastError,
          iconBoxClass: styles.iconError,
          titleClass: styles.titleError,
          textClass: styles.textError,
          progressClass: styles.progressBarError,
          icon: <AlertCircle size={20} className="shrink-0" />
        };
      case 'warning':
        return {
          toastClass: styles.toastWarning,
          iconBoxClass: styles.iconWarning,
          titleClass: styles.titleWarning,
          textClass: styles.textWarning,
          progressClass: styles.progressBarWarning,
          icon: <AlertTriangle size={20} className="shrink-0" />
        };
      case 'info':
      default:
        return {
          toastClass: styles.toastInfo,
          iconBoxClass: styles.iconInfo,
          titleClass: styles.titleInfo,
          textClass: styles.textInfo,
          progressClass: styles.progressBarInfo,
          icon: <Info size={20} className="shrink-0" />
        };
    }
  };

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════════
          1. TOAST CONTAINER GÓC TRÊN BÊN PHẢI
          ════════════════════════════════════════════════════════════════════════ */}
      <div className={styles.toastContainer}>
        {toasts.map((item) => {
          const cfg = getToastConfig(item.loai);
          return (
            <div
              key={item.id}
              className={`droplet-card ${styles.toastItem} ${cfg.toastClass}`}
            >
              <div className={styles.toastHeaderRow}>
                <div className={`${styles.iconBox} ${cfg.iconBoxClass}`}>
                  {cfg.icon}
                </div>

                <div className={styles.toastContent}>
                  {item.tieuDe && (
                    <div className={`${styles.toastTitle} ${cfg.titleClass}`}>
                      {item.tieuDe}
                      {item.loai === 'success' && (
                        <span className={styles.badgeCompleted}>
                          HOÀN TẤT
                        </span>
                      )}
                    </div>
                  )}
                  <div className={`${styles.toastMessage} ${cfg.textClass}`}>
                    {item.thongDiep}
                  </div>

                  {item.hanhDong && (
                    <button
                      type="button"
                      onClick={() => {
                        item.hanhDong.onClick();
                        xoaToast(item.id);
                      }}
                      className={`${styles.toastActionBtn} ${cfg.titleClass}`}
                    >
                      {item.hanhDong.nhan}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => xoaToast(item.id)}
                  className={`${styles.closeToastBtn} ${cfg.textClass}`}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Thanh tiến trình đếm lùi thời gian */}
              {item.thoiGian && item.thoiGian > 0 && (
                <div
                  className={`${styles.toastProgressBar} ${cfg.progressClass}`}
                  style={{ animation: `progressBarShrink ${item.thoiGian}ms linear forwards` }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          2. MODAL THÔNG BÁO HOÀN TẤT GIAO DỊCH CHUYÊN BIỆT
          ════════════════════════════════════════════════════════════════════════ */}
      {modalHoanTat && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            modalHoanTat.onDong?.();
            setModalHoanTat(null);
          }}
        >
          <div
            className={`droplet-card ${styles.modalCardHoanTat}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng góc phải */}
            <button
              type="button"
              onClick={() => {
                modalHoanTat.onDong?.();
                setModalHoanTat(null);
              }}
              className={styles.modalCloseCornerBtn}
            >
              <X size={16} />
            </button>

            {/* Vòng huy hiệu hoàn tất với hiệu ứng sóng ngọc bích */}
            <div className={styles.badgeWrap}>
              <div className={styles.badgeCircle}>
                <Check size={40} strokeWidth={2.8} />
              </div>

              {/* Icon lấp lánh trang trí */}
              <div className={styles.sparkleBadge}>
                <Sparkles size={16} />
              </div>
            </div>

            {/* Tiêu đề chính */}
            <h3 className={styles.modalTitle}>
              {modalHoanTat.tieuDe || 'Thao Tác Hoàn Tất!'}
            </h3>

            {/* Thông điệp phụ */}
            {modalHoanTat.thongDiep && (
              <p className={styles.modalSubtitle}>
                {modalHoanTat.thongDiep}
              </p>
            )}

            {/* Bảng chi tiết giao dịch (nếu có) */}
            {modalHoanTat.thongTinChiTiet && modalHoanTat.thongTinChiTiet.length > 0 && (
              <div className={styles.detailTable}>
                {modalHoanTat.thongTinChiTiet.map((row, idx) => (
                  <div
                    key={idx}
                    className={`${styles.detailRow} ${idx < modalHoanTat.thongTinChiTiet.length - 1 ? styles.detailRowBorder : ''}`}
                  >
                    <span className={styles.detailLabel}>{row.nhan}</span>
                    <span className={row.noiBat ? styles.detailValueHighlight : styles.detailValue}>
                      {row.giaTri}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Cụm nút hành động */}
            <div className={styles.modalActions}>
              {modalHoanTat.nutPhu && (
                <button
                  type="button"
                  onClick={() => {
                    modalHoanTat.nutPhu.onClick();
                    setModalHoanTat(null);
                  }}
                  className={styles.btnSecondaryAction}
                >
                  {modalHoanTat.nutPhu.nhan}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  modalHoanTat.onDong?.();
                  setModalHoanTat(null);
                }}
                className={styles.btnPrimaryFinish}
              >
                <Check size={18} />
                {modalHoanTat.nutDong || 'Hoàn tất & Đóng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          3. MODAL XÁC NHẬN CHUYÊN BIỆT (Thay thế window.confirm)
          ════════════════════════════════════════════════════════════════════════ */}
      {modalXacNhan && (
        <div
          className={styles.modalOverlay}
          onClick={() => {
            modalXacNhan.onHuy?.();
            setModalXacNhan(null);
          }}
        >
          <div
            className={`droplet-card ${styles.modalCardConfirm}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.confirmHeader}>
              <div
                className={modalXacNhan.loai === 'danger' ? styles.confirmIconBoxDanger : styles.confirmIconBoxWarning}
              >
                {modalXacNhan.loai === 'danger' ? <AlertCircle size={24} /> : <AlertTriangle size={24} />}
              </div>

              <div>
                <h4 className={styles.confirmTitle}>
                  {modalXacNhan.tieuDe || 'Xác nhận thao tác'}
                </h4>
                <p className={styles.confirmDesc}>
                  {modalXacNhan.thongDiep}
                </p>
              </div>
            </div>

            <div className={styles.confirmFooter}>
              <button
                type="button"
                onClick={() => {
                  modalXacNhan.onHuy?.();
                  setModalXacNhan(null);
                }}
                className={styles.btnCancel}
              >
                {modalXacNhan.nhanHuy || 'Hủy bỏ'}
              </button>

              <button
                type="button"
                onClick={async () => {
                  const onOk = modalXacNhan.onXacNhan;
                  setModalXacNhan(null);
                  if (onOk) await onOk();
                }}
                className={modalXacNhan.loai === 'danger' ? styles.btnDangerConfirm : styles.btnPrimaryConfirm}
              >
                {modalXacNhan.nhanXacNhan || 'Đồng ý'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BoThongBaoChuyenBiet;
