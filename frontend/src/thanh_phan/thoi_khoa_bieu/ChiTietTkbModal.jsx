import React from 'react';
import { Clock, BookOpen, MapPin, User, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import ModalWrapper from '../ModalWrapper';

/**
 * ChiTietTkbModal:
 * Modal xem chi tiết và thực hiện thao tác xóa lịch dạy trên thời khóa biểu
 */
const ChiTietTkbModal = ({
  selectedCard,
  onClose,
  onDelete,
  deleting = false,
  isReadOnly = false,
  isSlotPast,
  currentWeek
}) => {
  if (!selectedCard) return null;

  const slotPast = isSlotPast ? isSlotPast(selectedCard.thu, selectedCard.caHoc, selectedCard.gioKetThuc) : false;
  const cannotDelete = isReadOnly || slotPast;

  return (
    <ModalWrapper
      isOpen={Boolean(selectedCard)}
      onClose={onClose}
      maxWidth="max-w-[480px]"
      title={
        <div>
          <span className="badge badge-info inline-block mb-1 text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
            Chi Tiết Thời Khóa Biểu
          </span>
          <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
            {selectedCard.tenLop || `Lớp #${selectedCard.idLop}`}
          </h3>
        </div>
      }
    >
      {/* Thông tin chi tiết */}
      <div className="flex flex-col gap-2.5 mb-5">
        <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <Clock size={16} className="text-blue-500 shrink-0" />
          <div>
            <div className="text-xs text-slate-500">Thời gian & Ca học</div>
            <div className="text-sm font-bold text-slate-900">
              {selectedCard.thu === 8 ? 'Chủ Nhật' : `Thứ ${selectedCard.thu}`} • Ca {selectedCard.caHoc} ({selectedCard.gioBatDau || '--:--'} - {selectedCard.gioKetThuc || '--:--'})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <BookOpen size={16} className="text-emerald-500 shrink-0" />
          <div>
            <div className="text-xs text-slate-500">Khóa học / Bộ môn</div>
            <div className="text-sm font-bold text-slate-900">
              {selectedCard.tenKhoaHoc || 'Chương trình đào tạo chuẩn'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <MapPin size={16} className="text-amber-500 shrink-0" />
          <div>
            <div className="text-xs text-slate-500">Phòng học & Cơ sở</div>
            <div className="text-sm font-bold text-slate-900">
              {selectedCard.tenPhong || 'Chưa phân phòng'} {selectedCard.tenChiNhanh ? `(${selectedCard.tenChiNhanh})` : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <User size={16} className="text-purple-600 shrink-0" />
          <div>
            <div className="text-xs text-slate-500">Giáo viên phụ trách</div>
            <div className="text-sm font-bold text-slate-900">
              {selectedCard.tenGiaoVien || 'Chưa phân công giáo viên'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <CalendarIcon size={16} className="text-blue-500 shrink-0" />
          <div>
            <div className="text-xs text-slate-500">Tuần học</div>
            <div className="text-sm font-bold text-slate-900">
              Tuần {selectedCard.soTuan || currentWeek?.soTuan || selectedCard.idTh} {selectedCard.moTaTuan ? ` - ${selectedCard.moTaTuan}` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Thao tác */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-100">
        {cannotDelete ? (
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold inline-flex items-center gap-1.5">
            <Clock size={14} />
            <span>{isReadOnly ? 'Chế độ chỉ xem' : 'Tiết học đã qua (Không thể xóa)'}</span>
          </div>
        ) : (
          <button
            onClick={() => onDelete && onDelete(selectedCard.idTkbTuan)}
            disabled={deleting}
            className="px-3.5 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Trash2 size={15} />
            <span>{deleting ? 'Đang xóa...' : 'Xóa lịch dạy này'}</span>
          </button>
        )}

        <button
          onClick={onClose}
          className="droplet-pill px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm cursor-pointer transition-colors shadow-sm"
        >
          Đóng
        </button>
      </div>
    </ModalWrapper>
  );
};

export default ChiTietTkbModal;


