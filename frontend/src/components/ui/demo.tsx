import React, { useState } from 'react';
import { 
  Button, 
  LiquidButton, 
  MetalButton,
  LiquidGlassTabs
} from '@/components/ui/liquid-glass-button';
import { 
  Droplet, 
  Sparkles, 
  Calendar, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Grid,
  List as ListIcon,
  Layers,
  Award,
  BookOpen
} from 'lucide-react';

export default function DemoOne() {
  // Demo states for sliding liquid glass tabs
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('toan');
  const [selectedStatus, setSelectedStatus] = useState('active');
  const [selectedPeriod, setSelectedPeriod] = useState('tuan');

  const categoryOptions = [
    { value: 'all', label: 'Tất Cả' },
    { value: 'active', label: 'Đang Mở' },
    { value: 'pending', label: 'Sắp Khai Giảng' },
    { value: 'completed', label: 'Đã Kết Thúc' },
  ];

  const subjectOptions = [
    { value: 'toan', label: 'Toán Học' },
    { value: 'van', label: 'Ngữ Văn' },
    { value: 'anh', label: 'Tiếng Anh' },
    { value: 'ly', label: 'Vật Lý' },
    { value: 'hoa', label: 'Hóa Học' },
    { value: 'tin', label: 'Tin Học' },
  ];

  const statusOptions = [
    { value: 'active', label: 'Học Sinh Đang Học' },
    { value: 'reserved', label: 'Bảo Lưu' },
    { value: 'graduated', label: 'Tốt Nghiệp' },
  ];

  const periodOptions = [
    { value: 'ngay', label: 'Ngày' },
    { value: 'tuan', label: 'Tuần' },
    { value: 'thang', label: 'Tháng' },
    { value: 'ky', label: 'Học Kỳ' },
    { value: 'nam', label: 'Năm' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '1.5rem 2rem',
        border: '1px solid #DBDBDB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: '#EBF5FE',
            color: '#0095F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Droplet size={22} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#262626', letterSpacing: '-0.02em' }}>
              Tấm Kính Lỏng Khúc Xạ Trượt (Liquid Glass Sliding Tabs)
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#737373' }}>
              Khi click vào bất kỳ lựa chọn chữ nào, một tấm kính liquid glass với hiệu ứng khúc xạ ánh sáng <code>&lt;feTurbulence&gt;</code> sẽ lướt mượt mà đến vị trí được chọn!
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Showcase 1: Single-Word Subject Selector */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '1.75rem 2rem',
        border: '1px solid #DBDBDB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#262626' }}>
            1. Bộ Chọn Môn Học (Click vào từng chữ để xem tấm kính trượt)
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#737373' }}>
            Tấm kính cong lướt mượt mà và làm biến dạng nhẹ nền phía sau ngay dưới chữ bạn click
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', backgroundColor: '#FAFAFA', borderRadius: '12px', border: '1px solid #EFEFEF' }}>
          <LiquidGlassTabs
            options={subjectOptions}
            value={selectedSubject}
            onChange={(val) => setSelectedSubject(val)}
            size="default"
          />
        </div>
      </div>

      {/* Interactive Showcase 2: Status Filter & Time Period */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '1.75rem 2rem',
        border: '1px solid #DBDBDB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#262626' }}>
            2. Bộ Chọn Trạng Thái & Khung Thời Gian
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#737373' }}>
            Áp dụng cho thanh công cụ lọc dữ liệu của toàn hệ thống
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#737373', textTransform: 'uppercase' }}>
              Trạng thái học sinh
            </span>
            <LiquidGlassTabs
              options={statusOptions}
              value={selectedStatus}
              onChange={(val) => setSelectedStatus(val)}
              size="default"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#737373', textTransform: 'uppercase' }}>
              Khung xem thời gian
            </span>
            <LiquidGlassTabs
              options={periodOptions}
              value={selectedPeriod}
              onChange={(val) => setSelectedPeriod(val)}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Interactive Showcase 3: Colored Background Droplet Distortion */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '1.75rem 2rem',
        border: '1px solid #DBDBDB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#262626' }}>
            3. Hiệu Ứng Khúc Xạ Trên Nền Màu Sắc
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#737373' }}>
            Tấm kính trượt phản chiếu và bẻ cong dải màu Gradient phía sau theo thời gian thực
          </p>
        </div>

        <div style={{
          padding: '2.5rem',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #0095F6 0%, #818CF8 50%, #E1306C 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem'
        }}>
          <LiquidGlassTabs
            options={categoryOptions}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            size="lg"
            className="bg-black/20 border-white/30 text-white"
          />
        </div>
      </div>
    </div>
  );
}


