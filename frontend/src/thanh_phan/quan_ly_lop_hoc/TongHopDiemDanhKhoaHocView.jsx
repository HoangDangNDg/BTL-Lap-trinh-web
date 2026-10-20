import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Check,
  X,
  ArrowLeft,
  RefreshCw,
  Search,
  Filter,
  FileSpreadsheet,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import { dichVuGiaoVien } from '../../dich_vu/dichVuGiaoVien';
import { thongBao } from '../../tien_ich/thongBao';
import { useComponentTheme } from '../../trang_thai/useComponentTheme';
import styles from './TongHopDiemDanhKhoaHocView.module.css';

/**
 * =========================================================================
 * COMPONENT: BẢNG TỔNG HỢP ĐIỂM DANH KHÓA HỌC (ATTENDANCE MATRIX)
 * =========================================================================
 * - Ma trận 2 chiều:
 *   + Hàng dọc (Rows): Danh sách học sinh trong lớp/khóa học.
 *   + Hàng ngang (Columns): Tất cả các buổi học (Buổi 1, 2, ..., N).
 *   + Ô giao nhau (Cells):
 *       * Màu XANH (#DCFCE7 / #15803D): Đi học / Có mặt (trang_thai = true).
 *       * Màu ĐỎ (#FEE2E2 / #DC2626): Vắng mặt (trang_thai = false).
 *       * Màu XÁM (#F8FAFC / #94A3B8): Chưa diễn ra / Chưa điểm danh.
 *   + Cột phía cuối: Số buổi học sinh đi học (X/Y buổi, tỷ lệ %, mức độ chuyên cần).
 *   + Hàng chân bảng: Tổng số học sinh đi học từng buổi.
 * - Cho phép bấm vào từng buổi học để mở giao diện điểm danh nhanh.
 */
