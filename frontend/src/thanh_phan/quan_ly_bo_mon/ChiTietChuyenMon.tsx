import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import ChiTietChuyenMonView from './ChiTietChuyenMonView.jsx';

export interface BoMonRef {
  idBm?: number;
  idBoMon?: number;
  tenBm?: string;
  tenBoMon?: string;
}

export interface ChuyenMonRef {
  idCm: number;
  tenCm: string;
  moTa?: string;
}

export interface MonHocItem {
  idMh: number;
  tenMon: string;
  moTa?: string;
}

export interface GiaoVienItem {
  idGv: number;
  hoTen: string;
  sdt?: string;
  email?: string;
  conHoatDong?: boolean;
  soLopDangDay?: number;
  danhSachChuyenMon?: string[];
}

export interface ChiTietChuyenMonProps {
  boMon: BoMonRef;
  chuyenMon: ChuyenMonRef;
  onSelectGiaoVien?: (gv: GiaoVienItem) => void;
  onSelectMonHoc?: (mh: MonHocItem) => void;
  onOpenAddMonHocModal?: () => void;
  onOpenTaoLopModal?: (extra: { idBoMon?: number; idMh?: number; idCm?: number; tenMon?: string }) => void;
  onDeleteMonHoc?: (idMh: number) => void;
  refreshTrigger?: number;
}

/**
 * Component Logic Chi Tiết Chuyên Môn (Môn Học & Đội Ngũ Giáo Viên Chuyên Môn)
 */
const ChiTietChuyenMon: React.FC<ChiTietChuyenMonProps> = ({
  boMon,
  chuyenMon,
  onSelectGiaoVien,
  onSelectMonHoc,
  onOpenAddMonHocModal,
  onOpenTaoLopModal,
  onDeleteMonHoc,
  refreshTrigger = 0
}) => {
  const idBm = boMon?.idBm || boMon?.idBoMon;
  const tenBm = boMon?.tenBm || boMon?.tenBoMon || 'Bộ môn';
  const idCm = chuyenMon?.idCm;
  const tenCm = chuyenMon?.tenCm || 'Chuyên môn';

  const [activeTab, setActiveTab] = useState<'monHoc' | 'giaoVien'>('monHoc');
  const [monHocList, setMonHocList] = useState<MonHocItem[]>([]);
  const [giaoVienList, setGiaoVienList] = useState<GiaoVienItem[]>([]);
  const [loadingMonHoc, setLoadingMonHoc] = useState(true);
  const [loadingGiaoVien, setLoadingGiaoVien] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 1. Tải danh sách môn học theo bộ môn và chuyên môn
  const fetchMonHoc = useCallback(async () => {
    if (!idBm || !idCm) return;
    try {
      setLoadingMonHoc(true);
      const res = await dichVuDaoTaoChung.getMonHocTheoBoMonVaChuyenMon(idBm, idCm);
      setMonHocList(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Lỗi khi tải môn học theo chuyên môn:', err);
      setMonHocList([]);
    } finally {
      setLoadingMonHoc(false);
    }
  }, [idBm, idCm]);

  // 2. Tải danh sách giáo viên theo chuyên môn
  const fetchGiaoVien = useCallback(async () => {
    if (!idCm) return;
    try {
      setLoadingGiaoVien(true);
      const res = await dichVuDaoTaoChung.getGiaoVienTheoChuyenMon(idCm);
      setGiaoVienList(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Lỗi khi tải giáo viên theo chuyên môn:', err);
      setGiaoVienList([]);
    } finally {
      setLoadingGiaoVien(false);
    }
  }, [idCm]);

  const handleRefresh = useCallback(() => {
    fetchMonHoc();
    fetchGiaoVien();
  }, [fetchMonHoc, fetchGiaoVien]);

  useEffect(() => {
    fetchMonHoc();
    fetchGiaoVien();
  }, [fetchMonHoc, fetchGiaoVien, refreshTrigger]);

  // Filter môn học
  const filteredMonHoc = useMemo(() => {
    if (!searchKeyword.trim()) return monHocList;
    const kw = searchKeyword.toLowerCase();
    return monHocList.filter((m) =>
      (m.tenMon || '').toLowerCase().includes(kw) ||
      (m.moTa || '').toLowerCase().includes(kw)
    );
  }, [monHocList, searchKeyword]);

  // Filter giáo viên
  const filteredGiaoVien = useMemo(() => {
    if (!searchKeyword.trim()) return giaoVienList;
    const kw = searchKeyword.toLowerCase();
    return giaoVienList.filter((gv) =>
      (gv.hoTen || '').toLowerCase().includes(kw) ||
      (gv.sdt || '').includes(kw) ||
      (gv.email || '').toLowerCase().includes(kw)
    );
  }, [giaoVienList, searchKeyword]);

  return (
    <ChiTietChuyenMonView
      tenBm={tenBm}
      tenCm={tenCm}
      idBm={idBm}
      idCm={idCm}
      chuyenMon={chuyenMon}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      monHocList={monHocList}
      giaoVienList={giaoVienList}
      filteredMonHoc={filteredMonHoc}
      filteredGiaoVien={filteredGiaoVien}
      loadingMonHoc={loadingMonHoc}
      loadingGiaoVien={loadingGiaoVien}
      searchKeyword={searchKeyword}
      setSearchKeyword={setSearchKeyword}
      onRefresh={handleRefresh}
      onSelectGiaoVien={onSelectGiaoVien}
      onSelectMonHoc={onSelectMonHoc}
      onOpenAddMonHocModal={onOpenAddMonHocModal}
      onOpenTaoLopModal={onOpenTaoLopModal}
      onDeleteMonHoc={onDeleteMonHoc}
    />
  );
};

export default ChiTietChuyenMon;
