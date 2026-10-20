import React, { useReducer, useEffect, useCallback, useMemo } from 'react';
import { dichVuGiaoVien } from '../../dich_vu/dichVuGiaoVien';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import { useNamHocKyHocStore } from '../../trang_thai/useNamHocKyHocStore';
import TongQuanGiaoVienView from './TongQuanGiaoVienView.jsx';

interface TongQuanState {
  loading: boolean;
  lopHocs: any[];
  tkbList: any[];
  bangLuongs: any[];
  congDays: any[];
  error: string | null;
}

const initialState: TongQuanState = {
  loading: true,
  lopHocs: [],
  tkbList: [],
  bangLuongs: [],
  congDays: [],
  error: null
};

type TongQuanAction =
  | { type: 'FETCH_START' }
  | { 
      type: 'FETCH_SUCCESS'; 
      payload: { 
        lopHocs: any[]; 
        tkbList: any[]; 
        bangLuongs: any[]; 
        congDays: any[]; 
      } 
    }
  | { type: 'FETCH_ERROR'; payload: string };

function tongQuanReducer(state: TongQuanState, action: TongQuanAction): TongQuanState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        lopHocs: action.payload.lopHocs,
        tkbList: action.payload.tkbList,
        bangLuongs: action.payload.bangLuongs,
        congDays: action.payload.congDays,
        error: null
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export const TongQuanGiaoVien: React.FC = () => {
  const { user } = useTrangThaiXacThuc();
  const { selectedKyHocId, refreshCount } = useNamHocKyHocStore();
  const [state, dispatch] = useReducer(tongQuanReducer, initialState);
  const { loading, lopHocs, tkbList, bangLuongs, congDays } = state;

  const fetchData = useCallback(async () => {
    try {
      dispatch({ type: 'FETCH_START' });
      const [resLop, resTkb, resLuong, resCong] = await Promise.allSettled([
        dichVuGiaoVien.getLopHocCuaToi(),
        dichVuGiaoVien.getLichDayCuaToi(),
        dichVuGiaoVien.getBangLuongCuaToi(),
        dichVuGiaoVien.getCongDayCuaToi()
      ]);

      const lops = resLop.status === 'fulfilled' ? (Array.isArray(resLop.value) ? resLop.value : (resLop.value?.data || [])) : [];
      const tkbs = resTkb.status === 'fulfilled' ? (Array.isArray(resTkb.value) ? resTkb.value : (resTkb.value?.data || [])) : [];
      const luongs = resLuong.status === 'fulfilled' ? (Array.isArray(resLuong.value) ? resLuong.value : (resLuong.value?.data || [])) : [];
      const congs = resCong.status === 'fulfilled' ? (Array.isArray(resCong.value) ? resCong.value : (resCong.value?.data || [])) : [];

      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          lopHocs: lops,
          tkbList: tkbs,
          bangLuongs: luongs,
          congDays: congs
        }
      });
    } catch (err: any) {
      console.error('Lỗi khi nạp dữ liệu tổng quan giáo viên:', err);
      dispatch({ type: 'FETCH_ERROR', payload: err?.message || 'Lỗi khi nạp dữ liệu' });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshCount]);

  // 1. Số lớp dạy trong kỳ
  const lopDayTrongKy = useMemo(() => {
    if (!selectedKyHocId) return lopHocs;
    return lopHocs.filter(l => l.idKyHoc === selectedKyHocId || l.kyHoc?.idKh === selectedKyHocId || !l.idKyHoc);
  }, [lopHocs, selectedKyHocId]);

  // 2. Lịch dạy trong ngày hôm nay
  const lichDayHomNay = useMemo(() => {
    // Thứ trong tuần: JS getDay() trả về 0 (CN) -> 6 (T7). DB quy ước: 2 = Thứ 2 ... 8 = Chủ Nhật
    const jsDay = new Date().getDay();
    const currentThu = jsDay === 0 ? 8 : jsDay + 1;

    return tkbList.filter(item => {
      const thuValue = item.thu ?? item.thuTrongTuan;
      return thuValue === currentThu;
    });
  }, [tkbList]);

  // 3. Tổng quan lương đã nhận
  const tongLuongDaNhan = useMemo(() => {
    if (!bangLuongs || bangLuongs.length === 0) return 0;
    return bangLuongs.reduce((sum, item) => {
      const tien = Number(item.soTien || item.tongLuong || item.thucNhan || 0);
      return sum + tien;
    }, 0);
  }, [bangLuongs]);

  const tongSoBuoiDay = useMemo(() => {
    return congDays.length || tkbList.length || 0;
  }, [congDays, tkbList]);

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const getThuLabel = () => {
    const jsDay = new Date().getDay();
    const thuArr = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return thuArr[jsDay];
  };

  return (
    <TongQuanGiaoVienView
      user={user}
      loading={loading}
      lopDayTrongKy={lopDayTrongKy}
      lichDayHomNay={lichDayHomNay}
      tongLuongDaNhan={tongLuongDaNhan}
      tongSoBuoiDay={tongSoBuoiDay}
      thuLabel={getThuLabel()}
      onRefresh={fetchData}
      formatVND={formatVND}
    />
  );
};

export default TongQuanGiaoVien;
