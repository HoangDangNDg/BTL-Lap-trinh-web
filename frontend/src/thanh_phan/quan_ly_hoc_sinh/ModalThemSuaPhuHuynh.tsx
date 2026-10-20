import React, { useState, useEffect } from 'react';
import { dichVuHocSinhPhuHuynh } from '../../dich_vu/tao_tu_dong/dichVuHocSinhPhuHuynh';
import ModalThemSuaPhuHuynhView from './ModalThemSuaPhuHuynhView.jsx';

export interface PhuHuynhFormItem {
  idPh?: number;
  id?: number;
  hoTen?: string;
  tenPh?: string;
  soDienThoai?: string;
  sdt?: string;
  cccd?: string;
  email?: string;
  ngheNghiep?: string;
  diaChi?: string;
}

export interface ModalThemSuaPhuHuynhProps {
  show?: boolean;
  onClose?: () => void;
  editingParent?: PhuHuynhFormItem | null;
  selectedDnId?: number;
  onSuccess?: (savedParent: any) => void;
}

/**
 * Component Logic Modal Thêm mới & Chỉnh sửa Hồ sơ Phụ Huynh
 */
const ModalThemSuaPhuHuynh: React.FC<ModalThemSuaPhuHuynhProps> = ({
  show = false,
  onClose,
  editingParent = null,
  selectedDnId = 1,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    hoTen: '',
    soDienThoai: '',
    cccd: '',
    email: '',
    ngheNghiep: '',
    diaChi: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingParent) {
      setFormData({
        hoTen: editingParent.hoTen || editingParent.tenPh || '',
        soDienThoai: editingParent.soDienThoai || editingParent.sdt || '',
        cccd: editingParent.cccd || '',
        email: editingParent.email || '',
        ngheNghiep: editingParent.ngheNghiep || '',
        diaChi: editingParent.diaChi || ''
      });
    } else {
      setFormData({
        hoTen: '',
        soDienThoai: '',
        cccd: '',
        email: '',
        ngheNghiep: '',
        diaChi: ''
      });
    }
    setErrorMsg('');
  }, [editingParent, show]);

  if (!show) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const hoTen = formData.hoTen.trim();
    const sdt = formData.soDienThoai.trim();
    const cccd = formData.cccd.trim();
    const email = formData.email.trim();
    const ngheNghiep = formData.ngheNghiep.trim();
    const diaChi = formData.diaChi.trim();

    if (!hoTen) {
      setErrorMsg('Họ và tên phụ huynh không được để trống.');
      return;
    }

    if (!sdt) {
      setErrorMsg('Số điện thoại liên lạc của phụ huynh không được để trống.');
      return;
    }

    if (!/^[0-9]{9,11}$/.test(sdt)) {
      setErrorMsg('Số điện thoại phải chứa từ 9 đến 11 chữ số hợp lệ.');
      return;
    }

    if (cccd && !/^[0-9]{9,12}$/.test(cccd)) {
      setErrorMsg('Số CCCD phải chứa từ 9 đến 12 chữ số hợp lệ.');
      return;
    }

    const payload = {
      hoTen,
      sdt,
      cccd: cccd || null,
      email: email || null,
      ngheNghiep: ngheNghiep || null,
      diaChi: diaChi || null,
      idDn: selectedDnId,
      xoa: false
    };

    try {
      setSubmitting(true);
      let res: any;
      if (editingParent && (editingParent.idPh || editingParent.id)) {
        const idPh = editingParent.idPh || editingParent.id;
        res = await dichVuHocSinhPhuHuynh.updatePhuHuynh(idPh!, payload);
      } else {
        res = await dichVuHocSinhPhuHuynh.createPhuHuynh(selectedDnId, payload);
      }

      const saved = res?.data || res;
      if (onSuccess) onSuccess(saved);
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Lỗi khi lưu phụ huynh:', err);
      const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi lưu hồ sơ phụ huynh.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalThemSuaPhuHuynhView
      show={show}
      onClose={onClose}
      editingParent={editingParent}
      formData={formData}
      setFormData={setFormData}
      submitting={submitting}
      errorMsg={errorMsg}
      onSubmit={handleSubmit}
    />
  );
};

export default ModalThemSuaPhuHuynh;
