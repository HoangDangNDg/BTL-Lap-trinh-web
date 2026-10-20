import React, { useState, useEffect, useMemo } from 'react';
import { dichVuHocSinhPhuHuynh } from '../../dich_vu/tao_tu_dong/dichVuHocSinhPhuHuynh';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import ModalThemHocSinhVaoLopView from './ModalThemHocSinhVaoLopView.jsx';

export interface ModalThemHocSinhVaoLopProps {
  isOpen: boolean;
  onClose: () => void;
  idLop?: number | null;
  tenLop?: string;
  idKhoaHoc?: number | null;
  tenKhoaHoc?: string;
  siSoToiDa?: number;
  currentCount?: number;
  existingStudentIds?: (number | string)[];
  onSuccess?: () => void;
}

export interface FormHocSinhData {
  hoTen: string;
  cccd: string;
  ngaySinh: string;
  gioiTinh: 'M' | 'F' | string;
  soDienThoai: string;
  diaChi: string;
  phuHuynhTen: string;
  phuHuynhSdt: string;
  phuHuynhCccd: string;
}

export interface ToastNotification {
  type: 'success' | 'error';
  message: string;
}

const ModalThemHocSinhVaoLop: React.FC<ModalThemHocSinhVaoLopProps> = ({
  isOpen,
  onClose,
  idLop,
  tenLop,
  idKhoaHoc,
  tenKhoaHoc,
  siSoToiDa = 30,
  currentCount = 0,
  existingStudentIds = [],
  onSuccess
}) => {
  const { user } = useTrangThaiXacThuc();
  const idDn = user?.idDoanhNghiep || 1;

  // Tabs: 'TRA_CUU_CCCD' | 'NHAP_THU_CONG'
  const [activeTab, setActiveTab] = useState<'TRA_CUU_CCCD' | 'NHAP_THU_CONG'>('TRA_CUU_CCCD');

  // States tra cứu học sinh theo CCCD
  const [searchCccdKw, setSearchCccdKw] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // States form nhập học sinh thủ công
  const [formHs, setFormHs] = useState<FormHocSinhData>({
    hoTen: '',
    cccd: '',
    ngaySinh: '',
    gioiTinh: 'M',
    soDienThoai: '',
    diaChi: '',
    phuHuynhTen: '',
    phuHuynhSdt: '',
    phuHuynhCccd: ''
  });
  const [submittingManual, setSubmittingManual] = useState(false);

  // Reset states khi modal mở
  useEffect(() => {
    if (isOpen) {
      setSearchCccdKw('');
      setSearchResults([]);
      setSearching(false);
      setHasSearched(false);
      setAddedIds(new Set());
      setToast(null);
      setActiveTab('TRA_CUU_CCCD');
    }
  }, [isOpen]);

  // Tập hợp các ID đã có trong lớp (kể cả ban đầu + vừa thêm)
  const existingSet = useMemo(() => {
    const s = new Set<number>((existingStudentIds || []).map(Number));
    addedIds.forEach(id => s.add(id));
    return s;
  }, [existingStudentIds, addedIds]);

  const currentEnrolled = (currentCount || 0) + addedIds.size;
  const isClassFull = currentEnrolled >= siSoToiDa;
  const fillPercent = Math.min(100, Math.round((currentEnrolled / siSoToiDa) * 100));

  // Thực hiện tra cứu học sinh theo CCCD (Chỉ query khi người dùng yêu cầu)
  const handleSearchCccd = async (keyword?: string) => {
    const kw = (keyword !== undefined ? keyword : searchCccdKw).trim();
    if (!kw) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setSearching(true);
      setHasSearched(true);
      const res = await dichVuHocSinhPhuHuynh.timHocSinhTheoCccd(kw);
      const list = Array.isArray(res) ? res : (res?.data || []);
      // Lọc bỏ học sinh đã có trong lớp
      const filtered = list.filter((hs: any) => !existingSet.has(Number(hs.idHs)));
      setSearchResults(filtered);
    } catch (err) {
      console.error('Lỗi tra cứu học sinh theo CCCD:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Xử lý thêm học sinh tìm được vào lớp / khóa học
  const handleAddStudent = async (hs: any) => {
    if ((!idLop && !idKhoaHoc) || !hs?.idHs) return;
    try {
      setAddingId(hs.idHs);
      if (idLop) {
        // Đồng bộ cả dang_ky_hoc và hoc_sinh_khoa_hoc
        await dichVuDaoTaoChung.themHocSinhVaoLop(idLop, hs.idHs, hs.phuHuynh?.idPh);
      } else if (idKhoaHoc) {
        await dichVuHocSinhPhuHuynh.ganHocSinhKhoaHoc({
          idKhoaHoc,
          idHs: hs.idHs,
          idDn: idDn,
          soBuoiDaHoc: 0,
          ngayDangKy: new Date().toISOString().split('T')[0],
          trangThai: true
        });
      }
      
      setAddedIds(prev => new Set(prev).add(Number(hs.idHs)));
      // Loại bỏ học sinh vừa thêm khỏi kết quả tìm kiếm hiện tại
      setSearchResults(prev => prev.filter(item => item.idHs !== hs.idHs));

      setToast({ 
        type: 'success', 
        message: `Đã thêm học sinh "${hs.hoTen}" vào ${tenLop || tenKhoaHoc || 'lớp/khóa học'} thành công!` 
      });

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => setToast(null), 3500);
    } catch (err: any) {
      console.error('Lỗi thêm học sinh vào lớp/khóa học:', err);
      setToast({ 
        type: 'error', 
        message: 'Lỗi: ' + (err?.response?.data?.message || err.message || 'Không thể thêm học sinh') 
      });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setAddingId(null);
    }
  };

  // Xử lý nhập thông tin học sinh thủ công & ghi danh vào lớp
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHs.hoTen.trim()) {
      setToast({ type: 'error', message: 'Vui lòng nhập họ và tên học sinh' });
      return;
    }
    if (isClassFull) {
      setToast({ type: 'error', message: 'Lớp học đã đạt sĩ số tối đa, không thể thêm mới' });
      return;
    }

    try {
      setSubmittingManual(true);

      // 1. Tạo học sinh mới trong hệ thống
      const newHsData = {
        hoTen: formHs.hoTen.trim(),
        cccd: formHs.cccd.trim() || null,
        ngaySinh: formHs.ngaySinh || null,
        gioiTinh: formHs.gioiTinh || 'M',
        soDienThoai: formHs.soDienThoai.trim() || null,
        diaChi: formHs.diaChi.trim() || null,
        xoa: false
      };

      const resHs: any = await dichVuHocSinhPhuHuynh.createHocSinh(idDn, newHsData);
      const createdHs = resHs?.data || resHs;
      const createdIdHs = createdHs?.idHs;

      if (!createdIdHs) {
        throw new Error('Không nhận được mã học sinh mới sau khi lưu');
      }

      // 2. Tạo phụ huynh liên kết (nếu có thông tin)
      let createdIdPh = null;
      if (formHs.phuHuynhTen.trim() || formHs.phuHuynhSdt.trim()) {
        try {
          const resPh: any = await dichVuHocSinhPhuHuynh.taoMoiPhuHuynhChoHocSinh(
            createdIdHs,
            {
              hoTen: formHs.phuHuynhTen.trim() || 'Phụ huynh',
              soDienThoai: formHs.phuHuynhSdt.trim() || null,
              cccd: formHs.phuHuynhCccd.trim() || null
            },
            'Phụ huynh'
          );
          const createdPh = resPh?.data || resPh;
          createdIdPh = createdPh?.idPh;
        } catch (errPh) {
          console.warn('Lỗi phụ khi liên kết phụ huynh:', errPh);
        }
      }

      // 3. Ghi danh học sinh vào lớp học / khóa học
      if (idLop) {
        await dichVuDaoTaoChung.themHocSinhVaoLop(idLop, createdIdHs, createdIdPh);
      } else if (idKhoaHoc) {
        await dichVuHocSinhPhuHuynh.ganHocSinhKhoaHoc({
          idKhoaHoc,
          idHs: createdIdHs,
          idDn: idDn,
          soBuoiDaHoc: 0,
          ngayDangKy: new Date().toISOString().split('T')[0],
          trangThai: true
        });
      }

      // 4. Cập nhật trạng thái
      setAddedIds(prev => new Set(prev).add(Number(createdIdHs)));
      setToast({
        type: 'success',
        message: `Đã tạo mới và thêm học sinh "${formHs.hoTen}" vào ${tenLop || tenKhoaHoc || 'lớp học'} thành công!`
      });

      if (onSuccess) {
        onSuccess();
      }

      // Reset form
      setFormHs({
        hoTen: '',
        cccd: '',
        ngaySinh: '',
        gioiTinh: 'M',
        soDienThoai: '',
        diaChi: '',
        phuHuynhTen: '',
        phuHuynhSdt: '',
        phuHuynhCccd: ''
      });

      setTimeout(() => setToast(null), 3500);
    } catch (err: any) {
      console.error('Lỗi khi thêm học sinh thủ công:', err);
      setToast({
        type: 'error',
        message: 'Lỗi: ' + (err?.response?.data?.message || err.message || 'Không thể tạo học sinh')
      });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSubmittingManual(false);
    }
  };

  // Chuyển sang tab nhập thủ công và điền sẵn số CCCD vừa tra cứu
  const handleSwitchToManualWithCccd = () => {
    setFormHs(prev => ({ ...prev, cccd: searchCccdKw.trim() }));
    setActiveTab('NHAP_THU_CONG');
  };

  return (
    <ModalThemHocSinhVaoLopView
      isOpen={isOpen}
      onClose={onClose}
      tenLop={tenLop}
      tenKhoaHoc={tenKhoaHoc}
      siSoToiDa={siSoToiDa}
      currentEnrolled={currentEnrolled}
      isClassFull={isClassFull}
      fillPercent={fillPercent}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      toast={toast}
      searchCccdKw={searchCccdKw}
      setSearchCccdKw={setSearchCccdKw}
      searchResults={searchResults}
      searching={searching}
      hasSearched={hasSearched}
      addingId={addingId}
      onSearchCccd={handleSearchCccd}
      onAddStudent={handleAddStudent}
      onSwitchToManualWithCccd={handleSwitchToManualWithCccd}
      formHs={formHs}
      setFormHs={setFormHs}
      submittingManual={submittingManual}
      onManualSubmit={handleManualSubmit}
    />
  );
};

export default ModalThemHocSinhVaoLop;
