import React, { useState, useEffect, useMemo, useRef } from 'react';
import ModalWrapper from '../ModalWrapper';
import { 
  X, 
  CalendarPlus, 
  Clock, 
  MapPin, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Save,
  Users,
  Layers
} from 'lucide-react';
import { Button, MetalButton } from '@/components/ui/liquid-glass-button';
import { dichVuGiaoVien } from '../../dich_vu/dichVuGiaoVien';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import { checkSlotPast, isDayInPast, getThuHienTai } from '../thoi_khoa_bieu/caiDatTkb';

interface ModalThemLichDayProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTuanId?: number | null;
  onSuccess?: () => void;
  initialPhongId?: number | null;
  initialCaHoc?: number;
  initialThu?: number;
  selectedChiNhanhId?: number | null;
  danhSachPhong?: any[];
  danhSachTuan?: any[];
  isWeekPast?: boolean;
  isCurrentWeek?: boolean;
  isYearFinished?: boolean;
  weekDateRange?: { start: Date; end: Date } | null;
}

const CA_CONFIG: Record<number, { label: string; time: string; start: string; end: string }> = {
  1: { label: 'Ca 1 (Sáng)', time: '07:30 - 09:30', start: '07:30:00', end: '09:30:00' },
  2: { label: 'Ca 2 (Sáng)', time: '09:45 - 11:45', start: '09:45:00', end: '11:45:00' },
  3: { label: 'Ca 3 (Chiều)', time: '13:30 - 15:30', start: '13:30:00', end: '15:30:00' },
  4: { label: 'Ca 4 (Chiều)', time: '15:45 - 17:45', start: '15:45:00', end: '17:45:00' },
  5: { label: 'Ca 5 (Tối)', time: '18:00 - 20:00', start: '18:00:00', end: '20:00:00' },
  6: { label: 'Ca 6 (Tối)', time: '20:15 - 22:00', start: '20:15:00', end: '22:00:00' },
};

const THU_OPTIONS = [
  { thu: 2, label: 'Thứ 2' },
  { thu: 3, label: 'Thứ 3' },
  { thu: 4, label: 'Thứ 4' },
  { thu: 5, label: 'Thứ 5' },
  { thu: 6, label: 'Thứ 6' },
  { thu: 7, label: 'Thứ 7' },
  { thu: 8, label: 'Chủ Nhật' },
];

