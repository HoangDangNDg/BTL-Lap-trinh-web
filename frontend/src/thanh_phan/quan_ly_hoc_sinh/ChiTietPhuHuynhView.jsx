import React from 'react';
import { 
  HeartHandshake, 
  User, 
  GraduationCap, 
  Plus, 
  ArrowLeft, 
  Edit2, 
  RefreshCw, 
  Trash2, 
  Search, 
  Check, 
  X,
  ChevronRight
} from 'lucide-react';
import styles from './ChiTietPhuHuynh.module.css';

/**
 * Giao diện View Chi Tiết Phụ Huynh & Liên Kết Hồ Sơ Học Sinh (Pure Presentation JSX)
 */
const ChiTietPhuHuynhView = ({
  parentDetail,
  parentId,
  onBack,
  onEdit,
  onSelectStudent,
  studentsList = [],
  loadingStudents = false,
  onUnlink,
  showLinkModal = false,
  setShowLinkModal,
  searchHsCccd = '',
  setSearchHsCccd,
  searchingHs = false,
  searchHsResults = [],
  selectedHs = null,
  setSelectedHs,
  relationship = 'Con',
  setRelationship,
  linkingSubmitting = false,
  linkErrorMsg = '',
  onSearchStudent,
  onLinkSubmit
}) => {
  if (!parentDetail) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Không tìm thấy hồ sơ phụ huynh.</p>
        <button onClick={onBack} className="droplet-pill" style={{ cursor: 'pointer' }}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ── BANNER ĐIỀU HƯỚNG & HÀNH ĐỘNG ── */}
      <div className={styles.headerBanner}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            onClick={onBack}
            className={styles.btnBack}
            title="Quay lại danh sách phụ huynh"
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className={styles.headerIcon}>
              <HeartHandshake size={24} />
            </div>
            <div>
              <div className={styles.headerTitleGroup}>
                <h2 className={styles.headerTitle}>
                  {parentDetail.hoTen || parentDetail.tenPh}
                </h2>
                <span className={styles.headerBadge}>
                  #PH-{parentId}
                </span>
              </div>
              <p className={styles.headerSubtitle}>
                Hồ sơ phụ huynh đại diện & danh sách học sinh trực thuộc gia đình
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => onEdit && onEdit(parentDetail)}
            className={styles.btnEditParent}
          >
            <Edit2 size={16} />
            <span>Sửa Hồ Sơ Phụ Huynh</span>
          </button>
        </div>
      </div>

      {/* ── THẺ 1: HỒ SƠ CHI TIẾT PHỤ HUYNH ── */}
      <div className={styles.infoCard}>
        <div className={styles.infoCardHeader}>
          <User size={20} style={{ color: '#059669' }} />
          <h3 className={styles.infoCardTitle}>
            Thông Tin Cá Nhân & Liên Lạc
          </h3>
        </div>

        <div className={styles.infoGrid}>
          <div>
            <span className={styles.infoLabel}>Họ và tên phụ huynh:</span>
            <strong className={styles.infoValue}>{parentDetail.hoTen || parentDetail.tenPh}</strong>
          </div>

          <div>
            <span className={styles.infoLabel}>Số điện thoại liên lạc:</span>
            <strong className={styles.infoValueBlue}>
              {parentDetail.soDienThoai || parentDetail.sdt || 'Chưa cập nhật'}
            </strong>
          </div>

          <div>
            <span className={styles.infoLabel}>Số CCCD / Mã định danh:</span>
            <strong className={styles.infoValueCccd}>
              {parentDetail.cccd || 'Chưa cập nhật'}
            </strong>
          </div>

          <div>
            <span className={styles.infoLabel}>Hộp thư điện tử (Email):</span>
            <strong className={styles.infoValue}>
              {parentDetail.email || 'Chưa cập nhật'}
            </strong>
          </div>

          <div>
            <span className={styles.infoLabel}>Nghề nghiệp / Đơn vị:</span>
            <strong className={styles.infoValue}>
              {parentDetail.ngheNghiep || 'Tự do'}
            </strong>
          </div>

          <div className={styles.infoFullRow}>
            <span className={styles.infoLabel}>Địa chỉ liên hệ:</span>
            <strong className={styles.infoValue}>
              {parentDetail.diaChi || 'Chưa có thông tin địa chỉ'}
            </strong>
          </div>
        </div>
      </div>

      {/* ── THẺ 2: DANH SÁCH HỌC SINH / CON CÁI TRỰC THUỘC ── */}
      <div className={styles.childrenCard}>
        <div className={styles.childrenCardHeader}>
          <div className={styles.childrenTitleGroup}>
            <div className={styles.childrenIcon}>
              <GraduationCap size={20} />
            </div>
            <div>
              <h3 className={styles.childrenTitle}>
                Danh Sách Học Sinh Trực Thuộc Gia Đình ({studentsList.length})
              </h3>
              <p className={styles.childrenSubtitle}>
                Liên kết đa chiều qua bảng phụ <code>phu_huynh_hoc_sinh</code> • Bấm vào thẻ để xem Hồ sơ 360°
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowLinkModal && setShowLinkModal(true)}
            className={styles.btnAddChild}
          >
            <Plus size={16} />
            <span>Liên Kết Thêm Học Sinh</span>
          </button>
        </div>

        {/* Danh sách học sinh */}
        {loadingStudents ? (
          <div className={styles.loadingBox}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Đang tải danh sách học sinh của phụ huynh...</span>
          </div>
        ) : studentsList.length === 0 ? (
          <div className={styles.emptyChildrenBox}>
            <GraduationCap size={40} style={{ color: '#94A3B8', margin: '0 auto 0.75rem' }} />
            <h4 className={styles.emptyChildrenTitle}>
              Chưa có học sinh nào liên kết với phụ huynh này
            </h4>
            <p className={styles.emptyChildrenDesc}>
              Bấm nút "Liên Kết Thêm Học Sinh" ở trên để gán học sinh vào phụ huynh này theo số CCCD hoặc SĐT.
            </p>
            <button
              type="button"
              onClick={() => setShowLinkModal && setShowLinkModal(true)}
              className="droplet-pill"
              style={{
                height: '36px',
                padding: '0 1rem',
                border: '1px solid #059669',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                fontSize: '0.825rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              + Liên Kết Ngay
            </button>
          </div>
        ) : (
          <div className={styles.childrenGrid}>
            {studentsList.map((item, idx) => {
              const hs = item.hocSinh || {};
              const isFemale = hs.gioiTinh === 'F' || hs.gioiTinh === 'Nu' || hs.gioiTinh === 'Nữ';
              return (
                <div key={item.idPhHs || idx} className={styles.childCard}>
                  <div className={styles.childCardTop}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className={isFemale ? styles.childAvatarFemale : styles.childAvatarMale}>
                        {hs.hoTen ? hs.hoTen.charAt(0).toUpperCase() : 'H'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.025rem', fontWeight: '800', color: '#0F172A' }}>
                            {hs.hoTen || `Học sinh #${hs.idHs}`}
                          </h4>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '9999px',
                            backgroundColor: isFemale ? '#FDF2F8' : '#EFF6FF',
                            color: isFemale ? '#DB2777' : '#2563EB',
                            fontWeight: '700'
                          }}>
                            {isFemale ? 'Nữ' : 'Nam'}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          CCCD: {hs.cccd || 'Chưa cập nhật'}
                        </span>
                      </div>
                    </div>

                    <span className={styles.childRelationBadge}>
                      {item.quanHe || 'Người bảo hộ'}
                    </span>
                  </div>

                  <div className={styles.childDetailsBox}>
                    <div>SĐT Học Sinh: <strong>{hs.soDienThoai || hs.sdt || 'Chưa cập nhật'}</strong></div>
                    <div>Ngày Sinh: <strong>{hs.ngaySinh || 'Chưa cập nhật'}</strong></div>
                    <div>Địa Chỉ: <span>{hs.diaChi || 'Chưa cập nhật'}</span></div>
                  </div>

                  <div className={styles.childCardFooter}>
                    <button
                      type="button"
                      onClick={() => onUnlink && onUnlink(item.idPhHs, hs.hoTen || `HS #${hs.idHs}`)}
                      className={styles.btnUnlink}
                      title="Gỡ bỏ liên kết giữa học sinh này và phụ huynh"
                    >
                      <Trash2 size={13} />
                      <span>Hủy Liên Kết</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectStudent && onSelectStudent(hs)}
                      className={styles.btnView360}
                      title="Xem hồ sơ học sinh 360 độ (kèm danh sách khóa học và các kỳ)"
                    >
                      <span>Hồ Sơ 360°</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL LIÊN KẾT THÊM HỌC SINH VÀO PHỤ HUYNH ── */}
      {showLinkModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => !linkingSubmitting && setShowLinkModal && setShowLinkModal(false)}
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* Header modal link */}
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <GraduationCap size={22} style={{ color: '#059669' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#064E3B' }}>
                    Liên Kết Học Sinh Với Phụ Huynh
                  </h3>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: '#047857' }}>
                    Gán học sinh cho phụ huynh: <strong>{parentDetail.hoTen || parentDetail.tenPh}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkModal && setShowLinkModal(false)}
                disabled={linkingSubmitting}
                className={styles.modalCloseBtn}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body modal link */}
            <div className={styles.modalBody}>
              {linkErrorMsg && (
                <div className={styles.modalErrorAlert}>
                  ⚠️ {linkErrorMsg}
                </div>
              )}

              {/* Ô tra cứu CCCD / SĐT học sinh */}
              <form onSubmit={onSearchStudent} className={styles.modalSearchRow}>
                <input
                  type="text"
                  placeholder="Nhập số CCCD hoặc SĐT học sinh..."
                  value={searchHsCccd}
                  onChange={(e) => setSearchHsCccd && setSearchHsCccd(e.target.value)}
                  className={styles.modalSearchInput}
                />
                <button
                  type="submit"
                  disabled={searchingHs}
                  className={styles.modalBtnSearch}
                >
                  {searchingHs ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
                  <span>Tra Cứu</span>
                </button>
              </form>

              {/* Kết quả tìm kiếm */}
              {searchHsResults.length > 0 && (
                <div className={styles.modalSearchResults}>
                  <span style={{ fontSize: '0.775rem', fontWeight: '700', color: '#475569' }}>
                    Chọn học sinh cần liên kết:
                  </span>
                  {searchHsResults.map((hs) => {
                    const isSelected = selectedHs?.idHs === hs.idHs;
                    return (
                      <div
                        key={hs.idHs}
                        onClick={() => setSelectedHs && setSelectedHs(hs)}
                        className={`${styles.modalStudentItem} ${isSelected ? styles.modalStudentItemSelected : ''}`}
                      >
                        <div>
                          <strong style={{ fontSize: '0.9rem', color: '#0F172A' }}>{hs.hoTen}</strong>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            CCCD: {hs.cccd || 'Chưa có'} • SĐT: {hs.soDienThoai || hs.sdt || 'Chưa có'}
                          </div>
                        </div>
                        {isSelected && <Check size={18} style={{ color: '#059669' }} />}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Chọn mối quan hệ */}
              {selectedHs && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
                    Mối Quan Hệ Của Phụ Huynh Với Học Sinh:
                  </label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship && setRelationship(e.target.value)}
                    className={styles.modalSelect}
                  >
                    <option value="Cha">Cha</option>
                    <option value="Mẹ">Mẹ</option>
                    <option value="Người bảo hộ">Người bảo hộ</option>
                    <option value="Ông / Bà">Ông / Bà</option>
                    <option value="Anh / Chị">Anh / Chị</option>
                  </select>
                </div>
              )}

              {/* Nút submit liên kết */}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowLinkModal && setShowLinkModal(false)}
                  className={styles.modalBtnClose}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={onLinkSubmit}
                  disabled={!selectedHs || linkingSubmitting}
                  className={styles.modalBtnConfirm}
                  style={{
                    cursor: selectedHs ? 'pointer' : 'not-allowed',
                    opacity: selectedHs ? 1 : 0.6
                  }}
                >
                  {linkingSubmitting ? <RefreshCw size={15} className="animate-spin" /> : <Plus size={15} />}
                  <span>Xác Nhận Liên Kết</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChiTietPhuHuynhView;
