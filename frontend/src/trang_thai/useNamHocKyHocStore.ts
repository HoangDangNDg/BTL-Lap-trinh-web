import { create } from 'zustand';
import { NamHoc, KyHoc, TuanHoc } from '../kieu_du_lieu/tao_tu_dong';
import { dichVuDaoTaoChung } from '../dich_vu/dichVuDaoTaoChung';

/**
 * Tính khoảng ngày [start, end] của một tuần học
 */
export const tinhKhoangNgayTuanHoc = (
  tuan: TuanHoc,
  ngayBatDauNamHoc?: string | null,
  namBatDau?: number | null
): { start: Date; end: Date } | null => {
  if (!tuan) return null;

  // 0. ƯU TIÊN SỐ 1: Sử dụng trực tiếp ngayBatDau và ngayKetThuc từ CSDL
  if (tuan.ngayBatDau && tuan.ngayKetThuc) {
    try {
      const sParts = tuan.ngayBatDau.split('T')[0].split('-').map(Number);
      const eParts = tuan.ngayKetThuc.split('T')[0].split('-').map(Number);
      if (sParts.length === 3 && eParts.length === 3 && !sParts.some(isNaN) && !eParts.some(isNaN)) {
        const start = new Date(sParts[0], sParts[1] - 1, sParts[2], 0, 0, 0, 0);
        const end = new Date(eParts[0], eParts[1] - 1, eParts[2], 23, 59, 59, 999);
        return { start, end };
      }
    } catch {
      // Bỏ qua lỗi parse
    }
  }

  // 1. Fallback: Nếu có ngày bắt đầu năm học và số tuần
  if (tuan.soTuan && ngayBatDauNamHoc) {
    try {
      const cleanDateStr = ngayBatDauNamHoc.split('T')[0];
      const parts = cleanDateStr.split('-').map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        const [y, m, d] = parts;
        const rawStart = new Date(y, m - 1, d + (tuan.soTuan - 1) * 7);
        const day = rawStart.getDay();
        const diffToMon = (day === 0 ? -6 : 1 - day);
        const start = new Date(rawStart);
        start.setDate(rawStart.getDate() + diffToMon);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return { start, end };
      }
    } catch {
      // Bỏ qua lỗi parse
    }
  }

  // 2. Fallback: Parse từ moTa (ví dụ "Tuần 3 (15/09 - 21/09)" hoặc "Tuần 1 (01/09/2026 - 07/09/2026)")
  if (tuan.moTa) {
    const matchFull = tuan.moTa.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s*-\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (matchFull) {
      const [, d1, m1, y1, d2, m2, y2] = matchFull.map(Number);
      const rawStart = new Date(y1, m1 - 1, d1, 0, 0, 0, 0);
      const day = rawStart.getDay();
      const diffToMon = (day === 0 ? -6 : 1 - day);
      const start = new Date(rawStart);
      start.setDate(rawStart.getDate() + diffToMon);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    const matchShort = tuan.moTa.match(/(\d{1,2})\/(\d{1,2})\s*-\s*(\d{1,2})\/(\d{1,2})/);
    if (matchShort) {
      const baseYear = namBatDau || (ngayBatDauNamHoc ? Number(ngayBatDauNamHoc.split('-')[0]) : new Date().getFullYear());
      const [, d1, m1] = matchShort.map(Number);
      let y1 = baseYear;
      if (m1 < 6 && (namBatDau || ngayBatDauNamHoc)) {
        y1 = baseYear + 1;
      }
      const rawStart = new Date(y1, m1 - 1, d1, 0, 0, 0, 0);
      const day = rawStart.getDay();
      const diffToMon = (day === 0 ? -6 : 1 - day);
      const start = new Date(rawStart);
      start.setDate(rawStart.getDate() + diffToMon);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
  }

  return null;
};

/**
 * Tìm tuần học khớp với thời gian thực (hôm nay)
 */
export const timTuanHocTheoThoiGianThuc = (
  danhSachTuan: TuanHoc[],
  ngayBatDauNamHoc?: string | null,
  namBatDau?: number | null,
  thoiDiem: Date = new Date()
): TuanHoc | null => {
  if (!danhSachTuan || danhSachTuan.length === 0) return null;

  const nowTime = thoiDiem.getTime();

  // 1. Tìm tuần mà thời điểm hiện tại rơi đúng vào khoảng [start, end]
  for (const tuan of danhSachTuan) {
    const range = tinhKhoangNgayTuanHoc(tuan, ngayBatDauNamHoc, namBatDau);
    if (range && nowTime >= range.start.getTime() && nowTime <= range.end.getTime()) {
      return tuan;
    }
  }

  // 2. Nếu không nằm chính xác trong tuần nào, tìm tuần phù hợp nhất theo timeline
  const dsCoKhoangNgay = danhSachTuan
    .map(tuan => ({ tuan, range: tinhKhoangNgayTuanHoc(tuan, ngayBatDauNamHoc, namBatDau) }))
    .filter((item): item is { tuan: TuanHoc; range: { start: Date; end: Date } } => item.range !== null);

  if (dsCoKhoangNgay.length > 0) {
    // Nếu hôm nay trước tuần đầu tiên của danh sách -> chọn tuần đầu tiên
    const tuanDau = dsCoKhoangNgay[0];
    if (nowTime < tuanDau.range.start.getTime()) {
      return tuanDau.tuan;
    }

    // Nếu hôm nay sau tuần cuối cùng của danh sách -> chọn tuần cuối cùng
    const tuanCuoi = dsCoKhoangNgay[dsCoKhoangNgay.length - 1];
    if (nowTime > tuanCuoi.range.end.getTime()) {
      return tuanCuoi.tuan;
    }

    // Nếu rơi vào khoảng nghỉ giữa các tuần -> chọn tuần có khoảng cách gần nhất
    let tuanGanNhat = dsCoKhoangNgay[0].tuan;
    let khoangCachMin = Math.abs(nowTime - dsCoKhoangNgay[0].range.start.getTime());

    for (const item of dsCoKhoangNgay) {
      const dist = Math.min(
        Math.abs(nowTime - item.range.start.getTime()),
        Math.abs(nowTime - item.range.end.getTime())
      );
      if (dist < khoangCachMin) {
        khoangCachMin = dist;
        tuanGanNhat = item.tuan;
      }
    }
    return tuanGanNhat;
  }

  // Fallback: tuần đầu tiên trong danh sách
  return danhSachTuan[0];
};

export function getThuHienTai(): number {
  const day = new Date().getDay();
  return day === 0 ? 8 : day + 1;
}

interface NamHocKyHocState {
  namHocList: NamHoc[];
  kyHocList: KyHoc[];
  tuanHocList: TuanHoc[];
  selectedNamHocId: number | null;
  selectedKyHocId: number | null;
  selectedTuanHocId: number | null;
  selectedThu: number | null;
  loading: boolean;
  loadingKyHoc: boolean;
  loadingTuanHoc: boolean;
  refreshCount: number;

  fetchNamHoc: (idDn: number) => Promise<void>;
  fetchKyHoc: (idNh: number) => Promise<void>;
  fetchTuanHoc: (idKh?: number | null, idDn?: number) => Promise<void>;
  setSelectedNamHocId: (idNh: number | null) => void;
  setSelectedKyHocId: (idKh: number | null) => void;
  setSelectedTuanHocId: (idTh: number | null) => void;
  setSelectedThu: (thu: number | null) => void;
  chonTuanHienTai: () => void;
  triggerRefresh: () => void;
}

export const useNamHocKyHocStore = create<NamHocKyHocState>((set, get) => ({
  namHocList: [],
  kyHocList: [],
  tuanHocList: [],
  selectedNamHocId: null,
  selectedKyHocId: null,
  selectedTuanHocId: null,
  selectedThu: getThuHienTai(),
  loading: false,
  loadingKyHoc: false,
  loadingTuanHoc: false,
  refreshCount: 0,

  setSelectedThu: (thu: number | null) => {
    set({ selectedThu: thu });
  },

  fetchNamHoc: async (idDn: number) => {
    try {
      set({ loading: true });
      const list = await dichVuDaoTaoChung.getNamHocTheoDoanhNghiep(idDn);
      set({ namHocList: list || [], loading: false });

      const currentSelected = get().selectedNamHocId;
      if (list && list.length > 0 && (!currentSelected || !list.some((nh: NamHoc) => nh.idNh === currentSelected))) {
        // Tự động tìm năm học hiện tại theo thời gian thực
        const todayStr = new Date().toISOString().split('T')[0];
        const curYear = new Date().getFullYear();
        const matchedNamHoc = list.find((nh: NamHoc) => {
          if (nh.ngayBatDau && nh.ngayKetThuc) {
            return todayStr >= nh.ngayBatDau && todayStr <= nh.ngayKetThuc;
          }
          if (nh.namBatDau && nh.namKetThuc) {
            return curYear >= nh.namBatDau && curYear <= nh.namKetThuc;
          }
          return false;
        });

        const targetNamHocId = matchedNamHoc ? matchedNamHoc.idNh : list[0].idNh;
        get().setSelectedNamHocId(targetNamHocId ?? null);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách năm học:", err);
      set({ loading: false });
    }
  },

  fetchKyHoc: async (idNh: number) => {
    try {
      set({ loadingKyHoc: true });
      const list = await dichVuDaoTaoChung.getKyHocTheoNamHoc(idNh);
      set({ kyHocList: list || [], loadingKyHoc: false });

      // Tự động giữ kỳ đang chọn hoặc chọn kỳ học phù hợp thời gian thực
      const currentKyId = get().selectedKyHocId;
      let targetKyId: number | null = null;

      if (currentKyId && list.some(k => k.idKh === currentKyId)) {
        targetKyId = currentKyId;
      } else if (list.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const matchedKyHoc = list.find((kh: KyHoc) => {
          if (kh.ngayBatDau && kh.ngayKetThuc) {
            return todayStr >= kh.ngayBatDau && todayStr <= kh.ngayKetThuc;
          }
          return false;
        });
        targetKyId = matchedKyHoc ? (matchedKyHoc.idKh ?? null) : (list[0].idKh ?? null);
      }

      set({ selectedKyHocId: targetKyId });
      await get().fetchTuanHoc(targetKyId);
    } catch (err) {
      console.error("Lỗi khi tải danh sách kỳ học:", err);
      set({ kyHocList: [], loadingKyHoc: false });
    }
  },

  fetchTuanHoc: async (idKh?: number | null, idDn?: number) => {
    try {
      set({ loadingTuanHoc: true });
      let list: TuanHoc[] = [];
      if (idKh) {
        list = await dichVuDaoTaoChung.getTuanHocTheoKyHoc(idKh);
      } else if (idDn) {
        list = await dichVuDaoTaoChung.getTuanHocTheoDoanhNghiep(idDn);
      } else {
        list = await dichVuDaoTaoChung.getDanhSachTuanHoc();
      }

      set({ tuanHocList: list || [], loadingTuanHoc: false });

      if (!list || list.length === 0) {
        set({ selectedTuanHocId: null });
        return;
      }

      // Tự động chọn tuần theo thời gian thực nếu chưa chọn hoặc tuần đang chọn không thuộc danh sách
      const currentTuanId = get().selectedTuanHocId;
      if (!currentTuanId || !list.some(t => t.idTh === currentTuanId)) {
        const currentNamHoc = get().namHocList.find(nh => nh.idNh === get().selectedNamHocId);
        const targetTuan = timTuanHocTheoThoiGianThuc(
          list,
          currentNamHoc?.ngayBatDau,
          currentNamHoc?.namBatDau
        );
        set({ selectedTuanHocId: targetTuan?.idTh ?? list[0].idTh ?? null });
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách tuần học:", err);
      set({ tuanHocList: [], loadingTuanHoc: false, selectedTuanHocId: null });
    }
  },

  setSelectedNamHocId: (idNh: number | null) => {
    set({ selectedNamHocId: idNh, selectedKyHocId: null, selectedTuanHocId: null });
    if (idNh) {
      get().fetchKyHoc(idNh);
    } else {
      set({ kyHocList: [], tuanHocList: [] });
    }
  },

  setSelectedKyHocId: (idKh: number | null) => {
    set({ selectedKyHocId: idKh, selectedTuanHocId: null });
    get().fetchTuanHoc(idKh);
  },

  setSelectedTuanHocId: (idTh: number | null) => {
    set({ selectedTuanHocId: idTh });
  },

  chonTuanHienTai: () => {
    const { tuanHocList, namHocList, selectedNamHocId } = get();
    if (!tuanHocList || tuanHocList.length === 0) return;
    const currentNamHoc = namHocList.find(nh => nh.idNh === selectedNamHocId);
    const targetTuan = timTuanHocTheoThoiGianThuc(
      tuanHocList,
      currentNamHoc?.ngayBatDau,
      currentNamHoc?.namBatDau
    );
    if (targetTuan?.idTh) {
      set({ selectedTuanHocId: targetTuan.idTh });
    }
  },

  triggerRefresh: () => {
    set(state => ({ refreshCount: state.refreshCount + 1 }));
  }
}));


