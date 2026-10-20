import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import DanhSachChuyenMonView from './DanhSachChuyenMonView.jsx';

export interface ChuyenMonItem {
  idCm: number;
  tenCm: string;
  moTa?: string;
  thuocBoMon?: boolean;
  soMonHoc?: number;
  soGiaoVien?: number;
}

export interface BoMonRef {
  idBm?: number;
  idBoMon?: number;
  tenBm?: string;
  tenBoMon?: string;
}

export interface DanhSachChuyenMonProps {
  boMon: BoMonRef;
  onSelectChuyenMon?: (cm: ChuyenMonItem) => void;
  onOpenAddChuyenMonModal?: () => void;
  refreshTrigger?: number;
}

/**
 * Component Logic Danh Sách Chuyên Môn Thuộc Bộ Môn (Container Component)
 */
const DanhSachChuyenMon: React.FC<DanhSachChuyenMonProps> = ({
  boMon,
  onSelectChuyenMon,
  onOpenAddChuyenMonModal,
  refreshTrigger = 0
}) => {
  const idBm = boMon?.idBm || boMon?.idBoMon;
  const tenBm = boMon?.tenBm || boMon?.tenBoMon || 'Bộ môn';

  const [chuyenMonList, setChuyenMonList] = useState<ChuyenMonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');

  // Tải danh sách chuyên môn thuộc bộ môn
  const fetchChuyenMon = useCallback(async () => {
    if (!idBm) return;
    try {
      setLoading(true);
      const res = await dichVuDaoTaoChung.getChuyenMonTheoBoMon(idBm);
      setChuyenMonList(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Lỗi khi tải chuyên môn theo bộ môn:', err);
      setChuyenMonList([]);
    } finally {
      setLoading(false);
    }
  }, [idBm]);

  useEffect(() => {
    fetchChuyenMon();
  }, [fetchChuyenMon, refreshTrigger]);

  // Bộ lọc từ khóa
  const filteredList = useMemo(() => {
    if (!searchKeyword.trim()) return chuyenMonList;
    const kw = searchKeyword.toLowerCase();
    return chuyenMonList.filter((cm) =>
      (cm.tenCm || '').toLowerCase().includes(kw) ||
      (cm.moTa || '').toLowerCase().includes(kw)
    );
  }, [chuyenMonList, searchKeyword]);

  return (
    <DanhSachChuyenMonView
      tenBm={tenBm}
      filteredList={filteredList}
      loading={loading}
      searchKeyword={searchKeyword}
      setSearchKeyword={setSearchKeyword}
      onSelectChuyenMon={onSelectChuyenMon}
      onOpenAddChuyenMonModal={onOpenAddChuyenMonModal}
      onRefresh={fetchChuyenMon}
    />
  );
};

export default DanhSachChuyenMon;
