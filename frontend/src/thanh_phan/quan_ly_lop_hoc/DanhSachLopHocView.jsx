import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  GraduationCap, 
  Search, 
  RefreshCw, 
  Plus, 
  Calendar
} from 'lucide-react';
import TheLopHoc from '../lop_hoc/TheLopHoc';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import { useNamHocKyHocStore } from '../../trang_thai/useNamHocKyHocStore';
import styles from './DanhSachLopHocView.module.css';

/**
 * =========================================================================
 * COMPONENT TÁI SỬ DỤNG: DANH SÁCH LỚP HỌC ĐA NGỮ CẢNH
 * =========================================================================
 * 
 * Tái sử dụng đồng bộ cho cả:
 * 1. Ngữ cảnh Chi Nhánh & Kỳ Học (tại TrangLopHoc):
 *    - Props: chiNhanh, selectedKyHocId, selectedNamHocId, tenKyHoc, tenNamHoc
 * 2. Ngữ cảnh Môn Học & Bộ Môn (tại TrangBoMon khi click vào một Môn Học):
 *    - Props: monHoc, boMon, chuyenMon, onOpenTaoLopModal
 * 
 * Tính năng thống nhất:
 * - Tự động gọi API tối ưu (theo môn học & kỳ học, theo bộ môn & kỳ học, hoặc theo chi nhánh & kỳ học).
 * - Hiển thị danh sách dạng Thẻ Lớp trực quan (Grid card dùng TheLopHoc).
 * - Bộ lọc linh hoạt: Từ khóa, Chi nhánh, Bộ môn, Kỳ học.
 * - Thao tác: Bấm vào lớp xem Chi tiết (ChiTietLopHocModal hoặc onSelectLopHoc), Tạo buổi học, Điểm danh.
 */
