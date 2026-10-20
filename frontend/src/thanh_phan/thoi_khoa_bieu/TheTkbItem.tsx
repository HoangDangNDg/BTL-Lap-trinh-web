import React, { useMemo } from 'react';
import { CARD_THEMES } from './caiDatTkb';
import TheTkbItemView from './TheTkbItemView.jsx';

export interface TkbItemData {
  idLop?: number | string;
  tenLop?: string;
  tenKhoaHoc?: string;
  tenGiaoVien?: string;
  gioBatDau?: string;
  gioKetThuc?: string;
  tenPhong?: string;
  idTkbTuan?: number | string;
  [key: string]: any;
}

export interface TheTkbItemProps {
  item: TkbItemData;
  index?: number;
  defaultTime?: string;
  showRoom?: boolean;
  onClick?: (item: TkbItemData) => void;
}

/**
 * Component Logic Thẻ Tiết Học Thời Khóa Biểu
 */
const TheTkbItem: React.FC<TheTkbItemProps> = ({
  item,
  index = 0,
  defaultTime = '',
  showRoom = false,
  onClick
}) => {
  const theme = useMemo(() => {
    const themeIndex = Number(item.idLop || index);
    return CARD_THEMES[themeIndex % CARD_THEMES.length];
  }, [item.idLop, index]);

  const displayTime = useMemo(() => {
    if (item.gioBatDau) {
      const start = item.gioBatDau.substring(0, 5);
      const end = item.gioKetThuc ? item.gioKetThuc.substring(0, 5) : '';
      return end ? `${start} - ${end}` : start;
    }
    return defaultTime;
  }, [item.gioBatDau, item.gioKetThuc, defaultTime]);

  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  return (
    <TheTkbItemView
      item={item}
      theme={theme}
      displayTime={displayTime}
      showRoom={showRoom}
      onClick={handleClick}
    />
  );
};

export default TheTkbItem;
