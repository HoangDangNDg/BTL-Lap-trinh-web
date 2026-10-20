import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Award, 
  DollarSign, 
  Users, 
  Calendar, 
  Search, 
  Plus, 
  RefreshCw, 
  Trash2, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  FileText, 
  AlertCircle,
  X,
  Phone,
  ArrowUpRight
} from 'lucide-react';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import { dichVuTaiChinh } from '../../dich_vu/tao_tu_dong/dichVuTaiChinh';
import { dichVuGiaoVien } from '../../dich_vu/dichVuGiaoVien';
import { thongBao } from '../../tien_ich/thongBao';

export default function TrangLuongGiaoVien() {
  const { user } = useTrangThaiXacThuc();
  const idDn = user?.idDoanhNghiep || 1;

  const [payrolls, setPayrolls] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKw, setSearchKw] = useState('');
  const [filterMonth, setFilterMonth] = useState('ALL');

  // Modal tạo phiếu lương
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    idGv: '',
    soTien: '',
    ngayThanhToan: new Date().toISOString().split('T')[0],
    hinhThucTt: 'CHUYEN_KHOAN',
    ghiChu: 'Thanh toán thù lao giảng dạy'
  });

  // Tải danh sách lương và giáo viên
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [payrollRes, teacherRes] = await Promise.all([
        dichVuTaiChinh.getThanhToanTheoDoanhNghiep(idDn).catch(() => []),
        dichVuGiaoVien.getDanhSachGiaoVien({ idDn }).catch(() => [])
      ]);

      const pList = Array.isArray(payrollRes) ? payrollRes : (payrollRes?.data || []);
      const tList = Array.isArray(teacherRes) ? teacherRes : (teacherRes?.data || []);

      setPayrolls(pList);
      setTeachers(tList);
      if (tList.length > 0 && !formData.idGv) {
        setFormData(prev => ({ ...prev, idGv: tList[0].idGv }));
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu lương:', err);
    } finally {
      setLoading(false);
    }
  }, [idDn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Xóa phiếu lương
  const handleDelete = (idThanhToan) => {
    thongBao.xacNhan({
      tieuDe: 'Xác nhận xóa phiếu lương',
      thongDiep: 'Bạn có chắc chắn muốn xóa bản ghi thanh toán lương này?',
      loai: 'danger',
      nhanXacNhan: 'Xóa phiếu',
      nhanHuy: 'Hủy bỏ',
      onXacNhan: async () => {
        try {
          await dichVuTaiChinh.deleteThanhToanGiaoVien(idThanhToan);
          setPayrolls(prev => prev.filter(p => (p.idThanhToan || p.idTt) !== idThanhToan));
          thongBao.success('Đã xóa phiếu thanh toán lương thành công!');
        } catch (err) {
          thongBao.error('Không thể xóa phiếu lương. Vui lòng thử lại!');
        }
      }
    });
  };

  // Tạo mới phiếu lương
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.idGv || !formData.soTien || Number(formData.soTien) <= 0) {
      thongBao.warning('Vui lòng chọn giáo viên và nhập số tiền lương hợp lệ!');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        giaoVien: { idGv: Number(formData.idGv) },
        soTien: Number(formData.soTien),
        ngayThanhToan: formData.ngayThanhToan,
        hinhThucTt: formData.hinhThucTt,
        ghiChu: formData.ghiChu,
        idDoanhNghiep: idDn
      };

      const res = await dichVuTaiChinh.thanhToanLuongGiaoVien(payload);
      setShowModal(false);
      thongBao.success('Đã lập phiếu thanh toán lương thành công!');
      fetchData();
    } catch (err) {
      console.error('Lỗi khi tạo phiếu chi lương:', err);
      thongBao.error('Lỗi tạo phiếu chi lương. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  // Thống kê số liệu
  const stats = useMemo(() => {
    const totalAmount = payrolls.reduce((sum, p) => sum + (Number(p.soTien) || 0), 0);
    const uniqueTeachers = new Set(payrolls.map(p => p.giaoVien?.idGv || p.idGv)).size;
    return {
      totalAmount,
      count: payrolls.length,
      uniqueTeachers
    };
  }, [payrolls]);

  // Lọc danh sách
  const filteredPayrolls = useMemo(() => {
    return payrolls.filter(p => {
      const gvName = p.giaoVien?.hoTen || p.hoTen || '';
      const ghiChu = p.ghiChu || '';
      const matchKw = !searchKw.trim() || 
        gvName.toLowerCase().includes(searchKw.toLowerCase()) || 
        ghiChu.toLowerCase().includes(searchKw.toLowerCase());

      const matchMonth = filterMonth === 'ALL' || 
        (p.ngayThanhToan && p.ngayThanhToan.startsWith(filterMonth));

      return matchKw && matchMonth;
    });
  }, [payrolls, searchKw, filterMonth]);

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
            backgroundColor: '#FAF5FF',
            color: '#9333EA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Bảng Lương & Thù Lao Giáo Viên
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              Kiểm soát các kỳ thanh toán thù lao giảng dạy, lịch sử chi trả minh bạch cho giáo viên
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
              backgroundColor: '#9333EA',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(147, 51, 234, 0.25)'
            }}
          >
            <Plus size={16} />
            Lập Phiếu Chi Lương
          </button>
        </div>
      </div>

      {/* ── KPI METRICS CARDS (DẠNG THẺ THỐNG KÊ HIỆN ĐẠI) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Card 1: Tổng chi lương */}
        <div 
          className="droplet-card"
          style={{
            padding: '1.4rem',
            borderRadius: '20px',
            backgroundColor: '#FAF5FF',
            border: '1px solid #E9D5FF',
            display: 'flex',
            alignItems: 'center',
            gap: '1.1rem'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: '#9333EA',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#7E22CE', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tổng Tiền Đã Thanh Toán
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#581C87', marginTop: '0.2rem' }}>
              {stats.totalAmount.toLocaleString('vi-VN')} <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>đ</span>
            </div>
          </div>
        </div>

        {/* Card 2: Số lượt chi trả */}
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
            <CreditCard size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Số Phiếu Thanh Toán
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#14532D', marginTop: '0.2rem' }}>
              {stats.count} <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>lượt</span>
            </div>
          </div>
        </div>

        {/* Card 3: Số GV đã nhận lương */}
        <div 
          className="droplet-card"
          style={{
            padding: '1.4rem',
            borderRadius: '20px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            display: 'flex',
            alignItems: 'center',
            gap: '1.1rem'
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
          }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Giáo Viên Đã Nhận Lương
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1E3A8A', marginTop: '0.2rem' }}>
              {stats.uniqueTeachers} <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>nhân sự</span>
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
            placeholder="Tìm kiếm theo tên giáo viên, ghi chú..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: '600' }}>Kỳ chi trả:</span>
          <select
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              fontSize: '0.85rem',
              outline: 'none',
              backgroundColor: '#F8FAFC',
              fontWeight: '600',
              color: '#334155'
            }}
          >
            <option value="ALL">Toàn bộ thời gian</option>
            <option value="2026-09">Tháng 09/2026</option>
            <option value="2026-08">Tháng 08/2026</option>
            <option value="2026-07">Tháng 07/2026</option>
          </select>
        </div>
      </div>

      {/* ── LƯỚI THẺ LƯƠNG GIÁO VIÊN (DROPLET GRID CARDS - KHÔNG DÙNG BẢNG THÔ) ── */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.9rem' }}>
          Đang tải danh sách lương giáo viên...
        </div>
      ) : filteredPayrolls.length === 0 ? (
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
            Chưa có bản ghi thanh toán lương nào
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '380px', margin: '0 auto 1.25rem auto' }}>
            Bấm nút "Lập Phiếu Chi Lương" phía trên để tiến hành thanh toán thù lao cho giáo viên.
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '12px',
              backgroundColor: '#9333EA',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            + Lập Phiếu Ngay
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredPayrolls.map((payroll, idx) => {
            const idKey = payroll.idThanhToan || payroll.idTt || idx;
            const gv = payroll.giaoVien || {};
            const initials = gv.hoTen 
              ? gv.hoTen.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase() 
              : 'GV';

            return (
              <div
                key={idKey}
                className="droplet-card"
                style={{
                  padding: '1.4rem',
                  borderRadius: '20px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  boxShadow: '0 4px 15px -2px rgba(15, 23, 42, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                {/* Header Thẻ: Avatar GV & Tên */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: '#F3E8FF',
                      color: '#9333EA',
                      fontSize: '0.9rem',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A' }}>
                        {gv.hoTen || 'Giáo viên'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.15rem' }}>
                        <Phone size={12} /> {gv.soDienThoai || 'Chưa cập nhật SĐT'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(idKey)}
                    title="Xóa phiếu lương"
                    style={{
                      padding: '0.4rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#FEE2E2',
                      color: '#DC2626',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Số tiền lương nổi bật */}
                <div style={{
                  padding: '1rem',
                  borderRadius: '14px',
                  backgroundColor: '#FAF5FF',
                  border: '1px solid #F3E8FF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#7E22CE', textTransform: 'uppercase' }}>
                      Lương Thực Lĩnh
                    </div>
                    <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#581C87', marginTop: '0.15rem' }}>
                      {(Number(payroll.soTien) || 0).toLocaleString('vi-VN')} <span style={{ fontSize: '0.85rem' }}>VNĐ</span>
                    </div>
                  </div>
                  <div style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: '8px',
                    backgroundColor: '#E9D5FF',
                    color: '#6B21A8',
                    fontSize: '0.72rem',
                    fontWeight: '700'
                  }}>
                    {payroll.hinhThucTt === 'CHUYEN_KHOAN' ? 'Chuyển khoản' : 'Tiền mặt'}
                  </div>
                </div>

                {/* Thông tin phụ: Ngày chi & Ghi chú */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem', color: '#64748B' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={13} style={{ color: '#9333EA' }} />
                    <span>Ngày thanh toán: <strong>{payroll.ngayThanhToan || 'Hôm nay'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FileText size={13} style={{ color: '#9333EA' }} />
                    <span style={{ 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis' 
                    }}>
                      {payroll.ghiChu || 'Thanh toán thù lao'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL LẬP PHIẾU CHI LƯƠNG ── */}
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
                <Award size={20} style={{ color: '#9333EA' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Lập Phiếu Chi Lương Giáo Viên
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
              {/* Chọn giáo viên */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Giáo viên thụ hưởng *
                </label>
                <select
                  value={formData.idGv}
                  onChange={e => setFormData(prev => ({ ...prev, idGv: e.target.value }))}
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
                  <option value="">-- Chọn giáo viên --</option>
                  {teachers.map(t => (
                    <option key={t.idGv} value={t.idGv}>
                      {t.hoTen} ({t.soDienThoai || 'Chưa có SĐT'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Số tiền lương */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Số tiền thanh toán (VNĐ) *
                </label>
                <input
                  type="number"
                  placeholder="Ví dụ: 8000000"
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

              {/* Ngày thanh toán */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Ngày thanh toán *
                </label>
                <input
                  type="date"
                  value={formData.ngayThanhToan}
                  onChange={e => setFormData(prev => ({ ...prev, ngayThanhToan: e.target.value }))}
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

              {/* Hình thức thanh toán */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Hình thức thanh toán
                </label>
                <select
                  value={formData.hinhThucTt}
                  onChange={e => setFormData(prev => ({ ...prev, hinhThucTt: e.target.value }))}
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
                  <option value="CHUYEN_KHOAN">Chuyển khoản ngân hàng</option>
                  <option value="TIEN_MAT">Tiền mặt</option>
                </select>
              </div>

              {/* Ghi chú */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
                  Ghi chú / Nội dung thù lao
                </label>
                <textarea
                  rows={2}
                  value={formData.ghiChu}
                  onChange={e => setFormData(prev => ({ ...prev, ghiChu: e.target.value }))}
                  placeholder="Ví dụ: Thù lao giảng dạy tháng 09/2026..."
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
                    backgroundColor: '#9333EA',
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
                  }}
                >
                  {submitting ? 'Đang lưu...' : 'Lưu Phiếu Chi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
