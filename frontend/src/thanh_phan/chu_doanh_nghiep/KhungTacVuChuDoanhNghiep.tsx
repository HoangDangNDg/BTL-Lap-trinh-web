import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  CalendarDays, 
  Clock, 
  Layers, 
  BookOpen, 
  GraduationCap, 
  CheckCircle, 
  Users, 
  DollarSign, 
  FileText, 
  ArrowRight, 
  X, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { NutThaoTacApi } from '../NutThaoTacApi';
import { useNamHocKyHocStore } from '../../trang_thai/useNamHocKyHocStore';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import { dichVuTaiChinh } from '../../dich_vu/tao_tu_dong/dichVuTaiChinh';
import { dichVuHocSinhPhuHuynh } from '../../dich_vu/tao_tu_dong/dichVuHocSinhPhuHuynh';
import { useComponentTheme } from '../../trang_thai/useComponentTheme';

export interface ActionPreviewData {
  title: string;
  type: string;
  count?: number;
  data: any[];
  viewAllLink: string;
  columns?: { key: string; label: string; render?: (val: any) => any }[];
}

export const KhungTacVuChuDoanhNghiep: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useTrangThaiXacThuc();
  const { mode, applyToCards } = useComponentTheme();
  const isDark = mode === 'DARK' && applyToCards;

  const {
    namHocList,
    kyHocList,
    tuanHocList,
    selectedNamHocId,
    selectedKyHocId,
    selectedTuanHocId
  } = useNamHocKyHocStore();

  const [activeTab, setActiveTab] = useState<'daoTao' | 'diemDanh' | 'hocSinh' | 'taiChinh'>('daoTao');
  const [previewData, setPreviewData] = useState<ActionPreviewData | null>(null);

  const currentNam = namHocList.find(n => n.idNh === selectedNamHocId);
  const currentKy = kyHocList.find(k => k.idKh === selectedKyHocId);
  const currentTuan = tuanHocList.find(t => t.idTh === selectedTuanHocId);

  // 1. Tác vụ: Tra cứu TKB tuần hiện tại
  const handleFetchTkbTuan = async () => {
    let res;
    if (selectedTuanHocId) {
      res = await dichVuDaoTaoChung.getThoiKhoaBieuTheoTuan(selectedTuanHocId);
    } else {
      res = await dichVuDaoTaoChung.getTatCaThoiKhoaBieu();
    }
    const list = Array.isArray(res) ? res : (res?.data || []);
    setPreviewData({
      title: `Thời Khóa Biểu: ${currentTuan ? (currentTuan.soTuan ? `Tuần ${currentTuan.soTuan}` : currentTuan.moTa) : 'Tất cả tuần'}`,
      type: 'TKB',
      count: list.length,
      data: list,
      viewAllLink: '/thoi-khoa-bieu',
      columns: [
        { key: 'thuTrongTuan', label: 'Thứ', render: val => `Thứ ${val}` },
        { key: 'caHoc', label: 'Ca học', render: val => `Ca ${val?.idCaHoc || val || '-'}` },
        { key: 'lopHoc', label: 'Lớp học', render: val => val?.tenLop || `Lớp #${val?.idLop || '-'}` },
        { key: 'phongHoc', label: 'Phòng học', render: val => val?.tenPhong || '-' }
      ]
    });
  };

  // 2. Tác vụ: Tra cứu Lớp học theo Kỳ / Năm
  const handleFetchLopHoc = async () => {
    const res = await dichVuDaoTaoChung.getDanhSachLopHoc({
      idDn: user?.idDoanhNghiep || 1,
      idKh: selectedKyHocId || undefined
    });
    const list = Array.isArray(res) ? res : (res?.items || res?.data?.items || res?.data || []);
    setPreviewData({
      title: `Danh Sách Lớp Học: ${currentKy ? currentKy.tenKyHoc : 'Tất cả kỳ'} (${currentNam ? (currentNam.tenNamHoc || (currentNam.namBatDau && currentNam.namKetThuc ? `${currentNam.namBatDau} - ${currentNam.namKetThuc}` : `Năm ${currentNam.idNh}`)) : ''})`,
      type: 'LOP',
      count: list.length,
      data: list,
      viewAllLink: '/lop-hoc',
      columns: [
        { key: 'tenLop', label: 'Tên Lớp' },
        { key: 'khoaHoc', label: 'Khóa học', render: val => val?.tenKhoaHoc || '-' },
        { key: 'siSoToiDa', label: 'Sĩ số', render: (val, row: any) => `${row?.soHocSinh || 0} / ${val || 30}` },
        { key: 'trangThai', label: 'Trạng thái', render: val => val || 'Đang mở' }
      ]
    });
  };

  // 3. Tác vụ: Tra cứu Danh sách Học sinh của Doanh nghiệp
  const handleFetchHocSinh = async () => {
    const idDn = user?.idDoanhNghiep || 1;
    const res = await dichVuHocSinhPhuHuynh.getHocSinhTheoDoanhNghiep(idDn);
    const list = Array.isArray(res) ? res : (res?.data || []);
    setPreviewData({
      title: 'Danh Sách Học Sinh Doanh Nghiệp',
      type: 'HOC_SINH',
      count: list.length,
      data: list,
      viewAllLink: '/hoc-sinh',
      columns: [
        { key: 'hoTen', label: 'Họ và Tên' },
        { key: 'soDienThoai', label: 'Số Điện Thoại' },
        { key: 'gioiTinh', label: 'Giới tính', render: val => val === 'F' ? 'Nữ' : 'Nam' },
        { key: 'diaChi', label: 'Địa chỉ' }
      ]
    });
  };

  // 4. Tác vụ: Tra cứu Sổ Quỹ Doanh Nghiệp
  const handleFetchSoQuy = async () => {
    const idDn = user?.idDoanhNghiep || 1;
    const res = await dichVuTaiChinh.getSoQuyTheoDoanhNghiep(idDn);
    const list = Array.isArray(res) ? res : (res?.data || []);
    setPreviewData({
      title: `Sổ Quỹ Thu Chi Trung Tâm: ${currentKy ? currentKy.tenKyHoc : 'Toàn kỳ'}`,
      type: 'SO_QUY',
      count: list.length,
      data: list,
      viewAllLink: '/thu-chi',
      columns: [
        { key: 'maGiaoDich', label: 'Mã GD', render: (val, r: any) => val || `GD #${r?.idGd || '-'}` },
        { key: 'loaiGd', label: 'Loại', render: val => val === 'THU' ? '🟢 Thu' : '🔴 Chi' },
        { key: 'soTien', label: 'Số tiền (VNĐ)', render: val => (Number(val) || 0).toLocaleString('vi-VN') + ' đ' },
        { key: 'noiDung', label: 'Nội dung giao dịch' }
      ]
    });
  };

  // 5. Tác vụ: Lương Giáo Viên
  const handleFetchLuongGiaoVien = async () => {
    const idDn = user?.idDoanhNghiep || 1;
    const res = await dichVuTaiChinh.getThanhToanTheoDoanhNghiep(idDn);
    const list = Array.isArray(res) ? res : (res?.data || []);
    setPreviewData({
      title: 'Bảng Thanh Toán Lương Giáo Viên',
      type: 'LUONG',
      count: list.length,
      data: list,
      viewAllLink: '/luong-giao-vien',
      columns: [
        { key: 'giaoVien', label: 'Giáo viên', render: val => val?.hoTen || '-' },
        { key: 'soTien', label: 'Lương thực lĩnh', render: val => (Number(val) || 0).toLocaleString('vi-VN') + ' đ' },
        { key: 'thang', label: 'Kỳ / Tháng', render: (val, r: any) => val ? `Tháng ${val}` : (r?.ngayThanhToan || '-') }
      ]
    });
  };

  return (
    <div 
      className="droplet-card"
      style={{
        padding: '1.75rem',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        boxShadow: isDark ? '0 10px 30px -5px rgba(0, 0, 0, 0.4)' : '0 10px 30px -5px rgba(15, 23, 42, 0.06)',
        border: isDark ? '1px solid #334155' : '1px solid rgba(226, 232, 240, 0.8)'
      }}
    >
      {/* ── Tiêu đề & Ngữ cảnh Năm - Kỳ - Tuần Hiện Tại ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '1rem',
        borderBottom: isDark ? '1px solid #334155' : '1px solid #F1F5F9',
        paddingBottom: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: isDark ? 'rgba(37, 99, 235, 0.25)' : '#EFF6FF',
              color: isDark ? '#60A5FA' : '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Briefcase size={18} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: isDark ? '#F8FAFC' : '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Trung Tâm Tác Vụ Chủ Doanh Nghiệp
            </h3>
          </div>
        </div>

        {/* Cụm ngữ cảnh đang áp dụng - Giảm icon thừa */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          border: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
          fontSize: '0.75rem',
          fontWeight: '700',
          color: isDark ? '#CBD5E1' : '#334155'
        }}>
          <span style={{ color: isDark ? '#60A5FA' : '#2563EB' }}>
            {currentNam ? (currentNam.tenNamHoc || (currentNam.namBatDau && currentNam.namKetThuc ? `${currentNam.namBatDau} – ${currentNam.namKetThuc}` : `Năm ${currentNam.idNh}`)) : 'Chưa chọn năm'}
          </span>
          <span style={{ color: isDark ? '#475569' : '#CBD5E1' }}>•</span>
          <span style={{ color: isDark ? '#38BDF8' : '#0284C7' }}>
            {currentKy ? currentKy.tenKyHoc : 'Tất cả kỳ'}
          </span>
          <span style={{ color: isDark ? '#475569' : '#CBD5E1' }}>•</span>
          <span style={{ color: isDark ? '#34D399' : '#16A34A' }}>
            {currentTuan ? (currentTuan.soTuan ? `Tuần ${currentTuan.soTuan}` : currentTuan.moTa) : 'Tất cả tuần'}
          </span>
        </div>
      </div>

      {/* ── Thanh Tabs Phân Nhóm Chức Năng (Đã bỏ bớt emoji / icon theo yêu cầu) ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem'
      }}>
        {[
          { id: 'daoTao', label: 'Đào Tạo & Lịch Học', count: 6 },
          { id: 'diemDanh', label: 'Điểm Danh & Lớp', count: 2 },
          { id: 'hocSinh', label: 'Học Sinh & Phụ Huynh', count: 3 },
          { id: 'taiChinh', label: 'Tài Chính & Học Phí', count: 2 }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                border: isActive 
                  ? (isDark ? '1px solid #0284C7' : '1px solid #BFDBFE') 
                  : (isDark ? '1px solid #334155' : '1px solid transparent'),
                backgroundColor: isActive 
                  ? (isDark ? 'rgba(2, 132, 199, 0.25)' : '#EFF6FF') 
                  : (isDark ? '#0F172A' : '#F8FAFC'),
                color: isActive 
                  ? (isDark ? '#38BDF8' : '#2563EB') 
                  : (isDark ? '#94A3B8' : '#64748B'),
                fontSize: '0.825rem',
                fontWeight: isActive ? '700' : '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                minWidth: '18px',
                height: '18px',
                padding: '0 0.35rem',
                borderRadius: '9999px',
                backgroundColor: isActive 
                  ? (isDark ? 'rgba(56, 189, 248, 0.25)' : '#DBEAFE') 
                  : (isDark ? '#334155' : '#E2E8F0'),
                color: isActive 
                  ? (isDark ? '#38BDF8' : '#1D4ED8') 
                  : (isDark ? '#CBD5E1' : '#475569'),
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Danh Sách Các Nút Thao Tác API Tương Ứng ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem'
      }}>
        {/* TAB 1: ĐÀO TẠO & LỊCH HỌC */}
        {activeTab === 'daoTao' && (
          <>
            <NutThaoTacApi
              apiType="GET"
              variant="card"
              label="Xem TKB Tuần Này"
              subText="Lịch học theo phòng & ca"
              onClick={() => navigate('/thoi-khoa-bieu')}
            />

            <NutThaoTacApi
              apiType="GET"
              variant="card"
              label="Tra Cứu Lớp Học Kỳ Này"
              subText="Danh sách lớp học & sĩ số"
              onClick={() => navigate('/lop-hoc')}
            />

            <NutThaoTacApi
              apiType="POST"
              variant="card"
              label="Tạo Mới Lớp Học"
              subText="Mở lớp & phân công giáo viên"
              onClick={() => navigate('/lop-hoc')}
            />

            <NutThaoTacApi
              apiType="GET"
              variant="card"
              label="Xem Danh Mục Khóa Học"
              subText="Chương trình đào tạo"
              onClick={() => navigate('/bo-mon')}
            />

            <NutThaoTacApi
              apiType="GET"
              variant="card"
              label="Quản Lý Năm Học & Tuần"
              subText="Mốc thời gian & tuần học"
              onClick={() => navigate('/nam-hoc')}
            />
          </>
        )}

        {/* TAB 2: ĐIỂM DANH & LỚP */}
        {activeTab === 'diemDanh' && (
          <>
            <NutThaoTacApi
              apiType="GET"
              variant="card"
              label="Lớp Học & Điểm Danh"
              subText="Điểm danh theo từng lớp học"
              onClick={() => navigate('/lop-hoc')}
            />

            <NutThaoTacApi
              apiType="SYNC"
              variant="card"
              label="Đồng Bộ Dữ Liệu Buổi Học"
              subText="Cập nhật buổi học trong tuần"
              onClick={handleFetchTkbTuan}
            />
          </>
        )}

        {/* TAB 3: HỌC SINH & PHỤ HUYNH */}
        {activeTab === 'hocSinh' && (
          <>
            <NutThaoTacApi
              apiType="GET"
              variant="card"
              label="Danh Sách Học Sinh"
              subText="Hồ sơ học sinh đang học"
              onClick={() => navigate('/hoc-sinh')}
            />

            <NutThaoTacApi
              apiType="POST"
              variant="card"
              label="Đăng Ký Khóa Học Mới"
              subText="Tiếp nhận & xếp lớp mới"
              onClick={() => navigate('/dang-ky-hoc')}
            />

            <NutThaoTacApi
              apiType="GET"
              variant="card"
              label="Quản Lý Phụ Huynh"
              subText="Thông tin liên lạc phụ huynh"
              onClick={() => navigate('/phu-huynh')}
            />
          </>
        )}

        {/* TAB 4: TÀI CHÍNH & SỔ QUỸ */}
        {activeTab === 'taiChinh' && (
          <>
            <NutThaoTacApi
              apiType="GET"
              variant="card"
              label="Quản Lý Thu Học Phí"
              subText="Phiếu thu học phí trung tâm"
              onClick={() => navigate('/phieu-thu')}
            />

            <NutThaoTacApi
              apiType="EXPORT"
              variant="card"
              label="Xuất Báo Cáo Tài Chính"
              subText="Kết xuất file báo cáo"
              onClick={() => {
                alert('Đã sẵn sàng xuất báo cáo tài chính cho kỳ học đang chọn!');
              }}
            />
          </>
        )}
      </div>

      {/* ── Khung Drawer / Modal Xem Nhanh Kết Quả Dữ Liệu API (Preview Modal) ── */}
      {previewData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div 
            className="droplet-card"
            style={{
              width: '100%',
              maxWidth: '850px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
              border: isDark ? '1px solid #334155' : 'none',
              borderRadius: '24px',
              boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' : '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              overflow: 'hidden',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: isDark ? 'rgba(37, 99, 235, 0.25)' : '#EFF6FF',
                  color: isDark ? '#60A5FA' : '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: isDark ? '#F8FAFC' : '#0F172A' }}>
                    {previewData.title}
                  </h4>
                  <span style={{ fontSize: '0.785rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                    Tổng cộng: <b>{previewData.count || previewData.data.length}</b> bản ghi tìm thấy
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPreviewData(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: isDark ? '1px solid #475569' : '1px solid #E2E8F0',
                  backgroundColor: isDark ? '#334155' : '#FFFFFF',
                  color: isDark ? '#CBD5E1' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content / Table */}
            <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
              {previewData.data.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                  Không tìm thấy dữ liệu nào phù hợp với bộ lọc hiện tại.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: isDark ? '2px solid #334155' : '2px solid #E2E8F0', textAlign: 'left', color: isDark ? '#94A3B8' : '#64748B' }}>
                        <th style={{ padding: '0.65rem 0.75rem', width: '50px' }}>#</th>
                        {previewData.columns?.map((col) => (
                          <th key={col.key} style={{ padding: '0.65rem 0.75rem', fontWeight: '700', color: isDark ? '#CBD5E1' : '#64748B' }}>
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.data.slice(0, 8).map((row, idx) => (
                        <tr 
                          key={idx} 
                          style={{ 
                            borderBottom: isDark ? '1px solid #334155' : '1px solid #F1F5F9',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? '#1E293B' : '#F8FAFC'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '0.65rem 0.75rem', color: '#94A3B8', fontWeight: '600' }}>
                            {idx + 1}
                          </td>
                          {previewData.columns?.map((col) => {
                            const val = row[col.key];
                            return (
                              <td key={col.key} style={{ padding: '0.65rem 0.75rem', color: isDark ? '#F8FAFC' : '#1E293B', fontWeight: '500' }}>
                                {col.render ? col.render(val, row) : (val !== null && val !== undefined ? String(val) : '-')}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.data.length > 8 && (
                    <p style={{ textAlign: 'center', fontSize: '0.785rem', color: '#94A3B8', marginTop: '1rem' }}>
                      (Đang hiển thị 8 / {previewData.data.length} bản ghi đầu tiên)
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: isDark ? '1px solid #334155' : '1px solid #E2E8F0',
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC'
            }}>
              <span style={{ fontSize: '0.8rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                Bộ lọc: Năm {selectedNamHocId || 'ALL'} • Kỳ {selectedKyHocId || 'ALL'} • Tuần {selectedTuanHocId || 'ALL'}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setPreviewData(null)}
                  className="droplet-pill"
                  style={{
                    padding: '0.45rem 1rem',
                    fontSize: '0.825rem',
                    fontWeight: '600',
                    color: isDark ? '#CBD5E1' : '#64748B',
                    border: isDark ? '1px solid #475569' : '1px solid #E2E8F0',
                    backgroundColor: isDark ? '#0F172A' : '#FFFFFF'
                  }}
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigate(previewData.viewAllLink);
                  }}
                  className="droplet-pill"
                  style={{
                    padding: '0.45rem 1.15rem',
                    fontSize: '0.825rem',
                    fontWeight: '700',
                    color: '#FFFFFF',
                    backgroundColor: '#2563EB',
                    border: '1px solid #1D4ED8',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  <span>Mở Trang Chi Tiết</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


