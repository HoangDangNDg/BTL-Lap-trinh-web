import React from 'react';
import { Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import styles from './ThanhPhanPhoiThu.module.css';

/**
 * ThanhPhanPhoiThuView:
 * Giao diện Dải chọn Thứ trong tuần và hiển thị phân phối số tiết (Pure Presentation JSX)
 */
const ThanhPhanPhoiThuView = ({
  currentChiNhanh,
  selectedThu,
  thuHienTai,
  thuConfigList = [],
  sessionsCountByThu = {},
  onSelectThu
}) => {
  return (
    <div className={`droplet-card ${styles.container}`}>
      <div className={styles.titleSection}>
        <CalendarIcon size={18} className={styles.calendarIcon} />
        <span className={styles.titleLabel}>
          PHÂN PHỐI THEO THỨ:
        </span>
        {currentChiNhanh && (
          <span className={styles.branchText}>
            (Tại <strong className={styles.branchName}>{currentChiNhanh.tenCn}</strong>)
          </span>
        )}

        {/* Nút bấm quay về Thứ hôm nay nếu đang chọn thứ khác */}
        {selectedThu !== thuHienTai && onSelectThu && (
          <button
            type="button"
            onClick={() => onSelectThu(thuHienTai)}
            className={styles.btnReturnToday}
            title="Quay lại thứ của ngày hôm nay"
          >
            <RotateCcw size={11} />
            <span>Về hôm nay ({thuHienTai === 8 ? 'Chủ Nhật' : `Thứ ${thuHienTai}`})</span>
          </button>
        )}
      </div>

      <div className={styles.daysScrollWrapper}>
        {thuConfigList.map((day) => {
          const isAct = selectedThu === day.thu;
          const isToday = day.isToday;
          const isPast = day.isPast;
          const count = sessionsCountByThu[day.thu] || 0;

          let btnClass = styles.dayBtnDefault;
          if (isAct) {
            btnClass = styles.dayBtnActive;
          } else if (isToday) {
            btnClass = styles.dayBtnToday;
          } else if (isPast) {
            btnClass = styles.dayBtnPast;
          }

          return (
            <button
              key={day.thu}
              type="button"
              onClick={() => onSelectThu && onSelectThu(day.thu)}
              className={`${styles.dayBtn} ${btnClass} ${day.thu === 8 && !isAct ? styles.dayBtnSunday : ''}`}
              title={isToday ? `${day.label} (Hôm nay)` : (isPast ? `${day.label} (Đã qua)` : day.label)}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span>{day.label}</span>
                {isToday ? (
                  <span className={isAct ? styles.badgeTodayActive : styles.badgeTodayNormal}>
                    Hôm nay
                  </span>
                ) : isPast ? (
                  <span className={isAct ? styles.badgePastActive : styles.badgePastNormal}>
                    Đã qua
                  </span>
                ) : null}
              </span>
              <span className={isAct ? styles.countBadgeActive : (count > 0 ? styles.countBadgeHasItems : styles.countBadgeEmpty)}>
                {count} tiết
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThanhPhanPhoiThuView;
