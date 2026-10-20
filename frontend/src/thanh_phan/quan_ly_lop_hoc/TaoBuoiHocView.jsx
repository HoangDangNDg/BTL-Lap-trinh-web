import React, { useState, useEffect } from 'react';
import { 
  CalendarPlus, 
  Clock, 
  MapPin, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Layers,
  Building2,
  Lock
} from 'lucide-react';
import { Button, MetalButton } from '@/components/ui/liquid-glass-button';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import { useNamHocKyHocStore, timTuanHocTheoThoiGianThuc } from '../../trang_thai/useNamHocKyHocStore';
import styles from './TaoBuoiHocView.module.css';

const CA_CONFIG = {
  1: { label: 'Ca 1 (Sáng)', time: '07:30 - 09:30', start: '07:30:00', end: '09:30:00' },
  2: { label: 'Ca 2 (Sáng)', time: '09:45 - 11:45', start: '09:45:00', end: '11:45:00' },
  3: { label: 'Ca 3 (Chiều)', time: '13:30 - 15:30', start: '13:30:00', end: '15:30:00' },
  4: { label: 'Ca 4 (Chiều)', time: '15:45 - 17:45', start: '15:45:00', end: '17:45:00' },
  5: { label: 'Ca 5 (Tối)', time: '18:00 - 20:00', start: '18:00:00', end: '20:00:00' },
  6: { label: 'Ca 6 (Tối)', time: '20:15 - 22:00', start: '20:15:00', end: '22:00:00' },
};

/**
 * Tự động xác định Ca học khớp với thời gian thực
 */
export const xacDinhCaHocTheoThoiGianThuc = (d = new Date()) => {
  const minutes = d.getHours() * 60 + d.getMinutes();
  if (minutes < 570) return 1;          // Trước 09:30 -> Ca 1 (07:30 - 09:30)
  if (minutes < 705) return 2;          // 09:30 - 11:45 -> Ca 2 (09:45 - 11:45)
  if (minutes < 930) return 3;          // 11:45 - 15:30 -> Ca 3 (13:30 - 15:30)
  if (minutes < 1065) return 4;         // 15:30 - 17:45 -> Ca 4 (15:45 - 17:45)
  if (minutes < 1200) return 5;         // 17:45 - 20:00 -> Ca 5 (18:00 - 20:00)
  return 6;                             // Sau 20:00 -> Ca 6 (20:15 - 22:00)
};

