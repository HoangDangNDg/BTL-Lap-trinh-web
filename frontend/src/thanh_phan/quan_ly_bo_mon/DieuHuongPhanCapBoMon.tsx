import React from 'react';
import { 
  Layers, 
  Award, 
  BookOpen, 
  GraduationCap, 
  Users, 
  User, 
  Calendar, 
  CalendarPlus, 
  CheckCircle2 
} from 'lucide-react';
import DieuHuongPhanCapBoMonView from './DieuHuongPhanCapBoMonView.jsx';

export interface NavStepItem {
  step: string;
  data?: any;
}

export interface DieuHuongPhanCapBoMonProps {
  navQueue?: NavStepItem[];
  onPopStep?: () => void;
  onJumpToStep?: (index: number) => void;
  onRefresh?: () => void;
  loading?: boolean;
  extraRight?: React.ReactNode;
}

/**
 * Component Logic thanh điều hướng Queue State & Rollback cho Quản Lý Bộ Môn
 */
const DieuHuongPhanCapBoMon: React.FC<DieuHuongPhanCapBoMonProps> = ({
  navQueue = [],
  onPopStep,
  onJumpToStep,
  onRefresh,
  loading = false,
  extraRight = null
}) => {
  const canRollback = navQueue.length > 1;

  // Lấy icon tương ứng với từng bước
  const getStepIcon = (step: string) => {
    switch (step) {
      case 'BO_MON':
        return <Layers size={16} className="text-[#0284C7]" />;
      case 'CHUYEN_MON':
        return <Award size={16} className="text-[#8B5CF6]" />;
      case 'CHI_TIET_CHUYEN_MON':
        return <BookOpen size={16} className="text-[#10B981]" />;
      case 'LOP_HOC_MON_HOC':
        return <GraduationCap size={16} className="text-[#F59E0B]" />;
      case 'KHOA_HOC':
        return <BookOpen size={16} className="text-[#0284C7]" />;
      case 'BUOI_HOC':
        return <Calendar size={16} className="text-[#3B82F6]" />;
      case 'HOC_SINH_KHOA_HOC':
        return <Users size={16} className="text-[#10B981]" />;
      case 'HOC_SINH_DETAIL':
        return <User size={16} className="text-[#6366F1]" />;
      case 'TAO_BUOI_HOC':
        return <CalendarPlus size={16} className="text-[#14B8A6]" />;
      case 'DIEM_DANH':
        return <CheckCircle2 size={16} className="text-[#059669]" />;
      case 'TONG_HOP_DIEM_DANH':
        return <Award size={16} className="text-[#D97706]" />;
      default:
        return <Layers size={16} />;
    }
  };

  // Lấy nhãn hiển thị cho từng bước trong Queue
  const getStepLabel = (item: NavStepItem, index: number) => {
    switch (item.step) {
      case 'BO_MON':
        return 'Tất cả Bộ Môn';
      case 'CHUYEN_MON':
        return item.data?.boMon?.tenBm || item.data?.boMon?.tenBoMon || `Bộ môn #${item.data?.boMon?.idBm || item.data?.boMon?.idBoMon || ''}`;
      case 'CHI_TIET_CHUYEN_MON':
        return item.data?.chuyenMon?.tenCm || `Chuyên môn #${item.data?.chuyenMon?.idCm || ''}`;
      case 'LOP_HOC_MON_HOC':
        return item.data?.monHoc?.tenMon || item.data?.monHoc?.tenMonHoc || `Lớp học môn #${item.data?.monHoc?.idMh || ''}`;
      case 'KHOA_HOC':
        return item.data?.lopHoc?.tenLop || `Lớp #${item.data?.lopHoc?.idLop || ''}`;
      case 'BUOI_HOC':
        return item.data?.khoaHoc?.tenKhoaHoc || `Khóa #${item.data?.khoaHoc?.idKhoaHoc || ''}`;
      case 'HOC_SINH_KHOA_HOC':
        return 'Danh sách học sinh';
      case 'HOC_SINH_DETAIL':
        return item.data?.hocSinh?.hoTen || 'Hồ sơ học sinh';
      case 'TAO_BUOI_HOC':
        return 'Tạo buổi học';
      case 'DIEM_DANH':
        return 'Điểm danh buổi học';
      case 'TONG_HOP_DIEM_DANH':
        return 'Bảng tổng hợp điểm danh';
      default:
        return `Nấc ${index + 1}`;
    }
  };

  return (
    <DieuHuongPhanCapBoMonView
      navQueue={navQueue}
      canRollback={canRollback}
      onPopStep={onPopStep}
      onJumpToStep={onJumpToStep}
      onRefresh={onRefresh}
      loading={loading}
      extraRight={extraRight}
      getStepIcon={getStepIcon}
      getStepLabel={getStepLabel}
    />
  );
};

export default DieuHuongPhanCapBoMon;
