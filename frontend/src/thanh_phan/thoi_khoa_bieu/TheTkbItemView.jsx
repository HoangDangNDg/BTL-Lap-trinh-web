import React from 'react';
import { User, Clock } from 'lucide-react';
import styles from './TheTkbItem.module.css';

/**
 * TheTkbItemView:
 * Giao diện thẻ hiển thị một tiết học trong ô thời khóa biểu (Pure Presentation JSX)
 */
const TheTkbItemView = ({
  item,
  theme,
  displayTime = '',
  showRoom = false,
  onClick
}) => {
  return (
    <div
      className={`tkb-card-item ${styles.card}`}
      onClick={onClick}
      style={{
        backgroundColor: theme.bg,
        borderLeft: `3px solid ${theme.border}`
      }}
    >
      {/* Tên lớp */}
      <div
        className={styles.className}
        style={{ color: theme.text }}
      >
        {item.tenLop || 'Lớp đào tạo'}
      </div>

      {/* Tên khóa học / môn */}
      {item.tenKhoaHoc && (
        <div className={styles.courseName}>
          {item.tenKhoaHoc}
        </div>
      )}

      {/* Giáo viên */}
      {item.tenGiaoVien && (
        <div className={styles.teacherRow}>
          <User size={11} style={{ color: theme.border }} className={styles.timeIcon} />
          <span className={styles.teacherName}>
            {item.tenGiaoVien}
          </span>
        </div>
      )}

      {/* Thời gian và Phòng (nếu showRoom) */}
      <div className={styles.footerRow}>
        <div className={styles.timeGroup}>
          <Clock size={10} className={styles.timeIcon} />
          <span>{displayTime}</span>
        </div>

        {showRoom && item.tenPhong && (
          <span
            className={styles.roomTag}
            style={{
              color: theme.text,
              backgroundColor: theme.tagBg
            }}
          >
            {item.tenPhong}
          </span>
        )}
      </div>
    </div>
  );
};

export default TheTkbItemView;
