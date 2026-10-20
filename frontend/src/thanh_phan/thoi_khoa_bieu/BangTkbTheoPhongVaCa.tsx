import React, { memo, useMemo } from 'react';
import { getThuHienTai, isDayInPast, WeekDateRange } from './caiDatTkb';
import BangTkbTheoPhongVaCaView from './BangTkbTheoPhongVaCaView.jsx';

export interface PhongHocOption {
  idPhong: number | string;
  tenPhong: string;
  loaiPhong?: string;
  sucChua?: number;
  [key: string]: any;
}

export interface BangTkbTheoPhongVaCaProps {
  selectedThu?: number;
  currentChiNhanh?: { idCn?: number | string; tenCn?: string; [key: string]: any } | null;
  phongHocList?: PhongHocOption[];
  loadingPhongHoc?: boolean;
  roomCaMatrixMap?: Map<string, any[]>;
  isSlotPast?: (thu: number, caHoc: number, gioKetThucStr?: string) => boolean;
  onOpenAddModal?: (params: { idPhong?: number | string; caHoc?: number; thu?: number }) => void;
  onSelectCard?: (item: any) => void;
  isWeekPast?: boolean;
  isCurrentWeek?: boolean;
  isYearFinished?: boolean;
  weekDateRange?: WeekDateRange | null;
}

/**
 * Component Logic Ma trận Thời khóa biểu theo Phòng học x Ca học tại Thứ được chọn
 */
const BangTkbTheoPhongVaCa: React.FC<BangTkbTheoPhongVaCaProps> = memo(({
  selectedThu = getThuHienTai(),
  currentChiNhanh,
  phongHocList = [],
  loadingPhongHoc = false,
  roomCaMatrixMap,
  isSlotPast = () => false,
  onOpenAddModal,
  onSelectCard,
  isWeekPast = false,
  isCurrentWeek = false,
  isYearFinished = false,
  weekDateRange = null
}) => {
  const isToday = useMemo(() => selectedThu === getThuHienTai(), [selectedThu]);

  const isDayPast = useMemo(
    () => isDayInPast(selectedThu, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek),
    [selectedThu, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek]
  );

  return (
    <BangTkbTheoPhongVaCaView
      selectedThu={selectedThu}
      currentChiNhanh={currentChiNhanh}
      phongHocList={phongHocList}
      loadingPhongHoc={loadingPhongHoc}
      roomCaMatrixMap={roomCaMatrixMap}
      isToday={isToday}
      isDayPast={isDayPast}
      isSlotPast={isSlotPast}
      onOpenAddModal={onOpenAddModal}
      onSelectCard={onSelectCard}
    />
  );
});

BangTkbTheoPhongVaCa.displayName = 'BangTkbTheoPhongVaCa';

export default BangTkbTheoPhongVaCa;
