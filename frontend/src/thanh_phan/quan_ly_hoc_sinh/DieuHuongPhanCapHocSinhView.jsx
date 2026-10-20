import React from 'react';
import { ArrowLeft, ChevronRight, RefreshCw } from 'lucide-react';
import styles from './DieuHuongPhanCapHocSinh.module.css';

/**
 * Giao diện thanh điều hướng Queue State Quản Lý Học Sinh (Pure Presentation JSX)
 */
const DieuHuongPhanCapHocSinhView = ({
  navQueue = [],
  canRollback = false,
  onPopStep,
  onJumpToStep,
  onRefresh,
  loading = false,
  extraRight = null,
  getStepIcon,
  getStepLabel
}) => {
  return (
    <div className={styles.container}>
      {/* ── BÊN TRÁI: NÚT ROLLBACK & THANH BREADCRUMB ── */}
      <div className={styles.leftGroup}>
        {/* Nút Rollback (Quay lại) */}
        {canRollback && (
          <button
            type="button"
            onClick={onPopStep}
            className={`droplet-pill ${styles.btnRollback}`}
          >
            <ArrowLeft size={15} />
            <span>Quay lại</span>
          </button>
        )}

        {/* Danh sách nấc trong hàng đợi (Breadcrumbs) */}
        <div className={styles.breadcrumbNav}>
          {navQueue.map((item, idx) => {
            const isLast = idx === navQueue.length - 1;
            const label = getStepLabel ? getStepLabel(item, idx) : `Nấc ${idx + 1}`;
            const icon = getStepIcon ? getStepIcon(item.step) : null;

            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight size={14} className={styles.separator} />}
                <button
                  type="button"
                  onClick={() => onJumpToStep && onJumpToStep(idx)}
                  disabled={isLast}
                  className={`${styles.breadcrumbBtn} ${isLast ? styles.breadcrumbCurrent : styles.breadcrumbHistory}`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── BÊN PHẢI: NÚT LÀM MỚI HOẶC NÚT BỔ SUNG ── */}
      <div className={styles.rightGroup}>
        {extraRight}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            title="Làm mới dữ liệu"
            className={`droplet-pill ${styles.btnRefresh}`}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default DieuHuongPhanCapHocSinhView;
