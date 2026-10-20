import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BangDuLieu from '../../thanh_phan/BangDuLieu';
import ThanhChonId from '../../thanh_phan/ThanhChonId';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';

const TrangDangKyHoc = () => {
  const { user } = useTrangThaiXacThuc();
  const location = useLocation();
  const [selectedLopId, setSelectedLopId] = useState(location.state?.selectedLopId || 1);

  useEffect(() => {
    if (location.state?.selectedLopId) {
      setSelectedLopId(location.state.selectedLopId);
    }
  }, [location.state]);

  const columns = [
    { key: 'idDangKy', label: 'Mã ĐK', width: '90px' },
    { 
      key: 'hocSinh', 
      label: 'Học Sinh',
      render: (val) => val?.hoTen || '-'
    },
    { 
      key: 'lopHoc', 
      label: 'Lớp Học',
      render: (val) => val?.tenLop || '-'
    },
    { key: 'ngayDangKy', label: 'Ngày Đăng Ký' },
    { 
      key: 'trangThai', 
      label: 'Trạng Thái',
      render: (val) => (
        <span className="badge badge-success">{val || 'Đã duyệt'}</span>
      )
    }
  ];

  const fetchLopHocOptions = useCallback(() => {
    if (user?.idChiNhanh) {
      return dichVuDaoTaoChung.getDanhSachLopHoc({ idCn: user.idChiNhanh });
    }
    return dichVuDaoTaoChung.getDanhSachLopHoc({ idDn: user?.idDoanhNghiep });
  }, [user]);

  const fetchApi = useCallback(() => {
    if (!selectedLopId) return Promise.resolve({ data: [] });
    return dichVuDaoTaoChung.getDangKyHocTheoLop(selectedLopId);
  }, [selectedLopId]);

  return (
    <div className="page-container">
      <ThanhChonId
        label="Lọc theo Lớp Học"
        fetchOptions={fetchLopHocOptions}
        value={selectedLopId}
        onChange={(id) => setSelectedLopId(id)}
        getOptionLabel={(item) => item.tenLop || `Lớp #${item.idLop}`}
        getOptionValue={(item) => item.idLop}
      />

      <BangDuLieu 
        title="Quản Lý Đăng Ký Khóa Học"
        apiFunction={fetchApi}
        columns={columns}
      />
    </div>
  );
};

export default TrangDangKyHoc;


