import React from 'react';
import { Search, User } from 'lucide-react';
import DieuHuongPhanCapHocSinhView from './DieuHuongPhanCapHocSinhView.jsx';

export interface NavQueueItem {
  step: string;
  data?: any;
}

export interface DieuHuongPhanCapHocSinhProps {
  navQueue?: NavQueueItem[];
  onPopStep?: () => void;
  onJumpToStep?: (index: number) => void;
  onRefresh?: () => void;
  loading?: boolean;
  extraRight?: React.ReactNode;
}

/**
 * Component Logic thanh điều hướng Queue State & Rollback cho Quản Lý Học Sinh
 */
const DieuHuongPhanCapHocSinh: React.FC<DieuHuongPhanCapHocSinhProps> = ({
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
      case 'TIM_KIEM':
        return <Search size={16} style={{ color: '#0095F6' }} />;
      case 'CHI_TIET':
        return <User size={16} style={{ color: '#10B981' }} />;
      default:
        return <Search size={16} />;
    }
  };

  // Lấy nhãn hiển thị cho từng bước trong Queue
  const getStepLabel = (item: NavQueueItem, index: number) => {
    switch (item.step) {
      case 'TIM_KIEM':
        return 'Tra Cứu Hồ Sơ Học Sinh';
      case 'CHI_TIET':
        return `Hồ Sơ: ${item.data?.hocSinh?.hoTen || 'Chi Tiết Học Sinh'}`;
      default:
        return `Nấc ${index + 1}`;
    }
  };

  return (
    <DieuHuongPhanCapHocSinhView
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

export default DieuHuongPhanCapHocSinh;
