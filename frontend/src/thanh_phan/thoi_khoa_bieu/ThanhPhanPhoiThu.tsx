import React, { memo, useMemo } from 'react';
import { THU_CONFIG, getThuHienTai, isDayInPast, WeekDateRange } from './caiDatTkb';
import ThanhPhanPhoiThuView from './ThanhPhanPhoiThuView.jsx';

export interface ThanhPhanPhoiThuProps {
  currentChiNhanh?: { idCn?: number | string; tenCn?: string; [key: string]: any } | null;
  selectedThu?: number;
  onSelectThu?: (thu: number) => void;
  sessionsCountByThu?: Record<number, number>;
  isWeekPast?: boolean;
  isCurrentWeek?: boolean;
  isYearFinished?: boolean;
  weekDateRange?: WeekDateRange | null;
}

/**
 * Component Logic Thanh Phân Phối Thứ và Số Tiết Trong Tuần
 */
const ThanhPhanPhoiThu: React.FC<ThanhPhanPhoiThuProps> = memo(({
  currentChiNhanh,
  selectedThu = getThuHienTai(),
  onSelectThu,
  sessionsCountByThu = {},
  isWeekPast = false,
  isCurrentWeek = false,
  isYearFinished = false,
  weekDateRange = null
}) => {
  const thuHienTai = useMemo(() => getThuHienTai(), []);

  const thuConfigList = useMemo(() => {
    return THU_CONFIG.map((day) => {
      const isToday = day.thu === thuHienTai;
      const isPast = isDayInPast(day.thu, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek);
      return {
        ...day,
        isToday,
        isPast
      };
    });
  }, [thuHienTai, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek]);

  return (
    <ThanhPhanPhoiThuView
      currentChiNhanh={currentChiNhanh}
      selectedThu={selectedThu}
      thuHienTai={thuHienTai}
      thuConfigList={thuConfigList}
      sessionsCountByThu={sessionsCountByThu}
      onSelectThu={onSelectThu}
    />
  );
});

ThanhPhanPhoiThu.displayName = 'ThanhPhanPhoiThu';

export default ThanhPhanPhoiThu;
