import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  HeartHandshake, 
  Users, 
  Phone, 
  MapPin, 
  User, 
  GraduationCap, 
  CreditCard, 
  Search, 
  Plus, 
  Edit2, 
  RefreshCw, 
  ChevronRight, 
  ArrowLeft,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { dichVuHocSinhPhuHuynh } from '../../dich_vu/tao_tu_dong/dichVuHocSinhPhuHuynh';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import ModalThemSuaPhuHuynh from '../../thanh_phan/quan_ly_hoc_sinh/ModalThemSuaPhuHuynh';
import ChiTietPhuHuynh from '../../thanh_phan/quan_ly_hoc_sinh/ChiTietPhuHuynh';
import ChiTietHocSinhView from '../../thanh_phan/quan_ly_lop_hoc/ChiTietHocSinhView';

/**
 * Component hiển thị danh sách học sinh của phụ huynh (badge nhỏ)
 */
const CotHocSinhPhuHuynh = ({ idPh, onSelectStudent }) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idPh) return;
    dichVuHocSinhPhuHuynh.getHocSinhTheoPhuHuynhBangPhu(idPh)
      .then(res => {
        const items = Array.isArray(res) ? res : (res?.data || []);
        setList(items);
      })
      .catch(err => console.warn('Lỗi lấy học sinh của PH:', err))
      .finally(() => setLoading(false));
  }, [idPh]);

  if (loading) {
    return <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Đang tra cứu...</span>;
  }

  if (!list || list.length === 0) {
    return <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic' }}>Chưa liên kết</span>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
      {list.map((item, idx) => {
        const hs = item.hocSinh || {};
        const isFemale = hs.gioiTinh === 'F' || hs.gioiTinh === 'Nu' || hs.gioiTinh === 'Nữ';
        return (
          <span
            key={item.idPhHs || idx}
            onClick={(e) => {
              if (onSelectStudent) {
                e.stopPropagation();
                onSelectStudent(hs);
              }
            }}
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '0.2rem 0.55rem',
              borderRadius: '8px',
              backgroundColor: isFemale ? '#FDF2F8' : '#EFF6FF',
              color: isFemale ? '#DB2777' : '#2563EB',
              border: isFemale ? '1px solid #FBCFE8' : '1px solid #BFDBFE',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              cursor: onSelectStudent ? 'pointer' : 'default'
            }}
            title={`Quan hệ: ${item.quanHe || 'Người bảo hộ'} • Bấm để xem chi tiết học sinh`}
          >
            <GraduationCap size={12} />
            <span>{hs.hoTen || `HS #${hs.idHs}`}</span>
            <span style={{ fontSize: '0.685rem', opacity: 0.8 }}>({item.quanHe || 'Con'})</span>
          </span>
        );
      })}
    </div>
  );
};

/**
 * Trang Quản Lý Hồ Sơ Phụ Huynh
 * - Gợi ý 20 hồ sơ phụ huynh trong doanh nghiệp (tải nhanh, chống lag)
 * - Thanh tìm kiếm và chuyển đổi theo ID Doanh nghiệp
 * - Tìm kiếm phụ huynh linh hoạt theo CCCD / SĐT / Họ tên
 * - Thao tác Thêm mới & Chỉnh sửa hồ sơ phụ huynh (ModalThemSuaPhuHuynh)
 * - Tái sử dụng View liên kết hồ sơ học sinh - phụ huynh (ChiTietPhuHuynhView & ChiTietHocSinhView)
 */
