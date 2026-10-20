import React from 'react';
import { Clock, BookOpen, MapPin, User, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import ModalWrapper from '../ModalWrapper';
import styles from './ChiTietTkbModal.module.css';

/**
 * ChiTietTkbModalView:
 * Giao diện Modal xem chi tiết và xóa lịch dạy trên thời khóa biểu (Pure Presentation JSX)
 */
const ChiTietTkbModalView = ({
  selectedCard,
  onClose,
  onDelete,
  deleting = false,
  isReadOnly = false,
  cannotDelete = false,
  currentWeek
}) => {
  if (!selectedCard) return null;

  return (
    <ModalWrapper
      isOpen={Boolean(selectedCard)}
      onClose={onClose}
      maxWidth="max-w-[480px]"
      title={
        <div>
          <span className={styles.headerBadge}>
            Chi Tiết Thời Khóa Biểu
          </span>
          <h3 className={styles.headerTitle}>
            {selectedCard.tenLop || `Lớp #${selectedCard.idLop}`}
          </h3>
        </div>
      }
    >
      {/* Thông tin chi tiết */}
      <div className={styles.detailList}>
        <div className={styles.detailItem}>
          <Clock size={16} className="text-blue-500 shrink-0" />
          <div>
            <div className={styles.detailLabel}>Thời gian & Ca học</div>
            <div className={styles.detailValue}>
              {selectedCard.thu === 8 ? 'Chủ Nhật' : `Thứ ${selectedCard.thu}`} • Ca {selectedCard.caHoc} ({selectedCard.gioBatDau || '--:--'} - {selectedCard.gioKetThuc || '--:--'})
            </div>
          </div>
        </div>

        <div className={styles.detailItem}>
          <BookOpen size={16} className="text-emerald-500 shrink-0" />
          <div>
            <div className={styles.detailLabel}>Khóa học / Bộ môn</div>
            <div className={styles.detailValue}>
              {selectedCard.tenKhoaHoc || 'Chương trình đào tạo chuẩn'}
            </div>
          </div>
        </div>

        <div className={styles.detailItem}>
          <MapPin size={16} className="text-amber-500 shrink-0" />
          <div>
            <div className={styles.detailLabel}>Phòng học & Cơ sở</div>
            <div className={styles.detailValue}>
              {selectedCard.tenPhong || 'Chưa phân phòng'} {selectedCard.tenChiNhanh ? `(${selectedCard.tenChiNhanh})` : ''}
            </div>
          </div>
        </div>

        <div className={styles.detailItem}>
          <User size={16} className="text-purple-600 shrink-0" />
          <div>
            <div className={styles.detailLabel}>Giáo viên phụ trách</div>
            <div className={styles.detailValue}>
              {selectedCard.tenGiaoVien || 'Chưa phân công giáo viên'}
            </div>
          </div>
        </div>

        <div className={styles.detailItem}>
          <CalendarIcon size={16} className="text-blue-500 shrink-0" />
          <div>
            <div className={styles.detailLabel}>Tuần học</div>
            <div className={styles.detailValue}>
              Tuần {selectedCard.soTuan || currentWeek?.soTuan || selectedCard.idTh} {selectedCard.moTaTuan ? ` - ${selectedCard.moTaTuan}` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Thao tác */}
      <div className={styles.footerWrapper}>
        {cannotDelete ? (
          <div className={styles.readOnlyBadge}>
            <Clock size={14} />
            <span>{isReadOnly ? 'Chế độ chỉ xem' : 'Tiết học đã qua (Không thể xóa)'}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onDelete && onDelete(selectedCard.idTkbTuan)}
            disabled={deleting}
            className={styles.btnDelete}
          >
            <Trash2 size={15} />
            <span>{deleting ? 'Đang xóa...' : 'Xóa lịch dạy này'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className={`droplet-pill ${styles.btnClose}`}
        >
          Đóng
        </button>
      </div>
    </ModalWrapper>
  );
};

export default ChiTietTkbModalView;
