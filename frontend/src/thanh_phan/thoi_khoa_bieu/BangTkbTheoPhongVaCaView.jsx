import React from 'react';
import { Building, DoorClosed, RefreshCw, Plus, Clock } from 'lucide-react';
import { CA_HOC_CONFIG } from './caiDatTkb';
import TheTkbItem from './TheTkbItem';
import styles from './BangTkbTheoPhongVaCa.module.css';

/**
 * BangTkbTheoPhongVaCaView:
 * Giao diện Ma trận Thời khóa biểu theo Phòng học x Ca học tại Thứ được chọn (Pure Presentation JSX)
 */
const BangTkbTheoPhongVaCaView = ({
  selectedThu,
  currentChiNhanh,
  phongHocList = [],
  loadingPhongHoc = false,
  roomCaMatrixMap,
  isToday = false,
  isDayPast = false,
  isSlotPast,
  onOpenAddModal,
  onSelectCard
}) => {
  return (
    <div className={styles.container}>
      {/* Header thanh trạng thái của Ma trận Phòng - Ca */}
      <div className={styles.statusBar}>
        <div className={styles.statusLeft}>
          <span className={styles.titleGroup}>
            <span>Lịch Học {selectedThu === 8 ? 'Chủ Nhật' : `Thứ ${selectedThu}`}</span>
            {isToday ? (
              <span className={styles.badgeToday}>
                Hôm nay
              </span>
            ) : isDayPast ? (
              <span className={styles.badgePast}>
                Đã qua
              </span>
            ) : null}
            <span className={styles.dotDivider}>•</span>
            <span className={styles.branchHighlight}>{currentChiNhanh?.tenCn || 'Chi nhánh'}</span>
          </span>
          <span className={styles.roomCountBadge}>
            {phongHocList.length} phòng học
          </span>
        </div>

        <div className={`no-print ${styles.statusRight} ${isDayPast ? styles.statusRightPast : styles.statusRightNormal}`}>
          {isDayPast ? (
            <span>Thời gian của Thứ này đã trôi qua. Các ô ca học đã bị khóa (Không thể xếp lịch mới).</span>
          ) : (
            <span>Bấm vào ô <strong className={styles.branchHighlight}>+ Trống</strong> để tạo nhanh buổi học cho phòng & ca tương ứng</span>
          )}
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={`tkb-print-table ${styles.table}`}>
          <thead>
            <tr className={styles.headerRow}>
              {/* Cột 1: Phòng Học */}
              <th className={styles.thRoom}>
                <div className={styles.thRoomInner}>
                  <Building size={16} className={styles.thRoomIcon} />
                  <span>Phòng Học ({phongHocList.length})</span>
                </div>
              </th>

              {/* 6 Cột Ca Học (Trục Hoành) */}
              {CA_HOC_CONFIG.map((caInfo) => (
                <th key={caInfo.ca} className={styles.thSlot}>
                  <div className={styles.slotHeaderContent}>
                    <div className={styles.slotHeaderTop}>
                      <span className={styles.slotLabel} style={{ color: caInfo.color }}>
                        {caInfo.label}
                      </span>
                      <span
                        className={styles.buoiTag}
                        style={{
                          backgroundColor: `${caInfo.color}15`,
                          color: caInfo.color
                        }}
                      >
                        {caInfo.buoi}
                      </span>
                    </div>
                    <span className={styles.slotTime}>
                      {caInfo.time}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loadingPhongHoc ? (
              <tr>
                <td colSpan={7} className={styles.loadingCell}>
                  <RefreshCw size={24} className={`animate-spin ${styles.thRoomIcon}`} style={{ margin: '0 auto 0.5rem' }} />
                  <span>Đang nạp danh sách phòng học cơ sở...</span>
                </td>
              </tr>
            ) : phongHocList.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyRoomCell}>
                  <DoorClosed size={36} style={{ margin: '0 auto 0.75rem', color: '#94a3b8' }} />
                  <p style={{ fontWeight: '700', fontSize: '1rem', color: '#1e293b', margin: 0 }}>
                    Chi nhánh này chưa có phòng học nào
                  </p>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Vui lòng thêm phòng học cho cơ sở trong mục Quản lý cơ sở vật chất.
                  </p>
                </td>
              </tr>
            ) : (
              phongHocList.map((phong, pIdx) => {
                let occupiedInDay = 0;
                CA_HOC_CONFIG.forEach((c) => {
                  if ((roomCaMatrixMap?.get(`${phong.idPhong}_${c.ca}`) || []).length > 0) {
                    occupiedInDay += 1;
                  }
                });

                return (
                  <tr
                    key={phong.idPhong || pIdx}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      backgroundColor: pIdx % 2 === 0 ? '#ffffff' : '#fafafc'
                    }}
                  >
                    {/* Cột 1: Thông tin phòng học */}
                    <td className={styles.tdRoom}>
                      <div className={styles.roomInfoWrapper}>
                        <div className={styles.roomName}>
                          {phong.tenPhong}
                        </div>

                        <div className={styles.roomBadges}>
                          {phong.loaiPhong && (
                            <span className={styles.roomTypeTag}>
                              {phong.loaiPhong}
                            </span>
                          )}
                          {phong.sucChua > 0 && (
                            <span className={styles.capacityTag}>
                              {phong.sucChua} chỗ
                            </span>
                          )}
                        </div>

                        {/* Tỉ lệ sử dụng phòng trong ngày */}
                        <div className={styles.occupancyWrapper}>
                          <div className={styles.occupancyTrack}>
                            <div
                              className={styles.occupancyFill}
                              style={{
                                width: `${(occupiedInDay / 6) * 100}%`,
                                backgroundColor: occupiedInDay > 0 ? '#10b981' : '#cbd5e1'
                              }}
                            />
                          </div>
                          <span
                            className={styles.occupancyText}
                            style={{ color: occupiedInDay > 0 ? '#059669' : '#94a3b8' }}
                          >
                            {occupiedInDay}/6 ca
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 6 Cột Ca học */}
                    {CA_HOC_CONFIG.map((caInfo) => {
                      const key = `${phong.idPhong}_${caInfo.ca}`;
                      const slotItems = roomCaMatrixMap?.get(key) || [];
                      const past = isSlotPast ? isSlotPast(selectedThu, caInfo.ca) : false;

                      return (
                        <td
                          key={caInfo.ca}
                          className={styles.tdSlot}
                          style={{
                            backgroundColor: slotItems.length > 0 ? '#ffffff' : 'transparent'
                          }}
                        >
                          {slotItems.length === 0 ? (
                            past ? (
                              /* Ô trống đã qua: Khóa không cho phép xếp lịch */
                              <div
                                className={`o-trong-xep-lich ${styles.pastSlotBox}`}
                                title={`Thời gian ca học này (${caInfo.label}, Thứ ${selectedThu === 8 ? 'CN' : selectedThu}) đã trôi qua trong quá khứ`}
                              >
                                <Clock size={13} style={{ opacity: 0.5 }} />
                                <span>Đã qua</span>
                              </div>
                            ) : (
                              /* Ô trống tương lai: Click để thêm nhanh lịch học */
                              <div
                                className={`o-trong-xep-lich ${styles.emptySlotBox}`}
                                onClick={() => onOpenAddModal && onOpenAddModal({
                                  idPhong: phong.idPhong,
                                  caHoc: caInfo.ca,
                                  thu: selectedThu
                                })}
                                title={`Bấm để xếp lịch cho ${phong.tenPhong} - ${caInfo.label} (Thứ ${selectedThu === 8 ? 'CN' : selectedThu})`}
                              >
                                <Plus size={14} style={{ opacity: 0.6 }} />
                                <span>Trống</span>
                              </div>
                            )
                          ) : (
                            /* Ô có lịch học */
                            <div className={styles.slotCardsList}>
                              {slotItems.map((item, itemIdx) => (
                                <TheTkbItem
                                  key={item.idTkbTuan || itemIdx}
                                  item={item}
                                  index={itemIdx}
                                  defaultTime={caInfo.time}
                                  showRoom={false}
                                  onClick={onSelectCard}
                                />
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BangTkbTheoPhongVaCaView;
