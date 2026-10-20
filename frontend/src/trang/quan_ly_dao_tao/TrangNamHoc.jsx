import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calendar, 
  Plus, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  BookOpen, 
  RefreshCw, 
  AlertCircle, 
  Check, 
  X 
} from 'lucide-react';
import { dichVuChuDoanhNghiepDaoTao } from '../../dich_vu/tao_tu_dong/dichVuChuDoanhNghiepDaoTao';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import { useNamHocKyHocStore } from '../../trang_thai/useNamHocKyHocStore';
import { thongBao } from '../../tien_ich/thongBao';
import ModalWrapper from '../../thanh_phan/ModalWrapper';
import statStyles from '../../thanh_phan/StatCards.module.css';
import styles from './TrangNamHoc.module.css';

const TrangNamHoc = () => {
  const { user } = useTrangThaiXacThuc();
  const currentDnId = user?.idDoanhNghiep || 1;
  const { triggerRefresh } = useNamHocKyHocStore();

  const [namHocList, setNamHocList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Expand state cho từng năm học để xem tuần học
  const [expandedNhId, setExpandedNhId] = useState(null);
  const [tuanHocMap, setTuanHocMap] = useState({});
  const [loadingTuanMap, setLoadingTuanMap] = useState({});

  // Modal tạo mới
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    ngayBatDau: '2026-09-05',
    ngayKetThuc: '2027-05-31',
    taoTuanHocHangLoat: true
  });
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Tải danh sách năm học
  const fetchNamHoc = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const list = await dichVuChuDoanhNghiepDaoTao.getDanhSachNamHoc(currentDnId);
      setNamHocList(list || []);
      if (list && list.length > 0 && !expandedNhId) {
        setExpandedNhId(list[0].idNh);
        loadTuanHoc(list[0].idNh);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách năm học:', err);
      setErrorMsg(err?.response?.data?.message || err?.message || 'Không thể tải danh sách năm học');
    } finally {
      setLoading(false);
    }
  }, [currentDnId]);

  useEffect(() => {
    fetchNamHoc();
  }, [fetchNamHoc]);

  // Tải danh sách tuần học của 1 năm học
  const loadTuanHoc = async (idNh) => {
    if (!idNh) return;
    setLoadingTuanMap(prev => ({ ...prev, [idNh]: true }));
    try {
      const tuans = await dichVuChuDoanhNghiepDaoTao.getTuanHocTheoNamHoc(idNh);
      setTuanHocMap(prev => ({ ...prev, [idNh]: tuans || [] }));
    } catch (err) {
      console.error(`Lỗi tải tuần học năm #${idNh}:`, err);
      thongBao.warning(`Không thể tải danh sách tuần của năm học #${idNh}`);
    } finally {
      setLoadingTuanMap(prev => ({ ...prev, [idNh]: false }));
    }
  };

  const handleToggleExpand = (idNh) => {
    if (expandedNhId === idNh) {
      setExpandedNhId(null);
    } else {
      setExpandedNhId(idNh);
      if (!tuanHocMap[idNh]) {
        loadTuanHoc(idNh);
      }
    }
  };

  // Tạo tuần học hàng loạt cho 1 năm học
  const handleTaoTuanHocHangLoat = async (idNh, e) => {
    if (e) e.stopPropagation();
    try {
      setLoadingTuanMap(prev => ({ ...prev, [idNh]: true }));
      setSuccessMsg('');
      setErrorMsg('');
      const tuans = await dichVuChuDoanhNghiepDaoTao.taoTuanHocHangLoatTheoNamHoc(idNh);
      setTuanHocMap(prev => ({ ...prev, [idNh]: tuans || [] }));
      const msg = `Đã tạo thành công ${tuans?.length || 0} tuần học cho năm học #${idNh}!`;
      setSuccessMsg(msg);
      thongBao.success(msg);
      if (expandedNhId !== idNh) setExpandedNhId(idNh);
      triggerRefresh();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi khi tạo tuần học hàng loạt';
      setErrorMsg(msg);
      thongBao.error(msg);
    } finally {
      setLoadingTuanMap(prev => ({ ...prev, [idNh]: false }));
    }
  };

  // Đổi trạng thái hoàn thành
  const handleToggleTrangThai = async (nh, e) => {
    if (e) e.stopPropagation();
    const nextStatus = !nh.daHoanThanh;
    // RÀNG BUỘC: Chỉ cho phép sửa đổi trạng thái hoàn thành trong khoảng +/- 1 tháng so với ngày kết thúc năm học
    if (nh.ngayKetThuc) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [y, m, d] = nh.ngayKetThuc.split('-').map(Number);
      const ktDate = new Date(y, m - 1, d);

      const mocTruoc = new Date(ktDate);
      mocTruoc.setMonth(mocTruoc.getMonth() - 1);
      const mocSau = new Date(ktDate);
      mocSau.setMonth(mocSau.getMonth() + 1);

      const fmt = (dt) => `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;

      if (today < mocTruoc) {
        const msg = `Chưa thể thay đổi trạng thái hoàn thành: Chỉ được phép sửa đổi trong khoảng 1 tháng trước hoặc sau ngày kết thúc năm học (Từ ${fmt(mocTruoc)} đến ${fmt(mocSau)})!`;
        setErrorMsg(msg);
        thongBao.warning(msg);
        return;
      }
      if (today > mocSau) {
        const msg = `Đã quá thời hạn thay đổi trạng thái hoàn thành: Chỉ được phép sửa đổi trong khoảng 1 tháng trước hoặc sau ngày kết thúc năm học (Từ ${fmt(mocTruoc)} đến ${fmt(mocSau)})!`;
        setErrorMsg(msg);
        thongBao.warning(msg);
        return;
      }
    }

    const tenNam = nh.namBatDau ? `Năm học ${nh.namBatDau} - ${nh.namKetThuc}` : `Năm học #${nh.idNh}`;
    thongBao.xacNhan({
      tieuDe: 'Cập nhật trạng thái năm học',
      thongDiep: nextStatus
        ? `Bạn có chắc chắn muốn đánh dấu ${tenNam} là ĐÃ HOÀN THÀNH? Thao tác này sẽ khóa các phân bổ của năm học.`
        : `Bạn có muốn kích hoạt lại ${tenNam} thành ĐANG DIỄN RA không?`,
      loai: nextStatus ? 'warning' : 'info',
      nhanXacNhan: 'Đồng ý',
      onXacNhan: async () => {
        try {
          await dichVuChuDoanhNghiepDaoTao.doiTrangThaiHoanThanhNamHoc(nh.idNh, nextStatus);
          const msg = `Đã cập nhật trạng thái năm học thành: ${nextStatus ? 'Đã hoàn thành' : 'Đang diễn ra'}`;
          setSuccessMsg(msg);
          thongBao.success(msg);
          fetchNamHoc();
          triggerRefresh();
        } catch (err) {
          const msg = err?.response?.data?.message || err?.message || 'Lỗi khi đổi trạng thái năm học';
          setErrorMsg(msg);
          thongBao.error(msg);
        }
      }
    });
  };

  // Xóa cứng năm học
  const handleDeleteNamHoc = (nh, e) => {
    if (e) e.stopPropagation();
    if (!nh?.idNh) return;
    const tenNam = nh.namBatDau ? `Năm học ${nh.namBatDau} - ${nh.namKetThuc}` : `Năm học #${nh.idNh}`;

    thongBao.xacNhan({
      tieuDe: 'Xóa Vĩnh Viễn Năm Học',
      thongDiep: `Bạn có chắc chắn muốn XÓA VĨNH VIỄN ${tenNam} khỏi hệ thống không?\n\nToàn bộ các kỳ học, tuần học và dữ liệu phân bổ liên quan sẽ bị xóa sạch khỏi CSDL!`,
      loai: 'danger',
      nhanXacNhan: 'Xác nhận xóa',
      onXacNhan: async () => {
        setErrorMsg('');
        setSuccessMsg('');
        try {
          await dichVuChuDoanhNghiepDaoTao.xoaNamHoc(nh.idNh);
          const msg = `Đã xóa vĩnh viễn ${tenNam} thành công!`;
          setSuccessMsg(msg);
          thongBao.success(msg);
          fetchNamHoc();
          triggerRefresh();
        } catch (err) {
          const msg = err?.response?.data?.message || err?.message || 'Lỗi khi xóa năm học';
          setErrorMsg(msg);
          thongBao.error(msg);
        }
      }
    });
  };

  // Submit tạo mới năm học
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.ngayBatDau || !createForm.ngayKetThuc) {
      thongBao.warning('Vui lòng chọn ngày bắt đầu và ngày kết thúc');
      return;
    }

    if (new Date(createForm.ngayBatDau) >= new Date(createForm.ngayKetThuc)) {
      thongBao.error('Ngày bắt đầu phải trước ngày kết thúc!');
      return;
    }

    const diffMonths = (new Date(createForm.ngayKetThuc) - new Date(createForm.ngayBatDau)) / (1000 * 60 * 60 * 24 * 30);
    if (diffMonths > 24) {
      thongBao.warning('Năm học không nên kéo dài quá 24 tháng. Vui lòng kiểm tra lại khoảng thời gian!');
      return;
    }

    setSubmittingCreate(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await dichVuChuDoanhNghiepDaoTao.taoNamHoc({
        ngayBatDau: createForm.ngayBatDau,
        ngayKetThuc: createForm.ngayKetThuc,
        doanhNghiep: { idDn: currentDnId }
      }, currentDnId, createForm.taoTuanHocHangLoat);

      setSuccessMsg('Tạo mới năm học thành công!');
      thongBao.success('Tạo mới năm học thành công!');
      setShowCreateModal(false);
      fetchNamHoc();
      triggerRefresh();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể tạo năm học';
      setErrorMsg(msg);
      thongBao.error(msg);
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = namHocList.length;
    const active = namHocList.filter(nh => !nh.daHoanThanh).length;
    const completed = namHocList.filter(nh => nh.daHoanThanh).length;
    let totalWeeks = 0;
    Object.values(tuanHocMap).forEach(list => {
      totalWeeks += (list?.length || 0);
    });
    return { total, active, completed, totalWeeks };
  }, [namHocList, tuanHocMap]);

  return (
    <div className={styles.container}>
      
      {/* ── HEADER BANNER ── */}
      <header className={`droplet-card ${styles.headerCard}`}>
        <div className={styles.headerInfo}>
          <div className={styles.headerTitleWrap}>
            <span className={styles.headerIcon}>
              <Calendar size={20} />
            </span>
            <h2 className={styles.headerTitle}>
              Quản Lý Kế Hoạch Năm Học & Tuần Học
            </h2>
          </div>
          <p className={styles.headerDesc}>
            Thiết lập mốc thời gian bắt đầu, kết thúc và tự động sinh tuần học hàng loạt phục vụ đào tạo & xếp thời khóa biểu.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            onClick={fetchNamHoc}
            className="droplet-pill px-4 py-2.5 inline-flex items-center gap-2 text-slate-600 text-sm font-bold"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="droplet-pill droplet-pill-mint px-5 py-2.5 inline-flex items-center gap-2 text-sm font-extrabold"
          >
            <Plus size={16} />
            <span>Tạo Năm Học Mới</span>
          </button>
        </div>
      </header>

      {/* Thông báo Alert */}
      {errorMsg && (
        <div className={styles.alertError}>
          <AlertCircle size={18} />
          <span className={styles.alertText}>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className={styles.alertCloseBtn}>
            <X size={16} />
          </button>
        </div>
      )}

      {successMsg && (
        <div className={styles.alertSuccess}>
          <Check size={18} />
          <span className={styles.alertText}>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className={styles.alertCloseBtn}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── THỐNG KÊ NHANH 4 THẺ (Dùng CSS Module) ── */}
      <div className={statStyles.statGrid}>
        <div className={`${statStyles.statCard} ${statStyles.cardBlue}`}>
          <div className={statStyles.statHeader}>
            <span className={statStyles.statLabel}>TỔNG SỐ NĂM HỌC</span>
            <Calendar size={20} />
          </div>
          <div className={statStyles.statValue}>{stats.total}</div>
          <span className={statStyles.statSub}>Toàn hệ thống trung tâm</span>
        </div>

        <div className={`${statStyles.statCard} ${statStyles.cardGreen}`}>
          <div className={statStyles.statHeader}>
            <span className={statStyles.statLabel}>ĐANG DIỄN RA</span>
            <Clock size={20} />
          </div>
          <div className={statStyles.statValue}>{stats.active}</div>
          <span className={statStyles.statSub}>Đang nhận lớp & xếp lịch</span>
        </div>

        <div className={`${statStyles.statCard} ${statStyles.cardAmber}`}>
          <div className={statStyles.statHeader}>
            <span className={statStyles.statLabel}>ĐÃ HOÀN THÀNH</span>
            <CheckCircle2 size={20} />
          </div>
          <div className={statStyles.statValue}>{stats.completed}</div>
          <span className={statStyles.statSub}>Lưu trữ dữ liệu lịch sử</span>
        </div>

        <div className={`${statStyles.statCard} ${statStyles.cardPurple}`}>
          <div className={statStyles.statHeader}>
            <span className={statStyles.statLabel}>TUẦN HỌC ĐÃ TẢI</span>
            <Layers size={20} />
          </div>
          <div className={statStyles.statValue}>{stats.totalWeeks}</div>
          <span className={statStyles.statSub}>Đã chia tuần đào tạo</span>
        </div>
      </div>

      {/* ── DANH SÁCH NĂM HỌC ── */}
      <section className={styles.yearSection}>
        <h3 className={styles.sectionTitle}>
          Danh Sách Kế Hoạch Năm Học & Tuần Học
        </h3>

        {loading ? (
          <div className={`droplet-card ${styles.emptyState}`}>
            <RefreshCw size={24} className="animate-spin mb-3 mx-auto text-blue-600" />
            <div>Đang tải dữ liệu năm học...</div>
          </div>
        ) : namHocList.length === 0 ? (
          <div className={`droplet-card ${styles.emptyState}`}>
            <Calendar size={36} className="text-slate-400 mx-auto mb-4" />
            <div className="font-bold text-slate-700">Chưa có năm học nào trong hệ thống</div>
            <p className="text-sm text-slate-500 my-2 mb-5">
              Hãy tạo năm học đầu tiên để kích hoạt việc xếp lịch và chia tuần học.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="droplet-pill droplet-pill-mint px-5 py-2.5 font-extrabold"
            >
              + Tạo Năm Học Đầu Tiên
            </button>
          </div>
        ) : (
          namHocList.map((nh) => {
            const isExpanded = expandedNhId === nh.idNh;
            const tuans = tuanHocMap[nh.idNh] || [];
            const isLoadingTuan = loadingTuanMap[nh.idNh];

            const namBatDau = nh.namBatDau || (nh.ngayBatDau ? new Date(nh.ngayBatDau).getFullYear() : '---');
            const namKetThuc = nh.namKetThuc || (nh.ngayKetThuc ? new Date(nh.ngayKetThuc).getFullYear() : '---');

            return (
              <div 
                key={nh.idNh}
                className={`droplet-card ${isExpanded ? styles.yearCardExpanded : styles.yearCard}`}
              >
                {/* Header Card */}
                <div 
                  onClick={() => handleToggleExpand(nh.idNh)}
                  className={`${styles.yearCardHeader} ${isExpanded ? styles.yearCardHeaderExpanded : ''}`}
                >
                  <div className={styles.yearInfo}>
                    <div 
                      className={`droplet-circle ${nh.daHoanThanh ? styles.yearIconDone : styles.yearIconActive}`}
                    >
                      <Calendar size={20} />
                    </div>

                    <div>
                      <div className={styles.yearTitleWrap}>
                        <h4 className={styles.yearTitle}>
                          Năm học {namBatDau} - {namKetThuc}
                        </h4>
                        <span 
                          className={`badge ${nh.daHoanThanh ? styles.statusDone : styles.statusActive}`}
                        >
                          {nh.daHoanThanh ? 'Đã hoàn thành' : '● Đang diễn ra'}
                        </span>
                      </div>
                      
                      <div className={styles.yearMeta}>
                        <span>
                          Thời gian: <strong className="text-slate-700">{nh.ngayBatDau || '---'}</strong> đến <strong className="text-slate-700">{nh.ngayKetThuc || '---'}</strong>
                        </span>
                        {tuans.length > 0 && (
                          <span className="text-blue-600 font-bold">
                            ({tuans.length} tuần học)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className={styles.yearActions} onClick={(e) => e.stopPropagation()}>
                    
                    {/* Nút Tạo Tuần Học Hàng Loạt */}
                    <button
                      onClick={(e) => handleTaoTuanHocHangLoat(nh.idNh, e)}
                      disabled={isLoadingTuan}
                      className={`droplet-pill ${styles.btnGenerateWeeks}`}
                      title="Tự động tính toán chia tuần 7 ngày từ ngày bắt đầu đến kết thúc"
                    >
                      <Sparkles size={14} className={isLoadingTuan ? 'animate-spin' : ''} />
                      <span>{tuans.length > 0 ? 'Sinh Thêm Tuần' : 'Tạo Tuần Hàng Loạt'}</span>
                    </button>

                    {/* Nút Đổi Trạng Thái Hoàn Thành */}
                    <button
                      onClick={(e) => handleToggleTrangThai(nh, e)}
                      className={`droplet-pill ${styles.btnToggleStatus} ${nh.daHoanThanh ? 'text-sky-600' : 'text-amber-600'}`}
                    >
                      {nh.daHoanThanh ? <RefreshCw size={13} /> : <CheckCircle2 size={13} />}
                      <span>{nh.daHoanThanh ? 'Mở lại' : 'Đánh dấu xong'}</span>
                    </button>

                    {/* Nút Xóa Năm Học (Xóa cứng) */}
                    <button
                      onClick={(e) => handleDeleteNamHoc(nh, e)}
                      className={`droplet-pill ${styles.btnDelete}`}
                      title="Xóa vĩnh viễn năm học và các tuần trực thuộc"
                    >
                      <Trash2 size={13} />
                      <span>Xóa</span>
                    </button>

                    {/* Icon toggle dropdown */}
                    <button
                      onClick={() => handleToggleExpand(nh.idNh)}
                      className={`droplet-circle ${styles.btnExpand}`}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Danh Sách Tuần Học Con */}
                {isExpanded && (
                  <div className={styles.weeksDetail}>
                    <div className={styles.weeksDetailHeader}>
                      <div className={styles.weeksDetailTitle}>
                        <Layers size={16} className="text-blue-600" />
                        <span>Danh Sách Tuần Học Trực Thuộc ({tuans.length} tuần)</span>
                      </div>

                      {tuans.length === 0 && (
                        <button
                          onClick={() => handleTaoTuanHocHangLoat(nh.idNh)}
                          className="droplet-pill droplet-pill-mint px-3.5 py-1.5 text-xs font-extrabold"
                        >
                          + Bấm Vào Đây Để Sinh Tuần Ngay
                        </button>
                      )}
                    </div>

                    {isLoadingTuan ? (
                      <div className="p-6 text-center text-slate-500 text-sm">
                        <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-blue-600" />
                        Đang tải danh sách tuần...
                      </div>
                    ) : tuans.length === 0 ? (
                      <div className={styles.weeksEmpty}>
                        Năm học này chưa có danh sách tuần học nào. Hãy bấm nút <strong>"Tạo Tuần Hàng Loạt"</strong> để hệ thống tự động sinh 7 ngày/tuần theo ngày bắt đầu và kết thúc!
                      </div>
                    ) : (
                      <div className={styles.weeksGrid}>
                        {tuans.map((tuan) => (
                          <div key={tuan.idTh} className={styles.weekCard}>
                            <div>
                              <div className={styles.weekName}>
                                {tuan.moTa || `Tuần ${tuan.soTuan}`}
                              </div>
                              <span className={styles.weekKy}>
                                {tuan.kyHoc?.tenKyHoc || 'Kỳ học chuẩn'}
                              </span>
                            </div>
                            <span className={styles.weekBadge}>
                              #W{tuan.soTuan}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      {/* ── MODAL TẠO MỚI NĂM HỌC (Dùng ModalWrapper) ── */}
      <ModalWrapper
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        maxWidth="max-w-[480px]"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} style={{ color: '#2563EB' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>
              Thiết Lập Năm Học Mới
            </h3>
          </div>
        }
      >
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
              Thời gian bắt đầu năm học <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="date"
              value={createForm.ngayBatDau}
              onChange={(e) => setCreateForm(prev => ({ ...prev, ngayBatDau: e.target.value }))}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '14px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.9rem',
                fontWeight: '600',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
              Thời gian kết thúc năm học <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="date"
              value={createForm.ngayKetThuc}
              onChange={(e) => setCreateForm(prev => ({ ...prev, ngayKetThuc: e.target.value }))}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '14px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.9rem',
                fontWeight: '600',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Tùy chọn sinh tuần hàng loạt */}
          <div style={{
            padding: '0.85rem 1rem',
            borderRadius: '16px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #DCFCE7',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <input
              type="checkbox"
              id="chkBulkWeeks"
              checked={createForm.taoTuanHocHangLoat}
              onChange={(e) => setCreateForm(prev => ({ ...prev, taoTuanHocHangLoat: e.target.checked }))}
              style={{ marginTop: '3px', cursor: 'pointer', transform: 'scale(1.2)' }}
            />
            <label htmlFor="chkBulkWeeks" style={{ fontSize: '0.825rem', color: '#166534', fontWeight: '600', cursor: 'pointer' }}>
              <strong>Tự động tạo tuần học hàng loạt:</strong> Hệ thống sẽ tự động tính toán các tuần 7 ngày từ ngày bắt đầu đến ngày kết thúc và gán đúng học kỳ.
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="droplet-pill"
              style={{ padding: '0.65rem 1.25rem', color: '#64748B', fontWeight: '700' }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submittingCreate}
              className="droplet-pill droplet-pill-mint"
              style={{ padding: '0.65rem 1.5rem', fontWeight: '800' }}
            >
              {submittingCreate ? 'Đang khởi tạo...' : 'Lưu Năm Học'}
            </button>
          </div>
        </form>
      </ModalWrapper>

    </div>
  );
};

export default TrangNamHoc;


