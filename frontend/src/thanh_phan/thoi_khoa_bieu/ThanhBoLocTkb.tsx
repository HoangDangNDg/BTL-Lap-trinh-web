import React, { memo, useCallback } from 'react';
import ThanhBoLocTkbView from './ThanhBoLocTkbView.jsx';

export interface BoMonOption {
  idBoMon?: number | string;
  tenBoMon?: string;
  [key: string]: any;
}

export interface TkbFilters {
  filterCaNhan?: boolean;
  searchKeyword?: string;
  filterBoMon?: string;
  filterGiaoVien?: string;
  filterPhong?: string;
  filterLop?: string;
}

export interface TkbFilterOptions {
  boMonList?: BoMonOption[];
  teacherOptions?: string[];
  roomOptions?: string[];
  classOptions?: string[];
}

export interface ThanhBoLocTkbProps {
  user?: any;
  dispatch?: (action: any) => void;
  filters?: TkbFilters;
  options?: TkbFilterOptions;
  // Props tương thích ngược
  filterCaNhan?: boolean;
  onToggleFilterCaNhan?: () => void;
  searchKeyword?: string;
  onSearchKeywordChange?: (kw: string) => void;
  boMonList?: BoMonOption[];
  filterBoMon?: string;
  onFilterBoMonChange?: (bm: string) => void;
  teacherOptions?: string[];
  filterGiaoVien?: string;
  onFilterGiaoVienChange?: (gv: string) => void;
  roomOptions?: string[];
  filterPhong?: string;
  onFilterPhongChange?: (p: string) => void;
  classOptions?: string[];
  filterLop?: string;
  onFilterLopChange?: (lop: string) => void;
  onResetFilters?: () => void;
}

/**
 * Component Logic Thanh Bộ Lọc Thời Khóa Biểu
 */
const ThanhBoLocTkb: React.FC<ThanhBoLocTkbProps> = memo(({
  dispatch,
  filters,
  options,
  filterCaNhan: propFilterCaNhan,
  onToggleFilterCaNhan,
  searchKeyword: propSearchKeyword,
  onSearchKeywordChange,
  boMonList: propBoMonList,
  filterBoMon: propFilterBoMon,
  onFilterBoMonChange,
  teacherOptions: propTeacherOptions,
  filterGiaoVien: propFilterGiaoVien,
  onFilterGiaoVienChange,
  roomOptions: propRoomOptions,
  filterPhong: propFilterPhong,
  onFilterPhongChange,
  classOptions: propClassOptions,
  filterLop: propFilterLop,
  onFilterLopChange,
  onResetFilters
}) => {
  const activeFilters = filters || {
    filterCaNhan: propFilterCaNhan || false,
    searchKeyword: propSearchKeyword || '',
    filterBoMon: propFilterBoMon || '',
    filterGiaoVien: propFilterGiaoVien || '',
    filterPhong: propFilterPhong || '',
    filterLop: propFilterLop || ''
  };

  const activeOptions = options || {
    boMonList: propBoMonList || [],
    teacherOptions: propTeacherOptions || [],
    roomOptions: propRoomOptions || [],
    classOptions: propClassOptions || []
  };

  const {
    filterCaNhan = false,
    searchKeyword = '',
    filterBoMon = '',
    filterGiaoVien = '',
    filterPhong = '',
    filterLop = ''
  } = activeFilters;

  const {
    boMonList = [],
    teacherOptions = [],
    roomOptions = [],
    classOptions = []
  } = activeOptions;

  const handleToggleCaNhan = useCallback(() => {
    if (onToggleFilterCaNhan) {
      onToggleFilterCaNhan();
    } else if (dispatch) {
      dispatch({ type: 'TOGGLE_FILTER_CA_NHAN' });
    }
  }, [onToggleFilterCaNhan, dispatch]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (onSearchKeywordChange) {
      onSearchKeywordChange(val);
    } else if (dispatch) {
      dispatch({ type: 'SET_FILTER', payload: { searchKeyword: val } });
    }
  }, [onSearchKeywordChange, dispatch]);

  const handleBoMonChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (onFilterBoMonChange) {
      onFilterBoMonChange(val);
    } else if (dispatch) {
      dispatch({ type: 'SET_FILTER', payload: { filterBoMon: val } });
    }
  }, [onFilterBoMonChange, dispatch]);

  const handleGiaoVienChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (onFilterGiaoVienChange) {
      onFilterGiaoVienChange(val);
    } else if (dispatch) {
      dispatch({ type: 'SET_FILTER', payload: { filterGiaoVien: val } });
    }
  }, [onFilterGiaoVienChange, dispatch]);

  const handlePhongChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (onFilterPhongChange) {
      onFilterPhongChange(val);
    } else if (dispatch) {
      dispatch({ type: 'SET_FILTER', payload: { filterPhong: val } });
    }
  }, [onFilterPhongChange, dispatch]);

  const handleLopChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (onFilterLopChange) {
      onFilterLopChange(val);
    } else if (dispatch) {
      dispatch({ type: 'SET_FILTER', payload: { filterLop: val } });
    }
  }, [onFilterLopChange, dispatch]);

  const handleReset = useCallback(() => {
    if (onResetFilters) {
      onResetFilters();
    } else if (dispatch) {
      dispatch({ type: 'RESET_FILTERS' });
    }
  }, [onResetFilters, dispatch]);

  const isFiltered = Boolean(
    searchKeyword || filterBoMon || filterGiaoVien || filterPhong || filterLop || filterCaNhan
  );

  return (
    <ThanhBoLocTkbView
      filterCaNhan={filterCaNhan}
      searchKeyword={searchKeyword}
      filterBoMon={filterBoMon}
      filterGiaoVien={filterGiaoVien}
      filterPhong={filterPhong}
      filterLop={filterLop}
      boMonList={boMonList}
      teacherOptions={teacherOptions}
      roomOptions={roomOptions}
      classOptions={classOptions}
      isFiltered={isFiltered}
      onToggleCaNhan={handleToggleCaNhan}
      onSearchChange={handleSearchChange}
      onBoMonChange={handleBoMonChange}
      onGiaoVienChange={handleGiaoVienChange}
      onPhongChange={handlePhongChange}
      onLopChange={handleLopChange}
      onReset={handleReset}
    />
  );
});

ThanhBoLocTkb.displayName = 'ThanhBoLocTkb';

export default ThanhBoLocTkb;
