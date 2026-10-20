import React from 'react';
import { User, Search, X } from 'lucide-react';
import styles from './ThanhBoLocTkb.module.css';

/**
 * ThanhBoLocTkbView:
 * Giao diện Thanh công cụ lọc dữ liệu thời khóa biểu (Pure Presentation JSX)
 */
const ThanhBoLocTkbView = ({
  filterCaNhan = false,
  searchKeyword = '',
  filterBoMon = '',
  filterGiaoVien = '',
  filterPhong = '',
  filterLop = '',
  boMonList = [],
  teacherOptions = [],
  roomOptions = [],
  classOptions = [],
  isFiltered = false,
  onToggleCaNhan,
  onSearchChange,
  onBoMonChange,
  onGiaoVienChange,
  onPhongChange,
  onLopChange,
  onReset
}) => {
  return (
    <div className={styles.container}>
      {/* Toggle Lọc Lịch Cá Nhân */}
      <button
        type="button"
        onClick={onToggleCaNhan}
        className={`${styles.btnCaNhan} ${filterCaNhan ? styles.btnCaNhanActive : styles.btnCaNhanInactive}`}
        title="Chỉ hiển thị các ca học của bạn"
      >
        <User size={14} />
        <span>Lịch dạy cá nhân</span>
        {filterCaNhan && (
          <span className={styles.badgeFiltering}>
            Đang lọc
          </span>
        )}
      </button>

      {/* Ô Tìm kiếm Từ khóa */}
      <div className={styles.searchWrapper}>
        <Search size={14} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Tìm môn, lớp, GV, phòng..."
          value={searchKeyword}
          onChange={onSearchChange}
          className={styles.searchInput}
        />
      </div>

      {/* Lọc theo Bộ Môn */}
      {boMonList.length > 0 && (
        <select
          value={filterBoMon}
          onChange={onBoMonChange}
          className={styles.selectInput}
        >
          <option value="">Tất cả bộ môn (ALL)</option>
          {boMonList.map((bm) => (
            <option key={bm.idBoMon || bm.tenBoMon} value={bm.tenBoMon}>
              {bm.tenBoMon}
            </option>
          ))}
        </select>
      )}

      {/* Lọc theo Giáo Viên */}
      {teacherOptions.length > 0 && (
        <select
          value={filterGiaoVien}
          onChange={onGiaoVienChange}
          className={styles.selectInput}
        >
          <option value="">Tất cả giáo viên</option>
          {teacherOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      )}

      {/* Lọc theo Phòng Học */}
      {roomOptions.length > 0 && (
        <select
          value={filterPhong}
          onChange={onPhongChange}
          className={styles.selectInput}
        >
          <option value="">Tất cả phòng học</option>
          {roomOptions.map((room) => (
            <option key={room} value={room}>
              {room}
            </option>
          ))}
        </select>
      )}

      {/* Lọc theo Lớp Học */}
      {classOptions.length > 0 && (
        <select
          value={filterLop}
          onChange={onLopChange}
          className={styles.selectInput}
        >
          <option value="">Tất cả lớp học</option>
          {classOptions.map((lop) => (
            <option key={lop} value={lop}>
              {lop}
            </option>
          ))}
        </select>
      )}

      {/* Nút Xóa Lọc */}
      {isFiltered && (
        <button
          type="button"
          onClick={onReset}
          className={styles.btnReset}
        >
          <X size={13} />
          <span>Xóa lọc</span>
        </button>
      )}
    </div>
  );
};

export default ThanhBoLocTkbView;
