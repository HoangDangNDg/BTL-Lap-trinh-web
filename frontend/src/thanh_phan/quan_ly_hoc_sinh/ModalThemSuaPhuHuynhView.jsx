import React from 'react';
import ModalWrapper from '../ModalWrapper';
import { HeartHandshake, RefreshCw, Phone, CreditCard, Mail, Briefcase, MapPin, User } from 'lucide-react';
import styles from './ModalThemSuaPhuHuynh.module.css';

/**
 * Giao diện Modal Thêm mới & Chỉnh sửa Hồ sơ Phụ Huynh (Pure Presentation JSX)
 */
const ModalThemSuaPhuHuynhView = ({
  show = false,
  onClose,
  editingParent = null,
  formData,
  setFormData,
  submitting = false,
  errorMsg = '',
  onSubmit
}) => {
  if (!show) return null;

  return (
    <ModalWrapper
      isOpen={show}
      onClose={onClose}
      maxWidth="max-w-[540px]"
      title={
        <div className={styles.titleGroup}>
          <div className={styles.titleIcon}>
            <HeartHandshake size={22} />
          </div>
          <div>
            <h3 className={styles.titleMain}>
              {editingParent ? 'Chỉnh Sửa Hồ Sơ Phụ Huynh' : 'Thêm Mới Hồ Sơ Phụ Huynh'}
            </h3>
            <p className={styles.titleSub}>
              {editingParent ? `Cập nhật thông tin mã #${editingParent.idPh || editingParent.id}` : 'Nhập thông tin đại diện gia đình'}
            </p>
          </div>
        </div>
      }
    >
      {/* Form Body */}
      <form onSubmit={onSubmit} className={styles.form}>
        {errorMsg && (
          <div className={styles.errorAlert}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Họ và tên */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <User size={15} style={{ color: '#059669' }} />
            <span>Họ và Tên Phụ Huynh <span className={styles.requiredStar}>*</span></span>
          </label>
          <input
            type="text"
            placeholder="VD: Nguyễn Văn Nam"
            value={formData.hoTen}
            onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
            required
            className={styles.input}
          />
        </div>

        {/* SĐT và CCCD */}
        <div className={styles.gridTwoCol}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Phone size={15} style={{ color: '#0284C7' }} />
              <span>Số Điện Thoại <span className={styles.requiredStar}>*</span></span>
            </label>
            <input
              type="text"
              placeholder="VD: 0987654321"
              value={formData.soDienThoai}
              onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <CreditCard size={15} style={{ color: '#7C3AED' }} />
              <span>Số CCCD / Định Danh</span>
            </label>
            <input
              type="text"
              placeholder="VD: 001201012345"
              value={formData.cccd}
              onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
              className={styles.input}
            />
          </div>
        </div>

        {/* Email và Nghề nghiệp */}
        <div className={styles.gridTwoCol}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Mail size={15} style={{ color: '#D97706' }} />
              <span>Email Liên Hệ</span>
            </label>
            <input
              type="email"
              placeholder="VD: phuhuynh@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Briefcase size={15} style={{ color: '#059669' }} />
              <span>Nghề Nghiệp / Công Tác</span>
            </label>
            <input
              type="text"
              placeholder="VD: Kỹ sư / Kinh doanh"
              value={formData.ngheNghiep}
              onChange={(e) => setFormData({ ...formData, ngheNghiep: e.target.value })}
              className={styles.input}
            />
          </div>
        </div>

        {/* Địa chỉ */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            <MapPin size={15} style={{ color: '#EF4444' }} />
            <span>Địa Chỉ Thường Trú / Liên Lạc</span>
          </label>
          <input
            type="text"
            placeholder="VD: Số 123 Đường Cầu Giấy, Hà Nội"
            value={formData.diaChi}
            onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
            className={styles.input}
          />
        </div>

        {/* Footer buttons */}
        <div className={styles.footer}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className={styles.btnCancel}
          >
            Hủy Bỏ
          </button>

          <button
            type="submit"
            disabled={submitting}
            className={styles.btnSubmit}
          >
            {submitting ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Đang Lưu...</span>
              </>
            ) : (
              <span>{editingParent ? 'Lưu Thay Đổi' : 'Thêm Phụ Huynh'}</span>
            )}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default ModalThemSuaPhuHuynhView;