const TongHopDiemDanhKhoaHocView = ({
  khoaHoc,
  lopHoc,
  chiNhanh,
  onDiemDanhBuoiHoc,
  onBack,
  onSelectHocSinh
}) => {
  const navigate = useNavigate();
  const { mode, applyToCards } = useComponentTheme();
  const isDark = mode === 'DARK' && applyToCards;

  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bộ lọc tìm kiếm
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'VANG_NHIEU' | 'DAY_DU'

  const idKhoaHoc = khoaHoc?.idKhoaHoc;
  const idLop = lopHoc?.idLop || khoaHoc?.idLop;

  // 1. Tải toàn bộ dữ liệu (Buổi học, Học sinh, Điểm danh khóa học)
  const fetchData = useCallback(async () => {
    if (!idKhoaHoc && !idLop) return;
    try {
      setLoading(true);

      // 1.1 Tải danh sách các buổi học của khóa
      let rawSessions = [];
      if (idKhoaHoc) {
        try {
          rawSessions = await dichVuDaoTaoChung.getBuoiHocTheoKhoaHoc(idKhoaHoc);
        } catch (e) {
          console.warn('Lỗi tải buổi học theo khóa:', e);
        }
      }
      if ((!rawSessions || rawSessions.length === 0) && idLop) {
        try {
          rawSessions = await dichVuDaoTaoChung.getBuoiHocTheoLop(idLop);
        } catch (e) {
          console.warn('Lỗi tải buổi học theo lớp:', e);
        }
      }

      // Sắp xếp các buổi học theo số thứ tự hoặc ngày học tăng dần
      const sortedSessions = (rawSessions || []).slice().sort((a, b) => {
        if (a.soThuTu && b.soThuTu) return a.soThuTu - b.soThuTu;
        const dateA = a.ngayHoc ? new Date(a.ngayHoc).getTime() : 0;
        const dateB = b.ngayHoc ? new Date(b.ngayHoc).getTime() : 0;
        if (dateA !== dateB) return dateA - dateB;
        return (a.caHoc || 0) - (b.caHoc || 0);
      });
      setSessions(sortedSessions);

      // 1.2 Tải danh sách học sinh thuộc khóa/lớp
      let rawStudents = [];
      if (idKhoaHoc) {
        try {
          const resHs = await dichVuGiaoVien.getHocSinhKhoaHoc(idKhoaHoc);
          rawStudents = Array.isArray(resHs) ? resHs : (resHs?.data || []);
        } catch (e) {
          console.warn('Lỗi tải học sinh khóa học:', e);
        }
      }
      if ((!rawStudents || rawStudents.length === 0) && idLop) {
        try {
          const resDk = await dichVuDaoTaoChung.getDangKyHocTheoLop(idLop);
          rawStudents = Array.isArray(resDk) ? resDk : (resDk?.data || []);
        } catch (e) {
          console.warn('Lỗi tải học sinh đăng ký theo lớp:', e);
        }
      }

      // 1.3 Tải toàn bộ bản ghi điểm danh của khóa học
      let rawAttendance = [];
      if (idKhoaHoc) {
        try {
          const resAtt = await dichVuDaoTaoChung.getDiemDanhTheoKhoaHoc(idKhoaHoc);
          rawAttendance = Array.isArray(resAtt) ? resAtt : (resAtt?.data || []);
        } catch (e) {
          console.warn('Lỗi tải điểm danh theo khóa học:', e);
        }
      }
      setAttendanceRecords(rawAttendance || []);

      // Chuẩn hóa danh sách học sinh
      const studentMap = new Map();
      (rawStudents || []).forEach((item) => {
        const hs = item.hocSinh || item;
        const id = hs.idHs || item.idHs;
        if (id && !studentMap.has(id)) {
          studentMap.set(id, {
            idHs: id,
            hoTen: hs.hoTen || hs.tenHocSinh || item.tenHocSinh || item.hoTen || `Học sinh #${id}`,
            sdt: hs.soDienThoai || hs.sdt || item.sdt || item.soDienThoai || '',
            email: hs.email || item.email || '',
            gioiTinh: hs.gioiTinh || item.gioiTinh || 'M'
          });
        }
      });

      // Bổ sung học sinh nếu có trong bản ghi điểm danh mà chưa có trong danh sách
      (rawAttendance || []).forEach((att) => {
        const hs = att.hocSinh;
        const id = hs?.idHs || att.idHs;
        if (id && !studentMap.has(id)) {
          studentMap.set(id, {
            idHs: id,
            hoTen: hs?.hoTen || hs?.tenHocSinh || att.tenHocSinh || `Học sinh #${id}`,
            sdt: hs?.soDienThoai || hs?.sdt || '',
            email: '',
            gioiTinh: 'M'
          });
        }
      });

      const fullStudents = Array.from(studentMap.values()).sort((a, b) =>
        (a.hoTen || '').localeCompare(b.hoTen || '', 'vi')
      );
      setStudents(fullStudents);
    } catch (err) {
      console.error('Lỗi khi tải bảng tổng hợp điểm danh:', err);
    } finally {
      setLoading(false);
    }
  }, [idKhoaHoc, idLop]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 2. Xây dựng tra cứu điểm danh nhanh Map<`${idHs}_${idBuoiHoc}`, boolean>
  const attendanceLookup = useMemo(() => {
    const map = new Map();
    attendanceRecords.forEach((att) => {
      const hsId = att.hocSinh?.idHs || att.idHs;
      const buoiId = att.buoiHoc?.idBuoiHoc || att.idBuoiHoc;
      if (hsId && buoiId) {
        // Boolean: true = đi học, false = vắng
        map.set(`${hsId}_${buoiId}`, att.trangThai === true || att.trangThai === 1);
      }
    });
    return map;
  }, [attendanceRecords]);

  // 3. Tính toán thống kê theo từng học sinh
  const studentStats = useMemo(() => {
    return students.map((s) => {
      let attended = 0;
      let absent = 0;
      sessions.forEach((b) => {
        const status = attendanceLookup.get(`${s.idHs}_${b.idBuoiHoc}`);
        if (status === true) attended++;
        else if (status === false) absent++;
      });
      const recorded = attended + absent;
      const rate = recorded > 0 ? Math.round((attended / recorded) * 100) : 0;
      return {
        ...s,
        attended,
        absent,
        recorded,
        rate
      };
    });
  }, [students, sessions, attendanceLookup]);

  // 4. Lọc học sinh theo keyword và filterMode
  const filteredStudents = useMemo(() => {
    return studentStats.filter((s) => {
      // Lọc từ khóa
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchName = s.hoTen?.toLowerCase().includes(kw);
        const matchId = String(s.idHs).includes(kw);
        const matchPhone = s.sdt?.includes(kw);
        if (!matchName && !matchId && !matchPhone) return false;
      }

      // Lọc phân loại
      if (filterMode === 'VANG_NHIEU') {
        return s.absent >= 2;
      }
      if (filterMode === 'DAY_DU') {
        return s.recorded > 0 && s.absent === 0;
      }
      return true;
    });
  }, [studentStats, searchKeyword, filterMode]);

  // 5. Thống kê tổng hợp toàn khóa
  const summaryStats = useMemo(() => {
    const totalStudents = students.length;
    const totalSessions = sessions.length;

    // Số buổi đã có điểm danh ít nhất 1 học sinh
    const recordedSessionCount = sessions.filter((b) => {
      return students.some((s) => attendanceLookup.has(`${s.idHs}_${b.idBuoiHoc}`));
    }).length;

    // Tổng số lượt có mặt & vắng toàn khóa
    let totalAttendedEntries = 0;
    let totalRecordedEntries = 0;
    attendanceRecords.forEach((att) => {
      totalRecordedEntries++;
      if (att.trangThai === true || att.trangThai === 1) {
        totalAttendedEntries++;
      }
    });

    const avgRate = totalRecordedEntries > 0
      ? Math.round((totalAttendedEntries / totalRecordedEntries) * 100)
      : 0;

    return {
      totalStudents,
      totalSessions,
      recordedSessionCount,
      totalAttendedEntries,
      avgRate
    };
  }, [students, sessions, attendanceRecords, attendanceLookup]);

  // 6. Tính toán thống kê sĩ số có mặt cho từng buổi học (Footer hàng ngang)
  const sessionStats = useMemo(() => {
    const map = new Map();
    sessions.forEach((b) => {
      let countAttended = 0;
      let countAbsent = 0;
      students.forEach((s) => {
        const val = attendanceLookup.get(`${s.idHs}_${b.idBuoiHoc}`);
        if (val === true) countAttended++;
        else if (val === false) countAbsent++;
      });
      const total = countAttended + countAbsent;
      map.set(b.idBuoiHoc, {
        countAttended,
        countAbsent,
        total,
        rate: total > 0 ? Math.round((countAttended / total) * 100) : 0
      });
    });
    return map;
  }, [sessions, students, attendanceLookup]);

  const formatDate = (val) => {
    if (!val) return '--/--';
    try {
      const parts = String(val).split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
      return val;
    } catch {
      return val;
    }
  };

  const handleExportExcel = () => {
    try {
      if (!sessions || sessions.length === 0) {
        thongBao.warning('Không có dữ liệu buổi học để xuất Excel.');
        return;
      }
      if (!students || students.length === 0) {
        thongBao.warning('Không có danh sách học sinh để xuất Excel.');
        return;
      }

      // Xây dựng ma trận dữ liệu 2 chiều (AOA)
      const dataRows = [];

      // 1. Khối thông tin khóa học
      dataRows.push(['BẢNG TỔNG HỢP ĐIỂM DANH HỌC SINH']);
      dataRows.push([`Khóa học: ${khoaHoc?.tenKhoaHoc || 'Khóa học đào tạo'}`]);
      dataRows.push([
        `Lớp: ${lopHoc?.tenLop || 'Lớp đào tạo'}`,
        `Cơ sở: ${chiNhanh?.tenCn || lopHoc?.tenChiNhanh || 'Chi nhánh'}`,
        `Sĩ số: ${students.length} học sinh`,
        `Tổng số buổi: ${sessions.length} buổi`
      ]);
      dataRows.push([
        `Tiến độ: ${summaryStats.recordedSessionCount}/${summaryStats.totalSessions} buổi đã điểm danh`,
        `Tỷ lệ chuyên cần chung: ${summaryStats.avgRate}%`,
        `Ngày xuất báo cáo: ${new Date().toLocaleDateString('vi-VN')}`
      ]);
      dataRows.push([]); // Dòng phân cách

      // 2. Tiêu đề các cột dữ liệu
      const headerRow = ['STT', 'Họ & Tên Học Sinh', 'Số Điện Thoại'];
      sessions.forEach((buoi, idx) => {
        const bNum = buoi.soThuTu || idx + 1;
        const dStr = formatDate(buoi.ngayHoc);
        headerRow.push(`Buổi ${bNum} (${dStr})`);
      });
      headerRow.push('Số Buổi Đi Học', 'Số Buổi Vắng', 'Tỷ Lệ Đi Học');
      dataRows.push(headerRow);

      // 3. Dữ liệu từng học sinh (theo bộ lọc hiện thời)
      const exportStudents = filteredStudents.length > 0 ? filteredStudents : studentStats;
      exportStudents.forEach((hs, idx) => {
        const row = [
          idx + 1,
          hs.hoTen || `Học sinh #${idx + 1}`,
          hs.sdt || ''
        ];

        sessions.forEach((buoi) => {
          const status = attendanceLookup.get(`${hs.idHs}_${buoi.idBuoiHoc}`);
          if (status === true) {
            row.push('Đi học');
          } else if (status === false) {
            row.push('Vắng');
          } else {
            row.push('Chưa ĐD');
          }
        });

        row.push(
          `${hs.attended}/${sessions.length} buổi`,
          `${hs.absent} buổi`,
          hs.recorded > 0 ? `${hs.rate}%` : '0%'
        );

        dataRows.push(row);
      });

      // 4. Dòng tổng kết chân bảng
      const summaryRow = ['Tổng kết', 'Sĩ số có mặt / buổi', ''];
      sessions.forEach((buoi) => {
        const bStats = sessionStats.get(buoi.idBuoiHoc);
        if (bStats && bStats.total > 0) {
          summaryRow.push(`${bStats.countAttended}/${bStats.total} (${bStats.rate}%)`);
        } else {
          summaryRow.push('--');
        }
      });
      summaryRow.push(
        `${summaryStats.totalAttendedEntries} lượt có mặt`,
        '',
        `TB ${summaryStats.avgRate}%`
      );
      dataRows.push(summaryRow);

      // Chuyển mảng 2 chiều thành worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(dataRows);

      // Căn chỉnh độ rộng cột (!cols)
      const cols = [
        { wch: 6 },   // STT
        { wch: 26 },  // Họ & Tên Học Sinh
        { wch: 15 },  // SĐT
      ];
      sessions.forEach(() => {
        cols.push({ wch: 15 }); // Mỗi buổi học
      });
      cols.push(
        { wch: 18 },  // Số buổi đi học
        { wch: 15 },  // Số buổi vắng
        { wch: 15 }   // Tỷ lệ đi học
      );
      worksheet['!cols'] = cols;

      // Tạo workbook và xuất file
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Diem_Danh');

      // Tên file sạch đẹp không dấu
      const rawName = (khoaHoc?.tenKhoaHoc || lopHoc?.tenLop || 'Diem_Danh')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_');
      const today = new Date().toISOString().slice(0, 10);
      const fileName = `Bang_Diem_Danh_${rawName}_${today}.xlsx`;

      XLSX.writeFile(workbook, fileName);
      thongBao.success(`Đã xuất file Excel điểm danh: ${fileName}`);
    } catch (err) {
      console.error('Lỗi khi xuất file Excel điểm danh:', err);
      thongBao.error('Có lỗi xảy ra khi tạo file Excel điểm danh.');
    }
  };

  return (
    <div className={`${styles.container} ${isDark ? styles.containerDark : ''}`}>
      {/* ── HEADER BANNER ── */}
      <div className={`droplet-card ${styles.headerBanner}`}>
        <div className={styles.headerLeftCluster}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              title="Quay lại danh sách buổi học"
              className={styles.btnBack}
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div className={styles.headerIcon}>
            <FileSpreadsheet size={24} />
          </div>

          <div>
            <div className={styles.headerTitleRow}>
              <h2 className={styles.headerTitle}>
                Bảng Tổng Hợp Điểm Danh • {khoaHoc?.tenKhoaHoc || 'Khóa học đào tạo'}
              </h2>
              <span className={`badge badge-info ${styles.headerBadge}`}>
                {lopHoc?.tenLop || 'Lớp đào tạo'}
              </span>
            </div>
            <p className={styles.headerSubtitle}>
              Cơ sở: <strong className={styles.textBranch}>{chiNhanh?.tenCn || lopHoc?.tenChiNhanh || 'Chi nhánh'}</strong> • Tổng số: <strong className={styles.textGreen}>{students.length}</strong> học sinh • <strong className={styles.textBlue}>{sessions.length}</strong> buổi học
            </p>
          </div>
        </div>

        {/* Nút tác vụ nhanh: Làm mới & Xuất Excel */}
        <div className={styles.headerActionsRight}>
          <button
            type="button"
            onClick={handleExportExcel}
            className={styles.btnExport}
            title="Xuất bảng điểm danh tổng hợp ra file Excel (.xlsx)"
          >
            <FileSpreadsheet size={15} />
            <span>Xuất Excel</span>
          </button>

          <button
            type="button"
            onClick={fetchData}
            className={styles.btnRefresh}
            title="Tải lại dữ liệu điểm danh mới nhất"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Làm Mới</span>
          </button>
        </div>
      </div>

      {/* ── CARDS THỐNG KÊ TỔNG QUAN & CHÚ THÍCH MÀU SẮC ── */}
      <div className={styles.statsGrid}>
        {/* Card 1: Tổng Sĩ Số Học Sinh */}
        <div className={`droplet-card ${styles.statCard}`}>
          <div className={styles.statIconBlue}>
            <Users size={22} />
          </div>
          <div>
            <div className={styles.statLabel}>
              Sĩ Số Học Sinh
            </div>
            <div className={styles.statValue}>
              {summaryStats.totalStudents} <span className={styles.statValueUnit}>học sinh</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tiến Độ Buổi Học */}
        <div className={`droplet-card ${styles.statCard}`}>
          <div className={styles.statIconAmber}>
            <Calendar size={22} />
          </div>
          <div>
            <div className={styles.statLabel}>
              Tiến Độ Buổi Học
            </div>
            <div className={styles.statValue}>
              {summaryStats.recordedSessionCount} / {summaryStats.totalSessions} <span className={styles.statValueUnit}>buổi đã ĐD</span>
            </div>
          </div>
        </div>

        {/* Card 3: Tỷ Lệ Chuyên Cần Khóa */}
        <div className={`droplet-card ${styles.statCard}`}>
          <div className={styles.statIconEmerald}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div className={styles.statLabel}>
              Tỷ Lệ Chuyên Cần
            </div>
            <div className={`${styles.statValue} ${summaryStats.avgRate >= 80 ? styles.statValueRateHigh : styles.statValueRateMedium}`}>
              {summaryStats.avgRate}% <span className={styles.statValueUnit}>toàn khóa</span>
            </div>
          </div>
        </div>

        {/* Card 4: Chú thích màu sắc (Legend) */}
        <div className={`droplet-card ${styles.legendCard}`}>
          <div className={styles.legendTitle}>
            Quy Ước Điểm Danh:
          </div>
          <div className={styles.legendTagsGroup}>
            <span className={styles.legendTagGreen}>
              <Check size={12} strokeWidth={3} /> Đi học
            </span>

            <span className={styles.legendTagRed}>
              <X size={12} strokeWidth={3} /> Vắng
            </span>

            <span className={styles.legendTagGray}>
              • Chưa ĐD
            </span>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR: TÌM KIẾM & BỘ LỌC ── */}
      <div className={`droplet-card ${styles.toolbarCard}`}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo tên học sinh hoặc SĐT..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Lọc học sinh:</span>

          <button
            type="button"
            onClick={() => setFilterMode('ALL')}
            className={`${styles.filterBtn} ${filterMode === 'ALL' ? styles.filterBtnAllActive : ''}`}
          >
            Tất cả ({studentStats.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('DAY_DU')}
            className={`${styles.filterBtn} ${filterMode === 'DAY_DU' ? styles.filterBtnDayDuActive : ''}`}
          >
            Đi học 100% ({studentStats.filter(s => s.recorded > 0 && s.absent === 0).length})
          </button>

          <button
            type="button"
            onClick={() => setFilterMode('VANG_NHIEU')}
            className={`${styles.filterBtn} ${filterMode === 'VANG_NHIEU' ? styles.filterBtnVangActive : ''}`}
          >
            Vắng ≥ 2 buổi ({studentStats.filter(s => s.absent >= 2).length})
          </button>
        </div>
      </div>

      {/* ── BẢNG MA TRẬN ĐIỂM DANH (ATTENDANCE MATRIX GRID) ── */}
      {loading ? (
        <div className={`droplet-card ${styles.stateCard}`}>
          <RefreshCw size={36} className={`animate-spin ${styles.stateSpinner}`} />
          <p className={styles.stateTitle}>Đang nạp ma trận tổng hợp điểm danh...</p>
          <p className={styles.stateDesc}>Hệ thống đang đối chiếu dữ liệu buổi học và danh sách học sinh</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className={`droplet-card ${styles.stateCard}`}>
          <Calendar size={44} className={styles.stateIcon} />
          <p className={styles.stateTitle}>Khóa học này chưa có buổi học nào</p>
          <p className={styles.stateDesc}>Vui lòng tạo buổi học trước khi xem bảng tổng hợp điểm danh.</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className={`droplet-card ${styles.stateCard}`}>
          <Users size={44} className={styles.stateIcon} />
          <p className={styles.stateTitle}>Không tìm thấy học sinh phù hợp</p>
          <p className={styles.stateDesc}>Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc.</p>
        </div>
      ) : (
        <div className={`droplet-card ${styles.tableCard}`}>
          <div className={styles.tableScrollContainer}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeadRow}>
                  {/* Cột 1: STT (Sticky) */}
                  <th className={styles.thStt}>
                    STT
                  </th>

                  {/* Cột 2: Họ & Tên Học Sinh (Sticky) */}
                  <th className={styles.thStudent}>
                    Họ & Tên Học Sinh
                  </th>

                  {/* CÁC CỘT HÀNG NGANG: TỪNG BUỔI HỌC (Buổi 1, 2, ..., N) */}
                  {sessions.map((buoi, idx) => {
                    const bNum = buoi.soThuTu || idx + 1;
                    const dateStr = formatDate(buoi.ngayHoc);
                    const bStats = sessionStats.get(buoi.idBuoiHoc);
                    const hasData = bStats && bStats.total > 0;

                    return (
                      <th
                        key={buoi.idBuoiHoc || idx}
                        className={styles.thSession}
                      >
                        <div className={styles.thSessionContent}>
                          <div className={styles.thSessionTop}>
                            <span className={styles.thSessionNum}>
                              B.{bNum}
                            </span>
                            {onDiemDanhBuoiHoc && (
                              <button
                                type="button"
                                onClick={() => onDiemDanhBuoiHoc(buoi)}
                                title={`Mở điểm danh Buổi ${bNum}`}
                                className={styles.thSessionBtn}
                              >
                                ĐD
                              </button>
                            )}
                          </div>
                          <span className={styles.thSessionDate}>
                            {dateStr}
                          </span>
                          {hasData && (
                            <span className={bStats.rate >= 80 ? styles.thSessionBadgeGreen : styles.thSessionBadgeAmber}>
                              {bStats.countAttended}/{bStats.total} ({bStats.rate}%)
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}

                  {/* CỘT PHÍA CUỐI: SỐ BUỔI HỌC SINH ĐI HỌC (THEO YÊU CẦU NGƯỜI DÙNG) */}
                  <th className={styles.thFinalAttend}>
                    Số Buổi Đi Học
                  </th>

                  {/* Cột Số buổi Vắng */}
                  <th className={styles.thFinalAbsent}>
                    Số Buổi Vắng
                  </th>

                  {/* Cột Tỷ Lệ Đi Học */}
                  <th className={styles.thFinalRate}>
                    Tỷ Lệ Đi Học
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((hs, index) => {
                  const avatarLetter = (hs.hoTen || '?').charAt(0).toUpperCase();
                  const rowClass = index % 2 === 0 ? styles.trEven : styles.trOdd;
                  const isFemale = hs.gioiTinh === 'F';

                  return (
                    <tr
                      key={hs.idHs}
                      className={rowClass}
                    >
                      {/* Cột STT */}
                      <td className={styles.tdStt}>
                        {index + 1}
                      </td>

                      {/* Cột Họ & Tên Học Sinh (Kèm Avatar) */}
                      <td className={styles.tdStudent}>
                        <div className={styles.studentInfo}>
                          <div 
                            onClick={() => {
                              if (onSelectHocSinh) onSelectHocSinh(hs);
                              else navigate('/hoc-sinh', { state: { selectedHocSinhId: hs.idHs, hocSinh: hs } });
                            }}
                            className={`${styles.studentAvatar} ${isFemale ? styles.avatarFemale : styles.avatarMale}`}
                            title="Xem chi tiết học sinh"
                          >
                            {avatarLetter}
                          </div>
                          <div className={styles.studentNameCol}>
                            <span 
                              onClick={() => {
                                if (onSelectHocSinh) onSelectHocSinh(hs);
                                else navigate('/hoc-sinh', { state: { selectedHocSinhId: hs.idHs, hocSinh: hs } });
                              }}
                              className={styles.studentNameLink}
                              title="Nhấp vào chữ để xem thông tin chi tiết học sinh"
                            >
                              {hs.hoTen}
                            </span>
                            {hs.sdt && (
                              <span className={styles.studentPhone}>
                                {hs.sdt}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CÁC Ô ĐIỂM DANH TỪNG BUỔI HỌC: MÀU XANH LÀ ĐI HỌC, ĐỎ LÀ VẮNG */}
                      {sessions.map((buoi) => {
                        const status = attendanceLookup.get(`${hs.idHs}_${buoi.idBuoiHoc}`);

                        if (status === true) {
                          // MÀU XANH: ĐI HỌC (CÓ MẶT)
                          return (
                            <td
                              key={buoi.idBuoiHoc}
                              className={styles.tdSession}
                            >
                              <div 
                                className={styles.badgeCheckGreen}
                                title={`${hs.hoTen} - Buổi ${buoi.soThuTu || ''}: Có mặt`}
                              >
                                <Check size={16} strokeWidth={3} />
                              </div>
                            </td>
                          );
                        } else if (status === false) {
                          // MÀU ĐỎ: VẮNG HỌC
                          return (
                            <td
                              key={buoi.idBuoiHoc}
                              className={styles.tdSession}
                            >
                              <div 
                                className={styles.badgeXRed}
                                title={`${hs.hoTen} - Buổi ${buoi.soThuTu || ''}: Vắng mặt`}
                              >
                                <X size={16} strokeWidth={3} />
                              </div>
                            </td>
                          );
                        } else {
                          // CHƯA ĐIỂM DANH / CHƯA DIỄN RA
                          return (
                            <td
                              key={buoi.idBuoiHoc}
                              className={styles.tdSession}
                            >
                              <span 
                                className={styles.dotUnrecorded}
                                title={`Buổi ${buoi.soThuTu || ''}: Chưa có dữ liệu điểm danh`}
                              >
                                •
                              </span>
                            </td>
                          );
                        }
                      })}

                      {/* CỘT PHÍA CUỐI: SỐ BUỔI HỌC SINH ĐI HỌC */}
                      <td className={index % 2 === 0 ? styles.tdTotalAttendEven : styles.tdTotalAttendOdd}>
                        <span className={styles.totalAttendPill}>
                          {hs.attended} <span className={styles.statValueUnit}>/ {sessions.length} buổi</span>
                        </span>
                      </td>

                      {/* Cột Số buổi Vắng */}
                      <td className={index % 2 === 0 ? styles.tdTotalAbsentEven : styles.tdTotalAbsentOdd}>
                        <span className={hs.absent > 0 ? styles.totalAbsentPillRed : styles.totalAbsentPill}>
                          {hs.absent} buổi
                        </span>
                      </td>

                      {/* Cột Tỷ Lệ Đi Học (%) */}
                      <td className={index % 2 === 0 ? styles.tdTotalRateEven : styles.tdTotalRateOdd}>
                        <div className={styles.rateWrapper}>
                          <span className={`${styles.rateText} ${hs.rate >= 80 ? styles.rateTextGreen : hs.rate >= 50 ? styles.rateTextAmber : styles.rateTextRed}`}>
                            {hs.recorded > 0 ? `${hs.rate}%` : '--'}
                          </span>
                          {/* Mini Progress Bar */}
                          <div className={styles.miniProgressBg}>
                            <div 
                              className={`${styles.miniProgressFill} ${hs.rate >= 80 ? styles.fillGreen : hs.rate >= 50 ? styles.fillAmber : styles.fillRed}`}
                              style={{ width: `${hs.rate}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* ── FOOTER: DÒNG TỔNG KẾT SĨ SỐ ĐI HỌC TỪNG BUỔI ── */}
              <tfoot>
                <tr className={styles.tableFootRow}>
                  <td
                    colSpan={3}
                    className={styles.tdFootLabel}
                  >
                    Tổng Sĩ Số Đi Học / Buổi:
                  </td>

                  {/* Từng buổi: tổng đi học */}
                  {sessions.map((buoi) => {
                    const bStats = sessionStats.get(buoi.idBuoiHoc);
                    return (
                      <td
                        key={buoi.idBuoiHoc}
                        className={styles.tdFootSession}
                      >
                        {bStats && bStats.total > 0 ? (
                          <div className={styles.footSessionWrapper}>
                            <span className={styles.footSessionCount}>
                              {bStats.countAttended}
                            </span>
                            <span className={styles.footSessionTotal}>
                              /{bStats.total}
                            </span>
                          </div>
                        ) : (
                          <span className={styles.footSessionDash}>--</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Tổng kết cuối: Tổng số lượt */}
                  <td className={styles.tdFootAttend}>
                    {summaryStats.totalAttendedEntries} lượt
                  </td>

                  <td className={styles.tdFootAbsent}>
                    --
                  </td>

                  <td className={styles.tdFootRate}>
                    TB {summaryStats.avgRate}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TongHopDiemDanhKhoaHocView;