const TrangPhuHuynh = () => {
  const { user } = useTrangThaiXacThuc();
  // Tự động lấy ID doanh nghiệp từ phiên đăng nhập của người dùng để bảo mật đa người thuê (Multi-tenant)
  const selectedDnId = user?.idDoanhNghiep || 1;

  // Danh sách phụ huynh (gợi ý 20 hoặc kết quả tìm kiếm)
  const [parentList, setParentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Modal Thêm / Sửa phụ huynh
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingParent, setEditingParent] = useState(null);

  // ── QUEUE STATE ROLLBACK ĐIỀU HƯỚNG ──
  // 'DANH_SACH' -> 'CHI_TIET_PHU_HUYNH' -> 'CHI_TIET_HOC_SINH'
  const [navQueue, setNavQueue] = useState([
    { step: 'DANH_SACH', data: {} }
  ]);

  const currentNav = navQueue[navQueue.length - 1] || { step: 'DANH_SACH', data: {} };
  const currentStep = currentNav.step;
  const currentData = currentNav.data || {};

  const pushStep = (step, data) => {
    setNavQueue(prev => [...prev, { step, data }]);
  };

  const popStep = () => {
    setNavQueue(prev => (prev.length > 1 ? prev.slice(0, prev.length - 1) : prev));
  };

  const jumpToStep = (index) => {
    if (index >= 0 && index < navQueue.length) {
      setNavQueue(prev => prev.slice(0, index + 1));
    }
  };

  // Tải danh sách phụ huynh (Gợi ý 20 hoặc tìm kiếm theo từ khóa)
  const fetchParents = useCallback(async (keyword = '') => {
    if (!selectedDnId) return;
    setLoading(true);
    try {
      const res = await dichVuHocSinhPhuHuynh.timKiemVaGoiYPhuHuynh(selectedDnId, keyword, !keyword);
      const items = Array.isArray(res) ? res : (res?.data || []);
      setParentList(items);
      setIsSearching(Boolean(keyword));
    } catch (err) {
      console.error('Lỗi khi tải danh sách phụ huynh:', err);
      setParentList([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDnId]);

  useEffect(() => {
    fetchParents(searchKeyword);
  }, [fetchParents, searchKeyword]);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%' }}>
      
      {/* ── BREADCRUMB ĐIỀU HƯỚNG THEO QUEUE STATE ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.85rem 1.25rem',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.875rem' }}>
          <span 
            onClick={() => jumpToStep(0)}
            style={{ 
              fontWeight: currentStep === 'DANH_SACH' ? '800' : '600',
              color: currentStep === 'DANH_SACH' ? '#059669' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <HeartHandshake size={16} />
            <span>Tất Cả Phụ Huynh</span>
          </span>

          {currentStep === 'CHI_TIET_PHU_HUYNH' && (
            <>
              <ChevronRight size={15} style={{ color: '#94A3B8' }} />
              <span style={{ fontWeight: '800', color: '#059669' }}>
                Phụ Huynh: {currentData.phuHuynh?.hoTen || currentData.phuHuynh?.tenPh}
              </span>
            </>
          )}

          {currentStep === 'CHI_TIET_HOC_SINH' && (
            <>
              <ChevronRight size={15} style={{ color: '#94A3B8' }} />
              <span 
                onClick={() => jumpToStep(1)}
                style={{ fontWeight: '600', color: '#64748B', cursor: 'pointer' }}
              >
                Phụ Huynh: {navQueue[1]?.data?.phuHuynh?.hoTen || 'Hồ sơ'}
              </span>
              <ChevronRight size={15} style={{ color: '#94A3B8' }} />
              <span style={{ fontWeight: '800', color: '#0284C7' }}>
                Học Sinh: {currentData.student?.hoTen || `HS #${currentData.student?.idHs}`}
              </span>
            </>
          )}
        </div>

        {navQueue.length > 1 && (
          <button
            type="button"
            onClick={popStep}
            style={{
              height: '32px',
              padding: '0 0.85rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#F8FAFC',
              color: '#334155',
              fontSize: '0.8rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <ArrowLeft size={14} />
            <span>Quay Lại</span>
          </button>
        )}
      </div>

      {/* ── NỘI DUNG THEO TỪNG BƯỚC ── */}

      {/* BƯỚC 1: DANH SÁCH & GỢI Ý 20 PHỤ HUYNH */}
      {currentStep === 'DANH_SACH' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* HEADER BANNER & THANH TÌM KIẾM DOANH NGHIỆP */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '1.25rem 1.5rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <HeartHandshake size={26} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#0F172A' }}>
                  Quản Lý Hồ Sơ Phụ Huynh
                </h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.825rem', color: '#64748B' }}>
                  Gợi ý 20 hồ sơ mới nhất • Quản lý hồ sơ phụ huynh & liên kết đa chiều học sinh
                </p>
              </div>
            </div>

            {/* CỤM THANH CÔNG CỤ: NÚT THÊM MỚI */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Nút Thêm Mới Phụ Huynh */}
              <button
                type="button"
                onClick={() => {
                  setEditingParent(null);
                  setShowAddEditModal(true);
                }}
                style={{
                  height: '42px',
                  padding: '0 1.25rem',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              >
                <Plus size={18} />
                <span>+ Thêm Phụ Huynh</span>
              </button>
            </div>
          </div>

          {/* THANH TÌM KIẾM PHỤ HUYNH & CHẾ ĐỘ XEM */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '1rem 1.25rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
          }}>
            {/* Ô tìm kiếm phụ huynh theo CCCD / SĐT / Tên */}
            <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '480px' }}>
              <Search size={17} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Tra cứu phụ huynh theo Họ tên, SĐT, số CCCD..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  paddingLeft: '2.5rem',
                  paddingRight: '1rem',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.875rem',
                  color: '#0F172A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Badge thông báo trạng thái */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <span style={{ fontSize: '0.825rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sparkles size={15} style={{ color: '#059669' }} />
                <span>
                  {isSearching ? `Kết quả tìm kiếm: ${parentList.length} hồ sơ` : `Đang hiển thị đề xuất 20 hồ sơ mới nhất`}
                </span>
              </span>
            </div>
          </div>

          {/* HIỂN THỊ DANH SÁCH PHỤ HUYNH */}
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#059669' }}>
              <RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>Đang tải danh sách hồ sơ phụ huynh...</div>
            </div>
          ) : parentList.length === 0 ? (
            <div style={{
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              border: '1.5px dashed #CBD5E1'
            }}>
              <HeartHandshake size={48} style={{ color: '#94A3B8', margin: '0 auto 0.75rem' }} />
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#1E293B' }}>
                Không tìm thấy hồ sơ phụ huynh nào
              </h3>
              <p style={{ margin: '0.35rem 0 1.25rem', fontSize: '0.85rem', color: '#64748B' }}>
                Chưa có dữ liệu phụ huynh hoặc không khớp với từ khóa tìm kiếm.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingParent(null);
                  setShowAddEditModal(true);
                }}
                style={{
                  height: '40px',
                  padding: '0 1.25rem',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#059669',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                + Thêm Phụ Huynh Mới
              </button>
            </div>
          ) : (
            /* HIỂN THỊ DẠNG THẺ LƯỚI (GRID CARDS) */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.25rem'
            }}>
              {parentList.map((ph) => {
                const idPh = ph.idPh || ph.id;
                return (
                  <div
                    key={idPh}
                    onClick={() => pushStep('CHI_TIET_PHU_HUYNH', { phuHuynh: ph })}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '18px',
                      border: '1px solid #E2E8F0',
                      padding: '1.35rem',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#059669';
                      e.currentTarget.style.boxShadow = '0 10px 24px rgba(5, 150, 105, 0.12)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E2E8F0';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Header Thẻ Phụ Huynh */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          backgroundColor: '#ECFDF5',
                          color: '#059669',
                          fontWeight: '800',
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid #A7F3D0'
                        }}>
                          {ph.hoTen ? ph.hoTen.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>
                            {ph.hoTen || ph.tenPh}
                          </h4>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                            {ph.ngheNghiep || 'Phụ huynh'}
                          </span>
                        </div>
                      </div>

                      <span style={{
                        fontSize: '0.725rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        backgroundColor: ph.xoa ? '#FEF2F2' : '#F0FDF4',
                        color: ph.xoa ? '#DC2626' : '#166534',
                        border: ph.xoa ? '1px solid #FECACA' : '1px solid #BBF7D0'
                      }}>
                        {ph.xoa ? 'Đã khóa' : 'Hoạt động'}
                      </span>
                    </div>

                    {/* Metadata: SĐT & CCCD */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      padding: '0.75rem 0.85rem',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '12px',
                      fontSize: '0.825rem',
                      color: '#475569'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Phone size={14} style={{ color: '#0284C7' }} />
                        <span>SĐT: <strong style={{ color: '#0F172A' }}>{ph.soDienThoai || ph.sdt || 'Chưa cập nhật'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <CreditCard size={14} style={{ color: '#7C3AED' }} />
                        <span>CCCD: <strong style={{ color: '#0F172A', letterSpacing: '0.03em' }}>{ph.cccd || 'Chưa cập nhật'}</strong></span>
                      </div>
                      {ph.diaChi && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <MapPin size={14} style={{ color: '#EF4444', flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{ph.diaChi}</span>
                        </div>
                      )}
                    </div>

                    {/* Con cái trực thuộc */}
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                        Con cái trực thuộc:
                      </span>
                      <CotHocSinhPhuHuynh 
                        idPh={idPh} 
                        onSelectStudent={(hs) => pushStep('CHI_TIET_HOC_SINH', { student: hs })} 
                      />
                    </div>

                    {/* Thao tác chân thẻ */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '0.65rem',
                      borderTop: '1px solid #F1F5F9',
                      marginTop: '0.25rem'
                    }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingParent(ph);
                          setShowAddEditModal(true);
                        }}
                        style={{
                          height: '32px',
                          padding: '0 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          color: '#334155',
                          fontSize: '0.775rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem'
                        }}
                      >
                        <Edit2 size={13} />
                        <span>Sửa</span>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontSize: '0.8rem', fontWeight: '700' }}>
                        <span>Xem Hồ Sơ Liên Kết</span>
                        <ChevronRight size={15} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* BƯỚC 2: VIEW CHI TIẾT PHỤ HUYNH & LIÊN KẾT HỌC SINH */}
      {currentStep === 'CHI_TIET_PHU_HUYNH' && currentData.phuHuynh && (
        <ChiTietPhuHuynh
          phuHuynh={currentData.phuHuynh}
          onBack={popStep}
          onEdit={(ph) => {
            setEditingParent(ph);
            setShowAddEditModal(true);
          }}
          onSelectStudent={(hs) => pushStep('CHI_TIET_HOC_SINH', { student: hs })}
          selectedDnId={selectedDnId}
        />
      )}

      {/* BƯỚC 3: TÁI SỬ DỤNG TRỰC TIẾP VIEW HỒ SƠ HỌC SINH 360° */}
      {currentStep === 'CHI_TIET_HOC_SINH' && currentData.student && (
        <ChiTietHocSinhView
          hocSinh={currentData.student}
          onBack={popStep}
          onSelectStudent={(hs) => pushStep('CHI_TIET_HOC_SINH', { student: hs })}
        />
      )}

      {/* ── MODAL THÊM / SỬA PHỤ HUYNH ── */}
      <ModalThemSuaPhuHuynh
        show={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        editingParent={editingParent}
        selectedDnId={selectedDnId}
        onSuccess={(saved) => {
          fetchParents(searchKeyword);
          if (currentStep === 'CHI_TIET_PHU_HUYNH') {
            setNavQueue(prev => {
              const clone = [...prev];
              clone[1] = { step: 'CHI_TIET_PHU_HUYNH', data: { phuHuynh: saved } };
              return clone;
            });
          }
        }}
      />
    </div>
  );
};

export default TrangPhuHuynh;