const formatNgayHienTai = (d = new Date()) => {
  const thuNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const thuStr = thuNames[d.getDay()];
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy} (${thuStr})`;
};

/**
 * Component Tạo Buổi Học trực tiếp trong Navigation Stack
 * - Tự động điền trước thông số (Buổi tiếp theo, Tuần hiện tại, Ca học, Phòng học)
 * - Gọi API luuBuoiHoc
 * - Khi tạo thành công: Tự động chuyển bước sang trang Điểm Danh Buổi Học
 */
const TaoBuoiHocView = ({
  lopHoc,
  khoaHoc,
  chiNhanh,
  soThuTu = 1,
  onTaoThanhCong,
  onBack
}) => {
  const { tuanHocList: storeTuanList, selectedTuanHocId, selectedNamHocId, namHocList } = useNamHocKyHocStore();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Ca học tự động khớp theo thời gian thực - CỐ ĐỊNH không cho thay đổi
  const realtimeCa = xacDinhCaHocTheoThoiGianThuc(today);
  const caHoc = realtimeCa;
  const gioBatDau = CA_CONFIG[realtimeCa]?.start.substring(0, 5) || '07:30';
  const gioKetThuc = CA_CONFIG[realtimeCa]?.end.substring(0, 5) || '09:30';

  const [phongList, setPhongList] = useState([]);
  const [selectedPhongId, setSelectedPhongId] = useState(null);
  const [selectedTuan, setSelectedTuan] = useState(null);
  const [noiDung, setNoiDung] = useState(`Bài #${soThuTu}: Nội dung giảng dạy theo tiến trình khóa học`);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [thongBao, setThongBao] = useState(null);

  // Tải danh sách phòng học và xác định tuần học hiện tại đang có (Cố định không cho đổi)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setThongBao(null);
      try {
        const resPhongs = await dichVuDaoTaoChung.getDanhSachPhongHoc();

        // 1. Phòng học
        const itemsPhong = Array.isArray(resPhongs) ? resPhongs : ((resPhongs)?.data || []);
        const targetCnId = chiNhanh?.idCn || lopHoc?.idCn || lopHoc?.idChiNhanh;
        const filteredPhongs = targetCnId 
          ? itemsPhong.filter(p => p.idCn === targetCnId || p.chiNhanh?.idCn === targetCnId)
          : itemsPhong;
        
        const finalPhongs = filteredPhongs.length > 0 ? filteredPhongs : itemsPhong;
        setPhongList(finalPhongs);
        if (finalPhongs.length > 0) {
          setSelectedPhongId(finalPhongs[0].idPhong);
        }

        // 2. Tuần học: Lấy tuần học hiện tại đang có từ Store (Ảnh 2: "Tuần 2 Hiện tại")
        let itemsTuan = (storeTuanList && storeTuanList.length > 0) ? [...storeTuanList] : [];
        if (itemsTuan.length === 0) {
          const idKh = lopHoc?.idKh || lopHoc?.kyHoc?.idKh;
          if (idKh) {
            const resKyTuans = await dichVuDaoTaoChung.getTuanHocTheoKyHoc(idKh);
            itemsTuan = Array.isArray(resKyTuans) ? resKyTuans : ((resKyTuans)?.data || []);
          } else {
            const resAllTuans = await dichVuDaoTaoChung.getDanhSachTuanHoc();
            itemsTuan = Array.isArray(resAllTuans) ? resAllTuans : ((resAllTuans)?.data || []);
          }
        }

        // Ưu tiên chọn:
        // 1) Tuần đang được chọn trên Store toàn cục (selectedTuanHocId)
        // 2) Tuần khớp thời gian thực (timTuanHocTheoThoiGianThuc)
        // 3) Tuần đầu tiên
        const currentNamHoc = namHocList.find(nh => nh.idNh === selectedNamHocId);
        const realtimeTuan = timTuanHocTheoThoiGianThuc(
          itemsTuan,
          currentNamHoc?.ngayBatDau,
          currentNamHoc?.namBatDau,
          today
        );
        const targetTuan = itemsTuan.find(t => t.idTh === selectedTuanHocId) || realtimeTuan || itemsTuan[0];
        setSelectedTuan(targetTuan || null);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu khởi tạo tạo buổi học:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chiNhanh, lopHoc, selectedTuanHocId, storeTuanList, selectedNamHocId, namHocList]);

  // Submit tạo buổi học và chuyển sang trang điểm danh
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!lopHoc?.idLop) {
      setThongBao({ type: 'error', text: 'Chưa xác định lớp học cần tạo buổi.' });
      return;
    }
    const finalKhoaHocId = khoaHoc?.idKhoaHoc || lopHoc?.idKhoaHoc || lopHoc?.khoaHoc?.idKhoaHoc;
    if (!finalKhoaHocId) {
      setThongBao({ type: 'error', text: 'Chưa xác định khóa học cần tạo buổi.' });
      return;
    }
    if (!selectedTuan?.idTh) {
      setThongBao({ type: 'error', text: 'Chưa xác định được Tuần học hiện tại của hệ thống.' });
      return;
    }
    if (!selectedPhongId) {
      setThongBao({ type: 'error', text: 'Vui lòng chọn phòng học cho buổi dạy.' });
      return;
    }

    setSaving(true);
    setThongBao(null);

    try {
      const payload = {
        lopHoc: { idLop: lopHoc.idLop },
        khoaHoc: { idKhoaHoc: finalKhoaHocId },
        tuanHoc: { idTh: selectedTuan.idTh },
        idTh: selectedTuan.idTh,
        idTuan: selectedTuan.idTh,
        phongHoc: { idPhong: selectedPhongId },
        ngayHoc: todayStr,
        caHoc: caHoc,
        gioBatDau: `${gioBatDau}:00`,
        gioKetThuc: `${gioKetThuc}:00`,
        noiDung: noiDung.trim() || `Buổi học #${soThuTu} - Ngày ${todayStr} - Ca ${caHoc}`
      };

      const resBuoi = await dichVuDaoTaoChung.taoBuoiHoc(payload);
      const createdBuoi = resBuoi?.data || resBuoi;

      setThongBao({ type: 'success', text: `Tạo Buổi học #${soThuTu} thành công! Đang chuyển sang Điểm danh...` });

      setTimeout(() => {
        if (onTaoThanhCong) {
          onTaoThanhCong(createdBuoi || {
            ...payload,
            idBuoiHoc: createdBuoi?.idBuoiHoc,
            soThuTu
          });
        }
      }, 700);
    } catch (err) {
      console.error('Lỗi khi tạo buổi học:', err);
      const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi tạo buổi học. Vui lòng kiểm tra lại!';
      setThongBao({ type: 'error', text: msg });
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* ── HEADER THẺ KHỞI TẠO ── */}
      <div className={styles.headerCard}>
        <div className={styles.headerMainInfo}>
          <div className={styles.headerIconBox}>
            <CalendarPlus size={26} />
          </div>
          <div>
            <div className={styles.titleRow}>
              <h2 className={styles.headerTitle}>
                Tạo Buổi Học Mới • Buổi {soThuTu}
              </h2>
              <span className={`badge badge-info ${styles.badgeClassName}`}>
                {lopHoc?.tenLop || 'Lớp học'}
              </span>
            </div>
            <p className={styles.headerSubtitle}>
              Khóa: <strong className={styles.headerDarkText}>{khoaHoc?.tenKhoaHoc || 'Khóa học'}</strong> • Cơ sở: <strong className={styles.headerAccentText}>{chiNhanh?.tenCn || lopHoc?.tenChiNhanh || 'Chi nhánh'}</strong>
            </p>
          </div>
        </div>

        {/* Nút Quay lại */}
        <div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className={`droplet-pill ${styles.btnBack}`}
            >
              <ArrowLeft size={15} />
              <span>Quay Lại Danh Sách</span>
            </button>
          )}
        </div>
      </div>

      {/* ── THÔNG BÁO TRẠNG THÁI ── */}
      {thongBao && (
        <div className={`${styles.alertBanner} ${thongBao.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
          {thongBao.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{thongBao.text}</span>
        </div>
      )}

      {/* ── FORM CẤU HÌNH BUỔI HỌC ── */}
      <div className={styles.formCard}>
        <form onSubmit={handleSubmit} className={styles.form}>
          
          {/* Hàng 1: Ngày học & Tuần học (Cố định ngày hôm nay và tuần học hiện tại đang có - KHÔNG CHO THAY ĐỔI) */}
          <div className={styles.twoColGrid}>
            {/* 1. Ngày Diễn Ra Buổi Học (Cố định ngày hôm nay theo thời gian thực) */}
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabelRow}>
                <label className={styles.fieldLabel}>
                  1. Ngày Diễn Ra Buổi Học
                </label>
                <span className={styles.lockBadge}>
                  <Lock size={11} /> Cố định hôm nay
                </span>
              </div>
              <div className={styles.staticInputBox}>
                <Calendar size={16} className={styles.staticIconBlue} />
                <span className={styles.staticText}>
                  {formatNgayHienTai(today)}
                </span>
                <span className={styles.livePill}>
                  Thời gian thực
                </span>
              </div>
            </div>

            {/* 2. Tuần Học (Cố định tuần học hiện tại đang có trong hệ thống) */}
            <div className={styles.fieldGroup}>
              <div className={styles.fieldLabelRow}>
                <label className={styles.fieldLabel}>
                  2. Tuần Học Áp Dụng
                </label>
                <span className={styles.lockBadge}>
                  <Lock size={11} /> Cố định tuần đang có
                </span>
              </div>
              <div className={styles.staticInputBox}>
                <Clock size={16} className={styles.staticIconGreen} />
                <span className={styles.staticText}>
                  {selectedTuan 
                    ? `Tuần ${selectedTuan.soTuan || selectedTuan.soThuTu || selectedTuan.idTh} ${selectedTuan.moTa ? `(${selectedTuan.moTa})` : ''}`
                    : 'Đang xác định tuần hiện tại...'}
                </span>
                <span className={styles.livePill}>
                  Hiện tại
                </span>
              </div>
            </div>
          </div>

          {/* Hàng 2: Ca học trùng với thời gian thực (CỐ ĐỊNH - Không cho phép thay đổi) */}
          <div>
            <div className={styles.fieldLabelRow}>
              <label className={styles.fieldLabel}>
                3. Ca Học Trùng Với Thời Gian Thực
              </label>
              <span className={styles.lockBadge}>
                <Lock size={11} /> Cố định ca theo giờ thực
              </span>
            </div>
            
            <div className={styles.caGrid}>
              {Object.entries(CA_CONFIG).map(([numStr, cfg]) => {
                const caNum = Number(numStr);
                const isSelected = caHoc === caNum;
                return (
                  <div
                    key={caNum}
                    className={`${styles.caCard} ${isSelected ? styles.caCardSelected : ''}`}
                    title={isSelected ? 'Ca học đang diễn ra theo thời gian thực (Cố định)' : 'Ca học khác (Không khả dụng)'}
                  >
                    {isSelected && (
                      <div className={styles.caBadgeCurrent}>
                        <Lock size={9} /> Hiện tại
                      </div>
                    )}
                    <div className={isSelected ? styles.caLabelSelected : styles.caLabel}>{cfg.label}</div>
                    <div className={isSelected ? styles.caTimeSelected : styles.caTime}>{cfg.time}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hàng 3: Chọn Phòng học */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              4. Phòng Học Tại Cơ Sở
            </label>
            <select
              value={selectedPhongId || ''}
              onChange={(e) => setSelectedPhongId(Number(e.target.value))}
              required
              className={styles.selectInput}
            >
              {phongList.map((p) => (
                <option key={p.idPhong} value={p.idPhong}>
                  {p.tenPhong || `Phòng #${p.idPhong}`} (Sức chứa: {p.sucChua || 30} học sinh)
                </option>
              ))}
            </select>
          </div>

          {/* Hàng 4: Nội dung bài học */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              5. Nội Dung / Chủ Đề Buổi Học
            </label>
            <input
              type="text"
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              placeholder="Nhập nội dung hoặc tên bài học chuẩn giáo trình..."
              className={styles.textInput}
            />
          </div>

          {/* Nút hành động */}
          <div className={styles.formActions}>
            {onBack && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={onBack}
                disabled={saving}
              >
                Hủy bỏ
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={saving || loading}
              className={`${styles.btnSubmit} ${saving ? styles.btnSubmitDisabled : ''}`}
            >
              <Sparkles size={16} />
              <span>{saving ? 'Đang tạo buổi học...' : 'Tạo Buổi Học & Chuyển Sang Điểm Danh Ngay'}</span>
              <ArrowRight size={16} />
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default TaoBuoiHocView;
