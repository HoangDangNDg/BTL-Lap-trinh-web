import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Search, 
  Plus, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  FileText, 
  AlertCircle,
  X,
  ArrowDownRight,
  ArrowUpRight,
  Wallet
} from 'lucide-react';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import { dichVuTaiChinh } from '../../dich_vu/tao_tu_dong/dichVuTaiChinh';
import { dichVuDoanhNghiep } from '../../dich_vu/tao_tu_dong/dichVuDoanhNghiep';
import { thongBao } from '../../tien_ich/thongBao';

export default function TrangSoQuyThuChi() {
  const { user } = useTrangThaiXacThuc();
  const idDn = user?.idDoanhNghiep || 1;

  const [transactions, setTransactions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKw, setSearchKw] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'THU' | 'CHI'

  // Modal tạo giao dịch mới
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    idCn: '',
    loaiGd: 'THU',
    soTien: '',
    noiDung: '',
    ngayGd: new Date().toISOString().split('T')[0]
  });

  // Tải danh sách giao dịch và chi nhánh
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [txRes, brRes] = await Promise.all([
        dichVuTaiChinh.getSoQuyTheoDoanhNghiep(idDn).catch(() => []),
        dichVuDoanhNghiep.getChiNhanhTheoDoanhNghiep(idDn).catch(() => [])
      ]);

      const tList = Array.isArray(txRes) ? txRes : (txRes?.data || []);
      const bList = Array.isArray(brRes) ? brRes : (brRes?.data || []);

      setTransactions(tList);
      setBranches(bList);
      if (bList.length > 0 && !formData.idCn) {
        setFormData(prev => ({ ...prev, idCn: bList[0].idCn }));
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu sổ quỹ:', err);
    } finally {
      setLoading(false);
    }
  }, [idDn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Xóa giao dịch
  const handleDelete = (idGd) => {
    thongBao.xacNhan({
      tieuDe: 'Xác nhận xóa giao dịch',
      thongDiep: 'Bạn có chắc chắn muốn xóa giao dịch này khỏi sổ quỹ?',
      loai: 'danger',
      nhanXacNhan: 'Xóa giao dịch',
      nhanHuy: 'Hủy bỏ',
      onXacNhan: async () => {
        try {
          await dichVuTaiChinh.deleteSoQuyThuChi(idGd);
          setTransactions(prev => prev.filter(t => t.idGd !== idGd));
          thongBao.success('Đã xóa giao dịch khỏi sổ quỹ thành công!');
        } catch (err) {
          thongBao.error('Không thể xóa giao dịch. Vui lòng thử lại!');
        }
      }
    });
  };

  // Tạo mới giao dịch
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.soTien || Number(formData.soTien) <= 0 || !formData.noiDung.trim()) {
      thongBao.warning('Vui lòng điền đầy đủ số tiền và nội dung giao dịch!');
      return;
    }

    try {
      setSubmitting(true);
      const targetCnId = formData.idCn || (branches[0]?.idCn) || 1;
      const payload = {
        loaiGd: formData.loaiGd,
        soTien: Number(formData.soTien),
        noiDung: formData.noiDung,
        ngayGd: formData.ngayGd,
        chiNhanh: { idCn: Number(targetCnId) }
      };

      await dichVuTaiChinh.createGiaoDich(Number(targetCnId), payload);
      setShowModal(false);
      thongBao.success('Đã ghi nhận giao dịch mới vào sổ quỹ!');
      setFormData(prev => ({
        ...prev,
        soTien: '',
        noiDung: '',
        ngayGd: new Date().toISOString().split('T')[0]
      }));
      fetchData();
    } catch (err) {
      console.error('Lỗi khi tạo giao dịch thu chi:', err);
      thongBao.error('Lỗi tạo giao dịch. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  // Thống kê tài chính
  const stats = useMemo(() => {
    let tongThu = 0;
    let tongChi = 0;
    transactions.forEach(t => {
      const amt = Number(t.soTien) || 0;
      if (t.loaiGd === 'THU') {
        tongThu += amt;
      } else {
        tongChi += amt;
      }
    });
    return {
      tongThu,
      tongChi,
      soDuRong: tongThu - tongChi,
      count: transactions.length
    };
  }, [transactions]);

  // Lọc danh sách giao dịch
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchType = filterType === 'ALL' || t.loaiGd === filterType;
      const matchKw = !searchKw.trim() || 
        (t.noiDung && t.noiDung.toLowerCase().includes(searchKw.toLowerCase())) ||
        (t.maGiaoDich && t.maGiaoDich.toLowerCase().includes(searchKw.toLowerCase()));
      return matchType && matchKw;
    });
  }, [transactions, filterType, searchKw]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', paddingBottom: '3rem' }}>
      {/* ── HEADER CHÍNH ── */}
      <div 
        className="droplet-card"
        style={{
          padding: '1.5rem 1.75rem',
          borderRadius: '24px',
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            backgroundColor: '#EFF6FF',
            color: '#0284C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Sổ Quỹ & Tài Chính Thu Chi
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              Theo dõi dòng tiền thu chi, quản trị quỹ cơ sở và dòng tiền hoạt động trung tâm
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.1rem',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>

          <button
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
            }}
          >
            <Plus size={16} />
            Lập Giao Dịch
          </button>
        </div>
      </div>

      {/* ── METRICS CARDS: TỔNG THU - TỔNG CHI - SỐ DƯ QUỸ ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Card 1: Tổng Thu */}
        <div 
          className="droplet-card"
          style={{
            padding: '1.4rem',
            borderRadius: '20px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
            display: 'flex',
            alignItems: 'center',
            gap: '1.1rem'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: '#16A34A',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
          }}>
            <ArrowDownRight size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tổng Thu Vào Quỹ
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#14532D', marginTop: '0.2rem' }}>
              +{stats.tongThu.toLocaleString('vi-VN')} <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>đ</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tổng Chi */}
        <div 
          className="droplet-card"
          style={{
            padding: '1.4rem',
            borderRadius: '20px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            gap: '1.1rem'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
          }}>
            <ArrowUpRight size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#B91C1C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tổng Chi Hoạt Động
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#7F1D1D', marginTop: '0.2rem' }}>
              -{stats.tongChi.toLocaleString('vi-VN')} <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>đ</span>
            </div>
          </div>
        </div>

        {/* Card 3: Số Dư Quỹ */}
        <div 
          className="droplet-card"
          style={{
            padding: '1.4rem',
            borderRadius: '20px',
            backgroundColor: '#F0F9FF',
            border: '1px solid #BAE6FD',
            display: 'flex',
            alignItems: 'center',
            gap: '1.1rem'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: '#0284C7',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
          }}>
            <Wallet size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Số Dư Ròng Trong Quỹ
            </div>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '900', 
              color: stats.soDuRong >= 0 ? '#0C4A6E' : '#991B1B', 
              marginTop: '0.2rem' 
            }}>
              {stats.soDuRong.toLocaleString('vi-VN')} <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>đ</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BỘ LỌC VÀ TÌM KIẾM ── */}
      <div 
        className="droplet-card"
        style={{
          padding: '1rem 1.5rem',
          borderRadius: '20px',
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input 
            type="text"
            placeholder="Tìm theo nội dung, mã giao dịch..."
            value={searchKw}
            onChange={e => setSearchKw(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.4rem',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              fontSize: '0.85rem',
              outline: 'none',
              backgroundColor: '#F8FAFC'
            }}
          />
        </div>

        {/* Toggle Filter Thu / Chi */}
        <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: '#F1F5F9', padding: '0.3rem', borderRadius: '12px' }}>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'THU', label: '🟢 Thu tiền' },
            { id: 'CHI', label: '🔴 Chi tiền' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: filterType === tab.id ? '#FFFFFF' : 'transparent',
                color: filterType === tab.id ? '#0F172A' : '#64748B',
                fontWeight: filterType === tab.id ? '700' : '600',
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: filterType === tab.id ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── LƯỚI THẺ SỔ QUỸ (DROPLET GRID CARDS - KHÔNG DÙNG BẢNG THÔ) ── */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.9rem' }}>
          Đang tải dữ liệu sổ quỹ...
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div 
          className="droplet-card"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            borderRadius: '24px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0'
          }}
        >
          <AlertCircle size={40} style={{ color: '#94A3B8', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.5rem 0' }}>
            Chưa có giao dịch thu chi nào
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '380px', margin: '0 auto 1.25rem auto' }}>
            Bấm nút "Lập Giao Dịch" phía trên để ghi nhận khoản thu/chi mới vào sổ quỹ.
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '12px',
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            + Lập Giao Dịch Ngay
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredTransactions.map((tx, idx) => {
            const isThu = tx.loaiGd === 'THU';
            const idKey = tx.idGd || tx.idGiaoDich || idx;

            return (
              <div
                key={idKey}
                className="droplet-card"
                style={{
                  padding: '1.4rem',
                  borderRadius: '20px',
                  backgroundColor: '#FFFFFF',
                  border: isThu ? '1px solid #DCFCE7' : '1px solid #FEE2E2',
                  boxShadow: '0 4px 15px -2px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative'
                }}
              >
                {/* Header Thẻ: Loại GD & Nút Xóa */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      backgroundColor: isThu ? '#DCFCE7' : '#FEE2E2',
                      color: isThu ? '#16A34A' : '#DC2626',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isThu ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        backgroundColor: isThu ? '#DCFCE7' : '#FEE2E2',
                        color: isThu ? '#15803D' : '#B91C1C',
                        fontSize: '0.72rem',
                        fontWeight: '800'
                      }}>
                        {isThu ? 'KHOẢN THU (+)' : 'KHOẢN CHI (-)'}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                        {tx.maGiaoDich || `GD #${idKey}`}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(idKey)}
                    title="Xóa giao dịch này"
                    style={{
                      padding: '0.4rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#F8FAFC',
                      color: '#94A3B8',
                      cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Số tiền to, rõ ràng */}
                <div style={{
                  fontSize: '1.45rem',
                  fontWeight: '900',
                  color: isThu ? '#15803D' : '#B91C1C',
                  letterSpacing: '-0.02em'
                }}>
                  {isThu ? '+' : '-'}{(Number(tx.soTien) || 0).toLocaleString('vi-VN')} <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>VNĐ</span>
                </div>

                {/* Nội dung giao dịch */}
                <div style={{
                  padding: '0.75rem 0.9rem',
                  borderRadius: '12px',
                  backgroundColor: '#F8FAFC',
                  fontSize: '0.82rem',
                  color: '#334155',
                  lineHeight: '1.4'
                }}>
                  {tx.noiDung || 'Không có mô tả chi tiết'}
                </div>

                {/* Footer thông tin: Ngày giao dịch & Chi nhánh */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748B', borderTop: '1px solid #F1F5F9', paddingTop: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={13} style={{ color: '#0284C7' }} />
                    <span>{tx.ngayGd || 'Hôm nay'}</span>
                  </div>
                  <span>{tx.chiNhanh?.tenCn || 'Cơ sở chính'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL LẬP GIAO DỊCH THU CHI ── */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div 
            className="droplet-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={20} style={{ color: '#0284C7' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Lập Phiếu Thu / Chi Sổ Quỹ
                </h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Loại giao dịch */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Loại giao dịch *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, loaiGd: 'THU' }))}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '12px',
                      border: formData.loaiGd === 'THU' ? '2px solid #16A34A' : '1px solid #E2E8F0',
                      backgroundColor: formData.loaiGd === 'THU' ? '#F0FDF4' : '#FFFFFF',
                      color: formData.loaiGd === 'THU' ? '#15803D' : '#64748B',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    🟢 KHOẢN THU VÀO
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, loaiGd: 'CHI' }))}
                    style={{
                      padding: '0.65rem',
                      borderRadius: '12px',
                      border: formData.loaiGd === 'CHI' ? '2px solid #DC2626' : '1px solid #E2E8F0',
                      backgroundColor: formData.loaiGd === 'CHI' ? '#FEF2F2' : '#FFFFFF',
                      color: formData.loaiGd === 'CHI' ? '#B91C1C' : '#64748B',
                      fontWeight: '800',
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    🔴 KHOẢN CHI RA
                  </button>
                </div>
              </div>

              {/* Chi nhánh áp dụng */}
              {branches.length > 0 && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                    Chi nhánh cơ sở *
                  </label>
                  <select
                    value={formData.idCn}
                    onChange={e => setFormData(prev => ({ ...prev, idCn: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#F8FAFC'
                    }}
                  >
                    {branches.map(b => (
                      <option key={b.idCn} value={b.idCn}>
                        {b.tenCn} ({b.diaChi || 'Trụ sở'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Số tiền */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Số tiền giao dịch (VNĐ) *
                </label>
                <input
                  type="number"
                  placeholder="Ví dụ: 1500000"
                  value={formData.soTien}
                  onChange={e => setFormData(prev => ({ ...prev, soTien: e.target.value }))}
                  required
                  min="1000"
                  step="1000"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                    fontWeight: '700'
                  }}
                />
              </div>

              {/* Ngày giao dịch */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Ngày ghi nhận giao dịch *
                </label>
                <input
                  type="date"
                  value={formData.ngayGd}
                  onChange={e => setFormData(prev => ({ ...prev, ngayGd: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.85rem',
                    outline: 'none',
                    backgroundColor: '#F8FAFC'
                  }}
                />
              </div>

              {/* Nội dung giao dịch */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Nội dung chi tiết giao dịch *
                </label>
                <textarea
                  rows={2}
                  value={formData.noiDung}
                  onChange={e => setFormData(prev => ({ ...prev, noiDung: e.target.value }))}
                  placeholder="Ví dụ: Thu tiền thuê phòng hội thảo, Chi tiền điện nước tháng..."
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.85rem',
                    outline: 'none',
                    backgroundColor: '#F8FAFC',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '0.6rem 1.4rem',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                  }}
                >
                  {submitting ? 'Đang lưu...' : 'Lưu Giao Dịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
