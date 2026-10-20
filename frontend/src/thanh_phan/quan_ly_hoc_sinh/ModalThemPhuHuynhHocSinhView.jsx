import React from 'react';
import { createPortal } from 'react-dom';
import { HeartHandshake, X, RefreshCw, UserPlus, Search, Check, Users } from 'lucide-react';
import styles from './ModalThemPhuHuynhHocSinh.module.css';

/**
 * Giao diện Modal Thêm Phụ Huynh Cho Học Sinh (Pure Presentation JSX)
 */
const ModalThemPhuHuynhHocSinhView = ({
  show = false,
  onClose,
  studentId,
  studentName = '',
  activeTab = 'NEW',
  setActiveTab,
  submitting = false,
  errorMessage = '',
  formData,
  setFormData,
  onSubmitNew,
  searchParentKeyword = '',
  setSearchParentKeyword,
  searchingParent = false,
  parentSearchResults = [],
  selectedParentId = null,
  setSelectedParentId,
  existingRelation = 'Cha / Mẹ',
  setExistingRelation,
  onSearchExistingParent,
  onLinkExistingParent
}) => {
  if (!show) return null;

  return createPortal(
    <div className={styles.overlay}>
      <div className={`droplet-card ${styles.modalCard}`}>
        {/* Header Cố Định */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.titleIcon}>
              <HeartHandshake size={22} />
            </div>
            <div>
              <h3 className={styles.titleMain}>
                Thêm Phụ Huynh / Người Giám Hộ
              </h3>
              <p className={styles.titleSub}>
                Gán cho học sinh: <strong className={styles.studentHighlight}>{studentName || `#${studentId}`}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`droplet-circle ${styles.btnClose}`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className={styles.tabSwitcher}>
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('NEW')}
            className={`${styles.tabBtn} ${activeTab === 'NEW' ? styles.tabBtnActiveNew : styles.tabBtnInactive}`}
          >
            <UserPlus size={15} />
            <span>Tạo Phụ Huynh Mới</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('EXISTING')}
            className={`${styles.tabBtn} ${activeTab === 'EXISTING' ? styles.tabBtnActiveExisting : styles.tabBtnInactive}`}
          >
            <Users size={15} />
            <span>Chọn Phụ Huynh Có Sẵn</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className={styles.errorAlert}>
            {errorMessage}
          </div>
        )}

        {/* Body Form Cuộn Mượt */}
        <div className={styles.body}>
          {activeTab === 'NEW' ? (
            /* TAB 1: TẠO PHỤ HUYNH MỚI */
            <form id="form-new-parent" onSubmit={onSubmitNew} className={styles.formNew}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Họ Và Tên Phụ Huynh *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Thị Hoa"
                  value={formData.hoTen}
                  onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                  className={`droplet-pill ${styles.input}`}
                />
              </div>

              <div className={styles.gridTwoCol}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Số Điện Thoại Liên Lạc *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    placeholder="VD: 0904000006"
                    value={formData.soDienThoai}
                    onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                    className={`droplet-pill ${styles.input}`}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Số CCCD Phụ Huynh
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="VD: 079208000099"
                    value={formData.cccd}
                    onChange={(e) => setFormData({ ...formData, cccd: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                    className={`droplet-pill ${styles.input}`}
                  />
                </div>
              </div>

              <div className={styles.gridTwoCol}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Mối Quan Hệ Với Học Sinh
                  </label>
                  <select
                    value={formData.moiQuanHe}
                    onChange={(e) => setFormData({ ...formData, moiQuanHe: e.target.value })}
                    className={`droplet-pill ${styles.select}`}
                  >
                    <option value="Cha / Mẹ">Cha / Mẹ</option>
                    <option value="Bố">Bố</option>
                    <option value="Mẹ">Mẹ</option>
                    <option value="Người bảo hộ">Người bảo hộ</option>
                    <option value="Ông / Bà">Ông / Bà</option>
                    <option value="Anh / Chị">Anh / Chị</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Nghề Nghiệp / Đơn Vị
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Giáo viên, Tự do..."
                    value={formData.ngheNghiep}
                    onChange={(e) => setFormData({ ...formData, ngheNghiep: e.target.value })}
                    className={`droplet-pill ${styles.input}`}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Địa Chỉ Liên Hệ
                </label>
                <input
                  type="text"
                  placeholder="VD: 12 Nguyễn Huệ, Quận 1, TP.HCM"
                  value={formData.diaChi}
                  onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
                  className={`droplet-pill ${styles.input}`}
                />
              </div>
            </form>
          ) : (
            /* TAB 2: CHỌN PHỤ HUYNH CÓ SẴN */
            <div className={styles.tabExistingWrapper}>
              <div className={styles.searchRow}>
                <div className={styles.searchBox}>
                  <Search size={16} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Tìm theo SĐT hoặc họ tên phụ huynh..."
                    value={searchParentKeyword}
                    onChange={(e) => setSearchParentKeyword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') onSearchExistingParent(e); }}
                    className={`droplet-pill ${styles.searchInput}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={onSearchExistingParent}
                  disabled={searchingParent || !searchParentKeyword.trim()}
                  className={`droplet-pill ${styles.btnSearch}`}
                >
                  {searchingParent ? <RefreshCw size={14} className="animate-spin" /> : 'Tìm'}
                </button>
              </div>

              {/* Danh sách kết quả tìm kiếm */}
              <div className={styles.searchResultsList}>
                {parentSearchResults.length === 0 ? (
                  <p className={styles.searchEmptyText}>
                    {searchParentKeyword ? 'Không tìm thấy phụ huynh nào.' : 'Nhập SĐT hoặc Tên để tra cứu phụ huynh có sẵn.'}
                  </p>
                ) : (
                  parentSearchResults.map((p) => {
                    const isSelected = selectedParentId === p.idPh;
                    return (
                      <div
                        key={p.idPh}
                        onClick={() => setSelectedParentId && setSelectedParentId(p.idPh)}
                        className={`${styles.parentResultItem} ${isSelected ? styles.parentResultItemSelected : ''}`}
                      >
                        <div>
                          <strong className={styles.parentName}>{p.hoTen || p.tenPh}</strong>
                          <div className={styles.parentDetails}>
                            SĐT: <span className={styles.parentPhone}>{p.sdt || p.soDienThoai || '--'}</span> • CCCD: {p.cccd || '--'}
                          </div>
                        </div>
                        {isSelected && <Check size={18} style={{ color: '#0095F6' }} />}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Mối quan hệ */}
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Mối Quan Hệ Với Học Sinh Này
                </label>
                <select
                  value={existingRelation}
                  onChange={(e) => setExistingRelation && setExistingRelation(e.target.value)}
                  className={`droplet-pill ${styles.select}`}
                >
                  <option value="Cha / Mẹ">Cha / Mẹ</option>
                  <option value="Bố">Bố</option>
                  <option value="Mẹ">Mẹ</option>
                  <option value="Người bảo hộ">Người bảo hộ</option>
                  <option value="Ông / Bà">Ông / Bà</option>
                  <option value="Anh / Chị">Anh / Chị</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer Cố Định */}
        <div className={styles.footer}>
          <button
            type="button"
            onClick={onClose}
            className={`droplet-pill ${styles.btnCancel}`}
          >
            Hủy
          </button>

          {activeTab === 'NEW' ? (
            <button
              type="submit"
              form="form-new-parent"
              disabled={submitting}
              className={`droplet-pill droplet-pill-mint ${styles.btnSubmitNew}`}
            >
              {submitting && <RefreshCw size={15} className="animate-spin" />}
              <span>{submitting ? 'Đang lưu...' : 'Lưu & Liên Kết'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onLinkExistingParent}
              disabled={submitting || !selectedParentId}
              className={`droplet-pill ${styles.btnSubmitLink} ${submitting || !selectedParentId ? styles.btnSubmitLinkDisabled : styles.btnSubmitLinkActive}`}
            >
              {submitting && <RefreshCw size={15} className="animate-spin" />}
              <span>{submitting ? 'Đang liên kết...' : 'Xác Nhận Liên Kết'}</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ModalThemPhuHuynhHocSinhView;