export const ModalThemLichDay: React.FC<ModalThemLichDayProps> = ({
  isOpen,
  onClose,
  selectedTuanId,
  onSuccess,
  initialPhongId,
  initialCaHoc,
  initialThu,
  selectedChiNhanhId,
  danhSachPhong = [],
  danhSachTuan = [],
  isWeekPast = false,
  isCurrentWeek = false,
  isYearFinished = false,
  weekDateRange = null
}) => {
  const { user } = useTrangThaiXacThuc();

  const [allLopList, setAllLopList] = useState<any[]>([]);
  const [boMonList, setBoMonList] = useState<any[]>([]);
  const [selectedBoMonId, setSelectedBoMonId] = useState<number | null>(null); // null = ALL
  const [tuanList, setTuanList] = useState<any[]>(danhSachTuan || []);
  const [phongList, setPhongList] = useState<any[]>(danhSachPhong || []);

  const [selectedLopId, setSelectedLopId] = useState<number | null>(null);
  const [thu, setThu] = useState<number>(initialThu || 2);
  const [caHoc, setCaHoc] = useState<number>(initialCaHoc || 1);
  const [selectedPhongId, setSelectedPhongId] = useState<number | null>(initialPhongId || null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [thongBao, setThongBao] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Tìm thông tin tuần học tương ứng với selectedTuanId đang chọn trên thanh điều hướng
  const currentTuan = useMemo(() => {
    return (tuanList || []).find(t => t.idTh === selectedTuanId) || 
           (danhSachTuan || []).find(t => t.idTh === selectedTuanId) || null;
  }, [tuanList, danhSachTuan, selectedTuanId]);

  const tenTuanHienThi = useMemo(() => {
    if (currentTuan) {
      return `Tuần ${currentTuan.soTuan || currentTuan.idTh}${currentTuan.moTa ? ` - ${currentTuan.moTa}` : ''}`;
    }
    if (selectedTuanId) {
      return `Tuần #${selectedTuanId}`;
    }
    return 'Chưa xác định tuần học';
  }, [currentTuan, selectedTuanId]);

  // Lọc lớp học theo bộ môn: Nếu chọn ALL (selectedBoMonId === null) -> Hiển thị tất cả
  const filteredLopList = useMemo(() => {
    if (selectedBoMonId === null) return allLopList;
    return allLopList.filter(l => l.idBoMon === selectedBoMonId);
  }, [allLopList, selectedBoMonId]);

  // Tự động giữ hoặc chọn lớp đầu tiên của danh sách đã lọc
  useEffect(() => {
    if (filteredLopList.length > 0) {
      if (!selectedLopId || !filteredLopList.some(l => l.idLop === selectedLopId)) {
        setSelectedLopId(filteredLopList[0].idLop);
      }
    } else {
      setSelectedLopId(null);
    }
  }, [filteredLopList]);

  // Tìm ca học hợp lệ đầu tiên (chưa qua) cho một Thứ
  const findFirstValidCa = (targetThu: number): number | null => {
    for (const caNum of [1, 2, 3, 4, 5, 6]) {
      const cfg = CA_CONFIG[caNum];
      if (!checkSlotPast(targetThu, caNum, cfg.end, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek)) {
        return caNum;
      }
    }
    return null;
  };

  const handleSelectThu = (newThu: number) => {
    setThu(newThu);
    const cfg = CA_CONFIG[caHoc] || CA_CONFIG[1];
    if (checkSlotPast(newThu, caHoc, cfg.end, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek)) {
      const firstValidCa = findFirstValidCa(newThu);
      if (firstValidCa) {
        setCaHoc(firstValidCa);
      }
    }
  };

  // Tham chiếu kiểm tra modal vừa được mở
  const prevIsOpenRef = useRef(false);

  // Khởi tạo các lựa chọn mặc định MỘT LẦN DUY NHẤT khi mở modal
  useEffect(() => {
    if (!prevIsOpenRef.current && isOpen) {
      setSelectedBoMonId(null);

      let targetThu = initialThu || getThuHienTai();
      if (isDayInPast(targetThu, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek)) {
        const firstValidDay = THU_OPTIONS.find(item => !isDayInPast(item.thu, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek));
        if (firstValidDay) {
          targetThu = firstValidDay.thu;
        }
      }
      setThu(targetThu);

      let targetCa = initialCaHoc || 1;
      const cfg = CA_CONFIG[targetCa] || CA_CONFIG[1];
      if (checkSlotPast(targetThu, targetCa, cfg.end, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek)) {
        const firstValidCa = findFirstValidCa(targetThu);
        if (firstValidCa) {
          targetCa = firstValidCa;
        }
      }
      setCaHoc(targetCa);

      if (initialPhongId) {
        setSelectedPhongId(initialPhongId);
      }
      setThongBao(null);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialThu, initialCaHoc, initialPhongId, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek]);

  // Cập nhật tuanList khi danhSachTuan từ cha thay đổi
  useEffect(() => {
    if (danhSachTuan && danhSachTuan.length > 0) {
      setTuanList(danhSachTuan);
    }
  }, [danhSachTuan]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchOptions = async () => {
      setLoading(true);
      setThongBao(null);
      try {
        // 1. Tải danh sách bộ môn
        const resBoMon = await dichVuDaoTaoChung.getDanhSachBoMon();
        const bms = Array.isArray(resBoMon) ? resBoMon : (resBoMon?.data || []);
        setBoMonList(bms);

        // 2. Tải danh sách lớp học
        const isOwnerOrAdmin = user?.vaiTro === 'CHU_DOANH_NGHIEP' || user?.vaiTro === 'ADMIN';
        let lops: any[] = [];
        if (isOwnerOrAdmin) {
          const resLop = await dichVuDaoTaoChung.getDanhSachLopHoc({ idCn: selectedChiNhanhId || undefined });
          lops = Array.isArray(resLop) ? resLop : (resLop?.data || []);
        } else {
          const resLop = await dichVuGiaoVien.getDanhSachLopHoc();
          lops = Array.isArray(resLop) ? resLop : (resLop?.data || []);
        }
        setAllLopList(lops);
        setSelectedLopId((prev) => prev || (lops.length > 0 ? lops[0].idLop : null));

        // 3. Tải danh sách tuần học để hiển thị tên tuần chính xác
        let tuans = (danhSachTuan && danhSachTuan.length > 0) ? danhSachTuan : [];
        if (tuans.length === 0) {
          const resTuan = await dichVuDaoTaoChung.getDanhSachTuanHoc();
          tuans = Array.isArray(resTuan) ? resTuan : (resTuan?.data || []);
        }
        setTuanList(tuans);

        // 4. LỌC PHÒNG HỌC THEO CHI NHÁNH ĐƯỢC CHỌN Ở ẢNH 2 (Không hiển thị tất cả)
        let phongs: any[] = (danhSachPhong && danhSachPhong.length > 0) ? danhSachPhong : [];
        if (phongs.length === 0 && selectedChiNhanhId) {
          const resPhong = await dichVuDaoTaoChung.getDanhSachPhongHoc(selectedChiNhanhId);
          phongs = Array.isArray(resPhong) ? resPhong : (resPhong?.data || []);
        } else if (phongs.length === 0) {
          const resPhong = await dichVuDaoTaoChung.getDanhSachPhongHoc();
          phongs = Array.isArray(resPhong) ? resPhong : (resPhong?.data || []);
        }
        setPhongList(phongs);

        setSelectedPhongId((prev) => {
          if (prev && phongs.some(p => p.idPhong === prev)) return prev;
          if (initialPhongId && phongs.some(p => p.idPhong === initialPhongId)) return initialPhongId;
          return phongs.length > 0 ? phongs[0].idPhong : null;
        });

        if (initialCaHoc) setCaHoc(initialCaHoc);
        if (initialThu) setThu(initialThu);
      } catch (err) {
        console.error('Lỗi khi tải danh mục lịch dạy:', err);
        setThongBao({ type: 'error', text: 'Không thể tải danh sách lớp học hoặc phòng học.' });
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [isOpen, selectedChiNhanhId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isWeekPast || isYearFinished) {
      setThongBao({ type: 'error', text: 'Tuần học hoặc năm học này đã kết thúc. Không thể thêm lịch dạy mới.' });
      return;
    }
    if (isDayInPast(thu, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek)) {
      setThongBao({ type: 'error', text: `Thời gian của ${thu === 8 ? 'Chủ Nhật' : `Thứ ${thu}`} đã trôi qua trong quá khứ. Không thể thêm lịch dạy.` });
      return;
    }
    const cfg = CA_CONFIG[caHoc] || CA_CONFIG[1];
    if (checkSlotPast(thu, caHoc, cfg.end, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek)) {
      setThongBao({ type: 'error', text: `Ca học ${caHoc} (${cfg.label}) của ngày hôm nay đã kết thúc. Không thể thêm lịch dạy.` });
      return;
    }

    if (!selectedLopId) {
      setThongBao({ type: 'error', text: 'Vui lòng chọn lớp học.' });
      return;
    }
    const finalTuanId = selectedTuanId || (currentTuan ? currentTuan.idTh : null);
    if (!finalTuanId) {
      setThongBao({ type: 'error', text: 'Chưa xác định tuần học. Vui lòng chọn tuần ở thanh điều hướng phía trên.' });
      return;
    }
    if (!selectedPhongId) {
      setThongBao({ type: 'error', text: 'Vui lòng chọn phòng học.' });
      return;
    }

    setSaving(true);
    setThongBao(null);

    try {
      const cfg = CA_CONFIG[caHoc] || CA_CONFIG[1];
      const payload: any = {
        lopHoc: { idLop: selectedLopId },
        tuanHoc: { idTh: finalTuanId },
        phongHoc: { idPhong: selectedPhongId },
        thu: thu,
        caHoc: caHoc,
        gioBatDau: cfg.start,
        gioKetThuc: cfg.end,
        doanhNghiep: { idDn: user?.idDoanhNghiep || 1 }
      };

      if (user?.roleId) {
        payload.giaoVien = { idGv: user.roleId };
      }

      await dichVuGiaoVien.themLichDay(payload);
      setThongBao({ type: 'success', text: 'Thêm lịch dạy thành công vào thời khóa biểu!' });

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Lỗi khi thêm lịch dạy:', err);
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra khi thêm lịch dạy (có thể trùng lịch giáo viên, phòng hoặc lớp).';
      setThongBao({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-[540px]"
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shrink-0">
            <CalendarPlus size={20} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
              Thêm Lịch Dạy Mới
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Xếp ca giảng dạy vào thời khóa biểu tuần
            </p>
          </div>
        </div>
      }
    >
      {/* Thông báo nếu có */}
      {thongBao && (
        <div className={`p-2.5 px-3.5 mb-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${thongBao.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {thongBao.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{thongBao.text}</span>
        </div>
      )}

      {/* Cảnh báo nếu tuần học hoặc năm học đã qua */}
      {(isWeekPast || isYearFinished) && (
        <div className={`p-3 mb-3 rounded-xl flex items-center gap-2 text-xs font-bold ${isYearFinished ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
          <AlertCircle size={16} className={`shrink-0 ${isYearFinished ? 'text-red-600' : 'text-amber-600'}`} />
          <span>
            {isYearFinished 
              ? 'Năm học này đã hoàn thành hoặc kết thúc. Không thể thêm lịch dạy mới.' 
              : 'Tuần học này đã trôi qua trong quá khứ. Không thể thêm lịch dạy mới.'}
          </span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* 1. LỌC THEO BỘ MÔN (CHỌN ALL THÌ HIỂN THỊ TẤT CẢ LỚP HỌC) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: '700', color: '#334155' }}>
                Bộ môn:
              </label>
              <span style={{ fontSize: '0.725rem', color: '#64748B', fontWeight: '600' }}>
                {selectedBoMonId === null ? 'Đang hiển thị tất cả bộ môn (ALL)' : `Đã lọc theo bộ môn`}
              </span>
            </div>
            <select
              value={selectedBoMonId === null ? 'ALL' : selectedBoMonId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedBoMonId(val === 'ALL' ? null : Number(val));
              }}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '0.875rem',
                color: '#0F172A',
                backgroundColor: '#F8FAFC',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              <option value="ALL">Tất cả bộ môn (ALL)</option>
              {boMonList.map((bm) => (
                <option key={bm.idBoMon} value={bm.idBoMon}>
                  {bm.tenBoMon}
                </option>
              ))}
            </select>
          </div>

          {/* 2. CHỌN LỚP HỌC (ĐÃ ĐƯỢC LỌC THEO BỘ MÔN Ở TRÊN) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: '700', color: '#334155' }}>
                Lớp học:
              </label>
              <span style={{ fontSize: '0.725rem', color: '#0095F6', fontWeight: '600' }}>
                {filteredLopList.length} lớp khả dụng
              </span>
            </div>
            <select
              value={selectedLopId || ''}
              onChange={(e) => setSelectedLopId(Number(e.target.value))}
              required
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '0.875rem',
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            >
              {filteredLopList.length === 0 ? (
                <option value="">(Không có lớp học phù hợp với bộ môn đã chọn)</option>
              ) : (
                filteredLopList.map((lop) => (
                  <option key={lop.idLop} value={lop.idLop}>
                    {lop.tenLop} {lop.tenKhoaHoc ? `(${lop.tenKhoaHoc})` : ''} {lop.tenBoMon ? `• [${lop.tenBoMon}]` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* 3. TUẦN HỌC (CỐ ĐỊNH THEO TUẦN ĐÃ CHỌN TRÊN THANH ĐIỀU HƯỚNG, KHÔNG CÓ LIST CHỌN) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: '700', color: '#334155' }}>
                Tuần học:
              </label>
              <span style={{ fontSize: '0.725rem', color: '#0095F6', fontWeight: '600' }}>
                Cố định theo thanh điều hướng
              </span>
            </div>
            <div
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '0.875rem',
                color: '#0F172A',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                fontWeight: '700',
                cursor: 'default',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.03)'
              }}
            >
              <Clock size={16} style={{ color: '#0095F6', flexShrink: 0 }} />
              <span>{tenTuanHienThi}</span>
            </div>
          </div>

          {/* 4. CHỌN THỨ TRONG TUẦN */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: '700', color: '#334155' }}>
                Thứ trong tuần:
              </label>
              {isDayInPast(thu, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek) && (
                <span style={{ fontSize: '0.725rem', color: '#DC2626', fontWeight: '700' }}>
                  (Thứ này đã qua)
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.35rem' }}>
              {THU_OPTIONS.map((item) => {
                const isSelected = thu === item.thu;
                const isPastThu = isDayInPast(item.thu, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek);
                return (
                  <button
                    key={item.thu}
                    type="button"
                    disabled={isPastThu}
                    onClick={() => handleSelectThu(item.thu)}
                    style={{
                      padding: '0.45rem 0.2rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #0095F6' : (isPastThu ? '1px dashed #CBD5E1' : '1px solid #E2E8F0'),
                      backgroundColor: isSelected ? '#EFF6FF' : (isPastThu ? '#F8FAFC' : '#FFFFFF'),
                      color: isSelected ? '#0095F6' : (isPastThu ? '#94A3B8' : '#334155'),
                      fontWeight: isSelected ? '800' : '600',
                      fontSize: '0.775rem',
                      cursor: isPastThu ? 'not-allowed' : 'pointer',
                      textAlign: 'center',
                      opacity: isPastThu ? 0.5 : 1
                    }}
                    title={isPastThu ? `${item.label} đã qua` : item.label}
                  >
                    <div>{item.label}</div>
                    {isPastThu && <div style={{ fontSize: '0.575rem', color: '#DC2626', fontWeight: '700' }}>Đã qua</div>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. CHỌN CA HỌC */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: '700', color: '#334155' }}>
                Ca học:
              </label>
              {checkSlotPast(thu, caHoc, CA_CONFIG[caHoc]?.end, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek) && (
                <span style={{ fontSize: '0.725rem', color: '#DC2626', fontWeight: '700' }}>
                  (Ca học này đã trôi qua)
                </span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5, 6].map((caNum) => {
                const isSelected = caHoc === caNum;
                const cfg = CA_CONFIG[caNum];
                const isPastCa = checkSlotPast(thu, caNum, cfg.end, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek);
                return (
                  <button
                    key={caNum}
                    type="button"
                    disabled={isPastCa}
                    onClick={() => setCaHoc(caNum)}
                    style={{
                      padding: '0.45rem 0.35rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #0095F6' : (isPastCa ? '1px dashed #CBD5E1' : '1px solid #E2E8F0'),
                      backgroundColor: isSelected ? '#EFF6FF' : (isPastCa ? '#F8FAFC' : '#FFFFFF'),
                      color: isSelected ? '#0095F6' : (isPastCa ? '#94A3B8' : '#334155'),
                      fontWeight: isSelected ? '800' : '600',
                      fontSize: '0.75rem',
                      cursor: isPastCa ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.1rem',
                      opacity: isPastCa ? 0.5 : 1
                    }}
                    title={isPastCa ? `Ca ${caNum} đã qua` : `Ca ${caNum}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>Ca {caNum}</span>
                      {isPastCa && (
                        <span style={{ fontSize: '0.6rem', color: '#DC2626', fontWeight: '700' }}>
                          (Đã qua)
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: isSelected ? '#0095F6' : (isPastCa ? '#94A3B8' : '#64748B') }}>
                      {cfg.time}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. CHỌN PHÒNG HỌC (ĐÃ ĐƯỢC LỌC THEO CHI NHÁNH ĐƯỢC CHỌN Ở ẢNH 2) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: '700', color: '#334155' }}>
                Phòng học:
              </label>
              <span style={{ fontSize: '0.725rem', color: '#0095F6', fontWeight: '600' }}>
                {phongList.length} phòng khả dụng tại cơ sở
              </span>
            </div>
            <select
              value={selectedPhongId || ''}
              onChange={(e) => setSelectedPhongId(Number(e.target.value))}
              required
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '10px',
                border: '1px solid #CBD5E1',
                fontSize: '0.875rem',
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                outline: 'none'
              }}
            >
              {phongList.length === 0 ? (
                <option value="">(Cơ sở chi nhánh này chưa có phòng học)</option>
              ) : (
                phongList.map((ph) => (
                  <option key={ph.idPhong} value={ph.idPhong}>
                    {ph.tenPhong} {ph.loaiPhong ? `(${ph.loaiPhong})` : ''} {ph.sucChua ? `(Sức chứa: ${ph.sucChua} chỗ)` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Footer buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '0.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #F1F5F9'
          }}>
            <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={saving}>
              Hủy
            </Button>

            {(() => {
              const isCurrentSlotPast = isWeekPast || isYearFinished || 
                isDayInPast(thu, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek) || 
                checkSlotPast(thu, caHoc, CA_CONFIG[caHoc]?.end, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek);
              return (
                <MetalButton
                  variant="primary"
                  size="md"
                  type="submit"
                  disabled={saving || filteredLopList.length === 0 || phongList.length === 0 || isCurrentSlotPast}
                  className="flex items-center gap-2"
                  title={isCurrentSlotPast ? 'Thời gian này đã trôi qua trong quá khứ' : undefined}
                >
                  <Save size={16} />
                  <span>{saving ? 'Đang thêm...' : 'Lưu Lịch Dạy'}</span>
                </MetalButton>
              );
            })()}
          </div>
        </form>
    </ModalWrapper>
  );
};

export default ModalThemLichDay;


