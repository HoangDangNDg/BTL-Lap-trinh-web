import React, { useState, useEffect, useCallback } from 'react';
import { dichVuHocSinhPhuHuynh } from '../../dich_vu/tao_tu_dong/dichVuHocSinhPhuHuynh';
import ChiTietPhuHuynhView from './ChiTietPhuHuynhView.jsx';

export interface PhuHuynhDetailItem {
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

export interface ChiTietPhuHuynhProps {
  phuHuynh: PhuHuynhDetailItem;
  onBack?: () => void;
  onEdit?: (parent: PhuHuynhDetailItem) => void;
  onSelectStudent?: (hs: any) => void;
  selectedDnId?: number;
}

/**
 * Component Logic View Chi Tiết Phụ Huynh & Liên Kết Hồ Sơ Học Sinh
 */
const ChiTietPhuHuynh: React.FC<ChiTietPhuHuynhProps> = ({
  phuHuynh,
  onBack,
  onEdit,
  onSelectStudent,
  selectedDnId = 1
}) => {
  const [parentDetail, setParentDetail] = useState<PhuHuynhDetailItem | null>(phuHuynh || null);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Modal liên kết thêm học sinh
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [searchHsCccd, setSearchHsCccd] = useState('');
  const [searchingHs, setSearchingHs] = useState(false);
  const [searchHsResults, setSearchHsResults] = useState<any[]>([]);
  const [selectedHs, setSelectedHs] = useState<any | null>(null);
  const [relationship, setRelationship] = useState('Con');
  const [linkingSubmitting, setLinkingSubmitting] = useState(false);
  const [linkErrorMsg, setLinkErrorMsg] = useState('');

  const parentId = parentDetail?.idPh || parentDetail?.id;

  // Tải chi tiết danh sách học sinh của phụ huynh
  const fetchChildren = useCallback(async () => {
    if (!parentId) return;
    try {
      setLoadingStudents(true);
      const res: any = await dichVuHocSinhPhuHuynh.getHocSinhTheoPhuHuynhBangPhu(parentId);
      const items = Array.isArray(res) ? res : (res?.data || []);
      setStudentsList(items);
    } catch (err) {
      console.warn('Lỗi khi tải học sinh của phụ huynh:', err);
      setStudentsList([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [parentId]);

  useEffect(() => {
    if (phuHuynh) {
      setParentDetail(phuHuynh);
    }
  }, [phuHuynh]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  // Hủy liên kết quan hệ học sinh - phụ huynh
  const handleUnlink = async (idPhHs: number, studentName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy liên kết học sinh "${studentName}" khỏi phụ huynh này không? (Hồ sơ học sinh vẫn được bảo toàn)`)) {
      return;
    }
    try {
      await dichVuHocSinhPhuHuynh.deletePhuHuynhHocSinh(idPhHs);
      await fetchChildren();
    } catch (err: any) {
      console.error('Lỗi khi hủy liên kết:', err);
      alert('Không thể hủy liên kết lúc này: ' + (err?.message || 'Lỗi server'));
    }
  };

  // Tìm kiếm học sinh theo CCCD / SĐT để liên kết
  const handleSearchStudent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchHsCccd.trim();
    if (!query) {
      setLinkErrorMsg('Vui lòng nhập số CCCD hoặc SĐT của học sinh để tra cứu.');
      return;
    }

    setSearchingHs(true);
    setLinkErrorMsg('');
    try {
      let results: any[] = [];
      if (/^[0-9]{9,12}$/.test(query)) {
        const resCccd: any = await dichVuHocSinhPhuHuynh.timHocSinhTheoCccd(query);
        results = Array.isArray(resCccd) ? resCccd : (resCccd?.data || []);
      }
      if (results.length === 0) {
        const resSdt: any = await dichVuHocSinhPhuHuynh.timHocSinhTheoSdt(query);
        results = Array.isArray(resSdt) ? resSdt : (resSdt?.data || []);
      }
      setSearchHsResults(results);
      if (results.length === 0) {
        setLinkErrorMsg('Không tìm thấy học sinh nào với thông tin tra cứu trên.');
      }
    } catch (err: any) {
      console.error('Lỗi tìm học sinh:', err);
      setLinkErrorMsg('Lỗi tra cứu học sinh: ' + (err?.message || 'Không kết nối được server'));
    } finally {
      setSearchingHs(false);
    }
  };

  // Thực hiện liên kết học sinh với phụ huynh
  const handleLinkSubmit = async () => {
    if (!selectedHs || !parentId) {
      setLinkErrorMsg('Vui lòng chọn một học sinh trong danh sách kết quả.');
      return;
    }
    setLinkingSubmitting(true);
    setLinkErrorMsg('');
    try {
      await dichVuHocSinhPhuHuynh.ganQuanHe({
        idPh: parentId,
        idHs: selectedHs.idHs,
        quanHe: relationship || 'Con',
        laNguoiDaiDien: true
      });
      setShowLinkModal(false);
      setSelectedHs(null);
      setSearchHsResults([]);
      setSearchHsCccd('');
      await fetchChildren();
    } catch (err: any) {
      console.error('Lỗi liên kết:', err);
      setLinkErrorMsg(err?.response?.data?.message || err?.message || 'Không thể liên kết học sinh với phụ huynh');
    } finally {
      setLinkingSubmitting(false);
    }
  };

  return (
    <ChiTietPhuHuynhView
      parentDetail={parentDetail}
      parentId={parentId}
      onBack={onBack}
      onEdit={onEdit}
      onSelectStudent={onSelectStudent}
      studentsList={studentsList}
      loadingStudents={loadingStudents}
      onUnlink={handleUnlink}
      showLinkModal={showLinkModal}
      setShowLinkModal={setShowLinkModal}
      searchHsCccd={searchHsCccd}
      setSearchHsCccd={setSearchHsCccd}
      searchingHs={searchingHs}
      searchHsResults={searchHsResults}
      selectedHs={selectedHs}
      setSelectedHs={setSelectedHs}
      relationship={relationship}
      setRelationship={setRelationship}
      linkingSubmitting={linkingSubmitting}
      linkErrorMsg={linkErrorMsg}
      onSearchStudent={handleSearchStudent}
      onLinkSubmit={handleLinkSubmit}
    />
  );
};

export default ChiTietPhuHuynh;
