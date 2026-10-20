import React, { useState, useMemo } from 'react';
import { Building2, Search, MapPin, Phone, RefreshCw, ArrowRight } from 'lucide-react';
import TheChiNhanh from '../chi_nhanh/TheChiNhanh';
import styles from './ChonChiNhanhView.module.css';

/**
 * Tầng 1: Component hiển thị danh sách Chi nhánh cơ sở đào tạo
 * Tái sử dụng TheChiNhanh, hiển thị lưới chi nhánh đẹp mắt chuẩn theo ảnh 2
 * Khi người dùng chọn chi nhánh, kích hoạt callback onSelectBranch để chuyển sang Tầng 2
 */
const ChonChiNhanhView = ({
  chiNhanhList = [],
  loading = false,
  onSelectBranch
}) => {
  const [keyword, setKeyword] = useState('');

  const filteredBranches = useMemo(() => {
    if (!keyword.trim()) return chiNhanhList;
    const q = keyword.toLowerCase();
    return chiNhanhList.filter(cn => 
      (cn.tenCn || '').toLowerCase().includes(q) ||
      (cn.diaChi || '').toLowerCase().includes(q) ||
      (cn.sdt || '').includes(q)
    );
  }, [chiNhanhList, keyword]);

  return (
    <div className={styles.container}>
      {/* Header Banner Chọn Chi Nhánh */}
      <div className={`droplet-card ${styles.headerCard}`}>
        <div className={styles.headerLeft}>
          <div className={`droplet-circle ${styles.headerIconBox}`}>
            <Building2 size={26} />
          </div>
          <div>
            <h2 className={styles.headerTitle}>
              Chọn Cơ Sở Chi Nhánh Đào Tạo
            </h2>
            <p className={styles.headerSubtitle}>
              Bấm vào thẻ bên dưới để tải và xem danh sách lớp học theo từng cơ sở chi nhánh
            </p>
          </div>
        </div>

        {/* Ô Tìm Kiếm Chi Nhánh */}
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm theo tên cơ sở, địa chỉ..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Lưới các thẻ Chi nhánh Cơ sở (Grid Cards) */}
      {loading ? (
        <div className={`droplet-card ${styles.stateCard}`}>
          <RefreshCw size={32} className={`animate-spin ${styles.loadingSpinner}`} />
          <p className={styles.loadingText}>Đang tải danh sách cơ sở chi nhánh...</p>
        </div>
      ) : filteredBranches.length === 0 ? (
        <div className={`droplet-card ${styles.emptyCard}`}>
          <Building2 size={40} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>Không tìm thấy cơ sở nào</p>
          <p className={styles.emptySubtitle}>Vui lòng kiểm tra lại từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className={styles.branchGrid}>
          {filteredBranches.map((cn) => (
            <div key={cn.idCn} className={styles.cardItemWrapper}>
              <TheChiNhanh
                chiNhanh={cn}
                onSelect={() => onSelectBranch && onSelectBranch(cn)}
              />
              {/* Nút hành động trực quan hỗ trợ người dùng nhận biết click */}
              <div className={styles.actionBadge}>
                <span>Xem lớp học</span>
                <ArrowRight size={13} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChonChiNhanhView;


