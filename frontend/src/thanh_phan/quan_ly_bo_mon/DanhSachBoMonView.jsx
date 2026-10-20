import React from 'react';
import { Layers, Plus, Search, ChevronRight, RefreshCw, Edit, Trash2 } from 'lucide-react';
import styles from './DanhSachBoMon.module.css';

/**
 * Giao diện hiển thị danh sách các Bộ Môn Trung Tâm (Pure Presentation JSX)
 */
const DanhSachBoMonView = ({
  filteredList = [],
  loading = false,
  searchKeyword = '',
  setSearchKeyword,
  onSelectBoMon,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteBoMon,
  onRefresh
}) => {
  return (
    <div className={styles.container}>
      {/* ── BANNER HEADER & THANH CÔNG CỤ ── */}
      <div className={styles.headerBanner}>
        <div className={styles.headerInfo}>
          <div className={styles.headerIcon}>
            <Layers size={24} />
          </div>
          <div>
            <h2 className={styles.headerTitle}>
              Danh Mục Bộ Môn Trung Tâm
            </h2>
            <p className={styles.headerSubtitle}>
              Chọn bộ môn để quản lý danh sách chuyên môn, môn học và phân công giáo viên
            </p>
          </div>
        </div>

        {/* Cụm Tìm Kiếm & Nút Thêm Bộ Môn */}
        <div className={styles.toolbarActions}>
          <div className={styles.searchWrapper}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm kiếm bộ môn..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword && setSearchKeyword(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {onOpenAddModal && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className={`droplet-pill ${styles.btnAdd}`}
            >
              <Plus size={16} />
              <span>Thêm Bộ Môn</span>
            </button>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className={`droplet-pill ${styles.btnRefresh}`}
              title="Làm mới danh sách bộ môn"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
      </div>

      {/* ── LƯỚI DANH SÁCH THẺ BỘ MÔN ── */}
      {loading ? (
        <div className={`droplet-card ${styles.loadingCard}`}>
          <RefreshCw size={32} className={`animate-spin ${styles.loadingSpinner}`} />
          <p className={styles.loadingText}>Đang nạp danh sách bộ môn...</p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className={`droplet-card ${styles.emptyCard}`}>
          <Layers size={44} className={styles.emptyIcon} />
          <div>
            <h4 className={styles.emptyTitle}>
              {searchKeyword ? 'Không tìm thấy bộ môn phù hợp' : 'Chưa có bộ môn nào trong hệ thống'}
            </h4>
            <p className={styles.emptyDesc}>
              Hãy bấm vào nút "Thêm Bộ Môn" để khởi tạo bộ môn giảng dạy đầu tiên.
            </p>
          </div>
          {onOpenAddModal && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className={`droplet-pill ${styles.btnAddEmpty}`}
            >
              <Plus size={16} />
              <span>Thêm Bộ Môn Ngay</span>
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredList.map((bm) => {
            const idBm = bm.idBm || bm.idBoMon;
            const tenBm = bm.tenBm || bm.tenBoMon;
            return (
              <div
                key={idBm}
                onClick={() => onSelectBoMon && onSelectBoMon(bm)}
                className={`droplet-card ${styles.card}`}
              >
                <div>
                  {/* Top line: Icon + ID badge + Action dropdown */}
                  <div className={styles.cardHeader}>
                    <div className={styles.cardIcon}>
                      <Layers size={22} />
                    </div>

                    <div className={styles.badgeGroup}>
                      <span className={styles.cardBadge}>
                        Bộ môn đào tạo
                      </span>

                      {onOpenEditModal && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenEditModal(bm);
                          }}
                          className={styles.btnEdit}
                          title="Sửa tên bộ môn"
                        >
                          <Edit size={14} />
                        </button>
                      )}

                      {onDeleteBoMon && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteBoMon(idBm);
                          }}
                          className={styles.btnDelete}
                          title="Xóa bộ môn"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>
                      {tenBm}
                    </h3>
                    <p className={styles.cardDesc}>
                      {bm.moTa || 'Bộ môn trung tâm phụ trách đào tạo các chuyên ngành liên quan.'}
                    </p>
                  </div>
                </div>

                {/* Footer Action Card */}
                <div className={styles.cardFooter}>
                  <span>Xem Danh Sách Chuyên Môn</span>
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

export default DanhSachBoMonView;
