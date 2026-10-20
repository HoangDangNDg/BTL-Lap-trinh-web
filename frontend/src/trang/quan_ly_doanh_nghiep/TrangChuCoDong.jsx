import React, { useState, useCallback } from 'react';
import BangDuLieu from '../../thanh_phan/BangDuLieu';
import ThanhChonId from '../../thanh_phan/ThanhChonId';
import { dichVuDoanhNghiep } from '../../dich_vu/tao_tu_dong/dichVuDoanhNghiep';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';

const TrangChuCoDong = () => {
  const { user } = useTrangThaiXacThuc();
  const [selectedDnId, setSelectedDnId] = useState(user?.idDoanhNghiep || 1);

  const columns = [
    { key: 'idCd', label: 'ID', width: '80px' },
    { key: 'hoTen', label: 'Họ và Tên' },
    { key: 'soDienThoai', label: 'Số Điện Thoại' },
    { key: 'email', label: 'Email' },
    { key: 'cccd', label: 'CCCD/CMND' },
    { key: 'diaChi', label: 'Địa Chỉ' },
    { 
      key: 'doanhNghiep', 
      label: 'Doanh Nghiệp',
      render: (val) => val?.tenDn || '-'
    }
  ];

  const fetchApi = useCallback(() => {
    if (!selectedDnId) return Promise.resolve({ data: [] });
    return dichVuDoanhNghiep.getChuCoDongTheoDoanhNghiep(selectedDnId);
  }, [selectedDnId]);

  return (
    <div className="page-container">
      {(!user?.idDoanhNghiep || user?.vaiTro === 'ADMIN') && (
        <ThanhChonId
          label="Chọn Doanh Nghiệp"
          fetchOptions={dichVuDoanhNghiep.getAllDoanhNghiep}
          value={selectedDnId}
          onChange={(id) => setSelectedDnId(id)}
          getOptionLabel={(item) => item.tenDn || item.tenDoanhNghiep || `DN #${item.idDn}`}
          getOptionValue={(item) => item.idDn}
        />
      )}

      <BangDuLieu 
        title="Quản Lý Chủ Cổ Đông & Nhà Đầu Tư"
        apiFunction={fetchApi}
        columns={columns}
      />
    </div>
  );
};

export default TrangChuCoDong;


