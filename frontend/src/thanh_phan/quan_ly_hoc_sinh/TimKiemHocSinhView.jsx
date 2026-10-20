import React from 'react';
import { 
  GraduationCap, 
  UserPlus, 
  Search, 
  Phone, 
  CreditCard, 
  RefreshCw, 
  Edit2, 
  Trash2, 
  RotateCcw, 
  ArrowRight, 
  Eye, 
  XCircle, 
  Info,
  AlertCircle
} from 'lucide-react';
import ThanhChonId from '../ThanhChonId';
import { dichVuDoanhNghiep } from '../../dich_vu/tao_tu_dong/dichVuDoanhNghiep';
import styles from './TimKiemHocSinh.module.css';

/**
 * Giao diện Vùng Tìm Kiếm Học Sinh (Pure Presentation JSX)
 */
const TimKiemHocSinhView = ({
  user,
  selectedDnId,
  onChangeDnId,
  searchResults = [],
  searchType = null,
  searchKeyword = '',
  loading = false,
  errorMessage = '',
  inputCccd = '',
  setInputCccd,
  inputSdt = '',
  setInputSdt,
  onSubmitCccd,
  onSubmitSdt,
  onClearAll,
  onSelectStudent,
  onOpenAddModal,
  onOpenEditModal,
  onToggleDelete
}) => {
  return (
    <div className={styles.container}>
      {/* ── 1. HEADER & BỘ CHỌN DOANH NGHIỆP ── */}
      <div className={`droplet-card ${styles.headerCard}`}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <GraduationCap size={26} />
          </div>
          <div>
            <h2 className={styles.headerTitle}>
              Quản Lý Hồ Sơ Học Sinh
            </h2>
            <p className={styles.headerSubtitle}>
              Tra cứu, quản lý và theo dõi thông tin học viên toàn diện
            </p>
          </div>
        </div>

        {/* Thanh chọn Doanh Nghiệp */}
        {(!user?.idDoanhNghiep || user?.vaiTro === 'ADMIN') && (
          <div className={styles.dnSelectWrapper}>
            <ThanhChonId
              label="Doanh Nghiệp Trực Thuộc"
              fetchOptions={dichVuDoanhNghiep.getAllDoanhNghiep}
              value={selectedDnId}
              onChange={onChangeDnId}
              getOptionLabel={(item) => item.tenDn || item.tenDoanhNghiep || `DN #${item.idDn}`}
              getOptionValue={(item) => item.idDn}
            />
          </div>
        )}
      </div>

      {/* ── 2. VÙNG TÌM KIẾM ĐỘC LẬP: 2 Ô TÌM KIẾM RIÊNG BIỆT & NÚT THÊM HỌC SINH MỚI ── */}
      <div className={`droplet-card ${styles.searchCard}`}>
        <div className={styles.searchCardTop}>
          <div>
            <span className={styles.searchTitle}>
              <Search size={18} style={{ color: '#0095F6' }} />
              Tra Cứu Học Sinh Nhanh
            </span>
            <p className={styles.searchDesc}>
              Nhập mã định danh (CCCD) hoặc số điện thoại để tra cứu hồ sơ (hệ thống tối ưu không tải trước toàn bộ danh sách)
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAddModal}
            className={`droplet-pill droplet-pill-mint ${styles.btnAddStudent}`}
          >
            <UserPlus size={18} />
            <span>+ Thêm Học Sinh Mới</span>
          </button>
        </div>

        {/* 2 Ô Tìm Kiếm Song Song */}
        <div className={styles.searchFormsGrid}>
          {/* Ô 1: Tìm theo CCCD */}
          <form 
            onSubmit={onSubmitCccd}
            className={`${styles.searchForm} ${searchType === 'CCCD' ? styles.searchFormActiveCccd : ''}`}
          >
            <CreditCard size={18} style={{ color: '#0095F6', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Nhập số CCCD / Mã định danh..."
              value={inputCccd}
              onChange={(e) => setInputCccd && setInputCccd(e.target.value.replace(/\D/g, '').slice(0, 12))}
              className={styles.inputField}
            />
            {inputCccd && (
              <button
                type="button"
                onClick={() => setInputCccd && setInputCccd('')}
                className={styles.btnClearInput}
              >
                <XCircle size={16} />
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !inputCccd.trim()}
              className={`droplet-pill ${styles.btnSubmitCccd}`}
            >
              Tìm CCCD
            </button>
          </form>

          {/* Ô 2: Tìm theo SĐT */}
          <form 
            onSubmit={onSubmitSdt}
            className={`${styles.searchForm} ${searchType === 'SDT' ? styles.searchFormActiveSdt : ''}`}
          >
            <Phone size={18} style={{ color: '#10B981', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Nhập số điện thoại học sinh..."
              value={inputSdt}
              onChange={(e) => setInputSdt && setInputSdt(e.target.value.replace(/\D/g, '').slice(0, 11))}
              className={styles.inputField}
            />
            {inputSdt && (
              <button
                type="button"
                onClick={() => setInputSdt && setInputSdt('')}
                className={styles.btnClearInput}
              >
                <XCircle size={16} />
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !inputSdt.trim()}
              className={`droplet-pill ${styles.btnSubmitSdt}`}
            >
              Tìm SĐT
            </button>
          </form>
        </div>

        {/* Thanh trạng thái tìm kiếm hiện tại */}
        {searchType && (
          <div className={styles.statusBanner}>
            <div className={styles.statusText}>
              <Info size={16} style={{ color: '#2563EB' }} />
              <span>
                Đang hiển thị kết quả cho {searchType === 'CCCD' ? 'số CCCD' : 'số điện thoại'}:{' '}
                <strong>"{searchKeyword}"</strong> ({searchResults.length} kết quả)
              </span>
            </div>

            <button
              type="button"
              onClick={onClearAll}
              className={styles.btnClearFilter}
            >
              <RotateCcw size={13} />
              <span>Xóa bộ lọc</span>
            </button>
          </div>
        )}
      </div>

      {/* ── 3. KHU VỰC HIỂN THỊ KẾT QUẢ / TRẠNG THÁI ── */}
      <div className={`droplet-card ${styles.resultsCard}`}>
        {/* Đang tải */}
        {loading && (
          <div className={styles.loadingCard}>
            <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.75rem', color: '#2563EB' }} />
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>Đang tra cứu hồ sơ học sinh...</p>
          </div>
        )}

        {/* Lỗi */}
        {!loading && errorMessage && (
          <div className={styles.errorCard}>
            <AlertCircle size={36} style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontWeight: '700', margin: 0 }}>{errorMessage}</p>
          </div>
        )}

        {/* CHƯA TÌM KIẾM */}
        {!loading && !errorMessage && !searchType && (
          <div className={styles.initialStateCard}>
            <div className={styles.initialIcon}>
              <Search size={32} />
            </div>
            <h4 className={styles.initialTitle}>
              Tra Cứu Hồ Sơ Học Sinh Nhanh Chóng
            </h4>
            <p className={styles.initialDesc}>
              Để tối ưu hiệu năng và bảo mật, danh sách học sinh không tải tự động. Vui lòng nhập 
              <strong> số CCCD</strong> hoặc <strong>số điện thoại</strong> vào thanh tra cứu ở trên để xem chi tiết học sinh.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={onOpenAddModal}
                className={`droplet-pill droplet-pill-mint ${styles.btnEnroll}`}
              >
                + Ghi Danh Học Sinh Mới
              </button>
            </div>
          </div>
        )}

        {/* Đã tìm kiếm nhưng KHÔNG TÌM THẤY KẾT QUẢ */}
        {!loading && !errorMessage && searchType && searchResults.length === 0 && (
          <div className={styles.emptyStateCard}>
            <GraduationCap size={44} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <h4 className={styles.emptyTitle}>
              Không tìm thấy học sinh nào phù hợp
            </h4>
            <p style={{ margin: '0.35rem 0 1rem', fontSize: '0.825rem' }}>
              Không có bản ghi nào với {searchType === 'CCCD' ? 'số CCCD' : 'số điện thoại'} <strong>"{searchKeyword}"</strong>.
            </p>
            <button
              type="button"
              onClick={onOpenAddModal}
              className={`droplet-pill droplet-pill-mint ${styles.btnEnroll}`}
            >
              + Thêm Mới Học Sinh Với Thông Tin Này
            </button>
          </div>
        )}

        {/* CÓ KẾT QUẢ TÌM KIẾM -> HIỂN THỊ BẢNG KẾT QUẢ */}
        {!loading && !errorMessage && searchType && searchResults.length > 0 && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.theadRow}>
                  <th className={styles.th} style={{ width: '60px' }}>STT</th>
                  <th className={styles.th}>Họ và Tên Học Sinh</th>
                  <th className={styles.th}>Giới Tính</th>
                  <th className={styles.th}>Số CCCD</th>
                  <th className={styles.th}>Số Điện Thoại</th>
                  <th className={styles.th}>Ngày Sinh</th>
                  <th className={styles.th}>Địa Chỉ</th>
                  <th className={styles.th} style={{ width: '120px' }}>Trạng Thái</th>
                  <th className={styles.th} style={{ width: '130px', textAlign: 'center' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((hs, idx) => {
                  const isFemale = hs.gioiTinh === 'F' || hs.gioiTinh === 'Nu' || hs.gioiTinh === 'Nữ';

                  return (
                    <tr 
                      key={hs.idHs || idx} 
                      onClick={() => onSelectStudent && onSelectStudent(hs)}
                      className={`${styles.tr} ${hs.xoa ? styles.trDeleted : ''}`}
                    >
                      {/* STT */}
                      <td className={styles.td} style={{ fontWeight: '700', color: '#64748B' }}>
                        {idx + 1}
                      </td>

                      {/* Họ tên */}
                      <td className={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className={isFemale ? styles.avatarFemale : styles.avatarMale}>
                            {hs.hoTen ? hs.hoTen.split(' ').slice(-1)[0][0] : 'HS'}
                          </div>
                          <div>
                            <div className={styles.studentNameRow}>
                              <span>{hs.hoTen}</span>
                              <span style={{ fontSize: '0.75rem', color: '#0095F6' }}>
                                <ArrowRight size={13} />
                              </span>
                            </div>
                            {hs.phuHuynh && (
                              <div className={styles.parentText}>
                                PH: {hs.phuHuynh.hoTen || hs.phuHuynh.tenPh || `PH #${hs.phuHuynh.idPh}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Giới tính */}
                      <td className={styles.td}>
                        <span className={isFemale ? styles.badgeFemale : styles.badgeMale}>
                          {isFemale ? 'Nữ' : 'Nam'}
                        </span>
                      </td>

                      {/* Số CCCD */}
                      <td className={styles.td}>
                        {hs.cccd ? (
                          <span className={styles.cccdText}>
                            {hs.cccd}
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>-</span>
                        )}
                      </td>

                      {/* Số điện thoại */}
                      <td className={styles.td}>
                        {hs.soDienThoai || hs.sdt ? (
                          <span className={styles.phoneText}>
                            {hs.soDienThoai || hs.sdt}
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>-</span>
                        )}
                      </td>

                      {/* Ngày sinh */}
                      <td className={styles.td} style={{ color: '#475569' }}>
                        {hs.ngaySinh || '-'}
                      </td>

                      {/* Địa chỉ */}
                      <td className={`${styles.td} ${styles.addressText}`}>
                        {hs.diaChi || '-'}
                      </td>

                      {/* Trạng thái */}
                      <td className={styles.td}>
                        <span className={`badge ${hs.xoa ? 'badge-danger' : 'badge-success'}`}>
                          {hs.xoa ? 'Đã nghỉ học' : 'Đang học'}
                        </span>
                      </td>

                      {/* Thao tác */}
                      <td 
                        className={styles.td}
                        style={{ textAlign: 'center' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={styles.btnActionGroup}>
                          {/* Nút Xem chi tiết */}
                          <button
                            type="button"
                            title="Xem chi tiết hồ sơ học sinh"
                            onClick={() => onSelectStudent && onSelectStudent(hs)}
                            className={`droplet-circle ${styles.btnView}`}
                          >
                            <Eye size={14} />
                          </button>

                          {/* Nút Sửa */}
                          <button
                            type="button"
                            title="Sửa hồ sơ"
                            onClick={() => onOpenEditModal && onOpenEditModal(hs)}
                            className={`droplet-circle ${styles.btnEdit}`}
                          >
                            <Edit2 size={14} />
                          </button>

                          {/* Nút Đổi trạng thái */}
                          {onToggleDelete && (
                            <button
                              type="button"
                              title={hs.xoa ? "Khôi phục đang học" : "Đánh dấu nghỉ học"}
                              onClick={() => onToggleDelete(hs)}
                              className={`droplet-circle ${hs.xoa ? styles.btnToggleRestore : styles.btnToggleActive}`}
                            >
                              {hs.xoa ? <RotateCcw size={14} /> : <Trash2 size={14} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimKiemHocSinhView;
