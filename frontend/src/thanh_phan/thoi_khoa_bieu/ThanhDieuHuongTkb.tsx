import React, { useMemo } from 'react';
import { Building, Grid } from 'lucide-react';
import ThanhDieuHuongTkbView from './ThanhDieuHuongTkbView.jsx';

export interface ChiNhanhInfo {
  idCn?: number | string;
  tenCn?: string;
  [key: string]: any;
}

export interface ThanhDieuHuongTkbProps {
  currentChiNhanh?: ChiNhanhInfo | null;
  loading?: boolean;
  isReadOnly?: boolean;
  viewMode?: 'room' | 'grid';
  onChangeViewMode?: (mode: 'room' | 'grid') => void;
  onRefresh?: () => void;
  onOpenAddModal?: () => void;
  onChangeBranch?: () => void;
  onPrint?: () => void;
}

/**
 * Component Logic Thanh Điều Hướng & Banner Thời Khóa Biểu
 */
const ThanhDieuHuongTkb: React.FC<ThanhDieuHuongTkbProps> = ({
  currentChiNhanh,
  loading = false,
  isReadOnly = false,
  viewMode = 'room',
  onChangeViewMode,
  onRefresh,
  onOpenAddModal,
  onChangeBranch,
  onPrint
}) => {
  const viewModeOptions = useMemo(() => [
    { value: 'room', label: 'Theo Phòng & Ca', icon: <Building size={16} /> },
    { value: 'grid', label: 'Theo Tuần', icon: <Grid size={16} /> },
  ], []);

  return (
    <ThanhDieuHuongTkbView
      currentChiNhanh={currentChiNhanh}
      loading={loading}
      isReadOnly={isReadOnly}
      viewMode={viewMode}
      viewModeOptions={viewModeOptions}
      onChangeViewMode={onChangeViewMode}
      onRefresh={onRefresh}
      onOpenAddModal={onOpenAddModal}
      onChangeBranch={onChangeBranch}
      onPrint={onPrint}
    />
  );
};

export default ThanhDieuHuongTkb;
