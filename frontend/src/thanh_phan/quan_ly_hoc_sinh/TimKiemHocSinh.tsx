import React, { useState } from 'react';
import TimKiemHocSinhView from './TimKiemHocSinhView.jsx';

export interface HocSinhResultItem {
  idHs?: number;
  hoTen?: string;
  gioiTinh?: string;
  cccd?: string;
  soDienThoai?: string;
  sdt?: string;
  ngaySinh?: string;
  diaChi?: string;
  xoa?: boolean;
  phuHuynh?: {
    idPh?: number;
    hoTen?: string;
    tenPh?: string;
  };
}

export interface TimKiemHocSinhProps {
  user?: any;
  selectedDnId?: number;
  onChangeDnId?: (id: number) => void;
  currentDn?: any;
  searchResults?: HocSinhResultItem[];
  searchType?: 'CCCD' | 'SDT' | null;
  searchKeyword?: string;
  loading?: boolean;
  errorMessage?: string;
  onSearchCccd?: (cccd: string) => void;
  onSearchSdt?: (sdt: string) => void;
  onResetSearch?: () => void;
  onSelectStudent?: (hs: HocSinhResultItem) => void;
  onOpenAddModal?: () => void;
  onOpenEditModal?: (hs: HocSinhResultItem) => void;
  onToggleDelete?: (hs: HocSinhResultItem) => void;
}

/**
 * Component Logic Vùng Tìm Kiếm Học Sinh
 */
const TimKiemHocSinh: React.FC<TimKiemHocSinhProps> = ({
  user,
  selectedDnId,
  onChangeDnId,
  searchResults = [],
  searchType = null,
  searchKeyword = '',
  loading = false,
  errorMessage = '',
  onSearchCccd,
  onSearchSdt,
  onResetSearch,
  onSelectStudent,
  onOpenAddModal,
  onOpenEditModal,
  onToggleDelete
}) => {
  const [inputCccd, setInputCccd] = useState('');
  const [inputSdt, setInputSdt] = useState('');

  // Xử lý tìm theo CCCD
  const handleSubmitCccd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputCccd.trim();
    if (!val) return;
    setInputSdt('');
    if (onSearchCccd) onSearchCccd(val);
  };

  // Xử lý tìm theo SĐT
  const handleSubmitSdt = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputSdt.trim();
    if (!val) return;
    setInputCccd('');
    if (onSearchSdt) onSearchSdt(val);
  };

  const handleClearAll = () => {
    setInputCccd('');
    setInputSdt('');
    if (onResetSearch) onResetSearch();
  };

  return (
    <TimKiemHocSinhView
      user={user}
      selectedDnId={selectedDnId}
      onChangeDnId={onChangeDnId}
      searchResults={searchResults}
      searchType={searchType}
      searchKeyword={searchKeyword}
      loading={loading}
      errorMessage={errorMessage}
      inputCccd={inputCccd}
      setInputCccd={setInputCccd}
      inputSdt={inputSdt}
      setInputSdt={setInputSdt}
      onSubmitCccd={handleSubmitCccd}
      onSubmitSdt={handleSubmitSdt}
      onClearAll={handleClearAll}
      onSelectStudent={onSelectStudent}
      onOpenAddModal={onOpenAddModal}
      onOpenEditModal={onOpenEditModal}
      onToggleDelete={onToggleDelete}
    />
  );
};

export default TimKiemHocSinh;
