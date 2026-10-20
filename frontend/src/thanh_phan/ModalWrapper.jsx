import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * ModalWrapper - Component khung Modal dùng chung
 * Sử dụng Tailwind CSS & Droplet Design System
 * Tự động xử lý phím Escape, click ra ngoài để đóng, và khóa cuộn trang
 */
export default function ModalWrapper({
  isOpen,
  onClose,
  title,
  maxWidth = 'max-w-lg', // max-w-sm, max-w-md, max-w-lg, max-w-xl, max-w-2xl, max-w-3xl
  children
}) {
  // Lắng nghe phím Escape và khóa cuộn body khi modal mở
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`droplet-card w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 relative bg-white dark:bg-slate-900 shadow-2xl transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng X góc trên phải */}
        <button
          type="button"
          onClick={onClose}
          className="droplet-circle absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          title="Đóng (Esc)"
          aria-label="Đóng"
        >
          <X size={16} />
        </button>

        {/* Tiêu đề Modal (nếu có) */}
        {title && (
          <div className="mb-5 pr-8">
            {typeof title === 'string' ? (
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h3>
            ) : (
              title
            )}
          </div>
        )}

        {/* Nội dung Form / Body */}
        {children}
      </div>
    </div>
  );
}
