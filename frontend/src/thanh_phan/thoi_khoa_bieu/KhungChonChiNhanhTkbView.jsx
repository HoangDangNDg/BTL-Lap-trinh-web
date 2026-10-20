import React from 'react';
import { Building2, RefreshCw } from 'lucide-react';
import TheChiNhanh from '../chi_nhanh/TheChiNhanh';
import styles from './KhungChonChiNhanhTkb.module.css';

/**
 * KhungChonChiNhanhTkbView:
 * Giao diện hiển thị Bước 1 - Chọn cơ sở chi nhánh đào tạo (Pure Presentation JSX)
 */
const KhungChonChiNhanhTkbView = ({
  chiNhanhList = [],
  loading = false,
  onSelectChiNhanh
}) => {
  return (
    <div className={styles.container}>
      {/* Banner Giới thiệu Bước 1 */}
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.bannerIcon}>
            <Building2 size={26} />
          </div>
          <div>
            <div className={styles.titleWrapper}>
              <span className={styles.stepBadge}>Bước 1</span>
              <h2 className={styles.title}>
                Chọn Cơ Sở Chi Nhánh Đào Tạo
              </h2>
            </div>
            <p className={styles.subtitle}>
              Vui lòng chọn cơ sở chi nhánh bên dưới để nạp dữ liệu phòng học & thời khóa biểu tuần tương ứng
            </p>
          </div>
        </div>

        <div className={styles.bannerRight}>
          <span className={styles.countText}>
            Hệ thống đang quản lý <strong className={styles.countHighlight}>{chiNhanhList.length}</strong> cơ sở
          </span>
        </div>
      </div>

      {/* Danh sách các thẻ Chi Nhánh */}
      {loading ? (
        <div className={`droplet-card ${styles.loadingCard}`}>
          <RefreshCw size={28} className={`animate-spin ${styles.loadingSpinner}`} />
          <p className={styles.loadingText}>Đang nạp danh sách cơ sở chi nhánh...</p>
        </div>
      ) : chiNhanhList.length === 0 ? (
        <div className={styles.emptyCard}>
          <Building2 size={40} className={styles.emptyIcon} />
          <h4 className={styles.emptyTitle}>Chưa có cơ sở chi nhánh nào</h4>
          <p className={styles.emptyDesc}>
            Vui lòng thêm chi nhánh đào tạo trong mục Quản lý hệ thống.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {chiNhanhList.map((cn) => (
            <TheChiNhanh
              key={cn.idCn}
              chiNhanh={cn}
              isSelected={false}
              onSelect={(selected) => onSelectChiNhanh && onSelectChiNhanh(selected.idCn)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default KhungChonChiNhanhTkbView;
