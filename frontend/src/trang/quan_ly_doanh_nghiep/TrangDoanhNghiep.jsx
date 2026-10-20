import React from 'react';
import BangDuLieu from '../../thanh_phan/BangDuLieu';
import { dichVuDoanhNghiep } from '../../dich_vu/tao_tu_dong/dichVuDoanhNghiep';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';

const TrangDoanhNghiep = () => {
  const { user } = useTrangThaiXacThuc();

  const columns = [
    { key: 'idDn', label: 'ID', width: '80px' },
    { key: 'tenDn', label: 'Tên Doanh Nghiệp' },
    { key: 'maSoThue', label: 'Mã Số Thuế' },
    { key: 'diaChi', label: 'Địa Chỉ' },
    { key: 'soDienThoai', label: 'Số Điện Thoại' },
    { key: 'email', label: 'Email' },
    { 
      key: 'xoa', 
      label: 'Trạng Thái',
      render: (val) => (
        <span className={`badge ${val ? 'badge-danger' : 'badge-success'}`}>
          {val ? 'Đã khóa' : 'Hoạt động'}
        </span>
      )
    }
  ];

  const fetchApi = async () => {
    if (user?.idDoanhNghiep) {
      const dn = await dichVuDoanhNghiep.getDoanhNghiep(user.idDoanhNghiep);
      const list = Array.isArray(dn) ? dn : (dn ? [dn] : []);
      return { data: list };
    }
    return dichVuDoanhNghiep.getAllDoanhNghiep();
  };

  return (
    <div className="page-container">
      <BangDuLieu 
        title="Quản Lý Doanh Nghiệp"
        apiFunction={fetchApi}
        columns={columns}
      />
    </div>
  );
};

export default TrangDoanhNghiep;


