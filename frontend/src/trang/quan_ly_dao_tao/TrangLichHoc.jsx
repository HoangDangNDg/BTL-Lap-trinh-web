import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, 
  Calendar, 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  RefreshCw,
  Search,
  Filter,
  GraduationCap,
  Users,
  AlertCircle
} from 'lucide-react';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import DanhSachBuoiHocView from '../../thanh_phan/quan_ly_lop_hoc/DanhSachBuoiHocView';
import TaoBuoiHocView from '../../thanh_phan/quan_ly_lop_hoc/TaoBuoiHocView';
import DiemDanhBuoiHocView from '../../thanh_phan/quan_ly_lop_hoc/DiemDanhBuoiHocView';
import TongHopDiemDanhKhoaHocView from '../../thanh_phan/quan_ly_lop_hoc/TongHopDiemDanhKhoaHocView';
import DanhSachHocSinhKhoaHocView from '../../thanh_phan/quan_ly_lop_hoc/DanhSachHocSinhKhoaHocView';

export default function TrangLichHoc() {
  const { user } = useTrangThaiXacThuc();
  const idDn = user?.idDoanhNghiep || 1;

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [searchClassKw, setSearchClassKw] = useState('');

  // Queue state cho ngăn xếp điều hướng (Stack Navigation)
  // Mỗi phần tử: { step: 'DANH_SACH' | 'TAO_BUOI_HOC' | 'DIEM_DANH' | 'TONG_HOP' | 'HOC_SINH', buoiHoc?: any }
  const [navQueue, setNavQueue] = useState([{ step: 'DANH_SACH' }]);
  const currentStep = navQueue[navQueue.length - 1] || { step: 'DANH_SACH' };

  // Tải danh sách lớp học của doanh nghiệp
  const fetchClasses = useCallback(async () => {
    try {
      setLoadingClasses(true);
      const res = await dichVuDaoTaoChung.getDanhSachLopHoc({ idDn });
      const list = Array.isArray(res) ? res : (res?.data || []);
      setClasses(list);
      if (list.length > 0 && !selectedClass) {
        setSelectedClass(list[0]);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách lớp học:', err);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  }, [idDn]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const filteredClasses = classes.filter(c => {
    if (!searchClassKw.trim()) return true;
    const kw = searchClassKw.toLowerCase();
    return (
      (c.tenLop && c.tenLop.toLowerCase().includes(kw)) ||
      (c.maLop && c.maLop.toLowerCase().includes(kw)) ||
      (c.khoaHoc?.tenKhoaHoc && c.khoaHoc.tenKhoaHoc.toLowerCase().includes(kw))
    );
  });

  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
    // Reset về danh sách khi chuyển lớp
    setNavQueue([{ step: 'DANH_SACH' }]);
  };

  // Các hàm chuyển đổi bước
  const pushStep = (stepObj) => {
    setNavQueue(prev => [...prev, stepObj]);
  };

  const popStep = () => {
    if (navQueue.length > 1) {
      setNavQueue(prev => prev.slice(0, prev.length - 1));
    }
  };

  const khoaHocHienTai = selectedClass?.khoaHoc || (selectedClass?.idKhoaHoc ? { idKhoaHoc: selectedClass.idKhoaHoc, tenKhoaHoc: selectedClass.tenLop } : null);

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
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
              Lịch Học & Buổi Học Trung Tâm
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              Quản lý tiến độ giảng dạy, buổi học, điểm danh chuyên cần và sĩ số học viên
            </p>
          </div>
        </div>

        <button
          onClick={fetchClasses}
          disabled={loadingClasses}
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
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <RefreshCw size={15} className={loadingClasses ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {/* ── BỘ CHỌN LỚP HỌC (DROPDOWN / HORIZONTAL SCROLL) ── */}
      <div
        className="droplet-card"
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '20px',
          backgroundColor: '#FFFFFF',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 15px -2px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={18} style={{ color: '#2563EB' }} />
            <span style={{ fontSize: '0.92rem', fontWeight: '700', color: '#1E293B' }}>
              Chọn Lớp Học Cần Quản Lý:
            </span>
            <span style={{ 
              fontSize: '0.78rem', 
              padding: '0.2rem 0.6rem', 
              borderRadius: '9999px', 
              backgroundColor: '#EFF6FF', 
              color: '#2563EB', 
              fontWeight: '700' 
            }}>
              {classes.length} Lớp
            </span>
          </div>

          {/* Ô tìm nhanh lớp */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input 
              type="text"
              placeholder="Tìm theo tên lớp..."
              value={searchClassKw}
              onChange={e => setSearchClassKw(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                fontSize: '0.82rem',
                outline: 'none',
                backgroundColor: '#F8FAFC'
              }}
            />
          </div>
        </div>

        {/* Danh sách thẻ Lớp học cuộn ngang */}
        {loadingClasses ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
            Đang tải danh sách lớp học...
          </div>
        ) : filteredClasses.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>
            Chưa có lớp học nào phù hợp.
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            gap: '0.85rem', 
            overflowX: 'auto', 
            paddingBottom: '0.5rem',
            scrollbarWidth: 'thin'
          }}>
            {filteredClasses.map((cls) => {
              const isSelected = selectedClass?.idLop === cls.idLop;
              return (
                <div
                  key={cls.idLop || cls.maLop}
                  onClick={() => handleSelectClass(cls)}
                  style={{
                    flex: '0 0 auto',
                    minWidth: '200px',
                    maxWidth: '260px',
                    padding: '0.85rem 1.1rem',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                    backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                    boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.12)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <div style={{ 
                      fontSize: '0.92rem', 
                      fontWeight: '800', 
                      color: isSelected ? '#1E40AF' : '#0F172A',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {cls.tenLop}
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={16} style={{ color: '#2563EB', flexShrink: 0 }} />
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: isSelected ? '#3B82F6' : '#64748B', marginBottom: '0.4rem' }}>
                    {cls.khoaHoc?.tenKhoaHoc || cls.monHoc?.tenMon || 'Chưa gán khóa'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.72rem', color: '#64748B' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Users size={12} /> {cls.soHocSinh || 0}/{cls.siSoToiDa || 30}
                    </span>
                    <span>•</span>
                    <span style={{ 
                      color: cls.trangThai === 'DANG_HOC' ? '#16A34A' : '#64748B',
                      fontWeight: '600'
                    }}>
                      {cls.trangThai === 'DANG_HOC' ? 'Đang học' : 'Kế hoạch'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── NỘI DUNG CHÍNH (THEO BƯỚC NAVIGATION TRONG HỆ THỐNG) ── */}
      {selectedClass ? (
        <div style={{ width: '100%' }}>
          {/* Bước 1: Danh Sách Buổi Học */}
          {currentStep.step === 'DANH_SACH' && (
            <DanhSachBuoiHocView
              khoaHoc={khoaHocHienTai}
              lopHoc={selectedClass}
              chiNhanh={selectedClass.chiNhanh}
              onTaoBuoiHoc={() => pushStep({ step: 'TAO_BUOI_HOC' })}
              onDiemDanh={(...args) => {
                const buoi = args.length >= 3 ? args[2] : args[0];
                pushStep({ step: 'DIEM_DANH', buoiHoc: buoi });
              }}
              onViewTongHopDiemDanh={() => pushStep({ step: 'TONG_HOP' })}
              onViewStudents={() => pushStep({ step: 'HOC_SINH' })}
            />
          )}

          {/* Bước 2: Tạo Buổi Học Mới */}
          {currentStep.step === 'TAO_BUOI_HOC' && (
            <TaoBuoiHocView
              lopHoc={selectedClass}
              khoaHoc={khoaHocHienTai}
              chiNhanh={selectedClass.chiNhanh}
              onBack={popStep}
              onSuccess={(newSession) => {
                setNavQueue([
                  { step: 'DANH_SACH' },
                  { step: 'DIEM_DANH', buoiHoc: newSession }
                ]);
              }}
            />
          )}

          {/* Bước 3: Điểm Danh Buổi Học Cụ Thể */}
          {currentStep.step === 'DIEM_DANH' && (
            <DiemDanhBuoiHocView
              buoiHoc={currentStep.buoiHoc}
              khoaHoc={khoaHocHienTai}
              lopHoc={selectedClass}
              chiNhanh={selectedClass.chiNhanh}
              onBack={popStep}
              onAttendanceSaved={() => {
                // Đã lưu xong
              }}
            />
          )}

          {/* Bước 4: Bảng Tổng Hợp Chuyên Cần Khóa Học */}
          {currentStep.step === 'TONG_HOP' && (
            <TongHopDiemDanhKhoaHocView
              khoaHoc={khoaHocHienTai}
              lopHoc={selectedClass}
              chiNhanh={selectedClass.chiNhanh}
              onBack={popStep}
              onDiemDanhBuoiHoc={(buoi) => pushStep({ step: 'DIEM_DANH', buoiHoc: buoi })}
            />
          )}

          {/* Bước 5: Danh Sách Học Sinh Trong Khóa */}
          {currentStep.step === 'HOC_SINH' && (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <button
                  onClick={popStep}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ← Quay lại danh sách buổi học
                </button>
              </div>
              <DanhSachHocSinhKhoaHocView
                khoaHoc={khoaHocHienTai}
                lopHoc={selectedClass}
                chiNhanh={selectedClass.chiNhanh}
              />
            </div>
          )}
        </div>
      ) : (
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
            Vui lòng chọn một lớp học để xem lịch học & buổi học
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '400px', margin: '0 auto' }}>
            Hệ thống sẽ tải toàn bộ danh sách các buổi học theo thời khóa biểu cùng công cụ điểm danh chuyên cần.
          </p>
        </div>
      )}
    </div>
  );
}
