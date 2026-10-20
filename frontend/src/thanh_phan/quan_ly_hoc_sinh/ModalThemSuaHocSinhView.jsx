import React from 'react';
import ModalWrapper from '../ModalWrapper';
import { GraduationCap, RefreshCw, Building2 } from 'lucide-react';
import styles from './ModalThemSuaHocSinh.module.css';

/**
 * Giao diện Modal Thêm mới và Chỉnh sửa Hồ sơ Học sinh (Pure Presentation JSX)
 */
const ModalThemSuaHocSinhView = ({
  show = false,
  onClose,
  editingStudent = null,
  currentDn = {},
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
      maxWidth="max-w-[600px]"
      title={
        <div className={styles.titleGroup}>
          <div className={styles.titleIcon}>
            <GraduationCap size={22} />
          </div>
          <div>
            <h3 className={styles.titleMain}>
              {editingStudent ? 'Cập Nhật Hồ Sơ Học Sinh' : 'Thêm Mới Học Sinh'}
            </h3>
            <p className={styles.titleSub}>
              Doanh nghiệp: <strong>{currentDn?.tenDn || 'Hệ thống'}</strong>
            </p>
          </div>
        </div>
      }
    >
      {/* Error Alert nếu có */}
      {errorMsg && (
        <div className={styles.errorAlert}>
          {errorMsg}
        </div>
      )}

      {/* Form Body Cuộn Mượt */}
      <form onSubmit={onSubmit} className={styles.form}>
        <div className={styles.formBody}>
          {/* Họ và tên */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Họ Và Tên Học Sinh *
            </label>
            <input
              type="text"
              required
              placeholder="VD: Nguyễn Gia Bảo"
              value={formData.hoTen}
              onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
              className={`droplet-pill ${styles.input}`}
            />
          </div>

          {/* CCCD & SĐT */}
          <div className={styles.gridTwoCol}>
            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>
                  Số CCCD / Mã Định Danh
                </label>
                <span className={styles.labelNote}>12 số</span>
              </div>
              <input
                type="text"
                maxLength={12}
                placeholder="VD: 079208000001"
                value={formData.cccd}
                onChange={(e) => setFormData({ ...formData, cccd: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                className={`droplet-pill ${styles.input} ${styles.inputCccd}`}
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>
                  Số Điện Thoại
                </label>
                <span className={styles.labelNote}>10 - 11 số</span>
              </div>
              <input
                type="text"
                maxLength={11}
                placeholder="VD: 0911223301"
                value={formData.soDienThoai}
                onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                className={`droplet-pill ${styles.input}`}
              />
            </div>
          </div>

          {/* Giới tính & Ngày sinh */}
          <div className={styles.gridTwoCol}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Giới Tính
              </label>
              <select
                value={formData.gioiTinh}
                onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value })}
                className={`droplet-pill ${styles.select}`}
              >
                <option value="M">Nam</option>
                <option value="F">Nữ</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Ngày Sinh
              </label>
              <input
                type="date"
                value={formData.ngaySinh}
                onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                className={`droplet-pill ${styles.input}`}
              />
            </div>
          </div>

          {/* Địa chỉ */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Địa Chỉ Liên Hệ
            </label>
            <input
              type="text"
              placeholder="VD: 12 Nguyễn Huệ, Quận 1, TP.HCM"
              value={formData.diaChi}
              onChange={(e) => setFormData({ ...formData, diaChi: e.target.value })}
              className={`droplet-pill ${styles.input}`}
            />
          </div>

          {/* Doanh nghiệp trực thuộc */}
          <div className={styles.infoBox}>
            <Building2 size={18} className={styles.infoIcon} />
            <div>
              <div className={styles.infoTitle}>
                Doanh Nghiệp Quản Lý: {currentDn?.tenDn || 'Hệ thống'}
              </div>
              <div className={styles.infoDesc}>
                Hồ sơ học sinh sẽ được tự động liên kết vào doanh nghiệp quản lý này.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            type="button"
            onClick={onClose}
            className={`droplet-pill ${styles.btnCancel}`}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`droplet-pill droplet-pill-mint ${styles.btnSubmit}`}
          >
            {submitting && <RefreshCw size={15} className="animate-spin" />}
            <span>{submitting ? 'Đang lưu...' : (editingStudent ? 'Cập Nhật' : 'Lưu Học Sinh')}</span>
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default ModalThemSuaHocSinhView;
