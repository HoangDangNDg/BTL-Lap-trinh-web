import React, { useState } from 'react';
import { 
  Eye, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  RotateCw, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Layers,
  Clock
} from 'lucide-react';
import { useNamHocKyHocStore } from '../../trang_thai/useNamHocKyHocStore';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import { useComponentTheme } from '../../trang_thai/useComponentTheme';

export type ApiType = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'EXPORT' | 'SYNC';

export interface AcademicContextParams {
  idNamHoc?: number | null;
  idKyHoc?: number | null;
  idTuanHoc?: number | null;
  idDoanhNghiep?: number;
}

export interface NutThaoTacApiProps {
  apiType: ApiType;
  label: string;
  subText?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'pill' | 'droplet' | 'card' | 'compact';
  confirmMessage?: string;
  injectAcademicParams?: boolean;
  showAcademicFooter?: boolean;
  disabled?: boolean;
  onClick?: (params: AcademicContextParams) => Promise<any> | void;
  onSuccess?: (result?: any) => void;
  onError?: (err?: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Cấu hình giao diện & icon theo từng dạng API (HTTP Method)
 */
const API_CONFIG: Record<ApiType, {
  defaultIcon: React.ReactNode;
  badgeText: string;
  bgGradient: string;
  textColor: string;
  borderColor: string;
  pillBg: string;
  glowColor: string;
}> = {
  GET: {
    defaultIcon: <Eye size={15} />,
    badgeText: 'GET',
    bgGradient: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
    textColor: '#0284C7',
    borderColor: '#BAE6FD',
    pillBg: '#F0F9FF',
    glowColor: 'rgba(2, 132, 199, 0.25)'
  },
  POST: {
    defaultIcon: <Plus size={15} />,
    badgeText: 'POST',
    bgGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    textColor: '#059669',
    borderColor: '#A7F3D0',
    pillBg: '#ECFDF5',
    glowColor: 'rgba(16, 185, 129, 0.25)'
  },
  PUT: {
    defaultIcon: <Edit3 size={15} />,
    badgeText: 'PUT',
    bgGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    textColor: '#D97706',
    borderColor: '#FDE68A',
    pillBg: '#FFFBEB',
    glowColor: 'rgba(245, 158, 11, 0.25)'
  },
  DELETE: {
    defaultIcon: <Trash2 size={15} />,
    badgeText: 'DEL',
    bgGradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    textColor: '#DC2626',
    borderColor: '#FECACA',
    pillBg: '#FEF2F2',
    glowColor: 'rgba(239, 68, 68, 0.25)'
  },
  EXPORT: {
    defaultIcon: <Download size={15} />,
    badgeText: 'XUẤT',
    bgGradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    textColor: '#7C3AED',
    borderColor: '#DDD6FE',
    pillBg: '#F5F3FF',
    glowColor: 'rgba(139, 92, 246, 0.25)'
  },
  SYNC: {
    defaultIcon: <RotateCw size={15} />,
    badgeText: 'ĐỒNG BỘ',
    bgGradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
    textColor: '#0891B2',
    borderColor: '#A5F3FC',
    pillBg: '#ECFEFF',
    glowColor: 'rgba(6, 182, 212, 0.25)'
  }
};

/**
 * Component Nút Thao Tác API Tái Sử Dụng Thông Minh
 * - Phân loại theo HTTP Method (GET, POST, PUT, DELETE, EXPORT, SYNC)
 * - Tự động quản lý vòng đời async / loading spinner
 * - Tự động đính kèm ngữ cảnh đào tạo toàn cục (idNamHoc, idKyHoc, idTuanHoc, idDoanhNghiep)
 * - Thiết kế Liquid Glass / Water Droplet UI cao cấp
 */
export const NutThaoTacApi: React.FC<NutThaoTacApiProps> = ({
  apiType = 'GET',
  label,
  subText,
  icon,
  badge,
  size = 'md',
  variant = 'pill',
  confirmMessage,
  injectAcademicParams = true,
  showAcademicFooter = false,
  disabled = false,
  onClick,
  onSuccess,
  onError,
  className = '',
  style = {}
}) => {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    selectedNamHocId,
    selectedKyHocId,
    selectedTuanHocId
  } = useNamHocKyHocStore();

  const { user } = useTrangThaiXacThuc();
  const { mode, applyToCards, applyToPills } = useComponentTheme();
  const isDarkCard = mode === 'DARK' && applyToCards;
  const isDarkPill = mode === 'DARK' && applyToPills;

  const config = API_CONFIG[apiType] || API_CONFIG.GET;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled || loading) return;

