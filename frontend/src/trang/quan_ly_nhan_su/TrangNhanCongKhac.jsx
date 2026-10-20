import React, { useState, useCallback } from 'react';
import BangDuLieu from '../../thanh_phan/BangDuLieu';
import ThanhChonId from '../../thanh_phan/ThanhChonId';
import { dichVuNhanSu } from '../../dich_vu/tao_tu_dong/dichVuNhanSu';
import { dichVuDoanhNghiep } from '../../dich_vu/tao_tu_dong/dichVuDoanhNghiep';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';

const TrangNhanCongKhac = () => {
  const { user } = useTrangThaiXacThuc();
  const [selectedCnId, setSelectedCnId] = useState(user?.idChiNhanh || 1);

  const columns = [
    { key: 'idNhanCongKhac', label: 'ID', width: '80px', render: (val, item) => item?.idNhanCongKhac || item?.idNck || '-' },
    { key: 'hoTen', label: 'Họ và Tên' },
    { key: 'viTriCongViec', label: 'Vị Trí Công Việc' },
    { key: 'sdt', label: 'Số Điện Thoại', render: (val, item) => item?.sdt || item?.soDienThoai || '-' },
    { key: 'email', label: 'Email', render: (val) => val || '-' },
    { 
      key: 'mucLuong', 
      label: 'Mức Lương',
      render: (val) => (
        <span style={{ fontWeight: '700', color: '#059669' }}>
          {val != null ? `${Number(val).toLocaleString('vi-VN')} đ` : '0 đ'}
        </span>
      )
    },
    { 
      key: 'xoa', 
      label: 'Trạng Thái',
      render: (val) => (
        <span className={`badge ${val ? 'badge-danger' : 'badge-success'}`}>
          {val ? 'Nghỉ việc' : 'Đang làm'}
        </span>
      )
    }
  ];

  const fetchApi = useCallback(() => {
    if (!selectedCnId) return Promise.resolve({ data: [] });
    return dichVuNhanSu.getNhanCongTheoChiNhanh(selectedCnId);
  }, [selectedCnId]);

  return (
    <div className="page-container">
      {(!user?.idChiNhanh || user?.vaiTro === 'ADMIN') && (
        <ThanhChonId
          label="Chọn Chi Nhánh"
          fetchOptions={dichVuDoanhNghiep.getAllChiNhanh}
          value={selectedCnId}
          onChange={(id) => setSelectedCnId(id)}
          getOptionLabel={(item) => item.tenChiNhanh || `Chi nhánh #${item.idCn}`}
          getOptionValue={(item) => item.idCn}
        />
      )}

      <BangDuLieu 
        title="Quản Lý Nhân Sự Vận Hành Khác"
        apiFunction={fetchApi}
        columns={columns}
      />
    </div>
  );
};

export default TrangNhanCongKhac;


