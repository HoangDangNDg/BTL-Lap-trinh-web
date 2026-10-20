import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  UserX, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Phone, 
  Mail, 
  Eye, 
  Trash2, 
  GraduationCap, 
  X, 
  User, 
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Plus
} from 'lucide-react';
import { dichVuHocSinhPhuHuynh } from '../../dich_vu/tao_tu_dong/dichVuHocSinhPhuHuynh';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import ModalThemHocSinhVaoLop from '../lop_hoc/ModalThemHocSinhVaoLop';
import styles from './DanhSachHocSinhKhoaHocView.module.css';

/**
 * Component hiển thị tên từng học sinh trong danh sách khóa học
 * - Chỉ hiển thị Họ tên và avatar chữ cái đầu
 * - Click vào thẻ / tên học sinh để mở trang Chi tiết học sinh
 * - Hỗ trợ nút xóa học sinh với stopPropagation
 */
const ComponentTenHocSinh = ({ hs, index, onSelect, onDelete, isDeleting }) => {
  const initial = (hs.hoTen || 'H').trim().charAt(0).toUpperCase();

  const avatarClasses = [
    styles.avatarBlue,
    styles.avatarGreen,
    styles.avatarPurple,
    styles.avatarOrange,
    styles.avatarPink,
    styles.avatarTeal,
  ];
  const avatarClass = avatarClasses[index % avatarClasses.length];

  return (
    <div
      onClick={onSelect}
      className={styles.studentCard}
      title="Click vào tên để xem thông tin chi tiết học sinh"
    >
      <div className={styles.studentCardLeft}>
        {/* Avatar chữ cái đầu */}
        <div className={`${styles.avatarInitial} ${avatarClass}`}>
          {initial}
        </div>

        {/* Tên học sinh */}
        <div className={styles.studentTextInfo}>
          <div className={styles.studentName}>
            {hs.hoTen}
          </div>
          <div className={styles.studentMeta}>
            <span>Học sinh #{hs.idHs || index + 1}</span>
            {hs.soBuoiDaHoc > 0 && (
              <>
                <span>•</span>
                <span className={styles.studentMetaHighlight}>{hs.soBuoiDaHoc} buổi đã học</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Nút Xóa & Mũi tên điều hướng xem chi tiết */}
      <div className={styles.studentCardRight}>
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
            className={styles.btnDeleteStudent}
            title="Xóa học sinh khỏi khóa học"
          >
            <Trash2 size={15} className={isDeleting ? 'animate-spin' : ''} />
          </button>
        )}

        <div className={styles.arrowRightIcon}>
          <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
};

/**
 * Component hiển thị danh sách học sinh của một Khóa học
 * - Chỉ gọi API học sinh khóa học lấy họ tên gọn nhẹ
 * - Hiển thị dạng component tên học sinh
 * - Click vào tên từng học sinh sẽ xem toàn bộ hồ sơ chi tiết (ChiTietHocSinhView)
 */
