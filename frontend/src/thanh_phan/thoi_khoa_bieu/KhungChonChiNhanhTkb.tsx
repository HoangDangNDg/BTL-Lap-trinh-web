import React from 'react';
import KhungChonChiNhanhTkbView from './KhungChonChiNhanhTkbView.jsx';

export interface ChiNhanhOption {
  idCn: number | string;
  tenCn?: string;
  diaChi?: string;
  sdt?: string;
  soPhong?: number;
  [key: string]: any;
}

export interface KhungChonChiNhanhTkbProps {
  chiNhanhList?: ChiNhanhOption[];
  loading?: boolean;
  onSelectChiNhanh: (idCn: number | string) => void;
}

/**
 * Component Logic Bước 1 - Chọn Chi Nhánh Cơ Sở
 */
const KhungChonChiNhanhTkb: React.FC<KhungChonChiNhanhTkbProps> = ({
  chiNhanhList = [],
  loading = false,
  onSelectChiNhanh
}) => {
  return (
    <KhungChonChiNhanhTkbView
      chiNhanhList={chiNhanhList}
      loading={loading}
      onSelectChiNhanh={onSelectChiNhanh}
    />
  );
};

export default KhungChonChiNhanhTkb;
