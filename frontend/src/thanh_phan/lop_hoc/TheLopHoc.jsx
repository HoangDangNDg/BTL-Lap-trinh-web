import React from 'react';
import { BookOpen, Users, MapPin, ChevronRight, Droplet, CalendarPlus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/liquid-glass-button';
import { useComponentTheme } from '../../trang_thai/useComponentTheme';
import styles from './TheLopHoc.module.css';

const TheLopHoc = ({ lop, onClick, onTaoBuoiHoc, onDiemDanh }) => {
  const { mode, applyToCards } = useComponentTheme();
  const isDark = mode === 'DARK' && applyToCards;

  return (
    <div
      onClick={() => onClick && onClick(lop)}
      className={`droplet-card the-lop-hoc-card ${styles.card} ${isDark ? styles.cardDark : ''}`}
    >
      <div>
        {/* Card Header */}
        <div className={styles.cardHeader}>
          <div>
            <span className={`${styles.headerSublabel} ${isDark ? styles.headerSublabelDark : ''}`}>
              Lớp đào tạo
            </span>
            <h4 className={`${styles.classTitle} ${isDark ? styles.classTitleDark : ''}`}>
              {lop.tenLop}
            </h4>
          </div>
          <span className="badge badge-success">
            {lop.trangThai || 'Đang mở'}
          </span>
        </div>

        {/* Card Body Metadata */}
        <div className={`${styles.bodyMeta} ${isDark ? styles.bodyMetaDark : ''}`}>
          <div className={styles.metaRow}>
            <BookOpen size={15} className={styles.iconBlue} />
            <span>Khóa: <strong className={isDark ? styles.metaHighlightDark : styles.metaHighlight}>{lop.tenKhoaHoc || 'Chưa gán'}</strong></span>
          </div>

          {(lop.tenMonHoc || lop.monHoc?.tenMon) && (
            <div className={styles.metaRow}>
              <span className={isDark ? styles.badgeMonHocDark : styles.badgeMonHoc}>
                Môn: {lop.tenMonHoc || lop.monHoc?.tenMon}
              </span>
            </div>
          )}

          {lop.tenBoMon && (
            <div className={styles.metaRow}>
              <span className={isDark ? styles.badgeBoMonDark : styles.badgeBoMon}>
                Bộ môn: {lop.tenBoMon}
              </span>
            </div>
          )}

          {lop.tenGiaoVien && (
            <div className={styles.metaRow}>
              <Users size={15} className={styles.iconSky} />
              <span>GV: <strong className={isDark ? styles.metaHighlightDark : styles.metaHighlight}>{lop.tenGiaoVien}</strong></span>
            </div>
          )}

          <div className={styles.metaRow}>
            <MapPin size={15} className={styles.iconGreen} />
            <span>Chi nhánh: {lop.tenChiNhanh || lop.chiNhanh?.tenCn || '--'}</span>
          </div>

          <div className={styles.metaRow}>
            <Users size={15} className={styles.iconAmber} />
            <span>Sĩ số tối đa: {lop.siSoToiDa || 30} học viên</span>
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className={`${styles.cardFooter} ${isDark ? styles.cardFooterDark : ''}`}>
        <div className={styles.actionsGrid}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onTaoBuoiHoc) onTaoBuoiHoc(lop);
            }}
            className={`${styles.btnActionTaoBuoi} ${isDark ? styles.btnActionTaoBuoiDark : ''}`}
          >
            <CalendarPlus size={14} />
            <span>Tạo buổi học</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onDiemDanh) onDiemDanh(lop);
            }}
            className={`${styles.btnActionDiemDanh} ${isDark ? styles.btnActionDiemDanhDark : ''}`}
          >
            <CheckCircle2 size={14} />
            <span>Điểm danh</span>
          </button>
        </div>

        <Button variant="ios-droplet" size="sm" className="w-full justify-between">
          <span className="flex items-center gap-1.5">
            <Droplet size={14} className="text-[#0095F6]" />
            Xem Chi Tiết Lớp
          </span>
          <ChevronRight size={14} className={isDark ? "text-[#94A3B8]" : "text-[#737373]"} />
        </Button>
      </div>
    </div>
  );
};

export default TheLopHoc;


