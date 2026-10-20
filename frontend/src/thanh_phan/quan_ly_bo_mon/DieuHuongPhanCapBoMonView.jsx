import React from 'react';
import { ArrowLeft, ChevronRight, RefreshCw } from 'lucide-react';
import styles from './DieuHuongPhanCapBoMon.module.css';

/**
 * Giao diện hiển thị thanh điều hướng Queue State & Rollback (Pure Presentation JSX)
 */
const DieuHuongPhanCapBoMonView = ({
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
            title="Quay lại nấc trước"
          >
            <ArrowLeft size={16} />
            <span>Quay lại</span>
          </button>
        )}

        {/* Thanh Breadcrumb */}
        <nav className={styles.navBreadcrumb}>
          {navQueue.map((item, index) => {
            const isLast = index === navQueue.length - 1;
            const label = getStepLabel ? getStepLabel(item, index) : `Nấc ${index + 1}`;
            const icon = getStepIcon ? getStepIcon(item.step) : null;

            return (
              <React.Fragment key={`${item.step}-${index}`}>
                <button
                  type="button"
                  onClick={() => !isLast && onJumpToStep && onJumpToStep(index)}
                  disabled={isLast}
                  className={`${styles.breadcrumbBtn} ${isLast ? styles.breadcrumbBtnCurrent : styles.breadcrumbBtnHistory}`}
                  title={!isLast ? `Bấm để quay lại ${label}` : undefined}
                >
                  {icon}
                  <span>{label}</span>
                </button>

                {!isLast && (
                  <ChevronRight size={14} className={styles.separator} />
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* ── BÊN PHẢI: EXTRA ACTIONS & NÚT LÀM MỚI ── */}
      <div className={styles.rightGroup}>
        {extraRight}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className={`droplet-pill ${styles.btnRefresh}`}
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>
    </div>
  );
};

export default DieuHuongPhanCapBoMonView;
