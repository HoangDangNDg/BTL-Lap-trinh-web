import React from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Table, 
  Check, 
  Layers 
} from 'lucide-react';
import styles from './ModalNhapGiaoVienHangLoat.module.css';

const ModalNhapGiaoVienHangLoatView = ({
  isOpen,
  onClose,
  activeMode,
  setActiveMode,
  targetBranchId,
  setTargetBranchId,
  chiNhanhs,
  fileName,
  isDragging,
  setIsDragging,
  evaluatedRows,
  validRowCount,
  invalidRowCount,
  isProcessing,
  progressPercent,
  processStatusText,
  batchResult,
  onDownloadTemplate,
  onFileDrop,
  onFileInput,
  onCellChange,
  onAddRow,
  onRemoveRow,
  onClearAll,
  onSubmitBatch
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.backdrop}>
      <div className={styles.modalContainer}>
        
        {/* ── MODAL HEADER ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIconWrap}>
              <Layers size={22} />
            </div>
            <div>
              <div className={styles.headerTitleRow}>
                <h3 className={styles.headerTitle}>
                  Thêm Dữ Liệu Giáo Viên Hàng Loạt
                </h3>
                <span className={`badge badge-info ${styles.batchBadge}`}>
                  Batch 50 Objects
                </span>
              </div>
              <p className={styles.headerSubtitle}>
                Tải file Excel hoặc nhập bảng thủ công • Tự động kiểm tra điều kiện từng ô &amp; chia nhóm gửi tuần tự
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className={styles.closeBtn}
            aria-label="Đóng cửa sổ"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── MODAL BODY ── */}
        <div className={styles.body}>

          {/* 1. THANH ĐIỀU KHIỂN & CHỌN CHI NHÁNH PHÂN CÔNG */}
          <div className={styles.controlBar}>
            <div className={styles.modeTabs}>
              <button
                type="button"
                onClick={() => setActiveMode('excel')}
                className={`${styles.modeTabBtn} ${activeMode === 'excel' ? styles.modeTabBtnActive : ''}`}
              >
                <FileSpreadsheet 
                  size={16} 
                  className={activeMode === 'excel' ? styles.modeTabIconExcel : styles.modeTabIconExcelInactive} 
                />
                <span>1. Tải Lên Excel</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('manual')}
                className={`${styles.modeTabBtn} ${activeMode === 'manual' ? styles.modeTabBtnActive : ''}`}
              >
                <Table 
                  size={16} 
                  className={activeMode === 'manual' ? styles.modeTabIconManual : styles.modeTabIconManualInactive} 
                />
                <span>2. Nhập Bảng Thủ Công</span>
              </button>
            </div>

            {/* Chi nhánh phân công */}
            <div className={styles.branchSelectGroup}>
              <label htmlFor="targetBranchSelect" className={styles.branchLabel}>
                Phân công vào chi nhánh:
              </label>
              <select
                id="targetBranchSelect"
                value={targetBranchId}
                onChange={(e) => setTargetBranchId(e.target.value)}
                className={styles.branchSelect}
              >
                <option value="">-- Chưa gán chi nhánh cụ thể --</option>
                {chiNhanhs.filter(c => c.idCn !== 'ALL').map(cn => (
                  <option key={cn.idCn} value={String(cn.idCn)}>{cn.tenCn}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. TAB TẢI LÊN EXCEL */}
          {activeMode === 'excel' && (
            <div className={styles.excelSection}>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onFileDrop}
                className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
                onClick={() => document.getElementById('excelFileInput')?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    document.getElementById('excelFileInput')?.click();
                  }
                }}
              >
                <input
                  id="excelFileInput"
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={onFileInput}
                  style={{ display: 'none' }}
                />
                <div className={styles.dropZoneIcon}>
                  <UploadCloud size={26} />
                </div>
                <h4 className={styles.dropZoneTitle}>
                  {fileName ? `File đã chọn: ${fileName}` : 'Kéo thả hoặc click để chọn file Excel'}
                </h4>
                <p className={styles.dropZoneSubtitle}>
                  Hỗ trợ định dạng .xlsx, .xls, .csv (Tự động đọc các cột họ tên, SĐT, email, CCCD...)
                </p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDownloadTemplate(); }}
                  className={`droplet-pill ${styles.downloadTemplateBtn}`}
                >
                  <Download size={14} />
                  <span>Tải File Excel Mẫu Chuẩn (.xlsx)</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. THỐNG KÊ REALTIME & NÚT THAO TÁC BẢNG */}
          <div className={styles.actionBar}>
            <div className={styles.statsGroup}>
              <span className={styles.statCount}>
                Danh sách nạp: {evaluatedRows.length} dòng
              </span>
              <span className={styles.badgeValid}>
                ✓ {validRowCount} Hợp lệ
              </span>
              {invalidRowCount > 0 && (
                <span className={styles.badgeInvalid}>
                  ✗ {invalidRowCount} Cần kiểm tra
                </span>
              )}
            </div>

            <div className={styles.tableBtnGroup}>
              <button
                type="button"
                onClick={onAddRow}
                className={`droplet-pill ${styles.addRowBtn}`}
              >
                <Plus size={14} />
                <span>Thêm dòng</span>
              </button>
              <button
                type="button"
                onClick={onClearAll}
                className={`droplet-pill ${styles.clearAllBtn}`}
              >
                <Trash2 size={14} />
                <span>Xóa hết</span>
              </button>
            </div>
          </div>

          {/* 4. BẢNG DỮ LIỆU GRID EDITABLE VỚI CELL VALIDATION */}
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead className={styles.thead}>
                <tr className={styles.headerRow}>
                  <th className={styles.thCenter} style={{ width: '45px' }}>STT</th>
                  <th className={styles.th} style={{ minWidth: '160px' }}>Họ và tên *</th>
                  <th className={styles.th} style={{ minWidth: '140px' }}>Số ĐT (Tài khoản) *</th>
                  <th className={styles.th} style={{ minWidth: '150px' }}>Email</th>
                  <th className={styles.th} style={{ width: '85px' }}>Giới tính</th>
                  <th className={styles.th} style={{ minWidth: '130px' }}>Số CCCD (12 số)</th>
                  <th className={styles.th} style={{ minWidth: '140px' }}>Trình độ</th>
                  <th className={styles.thCenter} style={{ width: '80px' }}>Tạo TK?</th>
                  <th className={styles.th} style={{ minWidth: '110px' }}>Mật khẩu</th>
                  <th className={styles.th} style={{ minWidth: '130px' }}>Trạng thái</th>
                  <th className={styles.thCenter} style={{ width: '50px' }}>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {evaluatedRows.map((r) => (
                  <tr
                    key={r.id}
                    className={`${styles.dataRow} ${!r.isValid ? styles.dataRowInvalid : ''}`}
                  >
                    {/* STT */}
                    <td className={styles.tdIndex}>
                      {r.rowNum}
                    </td>

                    {/* Họ và tên */}
                    <td className={styles.td}>
                      <input
                        type="text"
                        placeholder="Họ tên GV"
                        value={r.hoTen}
                        onChange={(e) => onCellChange(r.id, 'hoTen', e.target.value)}
                        className={`${styles.cellInput} ${r.errors.hoTen ? styles.cellInputError : ''}`}
                      />
                    </td>

                    {/* Số ĐT */}
                    <td className={styles.td}>
                      <input
                        type="text"
                        maxLength={11}
                        placeholder="10-11 số"
                        value={r.sdt}
                        onChange={(e) => onCellChange(r.id, 'sdt', e.target.value.replace(/\D/g, '').slice(0, 11))}
                        className={`${styles.cellInput} ${styles.cellInputPhone} ${r.errors.sdt ? styles.cellInputError : ''}`}
                      />
                    </td>

                    {/* Email */}
                    <td className={styles.td}>
                      <input
                        type="email"
                        placeholder="email@edu.vn"
                        value={r.email}
                        onChange={(e) => onCellChange(r.id, 'email', e.target.value)}
                        className={`${styles.cellInput} ${r.errors.email ? styles.cellInputError : ''}`}
                      />
                    </td>

                    {/* Giới tính */}
                    <td className={styles.td}>
                      <select
                        value={r.gioiTinh}
                        onChange={(e) => onCellChange(r.id, 'gioiTinh', e.target.value)}
                        className={styles.cellSelect}
                      >
                        <option value="M">Nam</option>
                        <option value="F">Nữ</option>
                      </select>
                    </td>

                    {/* CCCD */}
                    <td className={styles.td}>
                      <input
                        type="text"
                        maxLength={12}
                        placeholder="Đúng 12 số"
                        value={r.cccd}
                        onChange={(e) => onCellChange(r.id, 'cccd', e.target.value.replace(/\D/g, '').slice(0, 12))}
                        className={`${styles.cellInput} ${r.errors.cccd ? styles.cellInputError : ''}`}
                      />
                    </td>

                    {/* Trình độ */}
                    <td className={styles.td}>
                      <input
                        type="text"
                        placeholder="Cử nhân..."
                        value={r.trinhDo}
                        onChange={(e) => onCellChange(r.id, 'trinhDo', e.target.value)}
                        className={styles.cellInput}
                      />
                    </td>

                    {/* Tạo tài khoản? */}
                    <td className={styles.tdCenter}>
                      <input
                        type="checkbox"
                        checked={r.taoTaiKhoan}
                        onChange={(e) => onCellChange(r.id, 'taoTaiKhoan', e.target.checked)}
                        className={styles.cellCheckbox}
                      />
                    </td>

                    {/* Mật khẩu */}
                    <td className={styles.td}>
                      <input
                        type="text"
                        disabled={!r.taoTaiKhoan}
                        placeholder="123456"
                        value={r.matKhau}
                        onChange={(e) => onCellChange(r.id, 'matKhau', e.target.value)}
                        className={`${styles.cellInput} ${!r.taoTaiKhoan ? styles.cellInputDisabled : ''} ${r.errors.matKhau ? styles.cellInputError : ''}`}
                      />
                    </td>

                    {/* Trạng thái lỗi / hợp lệ */}
                    <td className={styles.td}>
                      {r.isValid ? (
                        <span className={styles.statusValid}>
                          <Check size={13} /> Hợp lệ
                        </span>
                      ) : (
                        <span title={Object.values(r.errors).join(', ')} className={styles.statusError}>
                          <AlertCircle size={13} /> {Object.values(r.errors)[0]}
                        </span>
                      )}
                    </td>

                    {/* Xóa dòng */}
                    <td className={styles.tdCenter}>
                      <button
                        type="button"
                        onClick={() => onRemoveRow(r.id)}
                        className={styles.deleteBtn}
                        title="Xóa dòng này"
                      >
                        <X size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. TIẾN TRÌNH GỬI THEO NHÓM 50 (PROGRESS BAR) */}
          {isProcessing && (
            <div className={styles.progressSection}>
              <div className={styles.progressInfoRow}>
                <span className={styles.progressText}>
                  {processStatusText}
                </span>
                <span className={styles.progressText}>
                  {progressPercent}%
                </span>
              </div>
              <div className={styles.progressTrack}>
                <div 
                  className={styles.progressBarFill} 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
            </div>
          )}

          {/* 6. KẾT QUẢ IMPORT SAU KHI HOÀN TẤT */}
          {batchResult && (
            <div className={`${styles.resultBox} ${batchResult.thatBai === 0 ? styles.resultSuccess : styles.resultWarning}`}>
              <div className={styles.resultHeader}>
                {batchResult.thatBai === 0 ? (
                  <CheckCircle2 size={20} style={{ color: '#059669' }} />
                ) : (
                  <AlertTriangle size={20} style={{ color: '#D97706' }} />
                )}
                <h4 className={batchResult.thatBai === 0 ? styles.resultTitleSuccess : styles.resultTitleWarning}>
                  Kết Quả Cập Nhật: {batchResult.thanhCong}/{batchResult.tongSo} giáo viên thành công!
                </h4>
              </div>

              {batchResult.danhSachLoi && batchResult.danhSachLoi.length > 0 && (
                <div className={styles.errorList}>
                  {batchResult.danhSachLoi.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── MODAL FOOTER ── */}
        <div className={styles.footer}>
          <div className={styles.footerNote}>
            💡 Dữ liệu sẽ được tự động chia thành từng nhóm <strong>50 bản ghi</strong> để gửi tuần tự lên máy chủ.
          </div>

          <div className={styles.footerActions}>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className={`droplet-pill ${styles.cancelActionBtn}`}
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={onSubmitBatch}
              disabled={isProcessing || validRowCount === 0}
              className={`droplet-pill droplet-pill-mint ${styles.submitActionBtn}`}
            >
              <Check size={16} />
              <span>{isProcessing ? 'Đang Cập Nhật...' : `Cập Nhật ${validRowCount} Giáo Viên Vào Backend`}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ModalNhapGiaoVienHangLoatView;
