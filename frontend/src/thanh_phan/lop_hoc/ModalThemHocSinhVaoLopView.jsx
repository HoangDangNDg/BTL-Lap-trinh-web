import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Search, 
  UserPlus, 
  Users, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  CreditCard, 
  User, 
  Plus, 
  ArrowRight 
} from 'lucide-react';
import styles from './ModalThemHocSinhVaoLop.module.css';

const ModalThemHocSinhVaoLopView = ({
  isOpen,
  onClose,
  tenLop,
  tenKhoaHoc,
  siSoToiDa = 30,
  currentEnrolled = 0,
  isClassFull = false,
  fillPercent = 0,
  activeTab,
  setActiveTab,
  toast,
  searchCccdKw,
  setSearchCccdKw,
  searchResults,
  searching,
  hasSearched,
  addingId,
  onSearchCccd,
  onAddStudent,
  onSwitchToManualWithCccd,
  formHs,
  setFormHs,
  submittingManual,
  onManualSubmit
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay}>
      <div className={`droplet-card ${styles.modalCard}`}>
        {/* ── HEADER MODAL ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIconBox}>
              <UserPlus size={22} />
            </div>
            <div>
              <h3 className={styles.headerTitle}>
                Thêm Học Sinh Vào {tenKhoaHoc ? 'Khóa Học' : 'Lớp Học'}
              </h3>
              <p className={styles.headerSub}>
                {tenKhoaHoc ? (
                  <>Khóa: <strong>{tenKhoaHoc}</strong>{tenLop ? ` • Lớp: ${tenLop}` : ''}</>
                ) : (
                  <>Lớp: <strong>{tenLop || 'Lớp học'}</strong></>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`droplet-circle ${styles.btnClose}`}
            title="Đóng cửa sổ"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── THANH TIẾN ĐỘ SĨ SỐ LỚP ── */}
        <div className={`${styles.quotaBar} ${isClassFull ? styles.quotaBarFull : ''}`}>
          <div className={styles.quotaLeft}>
            <Users size={16} className={isClassFull ? styles.quotaIconFull : styles.quotaIcon} />
            <span className={styles.quotaLabel}>
              Sĩ số hiện tại: <strong className={isClassFull ? styles.quotaCountFull : styles.quotaCount}>{currentEnrolled}</strong> / {siSoToiDa} học viên
            </span>
          </div>

          <div className={styles.quotaRight}>
            <div className={styles.progressTrack}>
              <div 
                className={`${styles.progressBar} ${isClassFull ? styles.progressFull : fillPercent > 80 ? styles.progressWarning : styles.progressNormal}`}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
            <span className={isClassFull ? styles.percentTextFull : styles.percentText}>
              {fillPercent}%
            </span>
          </div>
        </div>

        {/* ── TABS CHUYỂN ĐỔI: TRA CỨU CCCD / NHẬP THỦ CÔNG ── */}
        <div className={styles.tabsBar}>
          <button
            type="button"
            onClick={() => setActiveTab('TRA_CUU_CCCD')}
            className={`${styles.tabBtn} ${activeTab === 'TRA_CUU_CCCD' ? styles.tabBtnActive : ''}`}
          >
            <CreditCard size={15} />
            <span>Tra Cứu Theo CCCD</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('NHAP_THU_CONG')}
            className={`${styles.tabBtn} ${activeTab === 'NHAP_THU_CONG' ? styles.tabBtnActive : ''}`}
          >
            <UserPlus size={15} />
            <span>Nhập Thủ Công Học Sinh</span>
          </button>
        </div>

        {/* Toast thông báo nhanh */}
        {toast && (
          <div className={toast.type === 'success' ? styles.toastSuccess : styles.toastError}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* ── NỘI DUNG THEO TAB ── */}
        {activeTab === 'TRA_CUU_CCCD' ? (
          <div className={styles.tabContent}>
            {/* ── THANH NHẬP SỐ CCCD & NÚT TÌM KIẾM ── */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSearchCccd();
              }}
              className={styles.searchForm}
            >
              <div className={styles.searchInputWrapper}>
                <CreditCard size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Nhập số CCCD của học sinh (ví dụ: 079208...)"
                  value={searchCccdKw}
                  onChange={(e) => setSearchCccdKw(e.target.value)}
                  autoFocus
                  className={styles.searchInput}
                />
              </div>

              <button
                type="submit"
                disabled={searching || !searchCccdKw.trim()}
                className={`${styles.btnSearch} ${!searchCccdKw.trim() ? styles.btnSearchDisabled : styles.btnSearchEnabled}`}
              >
                {searching ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Đang tìm...</span>
                  </>
                ) : (
                  <>
                    <Search size={15} />
                    <span>Tìm Kiếm</span>
                  </>
                )}
              </button>
            </form>

            {/* ── VÙNG HIỂN THỊ KẾT QUẢ TRA CỨU ── */}
            <div className={styles.resultsContainer}>
              {searching ? (
                <div className={styles.searchLoadingBox}>
                  <RefreshCw size={28} className={`animate-spin ${styles.searchLoadingSpinner}`} />
                  <p className={styles.searchLoadingText}>Đang tra cứu số CCCD từ hệ thống...</p>
                </div>
              ) : !hasSearched ? (
                /* Trạng thái chưa tìm kiếm: Hướng dẫn người dùng */
                <div className={styles.guideBox}>
                  <div className={styles.guideIconBox}>
                    <CreditCard size={24} />
                  </div>
                  <h4 className={styles.guideTitle}>
                    Tra Cứu Học Sinh Theo Số CCCD
                  </h4>
                  <p className={styles.guideDesc}>
                    Nhập số Căn cước công dân của học sinh vào ô phía trên rồi bấm <strong>"Tìm Kiếm"</strong> để tìm và thêm nhanh vào lớp học.
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                /* Đã tìm kiếm nhưng không có kết quả */
                <div className={styles.notFoundBox}>
                  <AlertCircle size={36} className={styles.notFoundIcon} />
                  <h4 className={styles.notFoundTitle}>
                    Không tìm thấy học sinh với số CCCD "{searchCccdKw}"
                  </h4>
                  <p className={styles.notFoundDesc}>
                    Học sinh có thể chưa có trong hệ thống hoặc đã được thêm vào lớp học này rồi.
                  </p>
                  <button
                    type="button"
                    onClick={onSwitchToManualWithCccd}
                    className={styles.btnSwitchManual}
                  >
                    <span>Tạo Mới Học Sinh Với CCCD Này</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                /* Danh sách học sinh tìm thấy theo CCCD */
                searchResults.map((hs) => {
                  const initials = hs.hoTen
                    ? hs.hoTen.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
                    : 'HS';
                  const isAdding = addingId === hs.idHs;
                  const phone = hs.soDienThoai || hs.sdt;
                  const parentName = hs.phuHuynh?.hoTen;
                  const parentPhone = hs.phuHuynh?.soDienThoai;
                  const cccd = hs.cccd || hs.soCccd || hs.cmnd;

                  return (
                    <div
                      key={hs.idHs}
                      className={styles.studentResultCard}
                    >
                      {/* Avatar + Thông tin cơ bản */}
                      <div className={styles.studentResultLeft}>
                        <div className={`droplet-circle ${styles.studentAvatarCircle}`}>
                          {initials}
                        </div>

                        <div className={styles.studentResultInfo}>
                          <div className={styles.studentNameRow}>
                            <strong className={styles.studentNameText}>{hs.hoTen}</strong>
                          </div>

                          <div className={styles.studentMetaRow}>
                            {/* Ưu tiên hiển thị CCCD */}
                            {cccd ? (
                              <span className={styles.metaItemCccdActive}>
                                <CreditCard size={12} className={styles.iconBlue} />
                                <span>CCCD: {cccd}</span>
                              </span>
                            ) : (
                              <span className={styles.metaItemCccdInactive}>
                                <CreditCard size={12} />
                                <span>CCCD: Chưa cập nhật</span>
                              </span>
                            )}

                            {phone && (
                              <span className={styles.metaItem}>
                                <Phone size={12} className={styles.iconGreen} />
                                <span>{phone}</span>
                              </span>
                            )}
                            {hs.ngaySinh && (
                              <span className={styles.metaItem}>
                                <Calendar size={12} className={styles.iconAmber} />
                                <span>{hs.ngaySinh}</span>
                              </span>
                            )}
                            {parentName && (
                              <span className={styles.metaItem}>
                                <Users size={12} className={styles.iconPurple} />
                                <span>PH: {parentName} {parentPhone ? `(${parentPhone})` : ''}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Nút Thêm vào lớp */}
                      <button
                        type="button"
                        onClick={() => onAddStudent(hs)}
                        disabled={isAdding}
                        className={`droplet-pill ${styles.btnAddStudent} ${isAdding ? styles.btnAddStudentDisabled : ''}`}
                      >
                        {isAdding ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>Đang thêm...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus size={14} />
                            <span>+ Thêm Vào Lớp</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── FOOTER TAB TRA CỨU CCCD ── */}
            <div className={styles.tabFooter}>
              <span className={styles.footerNote}>
                {hasSearched ? `Tìm thấy ${searchResults.length} học sinh phù hợp` : 'Nhập số CCCD để tra cứu nhanh'}
              </span>

              <button
                type="button"
                onClick={onClose}
                className={`droplet-pill ${styles.btnCancel}`}
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          /* ── TAB 2: FORM NHẬP THỦ CÔNG HỌC SINH ── */
          <form onSubmit={onManualSubmit} className={styles.manualForm}>
            <div className={styles.manualFormContent}>
              
              {/* KHỐI 1: THÔNG TIN HỌC SINH */}
              <div className={styles.formCard}>
                <div className={styles.formCardTitle}>
                  <User size={16} className={styles.iconBlue} />
                  <span className={styles.formCardTitleText}>Thông Tin Học Sinh Mới</span>
                </div>

                <div className={styles.formGrid}>
                  {/* Họ và tên */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      Họ và Tên Học Sinh <span className={styles.reqStar}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyễn Văn An"
                      value={formHs.hoTen}
                      onChange={(e) => setFormHs({ ...formHs, hoTen: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  {/* Số CCCD / Định danh */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      Số CCCD / Mã Định Danh <span className={styles.subLabel}>(Ưu tiên tra cứu)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập 12 số CCCD..."
                      value={formHs.cccd}
                      onChange={(e) => setFormHs({ ...formHs, cccd: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  {/* Ngày sinh */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      Ngày Sinh
                    </label>
                    <input
                      type="date"
                      value={formHs.ngaySinh}
                      onChange={(e) => setFormHs({ ...formHs, ngaySinh: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  {/* Giới tính */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      Giới Tính
                    </label>
                    <div className={styles.radioGroup}>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="gioiTinh"
                          value="M"
                          checked={formHs.gioiTinh === 'M'}
                          onChange={() => setFormHs({ ...formHs, gioiTinh: 'M' })}
                        />
                        <span>Nam</span>
                      </label>
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="gioiTinh"
                          value="F"
                          checked={formHs.gioiTinh === 'F'}
                          onChange={() => setFormHs({ ...formHs, gioiTinh: 'F' })}
                        />
                        <span>Nữ</span>
                      </label>
                    </div>
                  </div>

                  {/* Số điện thoại học sinh */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      Số Điện Thoại Học Sinh
                    </label>
                    <input
                      type="tel"
                      placeholder="09..."
                      value={formHs.soDienThoai}
                      onChange={(e) => setFormHs({ ...formHs, soDienThoai: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  {/* Địa chỉ */}
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      Địa Chỉ Thường Trú
                    </label>
                    <input
                      type="text"
                      placeholder="Số nhà, đường, quận/huyện..."
                      value={formHs.diaChi}
                      onChange={(e) => setFormHs({ ...formHs, diaChi: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* KHỐI 2: THÔNG TIN PHỤ HUYNH LIÊN HỆ (TÙY CHỌN) */}
              <div className={styles.formCard}>
                <div className={styles.formCardTitle}>
                  <Users size={16} className={styles.iconPurple} />
                  <span className={styles.formCardTitleText}>Thông Tin Phụ Huynh Liên Hệ (Tùy chọn)</span>
                </div>

                <div className={styles.formGridParent}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      Họ và Tên Phụ Huynh
                    </label>
                    <input
                      type="text"
                      placeholder="Họ tên cha / mẹ / người giám hộ"
                      value={formHs.phuHuynhTen}
                      onChange={(e) => setFormHs({ ...formHs, phuHuynhTen: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      Số Điện Thoại Phụ Huynh
                    </label>
                    <input
                      type="tel"
                      placeholder="SĐT liên hệ khẩn cấp"
                      value={formHs.phuHuynhSdt}
                      onChange={(e) => setFormHs({ ...formHs, phuHuynhSdt: e.target.value })}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      CCCD Phụ Huynh
                    </label>
                    <input
                      type="text"
                      placeholder="Số căn cước phụ huynh"
                      value={formHs.phuHuynhCccd}
                      onChange={(e) => setFormHs({ ...formHs, phuHuynhCccd: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── FOOTER TAB NHẬP THỦ CÔNG ── */}
            <div className={styles.manualFooter}>
              <button
                type="button"
                onClick={() => setActiveTab('TRA_CUU_CCCD')}
                className={`droplet-pill ${styles.btnCancelManual}`}
              >
                Hủy / Quay lại
              </button>

              <button
                type="submit"
                disabled={submittingManual || isClassFull}
                className={`${styles.btnSubmitManual} ${submittingManual || isClassFull ? styles.btnSubmitManualDisabled : styles.btnSubmitManualEnabled}`}
              >
                {submittingManual ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Đang tạo & ghi danh...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Lưu & Ghi Danh Vào Lớp</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

export default ModalThemHocSinhVaoLopView;