const DanhSachLopHocView = ({
  // Ngữ cảnh 1: Chi nhánh & Kỳ học
  chiNhanh,
  selectedKyHocId,
  selectedNamHocId,
  tenKyHoc = '',
  tenNamHoc = '',

  // Ngữ cảnh 2: Môn học & Bộ môn
  monHoc,
  boMon,
  chuyenMon,
  onOpenTaoLopModal,

  // Hành động điều hướng bên ngoài
  onSelectLopHoc,
  onTaoBuoiHoc,
  onDiemDanh,
  refreshTrigger = 0
}) => {
  const storeKyHocId = useNamHocKyHocStore(state => state.selectedKyHocId);
  const storeKyHocList = useNamHocKyHocStore(state => state.kyHocList);
  const setStoreKyHocId = useNamHocKyHocStore(state => state.setSelectedKyHocId);

  // Kỳ học đang áp dụng (ưu tiên prop, fallback về store)
  const [localKyHocId, setLocalKyHocId] = useState(selectedKyHocId ?? storeKyHocId ?? null);

  useEffect(() => {
    if (selectedKyHocId !== undefined && selectedKyHocId !== null) {
      setLocalKyHocId(selectedKyHocId);
    } else if (storeKyHocId) {
      setLocalKyHocId(storeKyHocId);
    }
  }, [selectedKyHocId, storeKyHocId]);

  const effectiveKyHocId = localKyHocId;
  const currentKyObj = storeKyHocList?.find(k => k.idKh === effectiveKyHocId);
  const currentKyName = currentKyObj?.tenKyHoc || tenKyHoc || '';

  const [classList, setClassList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedBoMonId, setSelectedBoMonId] = useState(null);
  const [selectedChiNhanhId, setSelectedChiNhanhId] = useState(null);

  const isMonHocMode = Boolean(monHoc && (monHoc.idMh || monHoc.idMonHoc));
  const idMh = monHoc?.idMh || monHoc?.idMonHoc;
  const tenMon = monHoc?.tenMon || monHoc?.tenMonHoc || 'Môn học';

  const isBoMonMode = Boolean(!isMonHocMode && boMon && !chiNhanh);
  const idBm = boMon?.idBm || boMon?.idBoMon;
  const tenBm = boMon?.tenBm || boMon?.tenBoMon || 'Bộ môn';

  // 1. Tải danh sách lớp học theo ngữ cảnh - Luôn giới hạn theo Môn học và Kỳ học, tránh tải tràn lan toàn DB
  const fetchLopHoc = useCallback(async () => {
    try {
      setLoading(true);
      let data = [];

      if (isMonHocMode && idMh) {
        // Truy vấn chính xác lớp học THEO MÔN HỌC và KỲ HỌC
        data = await dichVuDaoTaoChung.getLopHocTheoMonHoc(idMh, effectiveKyHocId || undefined);
      } else if (isBoMonMode && idBm) {
        // Truy vấn lớp học THEO BỘ MÔN và KỲ HỌC
        if (effectiveKyHocId) {
          data = await dichVuDaoTaoChung.getDanhSachLopHoc({
            idBoMon: idBm,
            idKh: effectiveKyHocId
          });
        } else {
          data = await dichVuDaoTaoChung.getLopHocTheoBoMon(idBm);
        }
      } else if (chiNhanh?.idCn) {
        // Truy vấn theo Chi nhánh và Kỳ học
        data = await dichVuDaoTaoChung.getDanhSachLopHoc({
          idCn: chiNhanh.idCn,
          idKyHoc: effectiveKyHocId || undefined,
          idKh: effectiveKyHocId || undefined
        });
      } else if (effectiveKyHocId) {
        // Nếu chỉ có kỳ học, lọc lớp theo kỳ học đó
        data = await dichVuDaoTaoChung.getDanhSachLopHoc({
          idKh: effectiveKyHocId
        });
      } else {
        // Tránh gọi linh tinh toàn bộ DB khi chưa có bộ lọc
        data = [];
      }

      setClassList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi khi tải danh sách lớp học:', err);
      setClassList([]);
    } finally {
      setLoading(false);
    }
  }, [isMonHocMode, idMh, isBoMonMode, idBm, chiNhanh?.idCn, effectiveKyHocId]);

  useEffect(() => {
    fetchLopHoc();
  }, [fetchLopHoc, refreshTrigger]);

  // Danh sách chi nhánh duy nhất để lọc (dùng khi ở ngữ cảnh Môn học)
  const chiNhanhOptions = useMemo(() => {
    const map = new Map();
    classList.forEach(c => {
      const cnId = c.idChiNhanh || c.chiNhanh?.idCn;
      const cnTen = c.tenChiNhanh || c.chiNhanh?.tenCn;
      if (cnId && cnTen && !map.has(cnId)) {
        map.set(cnId, { idCn: cnId, tenCn: cnTen });
      }
    });
    return Array.from(map.values());
  }, [classList]);

  // Danh sách bộ môn duy nhất để lọc (dùng khi ở ngữ cảnh Chi nhánh)
  const boMonOptions = useMemo(() => {
    const map = new Map();
    classList.forEach(c => {
      if (c.idBoMon && c.tenBoMon && !map.has(c.idBoMon)) {
        map.set(c.idBoMon, { idBoMon: c.idBoMon, tenBoMon: c.tenBoMon });
      }
    });
    return Array.from(map.values());
  }, [classList]);

  // Bộ lọc kết hợp: Từ khóa, Bộ môn, Chi nhánh, Kỳ học
  const filteredClasses = useMemo(() => {
    return classList.filter((item) => {
      // Khóa theo kỳ học (nếu có)
      if (effectiveKyHocId !== null && effectiveKyHocId !== undefined && effectiveKyHocId !== '') {
        const itemKyId = item.idKyHoc || item.idKh;
        if (itemKyId && itemKyId !== Number(effectiveKyHocId)) return false;
      }
      // Lọc theo bộ môn (nếu đang ở trang Chi nhánh)
      if (selectedBoMonId !== null && item.idBoMon !== selectedBoMonId) {
        return false;
      }
      // Lọc theo chi nhánh (nếu đang ở trang Môn học)
      if (selectedChiNhanhId !== null) {
        const itemCnId = item.idChiNhanh || item.chiNhanh?.idCn;
        if (itemCnId !== selectedChiNhanhId) return false;
      }
      // Lọc theo từ khóa
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchName = (item.tenLop || '').toLowerCase().includes(kw);
        const matchCourse = (item.tenKhoaHoc || '').toLowerCase().includes(kw);
        const matchTeacher = (item.tenGiaoVien || '').toLowerCase().includes(kw);
        const matchBoMon = (item.tenBoMon || '').toLowerCase().includes(kw);
        const matchMonHoc = (item.tenMonHoc || '').toLowerCase().includes(kw);
        const matchChiNhanh = (item.tenChiNhanh || '').toLowerCase().includes(kw);
        return matchName || matchCourse || matchTeacher || matchBoMon || matchMonHoc || matchChiNhanh;
      }
      return true;
    });
  }, [classList, effectiveKyHocId, selectedBoMonId, selectedChiNhanhId, searchKeyword]);

  const handleClassClick = (lop) => {
    if (onSelectLopHoc) {
      onSelectLopHoc(lop);
    }
  };

  return (
    <div className={styles.container}>
      {/* ── BANNER NGỮ CẢNH DANH SÁCH LỚP HỌC ── */}
      <div className={styles.headerCard}>
        <div className={styles.headerLeft}>
          <div className={isMonHocMode ? styles.headerIconBoxMonHoc : styles.headerIconBoxChiNhanh}>
            <GraduationCap size={26} />
          </div>
          <div>
            <div className={styles.titleRow}>
              <h2 className={styles.headerTitle}>
                {isMonHocMode 
                  ? `Lớp Học Môn ${tenMon}` 
                  : `Lớp Học Tại ${chiNhanh?.tenCn || `Cơ sở #${chiNhanh?.idCn}`}`}
              </h2>
              {isMonHocMode && (
                <span className={`badge badge-info ${styles.badgeClassName}`}>
                  {tenBm}
                </span>
              )}
              {currentKyName ? (
                <span className={styles.badgeKyHoc}>
                  <Calendar size={13} />
                  <span>{currentKyName}</span>
                </span>
              ) : (
                <span className={`badge badge-info ${styles.badgeClassName}`}>
                  Tất cả kỳ học
                </span>
              )}
            </div>
            <p className={styles.headerSubtitle}>
              {isMonHocMode
                ? `Danh sách các lớp học theo môn "${tenMon}" trong ${currentKyName || 'kỳ học đã chọn'}${chuyenMon?.tenCm ? ` • Chuyên môn: ${chuyenMon.tenCm}` : ''}`
                : `Truy vấn theo Cơ sở chi nhánh (${chiNhanh?.tenCn || chiNhanh?.idCn}) & ${currentKyName || 'Kỳ học'} • Bấm vào thẻ lớp để xem chi tiết`}
            </p>
          </div>
        </div>

        {/* ── THANH CÔNG CỤ TÌM KIẾM, LỌC & CHUYỂN VIEW ── */}
        <div className={styles.toolbarRight}>
          {/* Nút Tạo Lớp Nhanh (Nếu ở ngữ cảnh Môn học) */}
          {isMonHocMode && onOpenTaoLopModal && (
            <button
              type="button"
              onClick={() => onOpenTaoLopModal({
                idBoMon: idBm,
                idCm: chuyenMon?.idCm,
                idMh: idMh,
                tenMon: tenMon,
                idKh: effectiveKyHocId || undefined
              })}
              className={`droplet-pill ${styles.btnOpenClass}`}
            >
              <Plus size={15} />
              <span>Mở Lớp Cho Môn Này</span>
            </button>
          )}

          {/* Lọc theo Kỳ Học (Semester Filter) */}
          {storeKyHocList && storeKyHocList.length > 0 && (
            <div>
              <select
                value={effectiveKyHocId || ''}
                onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : null;
                  setLocalKyHocId(val);
                  if (val && setStoreKyHocId) {
                    setStoreKyHocId(val);
                  }
                }}
                className={styles.selectKyHoc}
                title="Lọc danh sách lớp học theo kỳ học cụ thể"
              >
                <option value="">-- Tất cả Kỳ Học --</option>
                {storeKyHocList.map(kh => (
                  <option key={kh.idKh} value={kh.idKh}>
                    📅 {kh.tenKyHoc}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Ô tìm kiếm */}
          <div className={styles.searchWrapper}>
            <Search size={14} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm tên lớp, GV, chi nhánh..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Lọc theo Chi nhánh (nếu ở mode Môn học và có nhiều cơ sở) */}
          {isMonHocMode && chiNhanhOptions.length > 1 && (
            <select
              value={selectedChiNhanhId || ''}
              onChange={(e) => setSelectedChiNhanhId(e.target.value ? Number(e.target.value) : null)}
              className={styles.selectFilter}
            >
              <option value="">Tất cả Chi nhánh</option>
              {chiNhanhOptions.map(cn => (
                <option key={cn.idCn} value={cn.idCn}>{cn.tenCn}</option>
              ))}
            </select>
          )}

          {/* Lọc theo Bộ môn (nếu ở mode Chi nhánh) */}
          {!isMonHocMode && boMonOptions.length > 0 && (
            <select
              value={selectedBoMonId || ''}
              onChange={(e) => setSelectedBoMonId(e.target.value ? Number(e.target.value) : null)}
              className={styles.selectFilter}
            >
              <option value="">Tất cả Bộ môn</option>
              {boMonOptions.map(bm => (
                <option key={bm.idBoMon} value={bm.idBoMon}>{bm.tenBoMon}</option>
              ))}
            </select>
          )}

          {/* Nút làm mới */}
          <button
            type="button"
            onClick={fetchLopHoc}
            className={`droplet-pill ${styles.btnRefresh}`}
            title="Làm mới danh sách lớp"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Hiển thị số lượng kết quả */}
      <div className={styles.resultsMeta}>
        <span className={styles.resultsMetaText}>
          Tìm thấy <strong className={styles.resultsCountHighlight}>{filteredClasses.length}</strong> lớp học {isMonHocMode ? `môn ${tenMon}` : 'tại cơ sở này'}
        </span>
      </div>

      {/* ── DANH SÁCH LỚP HỌC DẠNG GRID HOẶC TABLE ── */}
      {loading ? (
        <div className={`droplet-card ${styles.stateCard}`}>
          <RefreshCw size={32} className={`animate-spin ${styles.loadingSpinner}`} />
          <p className={styles.loadingText}>Đang tải danh sách lớp học...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className={`droplet-card ${styles.emptyCard}`}>
          <GraduationCap size={44} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>
            {isMonHocMode 
              ? `Chưa có lớp học nào được mở cho môn "${tenMon}"` 
              : 'Chưa có lớp học nào tại cơ sở này cho kỳ học đã chọn'}
          </p>
          <p className={styles.emptySubtitle}>
            {isMonHocMode 
              ? 'Bấm nút bên dưới để mở lớp học mới cho môn học này.' 
              : 'Vui lòng chọn kỳ học khác trên thanh điều hướng hoặc thêm lớp học mới'}
          </p>
          {isMonHocMode && onOpenTaoLopModal && (
            <button
              type="button"
              onClick={() => onOpenTaoLopModal({
                idBoMon: idBm,
                idCm: chuyenMon?.idCm,
                idMh: idMh,
                tenMon: tenMon
              })}
              className={`droplet-pill ${styles.btnOpenFirstClass}`}
            >
              <Plus size={16} />
              <span>Mở Lớp Học Đầu Tiên</span>
            </button>
          )}
        </div>
      ) : (
        <div className={styles.classGrid}>
          {filteredClasses.map((lop) => (
            <TheLopHoc
              key={lop.idLop}
              lop={lop}
              onClick={() => handleClassClick(lop)}
              onTaoBuoiHoc={onTaoBuoiHoc}
              onDiemDanh={onDiemDanh}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DanhSachLopHocView;
