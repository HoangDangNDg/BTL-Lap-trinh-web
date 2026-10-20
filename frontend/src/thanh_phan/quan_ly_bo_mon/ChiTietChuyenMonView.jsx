import React from 'react';
import { 
  BookOpen, 
  Users, 
  Plus, 
  Search, 
  RefreshCw, 
  Phone, 
  Mail, 
  CalendarPlus, 
  Trash2, 
  GraduationCap,
  ChevronRight
} from 'lucide-react';
import styles from './ChiTietChuyenMon.module.css';

/**
 * Giao diện Chi Tiết Chuyên Môn (Môn Học & Đội Ngũ Giáo Viên) (Pure Presentation JSX)
 */
const ChiTietChuyenMonView = ({
  tenBm = 'Bộ môn',
  tenCm = 'Chuyên môn',
  idBm,
  idCm,
  chuyenMon,
  activeTab = 'monHoc',
  setActiveTab,
  monHocList = [],
  giaoVienList = [],
  filteredMonHoc = [],
  filteredGiaoVien = [],
  loadingMonHoc = false,
  loadingGiaoVien = false,
  searchKeyword = '',
  setSearchKeyword,
  onRefresh,
  onSelectGiaoVien,
  onSelectMonHoc,
  onOpenAddMonHocModal,
  onOpenTaoLopModal,
  onDeleteMonHoc
}) => {
  return (
    <div className={styles.container}>
      {/* ── BANNER HEADER CHUYÊN MÔN ── */}
      <div className={styles.headerBanner}>
        <div className={styles.headerInfo}>
          <div className={styles.headerIcon}>
            <BookOpen size={24} />
          </div>
          <div>
            <div className={styles.headerTitleGroup}>
              <h2 className={styles.headerTitle}>
                {tenCm}
              </h2>
              <span className={styles.headerBadge}>
                Thuộc Bộ Môn: {tenBm}
              </span>
            </div>
            <p className={styles.headerDescription}>
              {chuyenMon?.moTa || `Quản trị các môn học và phân công đội ngũ giảng viên chuyên ngành ${tenCm}.`}
            </p>
          </div>
        </div>

        {/* Nút Hành Động Nhanh */}
        <div className={styles.headerActions}>
          {onOpenAddMonHocModal && (
            <button
              type="button"
              onClick={onOpenAddMonHocModal}
              className={`droplet-pill ${styles.btnAddSubject}`}
            >
              <Plus size={15} />
              <span>Thêm Môn Học</span>
            </button>
          )}

          {onOpenTaoLopModal && (
            <button
              type="button"
              onClick={() => onOpenTaoLopModal({ idBoMon: idBm, idCm: idCm })}
              className={`droplet-pill ${styles.btnQuickClass}`}
            >
              <CalendarPlus size={16} />
              <span>Tạo Lớp Nhanh</span>
            </button>
          )}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className={`droplet-pill ${styles.btnRefresh}`}
              title="Làm mới dữ liệu chuyên môn"
            >
              <RefreshCw size={15} className={loadingMonHoc || loadingGiaoVien ? 'animate-spin' : ''} />
            </button>
          )}
        </div>
      </div>

      {/* ── THANH CHUYỂN SUB-TAB & TÌM KIẾM ── */}
      <div className={styles.tabToolbar}>
        <div className={styles.tabGroup}>
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('monHoc')}
            className={`droplet-pill ${styles.tabBtn} ${activeTab === 'monHoc' ? styles.tabBtnActiveMonHoc : ''}`}
          >
            <BookOpen size={16} />
            <span>Môn Học Đào Tạo</span>
            <span className={`${styles.tabBadge} ${activeTab === 'monHoc' ? styles.tabBadgeMonHocActive : styles.tabBadgeInactive}`}>
              {monHocList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('giaoVien')}
            className={`droplet-pill ${styles.tabBtn} ${activeTab === 'giaoVien' ? styles.tabBtnActiveGiaoVien : ''}`}
          >
            <Users size={16} />
            <span>Đội Ngũ Giáo Viên</span>
            <span className={`${styles.tabBadge} ${activeTab === 'giaoVien' ? styles.tabBadgeGiaoVienActive : styles.tabBadgeInactive}`}>
              {giaoVienList.length}
            </span>
          </button>
        </div>

        {/* Ô Tìm Kiếm */}
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder={activeTab === 'monHoc' ? 'Tìm tên môn học...' : 'Tìm tên, sđt giáo viên...'}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword && setSearchKeyword(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* ── TAB NỘI DUNG 1: DANH SÁCH MÔN HỌC ── */}
      {activeTab === 'monHoc' && (
        <>
          {loadingMonHoc ? (
            <div className={`droplet-card ${styles.loadingCard}`}>
              <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#0284C7' }} />
              <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>Đang nạp danh sách môn học...</p>
            </div>
          ) : filteredMonHoc.length === 0 ? (
            <div className={`droplet-card ${styles.emptyCard}`}>
              <BookOpen size={44} style={{ color: '#94A3B8' }} />
              <div>
                <h4 className={styles.emptyTitle}>
                  {searchKeyword ? 'Không tìm thấy môn học phù hợp' : 'Chưa có môn học nào thuộc chuyên môn này'}
                </h4>
                <p className={styles.emptyDesc}>
                  Bấm "Thêm Môn Học" để khởi tạo giáo trình môn học mới cho chuyên môn {tenCm}.
                </p>
              </div>
              {onOpenAddMonHocModal && (
                <button
                  type="button"
                  onClick={onOpenAddMonHocModal}
                  className={`droplet-pill ${styles.btnQuickClass}`}
                >
                  <Plus size={16} />
                  <span>Thêm Môn Học Mới</span>
                </button>
              )}
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredMonHoc.map((mh) => (
                <div
                  key={mh.idMh}
                  onClick={() => onSelectMonHoc && onSelectMonHoc(mh)}
                  className={`droplet-card ${styles.subjectCard} ${onSelectMonHoc ? styles.subjectCardInteractive : ''}`}
                >
                  <div>
                    <div className={styles.cardHeader}>
                      <div>
                        <span className={styles.subjectBadge}>
                          Môn học
                        </span>
                        {onSelectMonHoc && (
                          <span className={styles.viewClassHint}>
                            Bấm xem lớp ➜
                          </span>
                        )}
                      </div>

                      {onDeleteMonHoc && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMonHoc(mh.idMh);
                          }}
                          className={styles.btnDelete}
                          title="Xóa môn học này"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    <h4 className={styles.cardTitle}>
                      {mh.tenMon}
                    </h4>
                    <p className={styles.cardDesc}>
                      {mh.moTa || 'Môn học đào tạo trực thuộc chuyên môn.'}
                    </p>
                  </div>

                  {/* Actions trên từng thẻ Môn học */}
                  <div className={styles.cardFooter}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {onOpenTaoLopModal && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenTaoLopModal({ idBoMon: idBm, idMh: mh.idMh, idCm: idCm, tenMon: mh.tenMon });
                          }}
                          className={styles.btnOpenClass}
                          title="Mở lớp mới cho môn này"
                        >
                          <CalendarPlus size={14} />
                          <span>Mở Lớp</span>
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {onSelectMonHoc && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMonHoc(mh);
                          }}
                          className={styles.btnViewClasses}
                          title={`Xem các lớp học của môn ${mh.tenMon}`}
                        >
                          <GraduationCap size={14} />
                          <span>Xem Lớp Học</span>
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── TAB NỘI DUNG 2: ĐỘI NGŨ GIÁO VIÊN CHUYÊN MÔN ── */}
      {activeTab === 'giaoVien' && (
        <>
          {loadingGiaoVien ? (
            <div className={`droplet-card ${styles.loadingCard}`}>
              <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#10B981' }} />
              <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>Đang nạp danh sách giáo viên chuyên môn...</p>
            </div>
          ) : filteredGiaoVien.length === 0 ? (
            <div className={`droplet-card ${styles.emptyCard}`}>
              <Users size={44} style={{ color: '#94A3B8' }} />
              <div>
                <h4 className={styles.emptyTitle}>
                  {searchKeyword ? 'Không tìm thấy giáo viên phù hợp' : 'Chưa có giáo viên nào được cấp chuyên môn này'}
                </h4>
                <p className={styles.emptyDesc}>
                  Vào phần Quản lý Nhân sự / Giáo viên để cấp chứng nhận chuyên môn {tenCm} cho thầy/cô.
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredGiaoVien.map((gv) => {
                const initials = gv.hoTen
                  ? gv.hoTen.split(' ').map((n) => n[0]).slice(-2).join('').toUpperCase()
                  : 'GV';
                const isActive = gv.conHoatDong !== false;
                const soLop = gv.soLopDangDay || 0;

                return (
                  <div
                    key={gv.idGv}
                    onClick={() => onSelectGiaoVien && onSelectGiaoVien(gv)}
                    className={`droplet-card ${styles.teacherCard}`}
                  >
                    <div>
                      {/* Avatar + Status Badge */}
                      <div className={styles.cardHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className={`droplet-circle ${styles.teacherAvatar}`}>
                            {initials}
                          </div>
                          <div>
                            <h4 className={styles.teacherName}>
                              {gv.hoTen}
                            </h4>
                            <span className={styles.teacherRole}>
                              Giảng viên phụ trách
                            </span>
                          </div>
                        </div>

                        <span className={isActive ? styles.statusBadgeActive : styles.statusBadgeInactive}>
                          {isActive ? '● Đang Dạy' : 'Tạm Nghỉ'}
                        </span>
                      </div>

                      {/* Thông tin liên hệ */}
                      <div className={styles.teacherContact}>
                        {gv.sdt && (
                          <div className={styles.teacherContactItem}>
                            <Phone size={13} style={{ color: '#0284C7' }} />
                            <span>{gv.sdt}</span>
                          </div>
                        )}
                        {gv.email && (
                          <div className={styles.teacherContactItem}>
                            <Mail size={13} style={{ color: '#8B5CF6' }} />
                            <span className={styles.teacherContactEllipsis}>{gv.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Các chuyên môn khác nếu có */}
                      {Array.isArray(gv.danhSachChuyenMon) && gv.danhSachChuyenMon.length > 0 && (
                        <div className={styles.specialtyTagGroup}>
                          {gv.danhSachChuyenMon.map((ten, i) => (
                            <span 
                              key={i}
                              className={ten === tenCm ? styles.specialtyTagCurrent : styles.specialtyTagOther}
                            >
                              {ten === tenCm ? `⭐ ${ten}` : ten}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer thẻ: Tải lớp đang dạy + Link xem chi tiết */}
                    <div className={styles.teacherFooter}>
                      <span className={`${styles.teacherClassCount} ${soLop > 4 ? styles.teacherClassCountHigh : soLop > 0 ? styles.teacherClassCountMed : styles.teacherClassCountLow}`}>
                        <GraduationCap size={14} />
                        <span>{soLop} lớp đang phụ trách</span>
                      </span>

                      <span className={styles.btnViewProfile}>
                        <span>Xem Hồ Sơ</span>
                        <ChevronRight size={15} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChiTietChuyenMonView;
