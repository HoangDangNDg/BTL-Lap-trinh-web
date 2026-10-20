import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  Layers, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  DollarSign, 
  RefreshCw, 
  Award,
  Users,
  GraduationCap
} from 'lucide-react';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import styles from './DanhSachKhoaHocView.module.css';

/**
 * Tầng 3: Component độc lập CHỈ hiển thị danh sách Khóa học thuộc Lớp học đã chọn
 * - Truy vấn danh sách khóa học theo ID lớp: GET /api/dao-tao-chung/lop-hoc/{idLop}/khoa-hoc
 * - Mỗi khối khóa học có 1 button chiếm 100% bề rộng hiển thị: "Xem Danh Sách Buổi Học Của Khóa Học"
 * - Khi bấm button này, gọi callback onSelectKhoaHoc để chuyển sang Tầng 4 (Buổi học)
 */
const DanhSachKhoaHocView = ({
  lopHoc,
  chiNhanh,
  onSelectKhoaHoc,
  onViewStudents
}) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy khóa học của lớp
  const fetchCourses = useCallback(async () => {
    if (!lopHoc?.idLop) return;
    try {
      setLoading(true);
      const data = await dichVuDaoTaoChung.getKhoaHocTheoLop(lopHoc.idLop);
      setCourses(data || []);
    } catch (err) {
      console.error('Lỗi khi tải khóa học của lớp:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [lopHoc?.idLop]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const formatDate = (val) => {
    if (!val) return 'Chưa xác định';
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
      {/* Header Banner Khóa Học Thuộc Lớp */}
      <div className={styles.headerBanner}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIconBox}>
            <Layers size={26} />
          </div>
          <div>
            <div className={styles.headerTitleRow}>
              <h2 className={styles.headerTitle}>
                Danh Sách Khóa Học • {lopHoc?.tenLop || 'Lớp học'}
              </h2>
            </div>
            <p className={styles.headerSubtitle}>
              Cơ sở: <strong className={styles.highlightDark}>{chiNhanh?.tenCn || lopHoc?.tenChiNhanh || 'Chi nhánh'}</strong> • Giáo viên phụ trách: <strong className={styles.highlightDark}>{lopHoc?.tenGiaoVien || '--'}</strong> • <span className={styles.highlightAction}>Bấm vào khóa học để xem danh sách buổi học</span>
            </p>
          </div>
        </div>

        {/* Nút tác vụ & làm mới */}
        <div className={styles.headerActions}>
          {onViewStudents && (
            <button
              type="button"
              onClick={() => onViewStudents(lopHoc, courses[0])}
              className={`droplet-pill ${styles.btnStudents}`}
              title="Xem danh sách học sinh của lớp học"
            >
              <Users size={15} />
              <span>Học Sinh Của Lớp</span>
            </button>
          )}

          <button
            type="button"
            onClick={fetchCourses}
            className={`droplet-pill ${styles.btnRefresh}`}
            title="Làm mới danh sách khóa học"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Danh sách các khối khóa học */}
      {loading ? (
        <div className={`droplet-card ${styles.stateCard}`}>
          <RefreshCw size={32} className={`animate-spin ${styles.loadingIcon}`} />
          <p className={styles.loadingText}>Đang tải danh sách khóa học của lớp...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className={`droplet-card ${styles.stateCard}`}>
          <Layers size={44} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>
            Lớp học này hiện chưa có khóa học nào
          </p>
          <p className={styles.emptySubtitle}>Vui lòng thêm khóa học cho lớp để lên lịch giảng dạy</p>
        </div>
      ) : (
        <div className={styles.courseList}>
          {courses.map((kh) => (
            <div
              key={kh.idKhoaHoc}
              onClick={() => onSelectKhoaHoc && onSelectKhoaHoc(kh)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectKhoaHoc && onSelectKhoaHoc(kh);
                }
              }}
              className={styles.courseCard}
              title="Bấm vào khóa học để xem danh sách buổi học"
            >
              {/* Hàng 1: Tiêu đề khóa học, mã khóa và trạng thái */}
              <div className={styles.courseHeaderRow}>
                <div className={styles.courseMainInfo}>
                  <div className={styles.courseIconBox}>
                    <BookOpen size={22} />
                  </div>
                  <div>
                    {kh.boMon?.tenBoMon && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={styles.subjectBadge}>
                          {kh.boMon.tenBoMon}
                        </span>
                      </div>
                    )}
                    <h3 className={styles.courseTitle}>
                      {kh.tenKhoaHoc}
                    </h3>
                  </div>
                </div>

                <div className={styles.courseHeaderRight}>
                  {onViewStudents && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewStudents(lopHoc, kh);
                      }}
                      className={styles.btnCourseStudents}
                      title="Xem danh sách học sinh của khóa học"
                    >
                      <Users size={14} />
                      <span>Học sinh</span>
                    </button>
                  )}
                  <span 
                    className={`${kh.trangThaiHoanThanh ? 'badge badge-success' : 'badge badge-info'} ${styles.statusBadge}`}
                  >
                    {kh.trangThaiHoanThanh ? '✓ Đã hoàn thành' : '⚡ Đang giảng dạy'}
                  </span>
                  <div className={styles.arrowBox}>
                    <ChevronRight size={18} strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Hàng 2: Grid các chỉ số chi tiết của khóa học */}
              <div className={styles.metricsGrid}>
                <div className={styles.metricItem}>
                  <Clock size={18} className={styles.iconBlue} />
                  <div>
                    <span className={styles.metricLabel}>Thời lượng đào tạo</span>
                    <strong className={styles.metricValue}>{kh.soTiet || 30} tiết</strong>
                  </div>
                </div>

                <div className={styles.metricItem}>
                  <CheckCircle2 size={18} className={styles.iconGreen} />
                  <div>
                    <span className={styles.metricLabel}>Tiến độ buổi dạy</span>
                    <strong className={styles.metricValue}>{kh.soBuoiDaDay || 0} buổi đã dạy</strong>
                  </div>
                </div>

                <div className={styles.metricItem}>
                  <DollarSign size={18} className={styles.iconAmber} />
                  <div>
                    <span className={styles.metricLabel}>Mức học phí niêm yết</span>
                    <strong className={styles.metricPrice}>
                      {formatCurrency(kh.hocPhi)}
                    </strong>
                  </div>
                </div>

                <div className={styles.metricItem}>
                  <Calendar size={18} className={styles.iconPurple} />
                  <div>
                    <span className={styles.metricLabel}>Thời gian khóa học</span>
                    <strong className={styles.metricDate}>
                      {formatDate(kh.ngayBatDau)} {kh.ngayKetThuc ? `➔ ${formatDate(kh.ngayKetThuc)}` : ''}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DanhSachKhoaHocView;


