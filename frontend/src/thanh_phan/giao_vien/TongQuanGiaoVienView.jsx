import React from 'react';
import { 
  BookOpen, 
  Calendar, 
  CreditCard, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  RefreshCw, 
  ChevronRight, 
  GraduationCap 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './TongQuanGiaoVien.module.css';

export const TongQuanGiaoVienView = ({
  user,
  loading,
  lopDayTrongKy,
  lichDayHomNay,
  tongLuongDaNhan,
  tongSoBuoiDay,
  thuLabel,
  onRefresh,
  formatVND
}) => {
  return (
    <div className={styles.container}>
      
      {/* ── HEADER BANNER: Chào mừng Giảng Viên ── */}
      <div className={`droplet-card ${styles.banner}`}>
        <div className={styles.bannerLeft}>
          <div className={styles.bannerDateRow}>
            <span className={`badge badge-info ${styles.badgePortal}`}>
              Cổng Giảng Viên
            </span>
            <span className={styles.bannerDateText}>
              {thuLabel}, {new Date().toLocaleDateString('vi-VN')}
            </span>
          </div>
          <h2 className={styles.bannerTitle}>
            Chào mừng, {user?.hoTen || 'Thầy/Cô'}!
          </h2>
          <p className={styles.bannerDesc}>
            Dưới đây là tổng hợp số lớp phụ trách, ca dạy hôm nay và tiến độ chi trả thù lao giảng dạy.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className={`droplet-pill ${styles.refreshBtn}`}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Cập nhật số liệu</span>
        </button>
      </div>

      {/* ── 3 THẺ CHỈ SỐ NƯỚC (WATER DROPLET METRIC CARDS) ── */}
      <div className={styles.metricsGrid}>

        {/* THẺ 1: SỐ LỚP DẠY TRONG KỲ */}
        <div className={`droplet-card ${styles.metricCard}`}>
          <div className={styles.metricCardHeader}>
            <span className={styles.metricLabel}>
              Số lớp dạy trong kỳ
            </span>
            <div className={`droplet-circle ${styles.metricIconBlue}`}>
              <BookOpen size={20} />
            </div>
          </div>
          <div className={styles.metricBody}>
            <div className={styles.metricValueRow}>
              <span>{loading ? '...' : lopDayTrongKy.length}</span>
              <span className={styles.metricUnit}>lớp</span>
            </div>
            <Link to="/lop-hoc" style={{ textDecoration: 'none' }}>
              <span className={styles.metricLinkBlue}>
                <span>Xem danh sách lớp học</span>
                <ChevronRight size={14} />
              </span>
            </Link>
          </div>
        </div>

        {/* THẺ 2: LỊCH DẠY TRONG NGÀY */}
        <div className={`droplet-card ${styles.metricCard}`}>
          <div className={styles.metricCardHeader}>
            <span className={styles.metricLabel}>
              Lịch dạy hôm nay ({thuLabel})
            </span>
            <div className={`droplet-circle ${styles.metricIconSky}`}>
              <Calendar size={20} />
            </div>
          </div>
          <div className={styles.metricBody}>
            <div className={styles.metricValueRow}>
              <span>{loading ? '...' : lichDayHomNay.length}</span>
              <span className={styles.metricUnit}>ca dạy</span>
            </div>
            <Link to="/thoi-khoa-bieu" style={{ textDecoration: 'none' }}>
              <span className={styles.metricLinkSky}>
                <span>Xem thời khóa biểu tuần</span>
                <ChevronRight size={14} />
              </span>
            </Link>
          </div>
        </div>

        {/* THẺ 3: TỔNG QUAN LƯƠNG ĐÃ NHẬN */}
        <div className={`droplet-card ${styles.metricCard}`}>
          <div className={styles.metricCardHeader}>
            <span className={styles.metricLabel}>
              Tổng quan lương đã nhận
            </span>
            <div className={`droplet-circle ${styles.metricIconGreen}`}>
              <CreditCard size={20} />
            </div>
          </div>
          <div className={styles.metricBody}>
            <div className={styles.metricValueSalary}>
              {loading ? '...' : (tongLuongDaNhan > 0 ? formatVND(tongLuongDaNhan) : '0 ₫')}
            </div>
            <span className={styles.metricBadgeSalary}>
              <CheckCircle2 size={13} />
              <span>Đã hoàn thành {tongSoBuoiDay} buổi giảng dạy</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── BẢNG CHI TIẾT: LỊCH DẠY TRONG NGÀY & DANH SÁCH LỚP ── */}
      <div className={styles.detailsGrid}>
        
        {/* KHỐI TRÁI: CHI TIẾT LỊCH DẠY HÔM NAY */}
        <div className={`droplet-card ${styles.detailPanel}`}>
          <div>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>
                Ca dạy hôm nay ({thuLabel})
              </h3>
              <span className={`badge badge-info ${styles.panelBadge}`}>
                {lichDayHomNay.length} ca
              </span>
            </div>

            {loading ? (
              <div className={styles.loadingBox}>
                <RefreshCw size={24} className={`animate-spin ${styles.loadingIconSky}`} />
                <span>Đang tải lịch dạy hôm nay...</span>
              </div>
            ) : lichDayHomNay.length === 0 ? (
              <div className={styles.emptyBox}>
                <Calendar size={32} className={styles.emptyIcon} />
                <h4 className={styles.emptyTitle}>
                  Hôm nay Thầy/Cô không có lịch dạy
                </h4>
                <p className={styles.emptyDesc}>
                  Hãy chuẩn bị giáo án cho các ca học sắp tới trong tuần.
                </p>
              </div>
            ) : (
              <div className={styles.itemsList}>
                {lichDayHomNay.map((item, idx) => (
                  <div
                    key={idx}
                    className={`droplet-pill ${styles.scheduleItem}`}
                  >
                    <div>
                      <div className={styles.scheduleHeaderRow}>
                        <span className={styles.scheduleClassName}>
                          {item.tenLop || item.lopHoc?.tenLop || `Lớp học #${item.idLop || idx + 1}`}
                        </span>
                        <span className={`badge badge-success ${styles.scheduleBadge}`}>
                          Ca {item.caHoc || '1'}
                        </span>
                      </div>
                      <div className={styles.scheduleMetaRow}>
                        <span className={styles.scheduleMetaItem}>
                          <Clock size={13} className={styles.scheduleClockIcon} />
                          {item.gioBatDau || '08:00'} - {item.gioKetThuc || '10:00'}
                        </span>
                        <span className={styles.scheduleMetaItem}>
                          <MapPin size={13} className={styles.schedulePinIcon} />
                          {item.tenPhong || item.phongHoc?.tenPhong || 'Phòng 101'}
                        </span>
                      </div>
                    </div>

                    <Link to="/lop-hoc" style={{ textDecoration: 'none' }}>
                      <button 
                        type="button"
                        className={`droplet-pill droplet-pill-accent ${styles.scheduleEnterBtn}`}
                      >
                        Vào lớp
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.panelFooter}>
            <Link to="/thoi-khoa-bieu" style={{ textDecoration: 'none', display: 'block' }}>
              <button 
                type="button"
                className={`droplet-pill ${styles.panelFullBtn}`}
              >
                Xem toàn bộ lịch dạy tuần
              </button>
            </Link>
          </div>
        </div>

        {/* KHỐI PHẢI: LỚP HỌC ĐANG PHỤ TRÁCH */}
        <div className={`droplet-card ${styles.detailPanel}`}>
          <div>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>
                Lớp học phụ trách ({lopDayTrongKy.length})
              </h3>
              <Link to="/lop-hoc" className={styles.panelLinkAll}>
                Xem tất cả
              </Link>
            </div>

            {loading ? (
              <div className={styles.loadingBox}>
                <RefreshCw size={24} className={`animate-spin ${styles.loadingIconBlue}`} />
                <span>Đang tải danh sách lớp học...</span>
              </div>
            ) : lopDayTrongKy.length === 0 ? (
              <div className={styles.emptyBox}>
                <GraduationCap size={32} className={styles.emptyIcon} />
                <h4 className={styles.emptyTitle}>
                  Chưa có lớp học phân công trong kỳ này
                </h4>
              </div>
            ) : (
              <div className={styles.itemsList}>
                {lopDayTrongKy.slice(0, 4).map((lop, idx) => (
                  <div
                    key={lop.idLop || idx}
                    className={`droplet-pill ${styles.classItem}`}
                  >
                    <div>
                      <div className={styles.classTitle}>
                        {lop.tenLop}
                      </div>
                      <div className={styles.classSubtitle}>
                        {lop.tenKhoaHoc || lop.khoaHoc?.tenKhoaHoc || 'Chương trình tiêu chuẩn'} • {lop.tenChiNhanh || 'Cơ sở chính'}
                      </div>
                    </div>
                    <Link to="/lop-hoc" style={{ textDecoration: 'none' }}>
                      <span className={`badge badge-info ${styles.classAttendanceBadge}`}>
                        Điểm danh
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.panelFooter}>
            <Link to="/lop-hoc" style={{ textDecoration: 'none', display: 'block' }}>
              <button 
                type="button"
                className={`droplet-pill droplet-pill-accent ${styles.panelActionBtn}`}
              >
                Quản lý lớp học &amp; Điểm danh
              </button>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default TongQuanGiaoVienView;
