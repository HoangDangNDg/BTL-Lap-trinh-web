import React from 'react';
import { ChevronRight, ArrowLeft, Building2, BookOpen, Layers, Calendar, RefreshCw, UserCheck, Users, User, CalendarPlus, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import styles from './DieuHuongPhanCapLopHoc.module.css';

/**
 * Component thanh điều hướng Queue State & Rollback
 * - Hiển thị Breadcrumb từng nấc: Cơ sở Chi nhánh > [Chi nhánh] > Lớp học > Khóa học > Buổi học > [Giáo viên / Học sinh]
 * - Nút "Quay lại" (Rollback) 1 bước trong hàng đợi
 * - Hỗ trợ bấm trực tiếp vào bất kỳ nấc nào trên breadcrumb để rollback về tầng đó
 */
const DieuHuongPhanCapLopHoc = ({
  navQueue = [],
  onPopStep,
  onJumpToStep,
  onRefresh,
  loading = false,
  extraRight = null
}) => {
  const currentStep = navQueue[navQueue.length - 1] || { step: 'CHI_NHANH', data: {} };
  const canRollback = navQueue.length > 1;

  // Lấy icon tương ứng với từng bước
  const getStepIcon = (step) => {
    switch (step) {
      case 'CHI_NHANH':
        return <Building2 size={16} className="text-[#10B981]" />;
      case 'LOP_HOC':
        return <BookOpen size={16} className="text-[#0095F6]" />;
      case 'KHOA_HOC':
        return <Layers size={16} className="text-[#8B5CF6]" />;
      case 'BUOI_HOC':
        return <Calendar size={16} className="text-[#F59E0B]" />;
      case 'TAO_BUOI_HOC':
        return <CalendarPlus size={16} className="text-[#0095F6]" />;
      case 'DIEM_DANH':
        return <CheckCircle2 size={16} className="text-[#10B981]" />;
      case 'TONG_HOP_DIEM_DANH':
        return <FileSpreadsheet size={16} className="text-[#059669]" />;
      case 'GIAO_VIEN':
        return <UserCheck size={16} className="text-[#7C3AED]" />;
      case 'HOC_SINH_KHOA_HOC':
        return <Users size={16} className="text-[#0095F6]" />;
      case 'HOC_SINH_DETAIL':
        return <User size={16} className="text-[#10B981]" />;
      default:
        return <Layers size={16} />;
    }
  };

  // Lấy nhãn hiển thị cho từng bước trong Queue
  const getStepLabel = (item, index) => {
    switch (item.step) {
      case 'CHI_NHANH':
        return 'Tất cả Cơ sở Chi nhánh';
      case 'LOP_HOC':
        return item.data?.chiNhanh?.tenCn || 'Chi nhánh';
      case 'KHOA_HOC':
        return item.data?.lopHoc?.tenLop || 'Lớp học';
      case 'BUOI_HOC':
        return item.data?.khoaHoc?.tenKhoaHoc || 'Khóa học';
      case 'TAO_BUOI_HOC':
        return 'Tạo Buổi Học Mới';
      case 'DIEM_DANH':
        return item.data?.buoiHoc?.tenBuoi || (item.data?.buoiHoc?.soThuTu ? `Điểm danh Buổi ${item.data.buoiHoc.soThuTu}` : 'Điểm danh Buổi học');
      case 'TONG_HOP_DIEM_DANH':
        return 'Tổng Hợp Điểm Danh';
      case 'GIAO_VIEN':
        return `Thầy/Cô ${item.data?.giaoVien?.hoTen || item.data?.lopHoc?.tenGiaoVien || 'Giáo viên'}`;
      case 'HOC_SINH_KHOA_HOC':
        return `Học sinh khóa ${item.data?.khoaHoc?.tenKhoaHoc || ''}`;
      case 'HOC_SINH_DETAIL':
        return `Học sinh: ${item.data?.hocSinh?.hoTen || ''}`;
      default:
        return `Nấc ${index + 1}`;
    }
  };

  return (
    <div className={styles.container}>
      {/* ── BÊN TRÁI: NÚT ROLLBACK & THANH BREADCRUMB ── */}
      <div className={styles.leftGroup}>
        {canRollback && (
          <button
            type="button"
            onClick={onPopStep}
            className={`droplet-pill ${styles.btnRollback}`}
            title="Quay lại nấc trước đó"
          >
            <ArrowLeft size={16} />
            <span>Quay lại</span>
          </button>
        )}

        {/* Danh sách Breadcrumb trong Queue */}
        <nav aria-label="Breadcrumb" className={styles.breadcrumbNav}>
          {navQueue.map((item, index) => {
            const isLast = index === navQueue.length - 1;
            return (
              <React.Fragment key={`${item.step}-${index}`}>
                <button
                  type="button"
                  onClick={() => onJumpToStep && onJumpToStep(index)}
                  disabled={isLast}
                  className={`${styles.breadcrumbBtn} ${isLast ? styles.breadcrumbBtnActive : ''}`}
                  title={!isLast ? `Bấm để quay lại ${getStepLabel(item, index)}` : undefined}
                >
                  {getStepIcon(item.step)}
                  <span>{getStepLabel(item, index)}</span>
                </button>

                {!isLast && (
                  <ChevronRight size={14} className={styles.breadcrumbSeparator} />
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* ── BÊN PHẢI: EXTRA ACTIONS & NÚT LÀM MỚI ── */}
      <div className={styles.rightGroup}>
        {extraRight}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className={`droplet-pill ${styles.btnRefresh}`}
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>
    </div>
  );
};

export default DieuHuongPhanCapLopHoc;


