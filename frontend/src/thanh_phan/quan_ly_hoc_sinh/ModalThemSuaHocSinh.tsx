import React, { useState, useEffect } from 'react';
import { dichVuHocSinhPhuHuynh } from '../../dich_vu/tao_tu_dong/dichVuHocSinhPhuHuynh';
import ModalThemSuaHocSinhView from './ModalThemSuaHocSinhView.jsx';

export interface HocSinhFormItem {
  idHs?: number;
  hoTen?: string;
  cccd?: string;
  soDienThoai?: string;
  sdt?: string;
  gioiTinh?: string;
  ngaySinh?: string;
  diaChi?: string;
}

export interface DoanhNghiepRef {
  idDn?: number;
  tenDn?: string;
}

export interface ModalThemSuaHocSinhProps {
  show?: boolean;
  onClose?: () => void;
  editingStudent?: HocSinhFormItem | null;
  selectedDnId?: number;
  currentDn?: DoanhNghiepRef;
  onSuccess?: (savedStudent: any) => void;
}

/**
 * Component Logic Modal Thêm mới và Chỉnh sửa Hồ sơ Học sinh
 */
const ModalThemSuaHocSinh: React.FC<ModalThemSuaHocSinhProps> = ({
  show = false,
  onClose,
  editingStudent = null,
  selectedDnId = 1,
  currentDn = {},
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    hoTen: '',
    cccd: '',
    soDienThoai: '',
    gioiTinh: 'M',
    ngaySinh: '',
    diaChi: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        hoTen: editingStudent.hoTen || '',
        cccd: editingStudent.cccd || '',
        soDienThoai: editingStudent.soDienThoai || editingStudent.sdt || '',
        gioiTinh: (editingStudent.gioiTinh === 'F' || editingStudent.gioiTinh === 'Nu' || editingStudent.gioiTinh === 'Nữ') ? 'F' : 'M',
        ngaySinh: editingStudent.ngaySinh || '',
        diaChi: editingStudent.diaChi || ''
      });
    } else {
      setFormData({
        hoTen: '',
        cccd: '',
        soDienThoai: '',
        gioiTinh: 'M',
        ngaySinh: '',
        diaChi: ''
      });
    }
    setErrorMsg('');
  }, [editingStudent, show]);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const hoTen = formData.hoTen.trim();
    const cccd = formData.cccd.trim();
    const sdt = formData.soDienThoai.trim();

    if (!hoTen) {
      setErrorMsg('Họ và tên học sinh không được để trống.');
      return;
    }

    if (cccd && !/^[0-9]{9,12}$/.test(cccd)) {
      setErrorMsg('Số CCCD phải chứa từ 9 đến 12 chữ số hợp lệ.');
      return;
    }

    if (sdt && !/^[0-9]{10,11}$/.test(sdt)) {
      setErrorMsg('Số điện thoại phải chứa 10 đến 11 chữ số.');
      return;
    }

    const payload = {
      hoTen,
      cccd: cccd || null,
      soDienThoai: sdt || null,
      gioiTinh: formData.gioiTinh,
      ngaySinh: formData.ngaySinh || null,
      diaChi: formData.diaChi.trim() || null,
      idDn: selectedDnId,
      xoa: false
    };

    try {
      setSubmitting(true);
      let res: any;
      if (editingStudent && editingStudent.idHs) {
        res = await dichVuHocSinhPhuHuynh.updateHocSinh(editingStudent.idHs, payload);
      } else {
        res = await dichVuHocSinhPhuHuynh.createHocSinh(selectedDnId, payload);
      }
      const saved = res?.data || res;
      if (onSuccess) onSuccess(saved);
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Lỗi khi lưu thông tin học sinh:', err);
      setErrorMsg(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin học sinh, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalThemSuaHocSinhView
      show={show}
      onClose={onClose}
      editingStudent={editingStudent}
      currentDn={currentDn}
      formData={formData}
      setFormData={setFormData}
      submitting={submitting}
      errorMsg={errorMsg}
      onSubmit={handleSubmit}
    />
  );
};

export default ModalThemSuaHocSinh;
