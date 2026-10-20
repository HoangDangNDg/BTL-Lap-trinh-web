import React, { useState, useMemo } from 'react';
import DanhSachBoMonView from './DanhSachBoMonView.jsx';

export interface BoMonItem {
  idBm?: number;
  idBoMon?: number;
  tenBm?: string;
  tenBoMon?: string;
  moTa?: string;
  soChuyenMon?: number;
  soGiaoVien?: number;
}

export interface DanhSachBoMonProps {
  boMonList?: BoMonItem[];
  loading?: boolean;
  onSelectBoMon?: (boMon: BoMonItem) => void;
  onOpenAddModal?: () => void;
  onOpenEditModal?: (boMon: BoMonItem) => void;
  onDeleteBoMon?: (idBm: number | undefined) => void;
  onRefresh?: () => void;
}

/**
 * Component Logic Quản Lý Danh Sách Bộ Môn Trung Tâm
 */
const DanhSachBoMon: React.FC<DanhSachBoMonProps> = ({
  boMonList = [],
  loading = false,
  onSelectBoMon,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteBoMon,
  onRefresh
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');

  // Lọc theo từ khóa tìm kiếm
  const filteredList = useMemo(() => {
    if (!searchKeyword.trim()) return boMonList;
    const kw = searchKeyword.toLowerCase();
    return boMonList.filter((bm) => 
      (bm.tenBm || bm.tenBoMon || '').toLowerCase().includes(kw) ||
      (bm.moTa || '').toLowerCase().includes(kw)
    );
  }, [boMonList, searchKeyword]);

  return (
    <DanhSachBoMonView
      filteredList={filteredList}
      loading={loading}
      searchKeyword={searchKeyword}
      setSearchKeyword={setSearchKeyword}
      onSelectBoMon={onSelectBoMon}
      onOpenAddModal={onOpenAddModal}
      onOpenEditModal={onOpenEditModal}
      onDeleteBoMon={onDeleteBoMon}
      onRefresh={onRefresh}
    />
  );
};

export default DanhSachBoMon;
