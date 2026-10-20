import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  HeartHandshake, 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft,
  Building2,
  DollarSign,
  ChevronRight,
  Layers,
  Sparkles,
  Edit2,
  Plus,
  Users,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/liquid-glass-button';
import { dichVuDaoTaoChung } from '../../dich_vu/dichVuDaoTaoChung';
import { dichVuHocSinhPhuHuynh } from '../../dich_vu/tao_tu_dong/dichVuHocSinhPhuHuynh';
import ModalThemPhuHuynhHocSinh from '../quan_ly_hoc_sinh/ModalThemPhuHuynhHocSinh';
import styles from './ChiTietHocSinhView.module.css';

/**
 * Component hiển thị hồ sơ Chi Tiết Học Sinh
 * - Thông tin cá nhân học sinh (kèm CCCD)
 * - Component Phụ Huynh của học sinh (người giám hộ liên hệ)
 * - Nút bấm và khu vực xem tất cả khóa học của học sinh trong TẤT CẢ CÁC KỲ HỌC
 * - Hỗ trợ callback onEdit để chỉnh sửa thông tin học sinh
 */
const ChiTietHocSinhView = ({
  hocSinh,
  onBack,
  onEdit,
  onSelectStudent
}) => {
  const [studentDetail, setStudentDetail] = useState(hocSinh || null);
  const [phuHuynhDetail, setPhuHuynhDetail] = useState(hocSinh?.phuHuynh || null);
  const [allCourses, setAllCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showCoursesView, setShowCoursesView] = useState(false);

  // State cho phụ huynh & bảng phụ phu_huynh_hoc_sinh
  const [showAddParentModal, setShowAddParentModal] = useState(false);
  const [parentStudentsList, setParentStudentsList] = useState([]);
  const [loadingParentStudents, setLoadingParentStudents] = useState(false);

  const studentId = hocSinh?.idHs;

  // Đồng bộ studentDetail khi hocSinh prop thay đổi từ ngoài (sau khi chỉnh sửa thành công)
  useEffect(() => {
    if (hocSinh) {
      setStudentDetail(hocSinh);
      if (hocSinh.phuHuynh) {
        setPhuHuynhDetail(hocSinh.phuHuynh);
      }
    }
  }, [hocSinh]);

  // Tải danh sách học sinh của phụ huynh thông qua bảng phụ phu_huynh_hoc_sinh
  useEffect(() => {
    const parentId = phuHuynhDetail?.idPh;
    if (!parentId) {
      setParentStudentsList([]);
      return;
    }

    const fetchParentStudents = async () => {
      try {
        setLoadingParentStudents(true);
        const res = await dichVuHocSinhPhuHuynh.getHocSinhTheoPhuHuynhBangPhu(parentId);
        const list = Array.isArray(res) ? res : (res?.data || []);
        setParentStudentsList(list);
      } catch (err) {
        console.warn('Lỗi khi tải danh sách học sinh của phụ huynh qua bảng phụ:', err);
        setParentStudentsList([]);
      } finally {
        setLoadingParentStudents(false);
      }
    };

    fetchParentStudents();
  }, [phuHuynhDetail?.idPh]);

  // Callback cập nhật phụ huynh thành công
  const handleParentSuccess = (savedPh, quanHe) => {
    const nextPh = {
      ...savedPh,
      moiQuanHe: quanHe || savedPh.moiQuanHe || 'Người bảo hộ'
    };
    setPhuHuynhDetail(nextPh);
    setStudentDetail(prev => ({ ...prev, phuHuynh: nextPh }));
  };

  // Tải chi tiết học sinh & phụ huynh nếu cần bổ sung
  useEffect(() => {
    if (!studentId) return;

    const fetchDetail = async () => {
      try {
        const res = await dichVuDaoTaoChung.getChiTietHocSinh(studentId);
        const data = res?.data || res;
        if (data) {
          setStudentDetail(data);
          if (data.phuHuynh) {
            setPhuHuynhDetail(data.phuHuynh);
          }
        }
      } catch (err) {
        console.warn('Không tải được chi tiết phụ huynh bổ sung:', err);
      }
    };

    fetchDetail();
  }, [studentId]);

  // Tải toàn bộ khóa học / lớp học của học sinh trong tất cả các kỳ
  const fetchAllCourses = useCallback(async () => {
    if (!studentId) return;
    try {
      setLoadingCourses(true);
      const res = await dichVuDaoTaoChung.getDangKyHocTheoHocSinh(studentId);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setAllCourses(list);
    } catch (err) {
      console.error('Lỗi khi tải danh sách khóa học của học sinh:', err);
      setAllCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }, [studentId]);

  const handleToggleCoursesView = () => {
    const nextState = !showCoursesView;
    setShowCoursesView(nextState);
    if (nextState && allCourses.length === 0) {
      fetchAllCourses();
    }
  };

  const formatDate = (val) => {
    if (!val) return 'Chưa cập nhật';
    try {
      const parts = String(val).split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return val;
    } catch {
      return val;
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  if (!studentDetail) {
    return (
      <div className={`droplet-card ${styles.notFoundCard}`}>
        <p className={styles.notFoundText}>Không tìm thấy thông tin học sinh.</p>
        {onBack && (
          <Button variant="ios-droplet" size="sm" onClick={onBack}>
            <ArrowLeft size={14} /> Quay lại danh sách
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ── HEADER BANNER HỌC SINH ── */}
      <div className={`droplet-card ${styles.headerCard}`}>
        <div className={styles.headerLeft}>
          <div className={styles.headerAvatar}>
            {studentDetail.hoTen ? studentDetail.hoTen.charAt(0).toUpperCase() : 'H'}
          </div>

          <div>
            <div className={styles.headerTitleGroup}>
              <h2 className={styles.headerTitle}>
                {studentDetail.hoTen}
              </h2>
              <span className={`badge badge-success ${styles.headerBadge}`}>
                Đang theo học
              </span>
            </div>
            <p className={styles.headerSub}>
              Giới tính: <strong className={styles.headerSubStrong}>{studentDetail.gioiTinh === 'F' || studentDetail.gioiTinh === 'Nu' ? 'Nữ' : 'Nam'}</strong>
            </p>
          </div>
        </div>

        {/* Nút hành động chính: Bật xem khóa học tất cả kỳ & Quay lại */}
        <div className={styles.headerActions}>
          {/* ── YÊU CẦU ĐẶC BIỆT: BUTTON ĐIỀU HƯỚNG XEM KHÓA HỌC TRONG TẤT CẢ KỲ HỌC ── */}
          <button
            type="button"
            onClick={handleToggleCoursesView}
            className={`droplet-pill ${styles.btnToggleCourses} ${showCoursesView ? styles.btnToggleCoursesActive : ''}`}
          >
            <BookOpen size={16} />
            <span>{showCoursesView ? 'Ẩn Danh Sách Khóa Học' : 'Khóa Học Của Học Sinh (Tất Cả Kỳ)'}</span>
          </button>

          {/* Nút Chỉnh Sửa Hồ Sơ */}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(studentDetail)}
              className={`droplet-pill ${styles.btnEdit}`}
            >
              <Edit2 size={16} />
              <span>Chỉnh Sửa Hồ Sơ</span>
            </button>
          )}

          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className={`droplet-pill ${styles.btnBack}`}
            >
              <ArrowLeft size={16} />
              <span>Quay lại</span>
            </button>
          )}
        </div>
      </div>

      {/* ── THẺ 1: THÔNG TIN HỒ SƠ CHI TIẾT HỌC SINH ── */}
      <div className={`droplet-card ${styles.profileCard}`}>
        <div className={styles.cardSectionHeader}>
          <User size={20} className={styles.userIcon} />
          <h3 className={styles.sectionTitle}>
            Hồ Sơ Cá Nhân Học Sinh
          </h3>
        </div>

        <div className={styles.profileGrid}>
          <div className={styles.fieldCol}>
            <span className={styles.fieldLabel}>Họ và tên đầy đủ:</span>
            <strong className={styles.fieldValue}>{studentDetail.hoTen}</strong>
          </div>

          <div className={styles.fieldCol}>
            <span className={styles.fieldLabel}>Ngày tháng năm sinh:</span>
            <strong className={styles.fieldValue}>{formatDate(studentDetail.ngaySinh)}</strong>
          </div>

          <div className={styles.fieldCol}>
            <span className={styles.fieldLabel}>Số CCCD / Mã định danh:</span>
            <strong className={styles.fieldValueCccd}>
              {studentDetail.cccd || 'Chưa cập nhật'}
            </strong>
          </div>

          <div className={styles.fieldCol}>
            <span className={styles.fieldLabel}>Số điện thoại học sinh:</span>
            <strong className={styles.fieldValuePhone}>{studentDetail.sdt || studentDetail.soDienThoai || 'Chưa cập nhật'}</strong>
          </div>

          <div className={styles.fieldCol}>
            <span className={styles.fieldLabel}>Hộp thư điện tử (Email):</span>
            <strong className={styles.fieldValue}>{studentDetail.email || 'Chưa cập nhật'}</strong>
          </div>

          <div className={styles.fieldColFull}>
            <span className={styles.fieldLabel}>Địa chỉ thường trú:</span>
            <strong className={styles.fieldValue}>{studentDetail.diaChi || 'Chưa có thông tin địa chỉ'}</strong>
          </div>
        </div>
      </div>

      {/* ── THẺ 2: YÊU CẦU ĐẶC BIỆT - COMPONENT PHỤ HUYNH CỦA HỌC SINH ── */}
      <div className={`droplet-card ${styles.parentCard}`}>
        <div className={styles.parentHeader}>
          <div className={styles.parentHeaderLeft}>
            <div className={styles.parentIconBox}>
              <HeartHandshake size={20} />
            </div>
            <div>
              <h3 className={styles.parentTitle}>
                Thông Tin Phụ Huynh / Người Giám Hộ
              </h3>
              <p className={styles.parentSub}>
                Đại diện gia đình liên hệ và tiếp nhận thông báo kết quả học tập
              </p>
            </div>
          </div>

          <div className={styles.parentHeaderRight}>
            <span className={`badge badge-success ${styles.parentBadge}`}>
              {phuHuynhDetail?.moiQuanHe || 'Người bảo hộ'}
            </span>
            <button
              type="button"
              onClick={() => setShowAddParentModal(true)}
              className={`droplet-pill ${styles.btnAddParent}`}
            >
              <Plus size={14} />
              <span>{phuHuynhDetail ? 'Thay Đổi / Gán Phụ Huynh' : 'Thêm Phụ Huynh'}</span>
            </button>
          </div>
        </div>

        {phuHuynhDetail ? (
          <div className={styles.parentDetailContainer}>
            {/* Chi tiết phụ huynh */}
            <div className={styles.parentDetailGrid}>
              <div className={styles.fieldCol}>
                <span className={styles.parentFieldLabel}>Họ và tên phụ huynh:</span>
                <strong className={styles.parentFieldValue}>
                  {phuHuynhDetail.hoTen || phuHuynhDetail.tenPh || 'Chưa cập nhật tên'}
                </strong>
              </div>

              <div className={styles.fieldCol}>
                <span className={styles.parentFieldLabel}>Số điện thoại liên lạc khẩn:</span>
                <strong className={styles.parentFieldPhone}>
                  {phuHuynhDetail.sdt || phuHuynhDetail.soDienThoai || '--'}
                </strong>
              </div>

              <div className={styles.fieldCol}>
                <span className={styles.parentFieldLabel}>Mối quan hệ với học sinh:</span>
                <strong className={styles.parentFieldRel}>
                  {phuHuynhDetail.moiQuanHe || 'Cha / Mẹ'}
                </strong>
              </div>

              <div className={styles.fieldCol}>
                <span className={styles.parentFieldLabel}>Nghề nghiệp / Đơn vị:</span>
                <strong className={styles.parentFieldJob}>
                  {phuHuynhDetail.ngheNghiep || 'Tự do'}
                </strong>
              </div>

              {phuHuynhDetail.diaChi && (
                <div className={styles.parentFieldAddressFull}>
                  <span className={styles.parentFieldLabel}>Địa chỉ liên hệ phụ huynh:</span>
                  <strong className={styles.parentAddressVal}>
                    {phuHuynhDetail.diaChi}
                  </strong>
                </div>
              )}
            </div>

            {/* DANH SÁCH HỌC SINH / CON CÁI CỦA PHỤ HUYNH NÀY (TRUY VẤN QUA BẢNG PHỤ) */}
            <div className={styles.parentStudentsSection}>
              <div className={styles.parentStudentsHeader}>
                <div className={styles.parentStudentsTitle}>
                  <Users size={18} className={styles.parentStudentsTitleIcon} />
                  <span>Danh Sách Học Sinh Của Phụ Huynh Này ({parentStudentsList.length})</span>
                </div>
                <span className={styles.parentStudentsNote}>
                  Truy vấn liên kết qua bảng phụ <code>phu_huynh_hoc_sinh</code>
                </span>
              </div>

              {loadingParentStudents ? (
                <div className={styles.parentStudentsLoading}>
                  <RefreshCw size={18} className={`animate-spin ${styles.loadingSpinner}`} />
                  <span>Đang tải danh sách học sinh của phụ huynh...</span>
                </div>
              ) : parentStudentsList.length === 0 ? (
                <div className={styles.parentStudentsEmpty}>
                  Chưa có thêm học sinh nào khác liên kết với phụ huynh này qua bảng phụ.
                </div>
              ) : (
                <div className={styles.parentStudentsGrid}>
                  {parentStudentsList.map((item, idx) => {
                    const hs = item.hocSinh || {};
                    const isCurrent = hs.idHs === studentId;
                    const isFemale = hs.gioiTinh === 'F' || hs.gioiTinh === 'Nu' || hs.gioiTinh === 'Nữ';
                    return (
                      <div
                        key={item.idPhHs || idx}
                        onClick={() => !isCurrent && onSelectStudent && onSelectStudent(hs)}
                        className={`${styles.parentStudentCard} ${isCurrent ? styles.parentStudentCardCurrent : ''}`}
                      >
                        <div className={styles.studentCardLeft}>
                          <div className={isFemale ? styles.studentAvatarFemale : styles.studentAvatarMale}>
                            {hs.hoTen ? hs.hoTen.charAt(0).toUpperCase() : 'H'}
                          </div>
                          <div>
                            <div className={styles.studentItemName}>
                              {hs.hoTen || 'Học sinh'}
                            </div>
                            <div className={styles.studentItemSub}>
                              {item.quanHe || 'Người bảo hộ'} • {hs.soDienThoai || hs.sdt || 'Chưa có SĐT'}
                            </div>
                          </div>
                        </div>

                        {isCurrent ? (
                          <span className={`badge badge-success ${styles.studentCurrentBadge}`}>
                            Đang xem
                          </span>
                        ) : (
                          <div className={styles.studentNavBtn} title="Xem chi tiết học sinh này">
                            <ArrowRight size={14} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* GIAO DIỆN PHỤ HUYNH LÀ DẤU + KHI CHƯA CÓ THÔNG TIN */
          <div 
            onClick={() => setShowAddParentModal(true)}
            className={styles.emptyParentBox}
          >
            <div className={styles.emptyParentIconCircle}>
              <Plus size={30} />
            </div>

            <div>
              <h4 className={styles.emptyParentTitle}>
                Chưa Có Thông Tin Phụ Huynh / Người Giám Hộ
              </h4>
              <p className={styles.emptyParentSub}>
                Bấm vào đây để tạo mới hoặc liên kết phụ huynh cho học sinh này
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowAddParentModal(true);
              }}
              className={`droplet-pill droplet-pill-mint ${styles.emptyParentBtn}`}
            >
              <Plus size={16} />
              <span>+ Thêm Phụ Huynh Học Sinh</span>
            </button>
          </div>
        )}
      </div>

      {/* ── THẺ 3: KHU VỰC HIỂN THỊ KHÓA HỌC CỦA HỌC SINH TRONG TẤT CẢ KỲ HỌC ── */}
      {showCoursesView && (
        <div className={`droplet-card ${styles.coursesCard}`}>
          <div className={styles.coursesHeader}>
            <div className={styles.coursesHeaderLeft}>
              <div className={styles.coursesIconBox}>
                <BookOpen size={20} />
              </div>
              <div>
                <h3 className={styles.coursesTitle}>
                  Tất Cả Khóa Học Đã Ghi Danh Qua Các Kỳ
                </h3>
                <p className={styles.coursesSub}>
                  Lịch sử đào tạo học viên trên toàn bộ các học kỳ và chi nhánh trung tâm
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchAllCourses}
              className={`droplet-pill ${styles.btnRefreshCourses}`}
              title="Tải lại danh sách khóa học"
            >
              <RefreshCw size={14} className={loadingCourses ? 'animate-spin' : ''} />
            </button>
          </div>

          {loadingCourses ? (
            <div className={styles.coursesLoadingBox}>
              <RefreshCw size={26} className={`animate-spin ${styles.coursesLoadingSpinner}`} />
              <p className={styles.coursesLoadingText}>Đang tải danh sách khóa học qua tất cả các kỳ...</p>
            </div>
          ) : allCourses.length === 0 ? (
            <div className={styles.coursesEmptyBox}>
              <BookOpen size={36} className={styles.coursesEmptyIcon} />
              <p className={styles.coursesEmptyTitle}>Học sinh chưa có khóa học nào</p>
              <span className={styles.coursesEmptySub}>Học sinh chưa được ghi danh vào bất kỳ lớp học nào trong hệ thống.</span>
            </div>
          ) : (
            <div className={styles.coursesList}>
              {allCourses.map((dk, idx) => {
                const lop = dk.lopHoc || {};
                return (
                  <div
                    key={dk.idDangKy || idx}
                    className={styles.courseItemCard}
                  >
                    <div className={styles.courseItemLeft}>
                      <div className={styles.courseCapIconBox}>
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <div className={styles.courseItemTitleRow}>
                          <strong className={styles.courseItemTitle}>
                            {lop.tenLop || `Lớp #${dk.idLop || idx + 1}`}
                          </strong>
                          <span className={`badge badge-info ${styles.courseItemBadge}`}>
                            {lop.kyHoc?.tenKyHoc || 'Kỳ học'}
                          </span>
                        </div>
                        <div className={styles.courseItemSub}>
                          Khóa: <strong>{lop.tenKhoaHoc || 'Khóa đào tạo'}</strong> • Cơ sở: <strong>{lop.tenChiNhanh || 'Chi nhánh'}</strong> • GV: <strong>{lop.tenGiaoVien || '--'}</strong>
                        </div>
                      </div>
                    </div>

                    <div className={styles.courseItemRight}>
                      <span className={dk.trangThaiThanhToan ? styles.paymentStatusBadgePaid : styles.paymentStatusBadgeUnpaid}>
                        {dk.trangThaiThanhToan ? '✓ Đã đóng học phí' : '⚡ Chưa thanh toán'}
                      </span>
                      {dk.hocPhi !== undefined && (
                        <div className={styles.courseFeeAmount}>
                          {formatCurrency(dk.hocPhi)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL THÊM / LIÊN KẾT PHỤ HUYNH CHO HỌC SINH */}
      <ModalThemPhuHuynhHocSinh
        show={showAddParentModal}
        onClose={() => setShowAddParentModal(false)}
        studentId={studentId}
        studentName={studentDetail?.hoTen}
        selectedDnId={studentDetail?.idDn || studentDetail?.doanhNghiep?.idDn || 1}
        onSuccess={handleParentSuccess}
      />
    </div>
  );
};

export default ChiTietHocSinhView;