const DanhSachHocSinhKhoaHocView = ({
  khoaHoc,
  lopHoc,
  chiNhanh,
  onSelectHocSinh
}) => {
  const { user } = useTrangThaiXacThuc();
  const idDn = user?.idDoanhNghiep || 1;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKw, setSearchKw] = useState('');

  // State mở modal thêm học sinh (tái sử dụng ModalThemHocSinhVaoLop)
  const [modalAddOpen, setModalAddOpen] = useState(false);

  // State xóa học sinh
  const [deletingId, setDeletingId] = useState(null);
  const [thongBao, setThongBao] = useState(null);

  // 1. Tải danh sách học sinh của khóa học: chỉ gọi API học sinh khóa học có họ tên
  const fetchCourseStudents = useCallback(async () => {
    if (!khoaHoc?.idKhoaHoc && !lopHoc?.idLop) return;
    try {
      setLoading(true);
      let list = [];
      if (khoaHoc?.idKhoaHoc) {
        // Chỉ gọi API học sinh khóa học rút gọn đã có sẵn hoTen mà không cần backend join chi tiết học sinh & phụ huynh
        const res = await dichVuHocSinhPhuHuynh.getHocSinhKhoaHocNganGon(khoaHoc.idKhoaHoc);
        const raw = Array.isArray(res) ? res : (res?.data || []);
        list = raw.map(item => ({
          idHsKh: item.idHsKh,
          idHs: item.idHs || item.hocSinh?.idHs,
          hoTen: item.hoTen || item.tenHocSinh || item.hocSinh?.hoTen || 'Học viên',
          soBuoiDaHoc: item.soBuoiDaHoc || 0,
          ngayDangKy: item.ngayDangKy || null,
          trangThai: item.trangThai !== false
        }));
      }

      // Nếu hoc_sinh_khoa_hoc trống nhưng lopHoc có sinh viên đăng ký, lấy từ dang_ky_hoc
      if (list.length === 0 && lopHoc?.idLop) {
        const resDk = await dichVuDaoTaoChung.getDangKyHocTheoLop(lopHoc.idLop);
        const rawDk = Array.isArray(resDk) ? resDk : (resDk?.data || []);
        list = rawDk.map(dk => ({
          idHsKh: null,
          idHs: dk.hocSinh?.idHs || dk.idHs,
          hoTen: dk.hocSinh?.hoTen || 'Học viên',
          soBuoiDaHoc: 0,
          ngayDangKy: dk.ngayDangKy || null,
          trangThai: true
        }));
      }

      setStudents(list);
    } catch (err) {
      console.error('Lỗi khi tải học sinh của khóa:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [khoaHoc?.idKhoaHoc, lopHoc?.idLop]);

  useEffect(() => {
    fetchCourseStudents();
  }, [fetchCourseStudents]);

  // 2. Thực hiện xóa học sinh khỏi khóa học & lớp học
  const handleDeleteStudent = async (hs) => {
    if (!khoaHoc?.idKhoaHoc && !lopHoc?.idLop) return;
    if (!hs?.idHs) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa học sinh "${hs.hoTen}" khỏi lớp/khóa học này không?`)) {
      return;
    }
    try {
      setDeletingId(hs.idHs);
      if (lopHoc?.idLop) {
        // Đồng bộ xóa cả dang_ky_hoc và hoc_sinh_khoa_hoc
        await dichVuDaoTaoChung.xoaHocSinhKhoiLop(lopHoc.idLop, hs.idHs);
      } else {
        await dichVuHocSinhPhuHuynh.xoaHocSinhKhoaHoc(khoaHoc.idKhoaHoc, hs.idHs);
      }
      setThongBao({ type: 'success', text: `Đã xóa học sinh "${hs.hoTen}" khỏi lớp/khóa học.` });
      await fetchCourseStudents();
      setTimeout(() => setThongBao(null), 4000);
    } catch (err) {
      console.error('Lỗi khi xóa học sinh khỏi khóa:', err);
      setThongBao({ type: 'error', text: 'Không thể xóa học sinh khỏi khóa học: ' + (err?.response?.data?.message || err.message) });
    } finally {
      setDeletingId(null);
    }
  };

  // ── TÍNH TOÁN CHỈ SỐ SĨ SỐ & GIỚI HẠN ──
  const siSoToiDa = lopHoc?.siSoToiDa || 30;
  const currentCount = students.length;
  const remainingSlots = Math.max(0, siSoToiDa - currentCount);
  const fillPercentage = Math.min(100, Math.round((currentCount / siSoToiDa) * 100));
  const isFull = currentCount >= siSoToiDa;

  // Lọc học sinh trong khóa theo từ khóa tên học sinh
  const filteredStudents = useMemo(() => {
    if (!searchKw.trim()) return students;
    const q = searchKw.toLowerCase();
    return students.filter(s => 
      (s.hoTen || '').toLowerCase().includes(q) ||
      String(s.idHs).includes(q)
    );
  }, [students, searchKw]);

  const formatDate = (val) => {
    if (!val) return '-';
    try {
      const parts = String(val).split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return val;
    } catch {
      return val;
    }
  };

  return (
    <div className={styles.container}>
      {/* Thông báo thao tác */}
      {thongBao && (
        <div className={`${styles.alertBanner} ${thongBao.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          {thongBao.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{thongBao.text}</span>
        </div>
      )}

      {/* ── HEADER BANNER: THÔNG TIN KHÓA HỌC & THỐNG KÊ GIỚI HẠN SĨ SỐ ── */}
      <div className={`droplet-card ${styles.headerCard}`}>
        {/* Dòng 1: Tiêu đề & Nút thao tác */}
        <div className={styles.headerTopRow}>
          <div className={styles.headerMainInfo}>
            <div className={styles.headerIconBox}>
              <GraduationCap size={28} />
            </div>
            <div>
              <div className={styles.titleRow}>
                <h2 className={styles.headerTitle}>
                  Danh Sách Học Sinh • {khoaHoc?.tenKhoaHoc || `Khóa #${khoaHoc?.idKhoaHoc}`}
                </h2>
                <span className={`badge badge-info ${styles.badgeClassName}`}>
                  {lopHoc?.tenLop || `Lớp #${lopHoc?.idLop}`}
                </span>
              </div>
              <p className={styles.headerSubtitle}>
                Cơ sở: <strong className={styles.headerDarkText}>{chiNhanh?.tenCn || 'Chi nhánh'}</strong> • Giáo viên phụ trách: <strong className={styles.headerDarkText}>{lopHoc?.tenGiaoVien || '--'}</strong>
              </p>
            </div>
          </div>

          {/* Nút tác vụ: Làm mới danh sách */}
          <div>
            <button
              type="button"
              onClick={fetchCourseStudents}
              className={`droplet-pill ${styles.btnRefresh}`}
              title="Làm mới danh sách học sinh"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Dòng 2: CARD THỐNG KÊ CHỈ SỐ GIỚI HẠN SĨ SỐ KHÓA HỌC */}
        <div className={styles.capacityBox}>
          {/* Cột 1: Sĩ số & Giới hạn */}
          <div className={styles.capacityCol}>
            <div className={styles.capacityHeader}>
              <span className={styles.capacityLabel}>
                Sĩ Số Hiện Tại / Giới Hạn:
              </span>
              <span className={`${styles.statusPill} ${isFull ? styles.statusPillFull : styles.statusPillAvailable}`}>
                {isFull ? 'Đã đủ sĩ số' : `Còn ${remainingSlots} chỗ trống`}
              </span>
            </div>
            <div className={styles.countGroup}>
              <strong className={styles.currentCount}>
                {currentCount}
              </strong>
              <span className={styles.maxCount}>
                / {siSoToiDa} học sinh
              </span>
            </div>
          </div>

          {/* Cột 2: Thanh tiến độ lấp đầy chỗ học (Progress Bar) */}
          <div className={styles.progressSection}>
            <div className={styles.progressLabelRow}>
              <span>Tỉ Lệ Lấp Đầy Chỗ Ngồi</span>
              <span className={isFull ? styles.progressPercentageFull : styles.progressPercentageNormal}>{fillPercentage}%</span>
            </div>
            <div className={styles.progressTrack}>
              <div 
                className={`${styles.progressFill} ${isFull ? styles.progressFillFull : fillPercentage > 80 ? styles.progressFillWarning : styles.progressFillNormal}`}
                style={{ width: `${fillPercentage}%` }} 
              />
            </div>
          </div>

          {/* Cột 3: Ô tìm kiếm học sinh */}
          <div className={styles.searchWrapper}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh..."
              value={searchKw}
              onChange={(e) => setSearchKw(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {/* ── DANH SÁCH HỌC SINH CỦA KHÓA HỌC ── */}
      {loading ? (
        <div className={`droplet-card ${styles.stateCard}`}>
          <RefreshCw size={32} className={`animate-spin ${styles.loadingSpinner}`} />
          <p className={styles.loadingText}>Đang tải danh sách học sinh...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className={`droplet-card ${styles.stateCard}`}>
          <Users size={44} className={styles.emptyIcon} />
          <p className={styles.stateTitle}>
            Chưa có học sinh nào trong khóa học này
          </p>
          <p className={styles.stateSubtitle}>
            {isFull ? 'Lớp học đã đạt giới hạn sĩ số tối đa' : `Còn ${remainingSlots} chỗ trống để ghi danh học sinh vào khóa học`}
          </p>
          {!isFull && (
            <button
              type="button"
              onClick={() => setModalAddOpen(true)}
              className={styles.btnAddFirst}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Thêm Học Sinh Ngay</span>
            </button>
          )}
        </div>
      ) : (
        <div className={styles.studentsListWrapper}>
          <div className={styles.studentsGrid}>
            {filteredStudents.map((hs, index) => (
              <ComponentTenHocSinh
                key={hs.idHs || hs.idHsKh || index}
                hs={hs}
                index={index}
                onSelect={() => onSelectHocSinh && onSelectHocSinh(hs)}
                onDelete={() => handleDeleteStudent(hs)}
                isDeleting={deletingId === hs.idHs}
              />
            ))}
          </div>

          {/* NÚT DẤU CỘNG THÊM HỌC SINH PHÍA DƯỚI (Biến mất khi sĩ số / giới hạn bằng nhau) */}
          {!isFull && (
            <button
              type="button"
              onClick={() => setModalAddOpen(true)}
              className={styles.btnAddNewStudentDashed}
              title="Thêm học sinh mới vào khóa học"
            >
              <div className={styles.plusIconBox}>
                <Plus size={20} strokeWidth={2.5} />
              </div>
              <div className={styles.btnTextGroup}>
                <span className={styles.btnMainLabel}>
                  Thêm Học Sinh Vào Khóa Học
                </span>
                <span className={styles.btnSlotsBadge}>
                  Còn {remainingSlots} chỗ trống
                </span>
              </div>
            </button>
          )}
        </div>
      )}

      {/* ── MODAL CHỌN HỌC SINH TÁI SỬ DỤNG TỪ LỚP HỌC ── */}
      <ModalThemHocSinhVaoLop
        isOpen={modalAddOpen}
        onClose={() => setModalAddOpen(false)}
        idLop={lopHoc?.idLop}
        tenLop={lopHoc?.tenLop}
        idKhoaHoc={khoaHoc?.idKhoaHoc}
        tenKhoaHoc={khoaHoc?.tenKhoaHoc}
        siSoToiDa={siSoToiDa}
        currentCount={students.length}
        existingStudentIds={students.map(s => s.idHs).filter(Boolean)}
        onSuccess={fetchCourseStudents}
      />
    </div>
  );
};

export default DanhSachHocSinhKhoaHocView;


