import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Save, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowLeft, 
  RefreshCw, 
  Sparkles,
  Phone,
  UserCheck,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { Button, MetalButton } from '@/components/ui/liquid-glass-button';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import { dichVuGiaoVien } from '../../dich_vu/dichVuGiaoVien';
import { useComponentTheme } from '../../trang_thai/useComponentTheme';
import styles from './DiemDanhBuoiHocView.module.css';

/**
 * Component Điểm Danh Buổi Học dạng Tái Sử Dụng trong Navigation Stack (có Rollback)
 * - Thay thế cửa sổ popup modal che mờ màn hình
 * - Hiển thị toàn bộ danh sách học sinh thuộc Khóa học & Lớp học
 * - Click từng học sinh để chuyển đổi trạng thái: Đi học (bit 1) / Vắng (bit 0)
 * - Nút "Lưu Điểm Danh" (Save) gửi idKhoaHoc và listIdHocSinh đi học
 * - Hỗ trợ Rollback [<- Quay lại] mượt mà
 */
const DiemDanhBuoiHocView = ({
  buoiHoc,
  khoaHoc,
  lopHoc,
  chiNhanh,
  onAttendanceSaved,
  onBack
}) => {
  const { mode, applyToCards } = useComponentTheme();
  const isDark = mode === 'DARK' && applyToCards;

  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'CO_MAT' | 'VANG_MAT'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [thongBao, setThongBao] = useState(null);

  const idBuoiHoc = buoiHoc?.idBuoiHoc;
  const idKhoaHoc = khoaHoc?.idKhoaHoc || buoiHoc?.idKhoaHoc || buoiHoc?.khoaHoc?.idKhoaHoc || lopHoc?.idKhoaHoc;
  const idLop = lopHoc?.idLop || buoiHoc?.idLop || buoiHoc?.lopHoc?.idLop;

  // 1. Tải danh sách học sinh và kết quả điểm danh cũ của buổi học
  const fetchData = useCallback(async () => {
    if (!idBuoiHoc) return;
    setLoading(true);
    setThongBao(null);

    try {
      // 1.1. Tải bản ghi điểm danh hiện có của buổi học từ DB
      let existingAttendance = [];
      try {
        const resAtt = await dichVuDaoTaoChung.getDiemDanhBuoiHoc(idBuoiHoc);
        existingAttendance = Array.isArray(resAtt) ? resAtt : (resAtt?.data || []);
      } catch (e) {
        console.warn('Chưa có dữ liệu điểm danh buổi học:', e);
      }

      // 1.2. Tải học sinh theo khóa học
      let rawStudents = [];
      if (idKhoaHoc) {
        try {
          const resHs = await dichVuGiaoVien.getHocSinhKhoaHoc(idKhoaHoc);
          rawStudents = Array.isArray(resHs) ? resHs : (resHs?.data || []);
        } catch (e) {
          console.warn('Lỗi tải học sinh khóa học:', e);
        }
      }

      // 1.3. Nếu rỗng, tải học sinh từ đăng ký lớp học
      if (rawStudents.length === 0 && idLop) {
        try {
          const resDk = await dichVuDaoTaoChung.getDangKyHocTheoLop(idLop);
          rawStudents = Array.isArray(resDk) ? resDk : (resDk?.data || []);
        } catch (e) {
          console.warn('Lỗi tải học sinh theo lớp:', e);
        }
      }

      // Chuẩn hóa danh sách học sinh
      const studentMap = new Map();
      rawStudents.forEach((item) => {
        const hs = item.hocSinh || item;
        const id = hs.idHs || item.idHs;
        if (id && !studentMap.has(id)) {
          studentMap.set(id, {
            idHs: id,
            hoTen: hs.hoTen || item.hoTen || `Học sinh #${id}`,
            sdt: hs.soDienThoai || hs.sdt || item.sdt || '',
            email: hs.email || item.email || '',
            gioiTinh: hs.gioiTinh || item.gioiTinh || 'M'
          });
        }
      });

      // Bổ sung học sinh từ điểm danh cũ nếu chưa có trong danh sách
      existingAttendance.forEach((att) => {
        const hs = att.hocSinh;
        const id = hs?.idHs || att.idHs;
        if (id && !studentMap.has(id)) {
          studentMap.set(id, {
            idHs: id,
            hoTen: hs?.hoTen || `Học sinh #${id}`,
            sdt: hs?.soDienThoai || hs?.sdt || '',
            email: '',
            gioiTinh: 'M'
          });
        }
      });

      const fullList = Array.from(studentMap.values());
      setStudents(fullList);

      // Khởi tạo map trạng thái điểm danh
      // Nếu buổi học đã có bản ghi -> nạp trạng thái cũ; nếu chưa có -> mặc định toàn bộ Có mặt (true)
      const initialMap = {};
      const hasExistingRecords = existingAttendance.length > 0;

      fullList.forEach((s) => {
        if (hasExistingRecords) {
          const found = existingAttendance.find((a) => (a.hocSinh?.idHs || a.idHs) === s.idHs);
          if (found) {
            const isPresent = found.trangThai === true || found.trangThai === 1 || found.trangThai === '1' || found.trangThai === 'CoMat';
            initialMap[s.idHs] = isPresent;
          } else {
            initialMap[s.idHs] = false; // Học sinh chưa có bản ghi cũ mặc định vắng
          }
        } else {
          // Buổi mới khởi tạo: Mặc định tất cả Có mặt để giáo viên điểm danh nhanh
          initialMap[s.idHs] = true;
        }
      });

      setAttendanceMap(initialMap);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu điểm danh:', err);
      setThongBao({ type: 'error', text: 'Không thể tải danh sách học sinh của buổi học. Vui lòng tải lại trang!' });
    } finally {
      setLoading(false);
    }
  }, [idBuoiHoc, idKhoaHoc, idLop]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Click vào từng học sinh để bật / tắt trạng thái đi học (bit 1 / bit 0)
  const handleToggleStudent = (idHs) => {
    setAttendanceMap(prev => ({
      ...prev,
      [idHs]: !prev[idHs]
    }));
  };

  // Nhanh: Đặt tất cả thành Có mặt
  const handleAllPresent = () => {
    setAttendanceMap(prev => {
      const next = { ...prev };
      students.forEach(s => {
        next[s.idHs] = true;
      });
      return next;
    });
  };

  // Nhanh: Đặt tất cả thành Vắng mặt
  const handleAllAbsent = () => {
    setAttendanceMap(prev => {
      const next = { ...prev };
      students.forEach(s => {
        next[s.idHs] = false;
      });
      return next;
    });
  };

  // Lưu điểm danh buổi học
  const handleSaveAttendance = async () => {
    if (!idBuoiHoc) {
      setThongBao({ type: 'error', text: 'Chưa xác định Buổi học cần lưu điểm danh.' });
      return;
    }

    setSaving(true);
    setThongBao(null);

    try {
      // Lọc danh sách ID các học sinh có mặt / đi học (bit 1)
      const listIdHocSinhDiHoc = Object.entries(attendanceMap)
        .filter(([_, isPresent]) => isPresent === true)
        .map(([idHsStr]) => Number(idHsStr));

      const payload = {
        idKhoaHoc: idKhoaHoc,
        listIdHocSinh: listIdHocSinhDiHoc
      };

      await dichVuDaoTaoChung.luuDiemDanhBuoiHoc(idBuoiHoc, payload);

      const soDiHoc = listIdHocSinhDiHoc.length;
      const soVang = students.length - soDiHoc;

      setThongBao({ 
        type: 'success', 
        text: `Đã lưu điểm danh thành công cho ${students.length} học sinh (Đi học: ${soDiHoc}, Vắng: ${soVang})!` 
      });

      if (onAttendanceSaved) {
        onAttendanceSaved();
      }
    } catch (err) {
      console.error('Lỗi khi lưu điểm danh:', err);
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra khi lưu kết quả điểm danh.';
      setThongBao({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  // Thống kê thời gian thực
  const stats = useMemo(() => {
    let coMat = 0;
    let vang = 0;
    Object.values(attendanceMap).forEach(val => {
      if (val === true) coMat++;
      else vang++;
    });
    const total = students.length;
    const tyLe = total > 0 ? Math.round((coMat / total) * 100) : 0;
    return { total, coMat, vang, tyLe };
  }, [attendanceMap, students]);

  const filteredStudents = useMemo(() => {
    if (filterMode === 'CO_MAT') {
      return students.filter(s => attendanceMap[s.idHs] === true);
    }
    if (filterMode === 'VANG_MAT') {
      return students.filter(s => !attendanceMap[s.idHs]);
    }
    return students;
  }, [students, attendanceMap, filterMode]);

  return (
    <div className={styles.container}>
      
      {/* ── 1. HEADER CHÍNH ── */}
      <div className={`droplet-card ${styles.headerCard} ${isDark ? styles.headerCardDark : ''}`}>
        <div className={styles.headerLeft}>
          <div className={`${styles.headerIconBox} ${isDark ? styles.headerIconBoxDark : ''}`}>
            <CheckCircle2 size={28} />
          </div>
          <div>
            <div className={styles.titleRow}>
              <h2 className={`${styles.headerTitle} ${isDark ? styles.headerTitleDark : ''}`}>
                Điểm Danh Buổi Học {buoiHoc?.soThuTu ? `(Buổi ${buoiHoc.soThuTu})` : ''}
              </h2>
              <span className={`badge badge-success ${styles.headerBadge}`}>
                {khoaHoc?.tenKhoaHoc || 'Khóa học'}
              </span>
              <span className={`badge badge-info ${styles.headerBadge}`}>
                {lopHoc?.tenLop || 'Lớp học'}
              </span>
            </div>
            <div className={`${styles.metaRow} ${isDark ? styles.metaRowDark : ''}`}>
              <span className={styles.metaItem}>
                <Calendar size={13} className={styles.metaIconBlue} />
                Ngày: <strong className={isDark ? styles.metaValueDark : styles.metaValue}>{buoiHoc?.ngayHoc || 'Hôm nay'}</strong>
              </span>
              {buoiHoc?.caHoc && (
                <span className={styles.metaItem}>
                  <Clock size={13} className={styles.metaIconOrange} />
                  Ca học: <strong className={isDark ? styles.metaValueDark : styles.metaValue}>Ca {buoiHoc.caHoc}</strong>
                </span>
              )}
              <span className={styles.metaItem}>
                <MapPin size={13} className={styles.metaIconGreen} />
                {buoiHoc?.tenPhong || chiNhanh?.tenCn || 'Phòng học cơ sở'}
              </span>
            </div>
          </div>
        </div>

        {/* Cụm nút tác vụ: Nhanh + Nút Save + Quay lại */}
        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={handleAllPresent}
            className={`droplet-pill ${styles.btnAllPresent} ${isDark ? styles.btnAllPresentDark : ''}`}
            title="Đánh dấu tất cả học sinh đi học"
          >
            <Check size={14} strokeWidth={2.5} />
            <span>Tất Cả Có Mặt</span>
          </button>

          <button
            type="button"
            onClick={handleAllAbsent}
            className={`droplet-pill ${styles.btnAllAbsent} ${isDark ? styles.btnAllAbsentDark : ''}`}
            title="Đánh dấu tất cả học sinh vắng"
          >
            <X size={14} strokeWidth={2.5} />
            <span>Tất Cả Vắng</span>
          </button>

          {/* Nút LƯU ĐIỂM DANH (Save) */}
          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={saving || loading}
            className={styles.btnSave}
          >
            <Save size={16} />
            <span>{saving ? 'Đang lưu...' : 'Lưu Điểm Danh'}</span>
          </button>

          {/* Nút Quay lại Rollback */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className={`droplet-pill ${styles.btnBack} ${isDark ? styles.btnBackDark : ''}`}
            >
              <ArrowLeft size={15} />
              <span>Quay Lại</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 2. THÔNG BÁO KẾT QUẢ ── */}
      {thongBao && (
        <div className={`${styles.alertBanner} ${
          thongBao.type === 'success'
            ? (isDark ? styles.alertSuccessDark : styles.alertSuccess)
            : (isDark ? styles.alertErrorDark : styles.alertError)
        }`}>
          {thongBao.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{thongBao.text}</span>
        </div>
      )}

      {/* ── 3. THỐNG KÊ NHANH & BỘ LỌC TÌM KIẾM ── */}
      <div className={styles.statsGrid}>
        {/* Thẻ 1: Tổng số học sinh */}
        <div 
          className={`droplet-card ${styles.statCard} ${isDark ? styles.statTotalDark : styles.statTotal} ${filterMode === 'ALL' ? styles.statActiveBorder : ''}`}
          onClick={() => setFilterMode('ALL')}
          title="Bấm để hiển thị tất cả học sinh"
        >
          <div className={`${styles.statIconBoxTotal} ${isDark ? styles.statIconBoxTotalDark : ''}`}>
            <Users size={20} />
          </div>
          <div>
            <div className={isDark ? styles.statLabelTotalDark : styles.statLabelTotal}>SĨ SỐ LỚP</div>
            <div className={isDark ? styles.statValueTotalDark : styles.statValueTotal}>
              {stats.total} <span className={styles.statUnit}>học sinh</span>
            </div>
          </div>
        </div>

        {/* Thẻ 2: Có mặt (Đi học - Bit 1) */}
        <div 
          className={`droplet-card ${styles.statCard} ${isDark ? styles.statPresentDark : styles.statPresent} ${filterMode === 'CO_MAT' ? styles.statActiveBorder : ''}`}
          onClick={() => setFilterMode(prev => prev === 'CO_MAT' ? 'ALL' : 'CO_MAT')}
          title="Bấm để lọc danh sách học sinh có mặt"
        >
          <div className={`${styles.statIconBoxPresent} ${isDark ? styles.statIconBoxPresentDark : ''}`}>
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className={isDark ? styles.statLabelPresentDark : styles.statLabelPresent}>CÓ MẶT (ĐI HỌC - BIT 1)</div>
            <div className={isDark ? styles.statValuePresentDark : styles.statValuePresent}>
              {stats.coMat} <span className={styles.statUnit}>({stats.tyLe}%)</span>
            </div>
          </div>
        </div>

        {/* Thẻ 3: Vắng mặt (Bit 0) */}
        <div 
          className={`droplet-card ${styles.statCard} ${isDark ? styles.statAbsentDark : styles.statAbsent} ${filterMode === 'VANG_MAT' ? styles.statActiveBorder : ''}`}
          onClick={() => setFilterMode(prev => prev === 'VANG_MAT' ? 'ALL' : 'VANG_MAT')}
          title="Bấm để lọc danh sách học sinh vắng mặt"
        >
          <div className={`${styles.statIconBoxAbsent} ${isDark ? styles.statIconBoxAbsentDark : ''}`}>
            <XCircle size={20} />
          </div>
          <div>
            <div className={isDark ? styles.statLabelAbsentDark : styles.statLabelAbsent}>VẮNG MẶT (BIT 0)</div>
            <div className={isDark ? styles.statValueAbsentDark : styles.statValueAbsent}>
              {stats.vang} <span className={styles.statUnit}>học sinh</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. DANH SÁCH HỌC SINH DẠNG Ô VUÔNG (CLICK ĐỂ ĐỔI TRẠNG THÁI) ── */}
      {loading ? (
        <div className={`${styles.stateBox} ${isDark ? styles.stateBoxDark : ''}`}>
          <RefreshCw size={24} className={`animate-spin ${styles.loadingSpinner}`} />
          <p>Đang tải danh sách học sinh và dữ liệu điểm danh...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className={`droplet-card ${styles.emptyCard} ${isDark ? styles.emptyCardDark : styles.emptyCardLight}`}>
          <Users size={40} className={styles.emptyIcon} />
          <p className={isDark ? styles.emptyTextDark : styles.emptyText}>
            {students.length === 0 
              ? 'Chưa có học sinh nào trong buổi học này' 
              : 'Không có học sinh nào phù hợp với bộ lọc hiện tại'}
          </p>
        </div>
      ) : (
        <div className={styles.studentsGrid}>
          {filteredStudents.map((hs, idx) => {
            const isPresent = !!attendanceMap[hs.idHs];
            const tileThemeClass = isPresent
              ? (isDark ? styles.tilePresentDark : styles.tilePresentLight)
              : (isDark ? styles.tileAbsentDark : styles.tileAbsentLight);
            const badgeThemeClass = isPresent
              ? (isDark ? styles.badgePresentDark : styles.badgePresentLight)
              : (isDark ? styles.badgeAbsentDark : styles.badgeAbsentLight);
            const nameThemeClass = isPresent
              ? (isDark ? styles.namePresentDark : styles.namePresentLight)
              : (isDark ? styles.nameAbsentDark : styles.nameAbsentLight);

            return (
              <div
                key={hs.idHs || idx}
                onClick={() => handleToggleStudent(hs.idHs)}
                className={`droplet-card ${styles.studentTile} ${tileThemeClass}`}
                title={`Click để chuyển sang ${isPresent ? 'Vắng mặt' : 'Có mặt'}`}
              >
                {/* Icon trạng thái góc trên bên phải */}
                <div className={`${styles.statusIconBadge} ${badgeThemeClass}`}>
                  {isPresent ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
                </div>

                {/* Tên học sinh */}
                <div className={`${styles.studentName} ${nameThemeClass}`}>
                  {hs.hoTen}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 6. FOOTER HÀNH ĐỘNG DƯỚI CÙNG ── */}
      <div className={`droplet-card ${styles.footerCard} ${isDark ? styles.footerCardDark : styles.footerCardLight}`}>
        <div className={isDark ? styles.footerInfoDark : styles.footerInfo}>
          Đang chọn: <strong className={isDark ? styles.footerCountGreenDark : styles.footerCountGreen}>{stats.coMat}</strong> đi học • <strong className={isDark ? styles.footerCountRedDark : styles.footerCountRed}>{stats.vang}</strong> vắng trên tổng số <strong className={isDark ? styles.footerCountTotalDark : styles.footerCountTotal}>{stats.total}</strong> học sinh
        </div>

        <div className={styles.footerActions}>
          {onBack && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onBack}
              disabled={saving}
            >
              Quay Lại Danh Sách
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSaveAttendance}
            disabled={saving || loading}
            className={styles.btnSaveFooter}
          >
            <Save size={16} />
            <span>{saving ? 'Đang lưu điểm danh...' : 'Lưu Điểm Danh (Save)'}</span>
          </Button>
        </div>
      </div>

    </div>
  );
};

export default DiemDanhBuoiHocView;
