import React from 'react';
import { 
  Calendar as CalendarIcon, 
  RefreshCw, 
  Plus, 
  ArrowLeft,
  Building2,
  Printer
} from 'lucide-react';
import { LiquidGlassTabs } from '@/components/ui/liquid-glass-button';
import styles from './ThanhDieuHuongTkb.module.css';

/**
 * ThanhDieuHuongTkbView:
 * Giao diện Thanh điều hướng & Banner trên cùng của Thời khóa biểu (Pure Presentation JSX)
 */
const ThanhDieuHuongTkbView = ({
  currentChiNhanh,
  loading = false,
  isReadOnly = false,
  viewMode = 'room',
  viewModeOptions = [],
  onChangeViewMode,
  onRefresh,
  onOpenAddModal,
  onChangeBranch,
  onPrint
}) => {
  return (
    <div className={styles.container}>
      {/* Tiêu đề & Thông tin cơ sở chi nhánh */}
      <div className={styles.leftSection}>
        <div className={styles.iconWrapper}>
          <CalendarIcon size={22} />
        </div>
        <div>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>
              Thời Khóa Biểu Tuần
            </h1>
            {currentChiNhanh && (
              <span className={styles.branchBadge}>
                <Building2 size={12} />
                {currentChiNhanh.tenCn}
              </span>
            )}
          </div>
          <p className={styles.subtitle}>
            Toàn cảnh phân bổ phòng học & ca giảng dạy • Bấm vào ô trống để xếp lịch
          </p>
        </div>
      </div>

      {/* Action Controls: Đổi chi nhánh, Làm mới, Thêm lịch dạy, Toggle View Mode */}
      <div className={styles.actionsSection}>
        {/* Nút Đổi chi nhánh khác */}
        {onChangeBranch && (
          <button
            type="button"
            onClick={onChangeBranch}
            className={`droplet-pill ${styles.btnChangeBranch}`}
            title="Quay lại danh sách để chọn chi nhánh khác"
          >
            <ArrowLeft size={14} />
            <span>Đổi chi nhánh</span>
          </button>
        )}

        {/* Nút Làm mới icon */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className={`droplet-pill ${styles.btnRefresh}`}
            title="Làm mới dữ liệu thời khóa biểu"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        )}

        {/* Nút In Thời Khóa Biểu */}
        {onPrint && (
          <button
            type="button"
            onClick={onPrint}
            className={`droplet-pill no-print ${styles.btnPrint}`}
            title="In thời khóa biểu ra máy in hoặc lưu file PDF (Khổ A4 ngang)"
          >
            <Printer size={15} />
            <span>In Thời Khóa Biểu</span>
          </button>
        )}

        {/* Nút Thêm lịch dạy */}
        {onOpenAddModal && (
          <button
            type="button"
            onClick={onOpenAddModal}
            disabled={isReadOnly}
            className={`droplet-pill droplet-pill-mint ${styles.btnAdd} ${isReadOnly ? styles.btnAddDisabled : ''}`}
            title={isReadOnly ? 'Năm học hoặc tuần học đã kết thúc (Không thể thêm lịch)' : 'Thêm lịch dạy mới'}
          >
            <Plus size={15} />
            <span>Thêm lịch dạy</span>
          </button>
        )}

        {/* Bộ chuyển đổi chế độ xem (LiquidGlassTabs) */}
        {onChangeViewMode && viewModeOptions.length > 0 && (
          <LiquidGlassTabs
            options={viewModeOptions}
            value={viewMode}
            onChange={onChangeViewMode}
            size="sm"
          />
        )}
      </div>
    </div>
  );
};

export default ThanhDieuHuongTkbView;
