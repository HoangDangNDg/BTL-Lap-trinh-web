import React, { useState, useEffect } from 'react';
import { dichVuHocSinhPhuHuynh } from '../../dich_vu/tao_tu_dong/dichVuHocSinhPhuHuynh';
import api from '../../dich_vu/api';
import ModalThemPhuHuynhHocSinhView from './ModalThemPhuHuynhHocSinhView.jsx';

export interface ModalThemPhuHuynhHocSinhProps {
  show?: boolean;
  onClose?: () => void;
  studentId: number;
  studentName?: string;
  selectedDnId?: number;
  onSuccess?: (savedPh: any, relation?: string) => void;
}

/**
 * Component Logic Modal Thêm Phụ Huynh Cho Học Sinh
 */
const ModalThemPhuHuynhHocSinh: React.FC<ModalThemPhuHuynhHocSinhProps> = ({
  show = false,
  onClose,
  studentId,
  studentName = '',
  selectedDnId = 1,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'NEW' | 'EXISTING'>('NEW');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form tạo mới
  const [formData, setFormData] = useState({
    hoTen: '',
    soDienThoai: '',
    cccd: '',
    moiQuanHe: 'Cha / Mẹ',
    ngheNghiep: '',
    diaChi: ''
  });

  // Chế độ chọn phụ huynh có sẵn
  const [searchParentKeyword, setSearchParentKeyword] = useState('');
  const [searchingParent, setSearchingParent] = useState(false);
  const [parentSearchResults, setParentSearchResults] = useState<any[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const [existingRelation, setExistingRelation] = useState('Cha / Mẹ');

  useEffect(() => {
    if (show) {
      setFormData({
        hoTen: '',
        soDienThoai: '',
        cccd: '',
        moiQuanHe: 'Cha / Mẹ',
        ngheNghiep: '',
        diaChi: ''
      });
      setSearchParentKeyword('');
      setParentSearchResults([]);
      setSelectedParentId(null);
      setErrorMessage('');
    }
  }, [show]);

  if (!show) return null;

  // Xử lý tạo mới phụ huynh
  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const hoTen = formData.hoTen.trim();
    const sdt = formData.soDienThoai.trim();

    if (!hoTen) {
      setErrorMessage('Họ và tên phụ huynh không được để trống.');
      return;
    }

    if (!sdt) {
      setErrorMessage('Số điện thoại liên lạc của phụ huynh không được để trống.');
      return;
    }

    const payload = {
      hoTen,
      sdt: sdt,
      soDienThoai: sdt,
      cccd: formData.cccd.trim() || null,
      ngheNghiep: formData.ngheNghiep.trim() || null,
      diaChi: formData.diaChi.trim() || null,
      idDn: selectedDnId,
      xoa: false
    };

    try {
      setSubmitting(true);
      const res: any = await dichVuHocSinhPhuHuynh.taoMoiPhuHuynhChoHocSinh(
        studentId, 
        payload, 
        formData.moiQuanHe || 'Người bảo hộ'
      );
      const savedPh = res?.data || res;
      if (onSuccess) onSuccess(savedPh, formData.moiQuanHe);
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Lỗi khi thêm phụ huynh mới:', err);
      setErrorMessage(err?.response?.data?.message || 'Có lỗi xảy ra khi thêm phụ huynh.');
    } finally {
      setSubmitting(false);
    }
  };

  // Tìm kiếm phụ huynh có sẵn
  const handleSearchExistingParent = async (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const kw = searchParentKeyword.trim();
    if (!kw) return;

    try {
      setSearchingParent(true);
      setErrorMessage('');
      const res: any = await api.get('/api/phu-huynh', {
        params: { sdt: kw }
      });
      const list = Array.isArray(res) ? res : (res?.data || []);
      setParentSearchResults(list);
      if (list.length === 0) {
        // Thử tìm theo danh sách phụ huynh doanh nghiệp
        const allRes: any = await dichVuHocSinhPhuHuynh.getPhuHuynhTheoDoanhNghiep(selectedDnId);
        const allList = Array.isArray(allRes) ? allRes : (allRes?.data || []);
        const filtered = allList.filter((p: any) => 
          (p.hoTen && p.hoTen.toLowerCase().includes(kw.toLowerCase())) ||
          (p.sdt && p.sdt.includes(kw)) ||
          (p.soDienThoai && p.soDienThoai.includes(kw)) ||
          (p.cccd && p.cccd.includes(kw))
        );
        setParentSearchResults(filtered);
      }
    } catch (err) {
      console.error('Lỗi khi tìm phụ huynh:', err);
      setErrorMessage('Không thể tìm kiếm phụ huynh.');
    } finally {
      setSearchingParent(false);
    }
  };

  // Xử lý liên kết phụ huynh có sẵn
  const handleLinkExistingParent = async () => {
    if (!selectedParentId) {
      setErrorMessage('Vui lòng chọn một phụ huynh từ kết quả tìm kiếm.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      await dichVuHocSinhPhuHuynh.ganQuanHe({
        idPh: selectedParentId,
        idHs: studentId,
        quanHe: existingRelation || 'Người bảo hộ',
        laNguoiDaiDien: true
      });
      
      const parentObj = parentSearchResults.find((p) => p.idPh === selectedParentId) || { idPh: selectedParentId };
      if (onSuccess) onSuccess(parentObj, existingRelation);
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Lỗi khi liên kết phụ huynh:', err);
      setErrorMessage(err?.response?.data?.message || 'Không thể liên kết phụ huynh.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalThemPhuHuynhHocSinhView
      show={show}
      onClose={onClose}
      studentId={studentId}
      studentName={studentName}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      submitting={submitting}
      errorMessage={errorMessage}
      formData={formData}
      setFormData={setFormData}
      onSubmitNew={handleSubmitNew}
      searchParentKeyword={searchParentKeyword}
      setSearchParentKeyword={setSearchParentKeyword}
      searchingParent={searchingParent}
      parentSearchResults={parentSearchResults}
      selectedParentId={selectedParentId}
      setSelectedParentId={setSelectedParentId}
      existingRelation={existingRelation}
      setExistingRelation={setExistingRelation}
      onSearchExistingParent={handleSearchExistingParent}
      onLinkExistingParent={handleLinkExistingParent}
    />
  );
};

export default ModalThemPhuHuynhHocSinh;
