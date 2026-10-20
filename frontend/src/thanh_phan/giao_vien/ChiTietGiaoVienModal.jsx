import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  ArrowLeft,
  UserCheck, 
  Phone, 
  Mail, 
  Calendar, 
  Building2, 
  Award, 
  BookOpen, 
  MapPin, 
  CreditCard, 
  HeartHandshake, 
  Image as ImageIcon, 
  FileBadge,
  Briefcase,
  GraduationCap,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { LiquidGlassTabs } from '../../components/ui/liquid-glass-button';
import { dichVuNhanSu } from '../../dich_vu/tao_tu_dong/dichVuNhanSu';
import { dichVuDoanhNghiep } from '../../dich_vu/tao_tu_dong/dichVuDoanhNghiep';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import ModalWrapper from '../ModalWrapper';
import styles from './ChiTietGiaoVienModal.module.css';

const ChiTietGiaoVienModal = ({ giaoVien, onClose }) => {
  const navigate = useNavigate();
  const { user } = useTrangThaiXacThuc();
  const [activeTab, setActiveTab] = useState('hoSo');
  const [chiTiet, setChiTiet] = useState(null);
  const [chiNhanhs, setChiNhanhs] = useState([]);
  const [chuyenMons, setChuyenMons] = useState([]);
  const [chungChis, setChungChis] = useState([]);
  const [loadingExtras, setLoadingExtras] = useState(false);

  // States quản lý thêm/xóa chi nhánh công tác
  const [allBranches, setAllBranches] = useState([]);
  const [loadingAllBranches, setLoadingAllBranches] = useState(false);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [addingBranch, setAddingBranch] = useState(false);
  const [deletingBranchId, setDeletingBranchId] = useState(null);
  const [branchActionError, setBranchActionError] = useState('');
  const [branchActionSuccess, setBranchActionSuccess] = useState('');

  useEffect(() => {
    if (!giaoVien?.idGv) return;

    const fetchExtras = async () => {
      try {
        setLoadingExtras(true);
        const [resCt, resCn, resCm, resCc] = await Promise.allSettled([
          dichVuNhanSu.getChiTietGv(giaoVien.idGv),
          dichVuNhanSu.getChiNhanhTheoGiaoVien(giaoVien.idGv),
          dichVuNhanSu.getChuyenMonTheoGiaoVien(giaoVien.idGv),
          dichVuNhanSu.getChungChiTheoGiaoVien(giaoVien.idGv)
        ]);

        if (resCt.status === 'fulfilled') {
          const d = resCt.value?.data !== undefined ? resCt.value.data : resCt.value;
          setChiTiet(d || null);
        }
        if (resCn.status === 'fulfilled') {
          const d = resCn.value?.data !== undefined ? resCn.value.data : resCn.value;
          setChiNhanhs(Array.isArray(d) ? d : []);
        }
        if (resCm.status === 'fulfilled') {
          const d = resCm.value?.data !== undefined ? resCm.value.data : resCm.value;
          setChuyenMons(Array.isArray(d) ? d : []);
        }
        if (resCc.status === 'fulfilled') {
          const d = resCc.value?.data !== undefined ? resCc.value.data : resCc.value;
          setChungChis(Array.isArray(d) ? d : []);
        }
      } catch (err) {
        console.error('Error fetching teacher extras:', err);
      } finally {
        setLoadingExtras(false);
      }
    };

    fetchExtras();
  }, [giaoVien]);

  const fetchChiNhanhsGiaoVien = async () => {
    try {
      const res = await dichVuNhanSu.getChiNhanhTheoGiaoVien(giaoVien.idGv);
      const d = res?.data !== undefined ? res.data : res;
      setChiNhanhs(Array.isArray(d) ? d : []);
    } catch (e) {
      console.error('Error fetching teacher branches:', e);
    }
  };

  const fetchAllBranches = async () => {
    try {
      setLoadingAllBranches(true);
      const idDn = user?.idDoanhNghiep || 1;
      const res = await dichVuDoanhNghiep.getChiNhanhTheoDoanhNghiep(idDn);
      const d = res?.data !== undefined ? res.data : res;
      setAllBranches(Array.isArray(d) ? d : []);
    } catch (e) {
      console.error('Error fetching enterprise branches:', e);
    } finally {
      setLoadingAllBranches(false);
    }
  };

  const handleOpenAddBranchModal = () => {
    setBranchActionError('');
    setBranchActionSuccess('');
    setSelectedBranchId('');
    setShowAddBranchModal(true);
    fetchAllBranches();
  };

  const handleAssignBranch = async (e) => {
    if (e) e.preventDefault();
    setBranchActionError('');
    setBranchActionSuccess('');
    if (!selectedBranchId) {
      setBranchActionError('Vui lòng chọn một chi nhánh');
      return;
    }
    try {
      setAddingBranch(true);
      await dichVuNhanSu.ganChiNhanh(giaoVien.idGv, Number(selectedBranchId));
      setBranchActionSuccess('Phân công chi nhánh công tác thành công!');
      await fetchChiNhanhsGiaoVien();
      setShowAddBranchModal(false);
      setSelectedBranchId('');
    } catch (err) {
      console.error('Error assigning branch:', err);
      const msg = err?.response?.data?.message;
      setBranchActionError(msg || 'Không thể phân công chi nhánh. Vui lòng kiểm tra lại!');
    } finally {
      setAddingBranch(false);
    }
  };

  const handleDeleteBranchAssignment = async (idGvChiNhanh, tenCn) => {
    if (!idGvChiNhanh) return;
    if (!window.confirm(`Bạn có chắc chắn muốn hủy phân công giáo viên khỏi "${tenCn || 'chi nhánh này'}"?`)) {
      return;
    }
    setBranchActionError('');
    setBranchActionSuccess('');
    try {
      setDeletingBranchId(idGvChiNhanh);
      await dichVuNhanSu.deleteGiaoVienChiNhanh(idGvChiNhanh);
      setBranchActionSuccess(`Đã xóa phân công khỏi ${tenCn || 'chi nhánh'} thành công!`);
      await fetchChiNhanhsGiaoVien();
    } catch (err) {
      console.error('Error removing branch assignment:', err);
      const msg = err?.response?.data?.message;
      setBranchActionError(msg || 'Không thể hủy phân công chi nhánh.');
    } finally {
      setDeletingBranchId(null);
    }
  };

  const assignedBranchIds = chiNhanhs
    .map(item => item.chiNhanh?.idCn || item.idCn)
    .filter(Boolean);
  const unassignedBranches = allBranches.filter(b => !assignedBranchIds.includes(b.idCn));

  if (!giaoVien) return null;

  const tabOptions = [
    { value: 'hoSo', label: 'Hồ Sơ Chi Tiết', icon: <UserCheck size={16} /> },
    { value: 'chiNhanh', label: 'Chi Nhánh Công Tác', icon: <Building2 size={16} /> },
    { value: 'chuyenMon', label: 'Chuyên Môn & Bằng Cấp', icon: <Award size={16} /> }
  ];

  const formatGender = (val) => {
    if (!val) return 'Chưa cập nhật';
    const v = String(val).toUpperCase();
    if (v === 'M' || v === 'NAM') return 'Nam';
    if (v === 'F' || v === 'NU' || v === 'NỮ') return 'Nữ';
    return val;
  };

  const formatDate = (val) => {
    if (!val) return '-';
    try {
      const parts = String(val).split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return val;
    } catch {
      return val;
    }
  };

  const avatarUrl = chiTiet?.urlAnh || null;

  return (
    <div className={styles.container}>
      {/* 1. KHỐI HEADER GIÁO VIÊN & THANH TABS HỢP NHẤT (Unified Droplet Card) */}
      <div className={`droplet-card ${styles.headerCard}`}>
        {/* TẦNG 1: Thông Tin Giáo Viên + Nút Quay Lại Danh Sách */}
        <div className={styles.level1Row}>
          <div className={styles.teacherInfoLeft}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={giaoVien.hoTen}
                className={styles.teacherAvatar}
              />
            ) : (
              <div className={`droplet-circle ${styles.avatarFallback}`}>
                {giaoVien.hoTen ? giaoVien.hoTen.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase() : 'GV'}
              </div>
            )}
            <div>
              <div className={styles.teacherNameRow}>
                <h2 className={styles.teacherHeading}>
                  {giaoVien.hoTen}
                </h2>
                <span className={`badge ${giaoVien.xoa ? 'badge-danger' : 'badge-success'}`}>
                  {giaoVien.xoa ? 'Nghỉ việc' : 'Đang công tác'}
                </span>
              </div>
              <p className={styles.teacherSubtitle}>
                Cơ sở: <strong className={styles.teacherBranchHighlight}>{giaoVien.doanhNghiep?.tenDn || 'Trung tâm giáo dục'}</strong>
              </p>
            </div>
          </div>

          <div className={styles.headerActionsRight}>
            {/* Nút Điều Hướng Đến Trang Thời Khóa Biểu Giáo Viên */}
            <button
              onClick={() => navigate(`/giao-vien/${giaoVien.idGv}/thoi-khoa-bieu`, { state: { giaoVien } })}
              className={`droplet-pill ${styles.btnSchedule}`}
              title="Xem thời khóa biểu và lịch dạy của giáo viên này"
            >
              <Calendar size={17} className={styles.scheduleIcon} />
              <span>Thời khóa biểu giáo viên</span>
            </button>

            {/* Nút Quay Lại Danh Sách */}
            <button
              onClick={onClose}
              className={`droplet-pill droplet-pill-mint ${styles.btnBack}`}
            >
              <ArrowLeft size={16} />
              <span>Quay lại danh sách</span>
            </button>
          </div>
        </div>

        {/* ĐƯỜNG KẺ PHÂN CÁCH MỜ NHẸ GIỮA 2 TẦNG */}
        <div className={styles.subtleDivider} />

        {/* TẦNG 2: Thanh Tabs Lướt Kính Quang Học */}
        <div className={styles.level2TabsRow}>
          <LiquidGlassTabs
            options={tabOptions}
            value={activeTab}
            onChange={(val) => setActiveTab(val)}
            size="default"
          />
        </div>
      </div>

      {/* 3. Khung nội dung chi tiết theo Tab */}
      <div className={`droplet-card ${styles.contentCard}`}>
        {/* TAB 1: Hồ sơ chi tiết (CCCD, URL ảnh, SĐT & Tên người thân, Địa chỉ, Trình độ) */}
        {activeTab === 'hoSo' && (
          <div className={styles.profileGrid}>
            {/* CCCD (Số) */}
            <div className={`droplet-pill ${styles.profileFieldCard}`}>
              <span className={styles.fieldLabel}>Số Căn Cước Công Dân (CCCD)</span>
              <div className={styles.fieldValueRow}>
                <CreditCard size={16} className={styles.iconCreditCard} />
                <span>{chiTiet?.cccd ? String(chiTiet.cccd) : 'Chưa cập nhật'}</span>
              </div>
            </div>

            {/* SĐT Liên hệ */}
            <div className={`droplet-pill ${styles.profileFieldCard}`}>
              <span className={styles.fieldLabel}>Số điện thoại liên hệ</span>
              <div className={styles.fieldValueRow}>
                <Phone size={16} className={styles.iconPhone} />
                <span>{giaoVien.sdt || 'Chưa cập nhật'}</span>
              </div>
            </div>

            {/* Tên người thân */}
            <div className={`droplet-pill ${styles.profileFieldCard}`}>
              <span className={styles.fieldLabel}>Tên người thân (Khẩn cấp)</span>
              <div className={styles.fieldValueRow}>
                <HeartHandshake size={16} className={styles.iconHeart} />
                <span>{chiTiet?.tenNguoiThan || 'Chưa cập nhật'}</span>
              </div>
            </div>

            {/* SĐT người thân */}
            <div className={`droplet-pill ${styles.profileFieldCard}`}>
              <span className={styles.fieldLabel}>SĐT người thân liên hệ</span>
              <div className={styles.fieldValueRow}>
                <Phone size={16} className={styles.iconPhoneAlert} />
                <span>{chiTiet?.sdtNguoiThan || 'Chưa cập nhật'}</span>
              </div>
            </div>

            {/* Email */}
            <div className={`droplet-pill ${styles.profileFieldCard}`}>
              <span className={styles.fieldLabel}>Hộp thư Email</span>
              <div className={styles.fieldValueRow}>
                <Mail size={16} className={styles.iconMail} />
                <span>{giaoVien.email || 'Chưa cập nhật'}</span>
              </div>
            </div>

            {/* Ngày sinh & Giới tính */}
            <div className={`droplet-pill ${styles.profileFieldCard}`}>
              <span className={styles.fieldLabel}>Ngày sinh & Giới tính</span>
              <div className={styles.fieldValueRow}>
                <Calendar size={16} className={styles.iconCalendar} />
                <span>{formatDate(giaoVien.ngaySinh)} • {formatGender(giaoVien.gioiTinh)}</span>
              </div>
            </div>

            {/* Trình độ học vấn */}
            <div className={`droplet-pill ${styles.profileFieldCard}`}>
              <span className={styles.fieldLabel}>Trình độ học vấn</span>
              <div className={styles.fieldValueRow}>
                <GraduationCap size={16} className={styles.iconGraduation} />
                <span>{chiTiet?.trinhDo || 'Cử nhân Sư phạm'}</span>
              </div>
            </div>

            {/* Ngày vào làm việc */}
            <div className={`droplet-pill ${styles.profileFieldCard}`}>
              <span className={styles.fieldLabel}>Ngày vào làm việc</span>
              <div className={styles.fieldValueRow}>
                <Briefcase size={16} className={styles.iconBriefcase} />
                <span>{formatDate(chiTiet?.ngayVaoLam)}</span>
              </div>
            </div>

            {/* URL Ảnh Đại Diện */}
            <div className={`droplet-pill ${styles.profileFieldCardFull}`}>
              <span className={styles.fieldLabel}>URL Ảnh đại diện giáo viên</span>
              <div className={styles.fieldValueRowUrl}>
                <ImageIcon size={16} className={styles.iconImage} />
                <span>{chiTiet?.urlAnh || 'Chưa có liên kết ảnh'}</span>
              </div>
            </div>

            {/* Địa chỉ cư trú */}
            <div className={`droplet-pill ${styles.profileFieldCardFull}`}>
              <span className={styles.fieldLabel}>Địa chỉ cư trú</span>
              <div className={styles.fieldValueRow}>
                <MapPin size={16} className={styles.iconLocation} />
                <span>{chiTiet?.diaChi || 'Chưa cập nhật địa chỉ'}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Chi nhánh công tác */}
        {activeTab === 'chiNhanh' && (
          <div className={styles.branchContainer}>
            {/* Header tab với nút thêm chi nhánh */}
            <div className={styles.branchListHeader}>
              <div>
                <h4 className={styles.branchListTitle}>
                  Danh Sách Chi Nhánh Giảng Dạy ({chiNhanhs.length})
                </h4>
                <p className={styles.branchListSubtitle}>
                  Các cơ sở giáo viên đang trực tiếp giảng dạy và công tác
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddBranchModal}
                className={`droplet-pill droplet-pill-mint ${styles.btnAddBranch}`}
              >
                <Plus size={16} />
                <span>+ Thêm Chi Nhánh Công Tác</span>
              </button>
            </div>

            {/* Thông báo thành công / lỗi */}
            {branchActionSuccess && (
              <div className={styles.alertSuccess}>
                <div className={styles.alertContent}>
                  <CheckCircle2 size={16} className={styles.alertIconSuccess} />
                  <span>{branchActionSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBranchActionSuccess('')}
                  className={styles.alertCloseBtnSuccess}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {branchActionError && (
              <div className={styles.alertError}>
                <div className={styles.alertContent}>
                  <AlertCircle size={16} className={styles.alertIconError} />
                  <span>{branchActionError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBranchActionError('')}
                  className={styles.alertCloseBtnError}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {loadingExtras ? (
              <div className={styles.loadingState}>Đang nạp chi nhánh...</div>
            ) : chiNhanhs.length === 0 ? (
              <div className={styles.emptyState}>
                <Building2 size={36} className={styles.emptyIcon} />
                <p className={styles.emptyText}>
                  Chưa phân công chi nhánh cụ thể cho giáo viên này.
                </p>
                <button
                  type="button"
                  onClick={handleOpenAddBranchModal}
                  className={`droplet-pill droplet-pill-mint ${styles.btnAssignNow}`}
                >
                  <Plus size={15} />
                  <span>Phân công chi nhánh ngay</span>
                </button>
              </div>
            ) : (
              <div className={styles.branchList}>
                {chiNhanhs.map((item, idx) => {
                  const idGvCn = item.idGvChiNhanh || item.id;
                  const tenBranch = item.chiNhanh?.tenCn || item.tenCn || `Chi Nhánh #${item.idCn || idx + 1}`;
                  const diaChiBranch = item.chiNhanh?.diaChi || 'Cơ sở đào tạo';

                  return (
                    <div key={idx} className={`droplet-pill ${styles.branchItemCard}`}>
                      <div className={styles.branchItemLeft}>
                        <div className={styles.branchPinIcon}>
                          <MapPin size={20} />
                        </div>
                        <div>
                          <div className={styles.branchItemName}>
                            {tenBranch}
                          </div>
                          <span className={styles.branchItemAddress}>
                            {diaChiBranch}
                          </span>
                        </div>
                      </div>

                      <div className={styles.branchItemRight}>
                        <span className={`badge badge-success ${styles.branchBadge}`}>
                          Đang giảng dạy
                        </span>

                        {idGvCn && (
                          <button
                            type="button"
                            onClick={() => handleDeleteBranchAssignment(idGvCn, tenBranch)}
                            disabled={deletingBranchId === idGvCn}
                            title="Hủy phân công khỏi chi nhánh này"
                            className={styles.btnDeleteBranch}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* MODAL THÊM CHI NHÁNH CÔNG TÁC */}
            <ModalWrapper
              isOpen={showAddBranchModal}
              onClose={() => setShowAddBranchModal(false)}
              maxWidth="max-w-[480px]"
            >
              {/* Modal Header */}
              <div className={styles.modalHeader}>
                <div className={styles.modalBuildingIcon}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className={styles.modalTitle}>
                    Thêm Chi Nhánh Công Tác
                  </h3>
                  <p className={styles.modalSubtitle}>
                    Phân công cơ sở cho giáo viên {giaoVien.hoTen}
                  </p>
                </div>
              </div>

              {/* Modal Body */}
              {branchActionError && (
                <div className={styles.modalErrorBox}>
                  {branchActionError}
                </div>
              )}

              {loadingAllBranches ? (
                <div className={styles.modalLoading}>
                  Đang tải danh sách các chi nhánh...
                </div>
              ) : unassignedBranches.length === 0 ? (
                <div className={styles.modalEmptyNotice}>
                  🎉 Giáo viên này đã được phân công đầy đủ vào toàn bộ các chi nhánh hiện có!
                </div>
              ) : (
                <form onSubmit={handleAssignBranch} className={styles.modalForm}>
                  <div>
                    <label className={styles.modalFormLabel}>
                      Chọn Chi Nhánh Muốn Phân Công *
                    </label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className={`droplet-pill ${styles.modalFormSelect}`}
                    >
                      <option value="">-- Bấm để chọn chi nhánh --</option>
                      {unassignedBranches.map(b => (
                        <option key={b.idCn} value={b.idCn}>
                          {b.tenCn} ({b.diaChi || 'Cơ sở đào tạo'})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Modal Footer */}
                  <div className={styles.modalFooter}>
                    <button
                      type="button"
                      onClick={() => setShowAddBranchModal(false)}
                      className={`droplet-pill ${styles.btnModalCancel}`}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={addingBranch || !selectedBranchId}
                      className={`droplet-pill droplet-pill-mint ${styles.btnModalSubmit}`}
                    >
                      {addingBranch ? 'Đang thêm...' : 'Xác Nhận Thêm'}
                    </button>
                  </div>
                </form>
              )}
            </ModalWrapper>
          </div>
        )}

        {/* TAB 3: Chuyên môn & Chứng chỉ */}
        {activeTab === 'chuyenMon' && (
          <div className={styles.specialtyContainer}>
            {/* Chuyên môn */}
            <div>
              <h4 className={styles.sectionHeading}>
                Bộ Môn & Chuyên Môn Phụ Trách
              </h4>
              {chuyenMons.length === 0 ? (
                <div className={styles.sectionEmptyNotice}>
                  Chưa gán chuyên môn giảng dạy.
                </div>
              ) : (
                <div className={styles.specialtyTagsList}>
                  {chuyenMons.map((cm, idx) => (
                    <span key={idx} className={`droplet-pill ${styles.specialtyPill}`}>
                      <BookOpen size={15} />
                      <span>{cm.chuyenMon?.tenChuyenMon || cm.tenChuyenMon || `Chuyên môn #${cm.idCm || idx + 1}`}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Chứng chỉ */}
            <div>
              <h4 className={styles.sectionHeading}>
                Bằng Cấp & Chứng Chỉ Sư Phạm
              </h4>
              {chungChis.length === 0 ? (
                <div className={styles.sectionEmptyNotice}>
                  Chưa cập nhật chứng chỉ.
                </div>
              ) : (
                <div className={styles.certificatesList}>
                  {chungChis.map((cc, idx) => (
                    <div key={idx} className={`droplet-pill ${styles.certificateItem}`}>
                      <div className={styles.certificateItemLeft}>
                        <FileBadge size={18} className={styles.certificateIcon} />
                        <span className={styles.certificateName}>
                          {cc.tenChungChi || cc.ten || `Chứng chỉ #${idx + 1}`}
                        </span>
                      </div>
                      <span className={styles.certificateDate}>
                        {cc.ngayCap ? `Cấp ngày: ${formatDate(cc.ngayCap)}` : 'Chứng chỉ hợp lệ'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChiTietGiaoVienModal;


