import React, { useReducer, useEffect, useCallback } from 'react';
import { 
  Users, 
  UserCheck, 
  CreditCard, 
  Plus, 
  UserPlus, 
  FileText, 
  MoreHorizontal, 
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dichVuThongKe } from '../dich_vu/tao_tu_dong/dichVuThongKe';
import { useTrangThaiXacThuc } from '../trang_thai/useTrangThaiXacThuc';
import { useNamHocKyHocStore } from '../trang_thai/useNamHocKyHocStore';
import TongQuanGiaoVien from '../thanh_phan/giao_vien/TongQuanGiaoVien';
import { KhungTacVuChuDoanhNghiep } from '../thanh_phan/chu_doanh_nghiep/KhungTacVuChuDoanhNghiep';
import styles from './BangDieuKhien.module.css';

// Định nghĩa trạng thái ban đầu và Reducer cho Trang Tổng Quan
const initialDashboardState = {
  loading: false,
  statsData: null,
  error: null
};

function dashboardReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, statsData: action.payload, error: null };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

const BangDieuKhien = () => {
  const { user } = useTrangThaiXacThuc();
  const currentDnId = user?.idDoanhNghiep || 1;

  const {
    selectedNamHocId,
    selectedKyHocId,
    refreshCount
  } = useNamHocKyHocStore();

  const [state, dispatch] = useReducer(dashboardReducer, initialDashboardState);
  const { statsData, loading } = state;

  // Tải số liệu thống kê (Đếm trực tiếp ở tầng Database)
  const fetchStats = useCallback(async () => {
    if (!selectedNamHocId) return;
    try {
      dispatch({ type: 'FETCH_START' });
      const res = await dichVuThongKe.getThongKeTongQuan(currentDnId, selectedNamHocId, selectedKyHocId);
      const data = res?.data !== undefined ? res.data : res;
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      console.error("Lỗi khi tải thống kê tổng quan:", err);
      dispatch({ type: 'FETCH_ERROR', payload: err?.message || 'Lỗi khi tải thống kê' });
    }
  }, [currentDnId, selectedNamHocId, selectedKyHocId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshCount]);

  if (user?.vaiTro === 'GIAO_VIEN') {
    return <TongQuanGiaoVien />;
  }

  return (
    <div className={styles.container}>
      {/* 1. Heading Section */}
      <div className={styles.headingSection}>
        <div>
          <h2 className={styles.headingTitle}>
            Tổng quan
          </h2>
        </div>
      </div>

      {/* 2. Top 3 Water Droplet Metric Cards */}
      <div className={styles.statsGrid}>
        {/* Card 1: Tổng học sinh */}
        <div className={`droplet-card ${styles.statCard}`}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardLabel}>
              Tổng học sinh
            </span>
            <div className={`droplet-circle ${styles.circleBlue}`}>
              <Users size={19} />
            </div>
          </div>
          <div className={styles.statBody}>
            <div className={`stat-metric-value ${styles.statMetricValue}`}>
              <span>{loading ? '...' : (statsData?.tongHocSinh != null ? statsData.tongHocSinh.toLocaleString() : '0')}</span>
              {loading && <RefreshCw size={18} className={`animate-spin ${styles.spinnerBlue}`} />}
            </div>
            <span className={styles.statSubBlue}>
              {statsData ? `Năm ${statsData.tenNamHoc || '---'} • ${statsData.tenKyHoc || '---'}` : 'Đang đồng bộ...'}
            </span>
          </div>
        </div>

        {/* Card 2: Giáo viên */}
        <div className={`droplet-card ${styles.statCard}`}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardLabel}>
              Giáo viên
            </span>
            <div className={`droplet-circle ${styles.circleCyan}`}>
              <UserCheck size={19} />
            </div>
          </div>
          <div className={styles.statBody}>
            <div className={`stat-metric-value ${styles.statMetricValue}`}>
              <span>{loading ? '...' : ((statsData?.tongGiaoVienHoatDong ?? statsData?.tongGiaoVien) != null ? (statsData.tongGiaoVienHoatDong ?? statsData.tongGiaoVien).toLocaleString() : '0')}</span>
              {loading && <RefreshCw size={18} className={`animate-spin ${styles.spinnerCyan}`} />}
            </div>
            <span className={styles.statSubGreen}>
              ● Đang hoạt động tại trung tâm
            </span>
          </div>
        </div>

        {/* Card 3: Học phí thu */}
        <div className={`droplet-card ${styles.statCard}`}>
          <div className={styles.statCardHeader}>
            <span className={styles.statCardLabel}>
              Học phí thu
            </span>
            <div className={`droplet-circle ${styles.circleAmber}`}>
              <CreditCard size={19} />
            </div>
          </div>
          <div className={styles.statBody}>
            <div className={`stat-metric-value ${styles.statMetricValue}`}>
              450M
            </div>
            <span className={styles.statSubEmerald}>
              92% kế hoạch
            </span>
          </div>
        </div>
      </div>

      {/* 2.5. Trung Tâm Điều Hành Tác Vụ Chủ Doanh Nghiệp (Phân Loại Theo Dạng API) */}
      {(user?.vaiTro === 'CHU_DOANH_NGHIEP' || user?.vaiTro === 'ADMIN' || !user?.vaiTro) && (
        <KhungTacVuChuDoanhNghiep />
      )}

      {/* 3. Middle Section */}
      <div className={styles.middleGrid}>
        {/* Left: Hoạt động tuần with Bar Chart */}
        <div className={`droplet-card ${styles.chartCard}`}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>
                Hoạt động tuần
              </h3>
              <span className={styles.chartSub}>
                Tóm tắt nhanh về các lớp và thu học phí
              </span>
            </div>
            <button className={`droplet-pill ${styles.chartFilterBtn}`}>
              7 ngày
            </button>
          </div>

          {/* Bar Chart Visualization */}
          <div className={styles.chartArea}>
            <div className={styles.chartBarGroup}>
              <div className={`${styles.barItem} ${styles.barH85}`} />
              <div className={`${styles.barItem} ${styles.barH125}`} />
              <div className={`${styles.barItem} ${styles.barH165}`} />
              <div className={`${styles.barItem} ${styles.barH145}`} />
            </div>
          </div>
        </div>

        {/* Right: Hành động nhanh & Thông báo */}
        <div className={styles.rightCol}>
          {/* Box 1: Hành động nhanh */}
          <div className={`droplet-card ${styles.quickActionsCard}`}>
            <h3 className={styles.cardSectionTitle}>
              Hành động nhanh
            </h3>
            <div className={styles.actionsList}>
              <Link to="/lop-hoc" className={styles.linkReset}>
                <button className={`droplet-pill ${styles.btnQuickAction}`}>
                  <Plus size={18} className={styles.iconBlue} />
                  <span>Tạo lớp học mới</span>
                </button>
              </Link>

              <Link to="/giao-vien" className={styles.linkReset}>
                <button className={`droplet-pill ${styles.btnQuickAction}`}>
                  <UserPlus size={18} className={styles.iconCyan} />
                  <span>Thêm giáo viên</span>
                </button>
              </Link>

              <Link to="/thu-chi" className={styles.linkReset}>
                <button className={`droplet-pill ${styles.btnQuickAction}`}>
                  <FileText size={18} className={styles.iconBlue} />
                  <span>Xuất báo cáo</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Box 2: Thông báo */}
          <div className={`droplet-card ${styles.notificationsCard}`}>
            <div className={styles.notificationsHeader}>
              <h3 className={styles.cardSectionTitle}>
                Thông báo
              </h3>
              <MoreHorizontal size={18} className={styles.moreIcon} />
            </div>

            <div className={styles.notificationsList}>
              <div className={styles.notificationItem}>
                <span className={styles.dotBlue} />
                <span className={styles.notificationText}>Cập nhật thời khóa biểu học kỳ II</span>
              </div>

              <div className={styles.notificationItem}>
                <span className={styles.dotAmber} />
                <span className={styles.notificationText}>Kiểm tra học phí tháng 3</span>
              </div>

              <div className={styles.notificationItem}>
                <span className={styles.dotGreen} />
                <span className={styles.notificationText}>Lịch họp phụ huynh</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Lớp học đang học các chi nhánh */}
      <div className={`droplet-card ${styles.classesCard}`}>
        <div className={styles.classesHeader}>
          <h3 className={styles.classesTitle}>
            Lớp học đang học các chi nhánh
          </h3>
          <div className={styles.classesHeaderLinks}>
            <Link to="/lop-hoc" className={styles.linkAllClasses}>
              Xem tất cả lớp
            </Link>
          </div>
        </div>

        <div className={styles.classesList}>
          {/* Row 1 */}
          <div className={`droplet-pill ${styles.classRow}`}>
            <div>
              <div className={styles.className}>Toán 10A1</div>
              <div className={styles.classTime}>Thứ 2 • 14:00</div>
            </div>
            <div className={`droplet-circle ${styles.classIndicatorPill}`} />
          </div>

          {/* Row 2 */}
          <div className={`droplet-pill ${styles.classRow}`}>
            <div>
              <div className={styles.className}>Văn 11B</div>
              <div className={styles.classTime}>Thứ 3 • 08:30</div>
            </div>
            <div className={`droplet-circle ${styles.classIndicatorPill}`} />
          </div>

          {/* Row 3 */}
          <div className={`droplet-pill ${styles.classRow}`}>
            <div>
              <div className={styles.className}>Lý 12C</div>
              <div className={styles.classTime}>Thứ 4 • 10:00</div>
            </div>
            <div className={`droplet-pill droplet-pill-mint ${styles.classIndicatorPill}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BangDieuKhien;


