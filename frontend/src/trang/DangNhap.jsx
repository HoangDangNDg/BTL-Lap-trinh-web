import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dichVuXacThuc } from '../dich_vu/dichVuXacThuc';
import { useTrangThaiXacThuc } from '../trang_thai/useTrangThaiXacThuc';
import { 
  LogIn, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  RefreshCw,
  Info
} from 'lucide-react';
import { LogoEduCenter } from '../thanh_phan/LogoEduCenter';
import styles from './DangNhap.module.css';

const DangNhap = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useTrangThaiXacThuc();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    setLoading(true);
    setError('');
    setInfo('');

    try {
      const data = await dichVuXacThuc.login({ tenDangNhap: username, matKhau: password });
      
      if (data) {
        login(data);
        navigate('/'); // Redirect to dashboard
      } else {
        setError('Đăng nhập thất bại. Không nhận được thông tin từ máy chủ.');
      }
    } catch (err) {
      const backendMessage = err?.response?.data?.message;
      setError(backendMessage || err?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* ── CÁC QUẢ CẦU PHÁT SÁNG NỘI TẠI (Ambient Floating Glow Orbs) ── */}
      <div className={styles.glowOrbTopLeft} />
      <div className={styles.glowOrbBottomRight} />
      <div className={styles.glowOrbCenterRight} />

      {/* ── TẤM THẺ KÍNH GIỌT NƯỚC TRUNG TÂM (Central Liquid Glass Card) ── */}
      <div className={`droplet-card ${styles.card}`}>
        {/* Header: Logo EduCenter & Tiêu Đề */}
        <div className={styles.cardHeader}>
          <div className={styles.logoWrapper}>
            <LogoEduCenter
              variant="compact"
              size="lg"
              interactive={true}
              title="EduCenter - Hệ thống Quản trị Đào tạo"
            />
          </div>

          <h1 className={styles.title}>
            Chào mừng trở lại!
          </h1>
          <p className={styles.subtitle}>
            Đăng nhập vào hệ thống quản lý trung tâm giáo dục
          </p>
        </div>

        {/* Thông Báo Lỗi */}
        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={16} className={styles.errorIcon} />
            <span>{error}</span>
          </div>
        )}

        {/* Thông Báo Thông Tin / Quên Mật Khẩu */}
        {info && (
          <div className={styles.infoBox}>
            <Info size={16} className={styles.infoIcon} />
            <span>{info}</span>
          </div>
        )}

        {/* Form Đăng Nhập */}
        <form onSubmit={handleLogin} className={styles.form}>
          {/* Ô Nhập: Tên Đăng Nhập */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              <User size={14} className={styles.labelIcon} />
              <span>Tên đăng nhập</span>
            </label>

            <div className="droplet-input-wrapper">
              <User size={16} className={styles.inputFieldIcon} />
              <input
                type="text"
                className="droplet-input"
                placeholder="Nhập username hoặc SĐT..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Ô Nhập: Mật Khẩu */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>
              <Lock size={14} className={styles.labelIcon} />
              <span>Mật khẩu</span>
            </label>

            <div className="droplet-input-wrapper">
              <Lock size={16} className={styles.inputFieldIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`droplet-input ${styles.passwordInput}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.togglePasswordBtn}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Hàng Tiện Ích: Ghi Nhớ & Quên Mật Khẩu */}
          <div className={styles.optionsRow}>
            <label className={styles.rememberLabel}>
              <input 
                type="checkbox" 
                defaultChecked 
                className={styles.checkbox}
              />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <a 
              href="#forgot" 
              onClick={(e) => {
                e.preventDefault();
                setInfo('Vui lòng liên hệ quản trị viên hoặc bộ phận IT để được hỗ trợ cấp lại mật khẩu!');
              }}
              className={styles.forgotLink}
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* NÚT BẤM ĐĂNG NHẬP GIỌT NƯỚC XANH DƯƠNG (Water Droplet Primary Button) */}
          <button
            type="submit"
            disabled={loading}
            className={`droplet-pill-primary ${styles.btnSubmit} ${loading ? styles.btnSubmitLoading : ''}`}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>Đang xác thực...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Đăng Nhập Vào Hệ Thống</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DangNhap;



