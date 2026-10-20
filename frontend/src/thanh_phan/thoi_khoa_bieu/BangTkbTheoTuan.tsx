import React from 'react';
import BangTkbTheoTuanView from './BangTkbTheoTuanView.jsx';

export interface BangTkbTheoTuanProps {
  matrixMap?: Map<string, any[]>;
  onSelectCard?: (item: any) => void;
}

/**
 * Component Logic Ma trận Thời khóa biểu theo Tuần (Ca học x Thứ trong tuần)
 */
const BangTkbTheoTuan: React.FC<BangTkbTheoTuanProps> = ({
  matrixMap,
  onSelectCard
}) => {
  return (
    <BangTkbTheoTuanView
      matrixMap={matrixMap}
      onSelectCard={onSelectCard}
    />
  );
};

export default BangTkbTheoTuan;
