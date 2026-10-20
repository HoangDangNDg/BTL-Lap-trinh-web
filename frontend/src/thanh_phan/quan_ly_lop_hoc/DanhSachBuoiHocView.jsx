import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  UserCheck,
  CheckCircle2, 
  Plus, 
  RefreshCw, 
  FileText, 
  BookOpen,
  CalendarPlus,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import styles from './DanhSachBuoiHocView.module.css';

/**
 * Tầng 4: Component độc lập hiển thị danh sách Buổi học của Khóa học / Lớp học
 * - Truy vấn danh sách buổi học: GET /api/dao-tao-chung/khoa-hoc/{idKhoaHoc}/buoi-hoc
 * - Hỗ trợ thao tác: Tạo buổi học mới, Điểm danh học sinh
 * - Hỗ trợ điều hướng: Giáo viên phụ trách (Ảnh 2) & Danh sách học sinh trong khóa & Tổng hợp điểm danh
 */
const DanhSachBuoiHocView = ({
  khoaHoc,
  lopHoc,
  chiNhanh,
  onTaoBuoiHoc,
  onDiemDanh,
  onViewTeacher,
  onViewStudents,
  onViewTongHopDiemDanh
}) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy danh sách buổi học
  const fetchSessions = useCallback(async () => {
    if (!khoaHoc?.idKhoaHoc && !lopHoc?.idLop) return;
    try {
      setLoading(true);
      let data = [];
      if (khoaHoc?.idKhoaHoc) {
        data = await dichVuDaoTaoChung.getBuoiHocTheoKhoaHoc(khoaHoc.idKhoaHoc);
      }
      if ((!data || data.length === 0) && lopHoc?.idLop) {
        data = await dichVuDaoTaoChung.getBuoiHocTheoLop(lopHoc.idLop);
      }
      setSessions(data || []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách buổi học:', err);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [khoaHoc?.idKhoaHoc, lopHoc?.idLop]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const formatDate = (val) => {
    if (!val) return '--/--/----';
    try {
      const parts = String(val).split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return val;
    } catch {
      return val;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    return String(timeStr).substring(0, 5);
  };

  return (
    <div className={styles.container}>
      {/* Header Banner Danh Sách Buổi Học */}
      <div className={styles.headerBanner}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIconBox}>
            <Calendar size={26} />
          </div>
          <div>
            <div className={styles.headerTitleRow}>
              <h2 className={styles.headerTitle}>
                Danh Sách Buổi Học • {khoaHoc?.tenKhoaHoc || lopHoc?.tenLop || 'Khóa học'}
              </h2>
              <span className={`badge badge-info ${styles.classNameBadge}`}>
                {lopHoc?.tenLop || 'Lớp học'}
              </span>
            </div>
            <p className={styles.headerSubtitle}>
              Cơ sở: <strong className={styles.highlightDark}>{chiNhanh?.tenCn || lopHoc?.tenChiNhanh || 'Chi nhánh'}</strong> • Tổng số buổi: <strong className={styles.highlightBlue}>{sessions.length}</strong> buổi học
            </p>
          </div>
        </div>

        {/* Nút thao tác nhanh: Giáo viên, Học sinh, Tạo buổi, Điểm danh & Làm mới */}
        <div className={styles.headerActions}>
          {/* Nút 1: Giáo viên khóa học (Tái sử dụng Ảnh 2) */}
          {onViewTeacher && (
            <button
              type="button"
              onClick={() => onViewTeacher(lopHoc, khoaHoc)}
              className={`droplet-pill ${styles.btnTeacher}`}
              title="Xem hồ sơ chi tiết giáo viên phụ trách khóa học"
            >
              <UserCheck size={15} />
              <span>Giáo Viên Khóa Học</span>
            </button>
          )}

          {/* Nút 2: Danh sách học sinh khóa học */}
          {onViewStudents && (
            <button
              type="button"
              onClick={() => onViewStudents(lopHoc, khoaHoc)}
              className={`droplet-pill ${styles.btnStudents}`}
              title="Xem danh sách học sinh và chỉ số sĩ số khóa học"
            >
              <Users size={15} />
              <span>Danh Sách Học Sinh</span>
            </button>
          )}

          {/* Nút 3: Bảng Tổng Hợp Điểm Danh Khóa Học */}
          {onViewTongHopDiemDanh && (
            <button
              type="button"
              onClick={() => onViewTongHopDiemDanh(lopHoc, khoaHoc)}
              className={`droplet-pill ${styles.btnAttendanceSummary}`}
              title="Xem bảng tổng hợp điểm danh chi tiết từng buổi học và tỷ lệ chuyên cần"
            >
              <FileSpreadsheet size={15} />
              <span>Tổng Hợp Điểm Danh</span>
            </button>
          )}

          <button
            type="button"
            onClick={fetchSessions}
            className={`droplet-pill ${styles.btnRefresh}`}
            title="Làm mới danh sách buổi học"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Danh sách các buổi học dạng danh sách chi tiết */}
      {loading ? (
        <div className={`droplet-card ${styles.stateCard}`}>
          <RefreshCw size={32} className={`animate-spin ${styles.loadingIcon}`} />
          <p className={styles.loadingText}>Đang tải danh sách buổi học...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className={`droplet-card ${styles.stateCard}`}>
          <Calendar size={44} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>
            Chưa có buổi học nào được tạo cho khóa học này
          </p>
          <p className={styles.emptySubtitle}>Bấm nút bên dưới để tạo buổi học đầu tiên</p>
          {onTaoBuoiHoc && (
            <button
              type="button"
              onClick={() => onTaoBuoiHoc(lopHoc, khoaHoc, { soThuTu: 1 })}
              className={styles.btnCreateFirstSession}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Tạo Buổi Học Đầu Tiên</span>
            </button>
          )}
        </div>
      ) : (
        <div className={styles.sessionList}>
          {sessions.map((bh, idx) => {
            const buoiSo = bh.soThuTu || (idx + 1);
            return (
              <div
                key={bh.idBuoiHoc || idx}
                onClick={() => onDiemDanh && onDiemDanh(lopHoc, khoaHoc, bh)}
                title={`Nhấp vào buổi học để mở điểm danh Buổi ${buoiSo}`}
                className={styles.sessionItem}
              >
                {/* Cột 1: Buổi số & Ngày học */}
                <div className={styles.sessionColDate}>
                  <div className={styles.sessionNumberBadge}>
                    <span className={styles.sessionNumberLabel}>Buổi</span>
                    <span>{buoiSo}</span>
                  </div>

                  <div>
                    <div className={styles.sessionDateRow}>
                      <Calendar size={14} className={styles.dateIcon} />
                      <strong className={styles.dateValue}>{formatDate(bh.ngayHoc)}</strong>
                    </div>
                    <div className={styles.sessionTimeRow}>
                      <Clock size={12} />
                      <span>{formatTime(bh.gioBatDau)} - {formatTime(bh.gioKetThuc)} {bh.caHoc ? `(Ca ${bh.caHoc})` : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Cột 2: Phòng học & Nội dung */}
                <div className={styles.sessionColInfo}>
                  <div className={styles.roomRow}>
                    <MapPin size={13} className={styles.roomIcon} />
                    <span className={styles.roomName}>
                      {bh.tenPhong || 'Phòng học chuẩn'}
                    </span>
                  </div>
                  <div className={styles.contentRow}>
                    <FileText size={13} className={styles.contentIcon} />
                    <span>{bh.noiDung || 'Nội dung buổi học chuẩn theo giáo trình'}</span>
                  </div>
                </div>

                {/* Cột 3: Nút điểm danh nhanh */}
                <div className={styles.sessionColAction}>
                  <div className={styles.attendancePill}>
                    <CheckCircle2 size={14} />
                    <span>Điểm danh</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Nút tạo buổi học bằng dấu + phía dưới buổi đã hiển thị */}
          {onTaoBuoiHoc && (
            <button
              type="button"
              onClick={() => onTaoBuoiHoc(lopHoc, khoaHoc, { soThuTu: sessions.length + 1 })}
              className={styles.btnAddNewSession}
              title="Tạo thêm buổi học tiếp theo cho khóa học này"
            >
              <div className={styles.plusIconCircle}>
                <Plus size={18} strokeWidth={2.5} />
              </div>
              <span>Tạo Buổi Học Mới {sessions.length > 0 ? `(Buổi ${sessions.length + 1})` : ''}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DanhSachBuoiHocView;


