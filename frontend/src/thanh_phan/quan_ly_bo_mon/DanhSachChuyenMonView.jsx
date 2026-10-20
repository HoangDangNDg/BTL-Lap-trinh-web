import React from 'react';
import { Award, Plus, Search, ChevronRight, BookOpen, Users, RefreshCw } from 'lucide-react';
import styles from './DanhSachChuyenMon.module.css';

/**
 * Giao diện hiển thị danh sách Chuyên Môn của Bộ Môn (Pure Presentation JSX)
 */
const DanhSachChuyenMonView = ({
  tenBm = 'Bộ môn',
  filteredList = [],
  loading = false,
  searchKeyword = '',
  setSearchKeyword,
  onSelectChuyenMon,
  onOpenAddChuyenMonModal,
  onRefresh
}) => {
  return (
    <div className={styles.container}>
      {/* ── BANNER HEADER & THANH CÔNG CỤ ── */}
      <div className={styles.headerBanner}>
        <div className={styles.headerInfo}>
          <div className={styles.headerIcon}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h2 className={styles.headerTitle}>
                Chuyên Môn Thuộc {tenBm}
              </h2>
            </div>
            <p className={styles.headerSubtitle}>
              Chọn một chuyên môn để xem chi tiết danh sách môn học và đội ngũ giáo viên phụ trách
            </p>
          </div>
        </div>

        {/* Cụm Tìm Kiếm & Nút Thêm Chuyên Môn */}
        <div className={styles.toolbarActions}>
          <div className={styles.searchWrapper}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm chuyên môn..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword && setSearchKeyword(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {onOpenAddChuyenMonModal && (
            <button
              type="button"
              onClick={onOpenAddChuyenMonModal}
              className={`droplet-pill ${styles.btnAdd}`}
            >
              <Plus size={16} />
              <span>Tạo Chuyên Môn Mới</span>
            </button>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className={`droplet-pill ${styles.btnRefresh}`}
              title="Làm mới danh sách chuyên môn"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
      </div>

      {/* ── LƯỚI DANH SÁCH THẺ CHUYÊN MÔN ── */}
      {loading ? (
        <div className={`droplet-card ${styles.loadingCard}`}>
          <RefreshCw size={32} className={`animate-spin ${styles.loadingSpinner}`} />
          <p className={styles.loadingText}>Đang nạp danh sách chuyên môn của bộ môn {tenBm}...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className={`droplet-card ${styles.emptyCard}`}>
          <Award size={44} className={styles.emptyIcon} />
          <div>
            <h4 className={styles.emptyTitle}>
              {searchKeyword ? 'Không tìm thấy chuyên môn phù hợp' : 'Chưa có chuyên môn nào liên kết với bộ môn này'}
            </h4>
            <p className={styles.emptyDesc}>
              Hãy tạo chuyên môn mới hoặc liên kết môn học để phân bổ chuyên môn cho bộ môn {tenBm}.
            </p>
          </div>
          {onOpenAddChuyenMonModal && (
            <button
              type="button"
              onClick={onOpenAddChuyenMonModal}
              className={`droplet-pill ${styles.btnAddEmpty}`}
            >
              <Plus size={16} />
              <span>Tạo Chuyên Môn Đầu Tiên</span>
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredList.map((cm) => {
            const isAssigned = cm.thuocBoMon;
            return (
              <div
                key={cm.idCm}
                onClick={() => onSelectChuyenMon && onSelectChuyenMon(cm)}
                className={`droplet-card ${styles.card} ${isAssigned ? styles.cardAssigned : ''}`}
              >
                <div>
                  {/* Header thẻ: Icon + Trạng thái */}
                  <div className={styles.cardHeader}>
                    <div className={`${styles.cardIcon} ${isAssigned ? styles.cardIconAssigned : styles.cardIconDefault}`}>
                      <Award size={22} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {isAssigned ? (
                        <span className={styles.badgeAssigned}>
                          ● Đang Giảng Dạy
                        </span>
                      ) : (
                        <span className={styles.badgeAvailable}>
                          Có Sẵn
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>
                      {cm.tenCm}
                    </h3>
                    <p className={styles.cardDesc}>
                      {cm.moTa || `Chuyên môn đào tạo trực thuộc ${tenBm}.`}
                    </p>
                  </div>

                  {/* Metrics Pills */}
                  <div className={styles.metricsGroup}>
                    <span className={styles.metricBlue}>
                      <BookOpen size={13} />
                      <span>{cm.soMonHoc || 0} Môn Học</span>
                    </span>

                    <span className={styles.metricGreen}>
                      <Users size={13} />
                      <span>{cm.soGiaoVien || 0} Giáo Viên</span>
                    </span>
                  </div>
                </div>

                {/* Footer Action Card */}
                <div className={styles.cardFooter}>
                  <span>Xem Môn Học & Đội Ngũ Giáo Viên</span>
                  <ChevronRight size={17} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DanhSachChuyenMonView;
