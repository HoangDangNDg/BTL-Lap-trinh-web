export const CA_HOC_CONFIG = [
  { ca: 1, label: 'Ca 1', time: '07:30 - 09:30', buoi: 'Sáng', color: '#0095F6' },
  { ca: 2, label: 'Ca 2', time: '09:45 - 11:45', buoi: 'Sáng', color: '#0284C7' },
  { ca: 3, label: 'Ca 3', time: '13:30 - 15:30', buoi: 'Chiều', color: '#D97706' },
  { ca: 4, label: 'Ca 4', time: '15:45 - 17:45', buoi: 'Chiều', color: '#EA580C' },
  { ca: 5, label: 'Ca 5', time: '18:00 - 20:00', buoi: 'Tối', color: '#7E22CE' },
  { ca: 6, label: 'Ca 6', time: '20:15 - 22:00', buoi: 'Tối', color: '#4F46E5' },
];

export const THU_CONFIG = [
  { thu: 2, label: 'Thứ 2', short: 'T2' },
  { thu: 3, label: 'Thứ 3', short: 'T3' },
  { thu: 4, label: 'Thứ 4', short: 'T4' },
  { thu: 5, label: 'Thứ 5', short: 'T5' },
  { thu: 6, label: 'Thứ 6', short: 'T6' },
  { thu: 7, label: 'Thứ 7', short: 'T7' },
  { thu: 8, label: 'Chủ Nhật', short: 'CN' },
];

export const CARD_THEMES = [
  { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF', tagBg: '#DBEAFE' },
  { bg: '#ECFDF5', border: '#10B981', text: '#065F46', tagBg: '#D1FAE5' },
  { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E', tagBg: '#FDE68A' },
  { bg: '#F5F3FF', border: '#8B5CF6', text: '#5B21B6', tagBg: '#EDE9FE' },
  { bg: '#FDF2F8', border: '#EC4899', text: '#9D174D', tagBg: '#FCE7F3' },
  { bg: '#F0FDFA', border: '#14B8A6', text: '#115E59', tagBg: '#CCFBF1' },
];

/**
 * Lấy Thứ trong tuần của ngày hôm nay theo chuẩn hệ thống:
 * Thứ 2 = 2, Thứ 3 = 3, ..., Thứ 7 = 7, Chủ Nhật = 8
 */
export function getThuHienTai() {
  const day = new Date().getDay();
  return day === 0 ? 8 : day + 1;
}

/**
 * Kiểm tra xem một ca học cụ thể trong tuần đã qua thời điểm hiện tại hay chưa.
 * @param {number} thu - Thứ trong tuần (2 -> 8)
 * @param {number} caHoc - Ca học (1 -> 6)
 * @param {string} [gioKetThucStr] - Giờ kết thúc dạng "HH:mm" hoặc "HH:mm:ss"
 * @param {boolean} [isYearFinished] - Năm học đã kết thúc
 * @param {boolean} [isWeekPast] - Tuần học đã kết thúc
 * @param {{ start: Date, end: Date }} [weekDateRange] - Khoảng thời gian tuần học
 * @param {boolean} [isCurrentWeek] - Tuần học đang chọn là tuần hiện tại
 * @returns {boolean} true nếu ca học đã qua, false nếu còn có thể xếp lịch
 */
export function checkSlotPast(thu, caHoc, gioKetThucStr, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek) {
  // 1. Năm học đã kết thúc hoặc Tuần học đã qua -> Toàn bộ ca học đều đã qua
  if (isYearFinished || isWeekPast) return true;

  const now = new Date();
  const thuHienTai = getThuHienTai();

  // 2. Nếu là Tuần học hiện tại theo thời gian thực:
  if (isCurrentWeek) {
    // Thứ trong tuần nhỏ hơn thứ hôm nay (ví dụ: Thứ 2..Thứ 7 khi hôm nay là Chủ Nhật) -> Đã qua
    if (thu < thuHienTai) return true;

    // Nếu chính là ngày hôm nay: Kiểm tra giờ kết thúc của Ca học
    if (thu === thuHienTai) {
      let endHour = 22;
      let endMin = 0;
      if (gioKetThucStr) {
        const parts = gioKetThucStr.substring(0, 5).split(':').map(Number);
        endHour = parts[0];
        endMin = parts[1] || 0;
      } else {
        const caConfig = CA_HOC_CONFIG.find(c => c.ca === caHoc);
        if (caConfig?.time) {
          const timePart = caConfig.time.split(' - ')[1];
          if (timePart) {
            const parts = timePart.split(':').map(Number);
            endHour = parts[0];
            endMin = parts[1] || 0;
          }
        }
      }
      const todaySlotEnd = new Date(now);
      todaySlotEnd.setHours(endHour, endMin, 0, 0);
      return now > todaySlotEnd;
    }

    // Thứ lớn hơn thứ hôm nay trong tuần hiện tại -> Chưa qua
    return false;
  }

  // 3. Nếu có khoảng ngày weekDateRange (Căn chỉnh chuẩn theo Thứ 2 -> Chủ Nhật):
  if (weekDateRange?.start) {
    const startDate = new Date(weekDateRange.start);
    const startDay = startDate.getDay(); // 0 is Sunday, 1..6 is Mon..Sat
    const diffToMonday = (startDay === 0 ? -6 : 1 - startDay);
    const monday = new Date(startDate);
    monday.setDate(startDate.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + (thu === 8 ? 6 : thu - 2));

    let endHour = 22;
    let endMin = 0;
    if (gioKetThucStr) {
      const parts = gioKetThucStr.substring(0, 5).split(':').map(Number);
      endHour = parts[0];
      endMin = parts[1] || 0;
    } else {
      const caConfig = CA_HOC_CONFIG.find(c => c.ca === caHoc);
      if (caConfig?.time) {
        const timePart = caConfig.time.split(' - ')[1];
        if (timePart) {
          const parts = timePart.split(':').map(Number);
          endHour = parts[0];
          endMin = parts[1] || 0;
        }
      }
    }

    const slotEndDateTime = new Date(targetDate);
    slotEndDateTime.setHours(endHour, endMin, 0, 0);
    return now > slotEndDateTime;
  }

  return false;
}

/**
 * Kiểm tra xem một Thứ cụ thể trong tuần học đang chọn đã trôi qua hay chưa
 */
export function isDayInPast(thu, isYearFinished, isWeekPast, weekDateRange, isCurrentWeek) {
  if (isYearFinished || isWeekPast) return true;
  const thuHienTai = getThuHienTai();
  if (isCurrentWeek) {
    return thu < thuHienTai;
  }
  if (weekDateRange?.start) {
    const startDate = new Date(weekDateRange.start);
    const startDay = startDate.getDay();
    const diffToMonday = (startDay === 0 ? -6 : 1 - startDay);
    const monday = new Date(startDate);
    monday.setDate(startDate.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + (thu === 8 ? 6 : thu - 2));
    targetDate.setHours(23, 59, 59, 999);
    return new Date() > targetDate;
  }
  return false;
}


