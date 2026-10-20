import React from 'react';
import { CA_HOC_CONFIG, THU_CONFIG } from './caiDatTkb';
import TheTkbItem from './TheTkbItem';
import styles from './BangTkbTheoTuan.module.css';

/**
 * BangTkbTheoTuanView:
 * Giao diện Ma trận Thời khóa biểu theo Ca học x Thứ trong tuần (Pure Presentation JSX)
 */
const BangTkbTheoTuanView = ({
  matrixMap,
  onSelectCard
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.tableWrapper}>
        <table className={`tkb-print-table ${styles.table}`}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.thCa}>
                Ca / Giờ
              </th>
              {THU_CONFIG.map((day) => (
                <th
                  key={day.thu}
                  className={`${styles.thDay} ${day.thu === 8 ? styles.thDaySunday : styles.thDayNormal}`}
                  style={{ width: 'calc((100% - 100px) / 7)' }}
                >
                  <div className={styles.thDayInner}>
                    <span>{day.label}</span>
                    <span className={day.thu === 8 ? styles.shortBadgeSunday : styles.shortBadgeNormal}>
                      {day.short}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {CA_HOC_CONFIG.map((caInfo, idx) => (
              <tr
                key={caInfo.ca}
                className={styles.bodyRow}
                style={{
                  backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafc'
                }}
              >
                {/* Cột Ca học */}
                <td className={styles.tdCa}>
                  <div className={styles.caInfoWrapper}>
                    <span className={styles.caLabel} style={{ color: caInfo.color }}>
                      {caInfo.label}
                    </span>
                    <span
                      className={styles.buoiBadge}
                      style={{
                        backgroundColor: `${caInfo.color}15`,
                        color: caInfo.color
                      }}
                    >
                      {caInfo.buoi}
                    </span>
                    <span className={styles.caTime}>
                      {caInfo.time}
                    </span>
                  </div>
                </td>

                {/* 7 Cột Thứ trong tuần */}
                {THU_CONFIG.map((day) => {
                  const key = `${day.thu}_${caInfo.ca}`;
                  const slotItems = matrixMap?.get(key) || [];

                  return (
                    <td
                      key={day.thu}
                      className={styles.tdSlot}
                      style={{
                        backgroundColor: slotItems.length > 0 ? '#ffffff' : 'transparent'
                      }}
                    >
                      {slotItems.length === 0 ? (
                        <div className={styles.emptySlotPlaceholder}>
                          -
                        </div>
                      ) : (
                        <div className={styles.slotCardsList}>
                          {slotItems.map((item, itemIdx) => (
                            <TheTkbItem
                              key={item.idTkbTuan || itemIdx}
                              item={item}
                              index={itemIdx}
                              defaultTime={caInfo.time}
                              showRoom={true}
                              onClick={onSelectCard}
                            />
                          ))}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BangTkbTheoTuanView;