    if (confirmMessage) {
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) return;
    }

    try {
      setLoading(true);

      const params: AcademicContextParams = injectAcademicParams ? {
        idNamHoc: selectedNamHocId,
        idKyHoc: selectedKyHocId,
        idTuanHoc: selectedTuanHocId,
        idDoanhNghiep: user?.idDoanhNghiep || 1
      } : {};

      const result = onClick ? await onClick(params) : undefined;

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err: any) {
      console.error(`Lỗi khi thực thi tác vụ API [${apiType}]:`, err);
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Kích thước nút
  const sizeStyles = {
    sm: { padding: '0.35rem 0.75rem', fontSize: '0.785rem', iconSize: 13 },
    md: { padding: '0.5rem 1.15rem', fontSize: '0.85rem', iconSize: 15 },
    lg: { padding: '0.75rem 1.5rem', fontSize: '0.95rem', iconSize: 18 }
  }[size];

  // 1. DẠNG THẺ CARD (Action Feature Card)
  if (variant === 'card') {
    return (
      <div
        onClick={handleClick}
        className={`droplet-card ${className}`}
        style={{
          padding: '1.25rem',
          borderRadius: '18px',
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.85rem',
          transition: 'all 0.25s cubic-bezier(0.25, 1, 0.5, 1)',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: isDarkCard ? '#1E293B' : '#FFFFFF',
          border: isDarkCard ? '1px solid #334155' : `1px solid ${config.borderColor}`,
          boxShadow: isDarkCard ? '0 4px 16px -2px rgba(0, 0, 0, 0.3)' : '0 4px 16px -2px rgba(15, 23, 42, 0.04)',
          ...style
        }}
        onMouseEnter={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = isDarkCard ? '0 12px 24px -4px rgba(0, 0, 0, 0.5)' : `0 12px 24px -4px ${config.glowColor}`;
            if (isDarkCard) e.currentTarget.style.borderColor = '#475569';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !loading) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = isDarkCard ? '0 4px 16px -2px rgba(0, 0, 0, 0.3)' : '0 4px 16px -2px rgba(15, 23, 42, 0.04)';
            if (isDarkCard) e.currentTarget.style.borderColor = '#334155';
          }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            backgroundColor: isDarkCard ? 'rgba(51, 65, 85, 0.6)' : config.pillBg,
            color: isDarkCard ? '#38BDF8' : config.textColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isDarkCard ? '1px solid #475569' : `1px solid ${config.borderColor}`
          }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : (icon || config.defaultIcon)}
          </div>

          <span style={{
            padding: '0.15rem 0.5rem',
            borderRadius: '9999px',
            fontSize: '0.685rem',
            fontWeight: '800',
            backgroundColor: isDarkCard ? 'rgba(51, 65, 85, 0.6)' : config.pillBg,
            color: isDarkCard ? '#F1F5F9' : config.textColor,
            border: isDarkCard ? '1px solid #475569' : `1px solid ${config.borderColor}`,
            letterSpacing: '0.04em'
          }}>
            {config.badgeText}
          </span>
        </div>

        <div>
          <div style={{
            fontSize: '0.925rem',
            fontWeight: '700',
            color: isDarkCard ? '#F8FAFC' : '#0F172A',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}>
            <span>{label}</span>
            {badge !== undefined && (
              <span style={{
                fontSize: '0.725rem',
                fontWeight: '700',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                backgroundColor: isDarkCard ? '#334155' : '#F1F5F9',
                color: isDarkCard ? '#CBD5E1' : '#475569'
              }}>
                {badge}
              </span>
            )}
          </div>
          {subText && (
            <p style={{
              fontSize: '0.785rem',
              color: isDarkCard ? '#94A3B8' : '#64748B',
              margin: '0.35rem 0 0',
              lineHeight: 1.35
            }}>
              {subText}
            </p>
          )}
        </div>

        {showAcademicFooter && injectAcademicParams && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            fontSize: '0.725rem',
            color: isDarkCard ? '#64748B' : '#94A3B8',
            borderTop: isDarkCard ? '1px solid #334155' : '1px solid #F1F5F9',
            paddingTop: '0.65rem'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Layers size={11} /> Kỳ {selectedKyHocId || 'ALL'}
            </span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Clock size={11} /> Tuần {selectedTuanHocId || 'ALL'}
            </span>
          </div>
        )}
      </div>
    );
  }

  // 2. DẠNG NÚT VIÊN NHỘNG (Pill / Droplet Button)
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={`droplet-pill ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.55rem',
        padding: sizeStyles.padding,
        fontSize: sizeStyles.fontSize,
        fontWeight: '700',
        borderRadius: '9999px',
        backgroundColor: variant === 'droplet' 
          ? (isDarkPill ? '#1E293B' : config.pillBg) 
          : (isDarkPill ? '#1E293B' : '#FFFFFF'),
        color: isDarkPill ? '#F8FAFC' : '#0F172A',
        border: isDarkPill ? '1px solid #334155' : `1px solid ${config.borderColor}`,
        boxShadow: isDarkPill 
          ? '0 2px 8px -1px rgba(0, 0, 0, 0.4)' 
          : `0 2px 8px -1px ${config.glowColor}, inset 0 1px 1px rgba(255, 255, 255, 0.9)`,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none',
        whiteSpace: 'nowrap',
        position: 'relative',
        ...style
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = isDarkPill ? '#334155' : config.pillBg;
          e.currentTarget.style.borderColor = isDarkPill ? '#64748B' : config.textColor;
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = variant === 'droplet' 
            ? (isDarkPill ? '#1E293B' : config.pillBg) 
            : (isDarkPill ? '#1E293B' : '#FFFFFF');
          e.currentTarget.style.borderColor = isDarkPill ? '#334155' : config.borderColor;
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: isDarkPill ? 'rgba(51, 65, 85, 0.6)' : config.pillBg,
        color: isDarkPill ? '#38BDF8' : config.textColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {loading ? (
          <Loader2 size={13} className="animate-spin" />
        ) : showSuccess ? (
          <CheckCircle2 size={13} style={{ color: '#16A34A' }} />
        ) : (
          icon || config.defaultIcon
        )}
      </div>

      <span>{label}</span>

      {/* Badge Method HTTP */}
      <span style={{
        padding: '0.1rem 0.4rem',
        borderRadius: '9999px',
        fontSize: '0.65rem',
        fontWeight: '800',
        backgroundColor: isDarkPill ? 'rgba(51, 65, 85, 0.6)' : config.pillBg,
        color: isDarkPill ? '#F1F5F9' : config.textColor,
        border: isDarkPill ? '1px solid #475569' : `1px solid ${config.borderColor}`
      }}>
        {config.badgeText}
      </span>

      {badge !== undefined && (
        <span style={{
          padding: '0.1rem 0.45rem',
          borderRadius: '9999px',
          fontSize: '0.7rem',
          fontWeight: '700',
          backgroundColor: isDarkPill ? '#334155' : '#F1F5F9',
          color: isDarkPill ? '#CBD5E1' : '#475569'
        }}>
          {badge}
        </span>
      )}
    </button>
  );
};


