import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { dichVuNhanSu, GiaoVienBulkDto } from '../../dich_vu/tao_tu_dong/dichVuNhanSu';
import { useTrangThaiXacThuc } from '../../trang_thai/useTrangThaiXacThuc';
import ModalNhapGiaoVienHangLoatView from './ModalNhapGiaoVienHangLoatView.jsx';

export interface TeacherRow {
  id: number | string;
  hoTen: string;
  sdt: string;
  email: string;
  gioiTinh: string;
  ngaySinh: string;
  trinhDo: string;
  cccd: string;
  diaChi: string;
  taoTaiKhoan: boolean;
  matKhau: string;
}

export interface EvaluatedTeacherRow extends TeacherRow {
  rowNum: number;
  cleanSdt: string;
  cleanCccd: string;
  errors: Record<string, string>;
  isValid: boolean;
}

export interface BatchResult {
  tongSo: number;
  thanhCong: number;
  thatBai: number;
  danhSachLoi: string[];
}

export interface ChiNhanhOption {
  idCn: number | string;
  tenCn: string;
}

const CHUNK_SIZE = 50;

const createEmptyRow = (id?: number | string): TeacherRow => ({
  id: id || Date.now() + Math.random(),
  hoTen: '',
  sdt: '',
  email: '',
  gioiTinh: 'M',
  ngaySinh: '',
  trinhDo: 'Cử nhân Sư phạm',
  cccd: '',
  diaChi: '',
  taoTaiKhoan: true,
  matKhau: '123456'
});

export interface ModalNhapGiaoVienHangLoatProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  chiNhanhs?: ChiNhanhOption[];
  selectedBranch?: { idCn?: number | string; tenCn?: string } | null;
}

const ModalNhapGiaoVienHangLoat: React.FC<ModalNhapGiaoVienHangLoatProps> = ({
  isOpen,
  onClose,
  onSuccess,
  chiNhanhs = [],
  selectedBranch = null
}) => {
  const { user } = useTrangThaiXacThuc();
  const [activeMode, setActiveMode] = useState<'excel' | 'manual'>('excel');
  const [rows, setRows] = useState<TeacherRow[]>([
    createEmptyRow(1),
    createEmptyRow(2),
    createEmptyRow(3)
  ]);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Chi nhánh đích mặc định
  const [targetBranchId, setTargetBranchId] = useState(
    selectedBranch?.idCn !== 'ALL' && selectedBranch?.idCn ? String(selectedBranch.idCn) : ''
  );

  // Trạng thái tiến trình gửi hàng loạt
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setProcessStep] = useState(0);
  const [, setTotalChunks] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [processStatusText, setProcessStatusText] = useState('');
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);

  // 1. ENGINE KIỂM TRA ĐIỀU KIỆN TỪNG Ô (Cell & Row Validation)
  const evaluatedRows: EvaluatedTeacherRow[] = useMemo(() => {
    // Đếm tần suất SĐT trong bảng để bắt trùng lặp nội bộ
    const sdtCounts: Record<string, number> = {};
    rows.forEach(r => {
      const clean = (r.sdt || '').trim().replace(/\D/g, '');
      if (clean) {
        sdtCounts[clean] = (sdtCounts[clean] || 0) + 1;
      }
    });

    return rows.map((r, idx) => {
      const errors: Record<string, string> = {};
      const rowNum = idx + 1;

      // Validate Họ tên
      if (!r.hoTen || !r.hoTen.trim()) {
        errors.hoTen = 'Họ tên bắt buộc';
      }

      // Validate SĐT
      const cleanSdt = (r.sdt || '').trim().replace(/\D/g, '');
      if (!cleanSdt) {
        if (r.taoTaiKhoan) {
          errors.sdt = 'Cần SĐT để tạo tài khoản';
        }
      } else {
        if (cleanSdt.length < 10 || cleanSdt.length > 11) {
          errors.sdt = 'SĐT phải có 10 - 11 chữ số';
        } else if (sdtCounts[cleanSdt] > 1) {
          errors.sdt = 'SĐT bị trùng lặp trong bảng';
        }
      }

      // Validate CCCD
      const cleanCccd = (r.cccd || '').toString().trim().replace(/\D/g, '');
      if (cleanCccd && cleanCccd.length !== 12) {
        errors.cccd = 'CCCD phải đúng 12 chữ số';
      }

      // Validate Email
      if (r.email && r.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(r.email.trim())) {
          errors.email = 'Email không hợp lệ';
        }
      }

      // Validate Mật khẩu
      if (r.taoTaiKhoan && r.matKhau && r.matKhau.trim().length < 6) {
        errors.matKhau = 'Mật khẩu ≥ 6 ký tự';
      }

      const isValid = Object.keys(errors).length === 0;
      return {
        ...r,
        rowNum,
        cleanSdt,
        cleanCccd,
        errors,
        isValid
      };
    });
  }, [rows]);

  const validRowCount = evaluatedRows.filter(r => r.isValid && (r.hoTen || r.sdt)).length;
  const invalidRowCount = evaluatedRows.filter(r => !r.isValid).length;

  // 2. TẠO & TẢI FILE EXCEL MẪU
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Họ và tên *': 'Nguyễn Văn An',
        'Số điện thoại *': '0901112233',
        'Email': 'an.nguyen@edu.vn',
        'Giới tính (Nam/Nữ)': 'Nam',
        'Ngày sinh (YYYY-MM-DD)': '1990-05-15',
        'Trình độ': 'Thạc sĩ Sư phạm',
        'Số CCCD (12 số)': '079090123456',
        'Địa chỉ': 'Quận 1, TP.HCM',
        'Tạo tài khoản (Có/Không)': 'Có',
        'Mật khẩu': '123456'
      },
      {
        'Họ và tên *': 'Trần Thị Bích',
        'Số điện thoại *': '0902223344',
        'Email': 'bich.tran@edu.vn',
        'Giới tính (Nam/Nữ)': 'Nữ',
        'Ngày sinh (YYYY-MM-DD)': '1992-08-20',
        'Trình độ': 'Cử nhân Anh văn',
        'Số CCCD (12 số)': '079092654321',
        'Địa chỉ': 'Bình Thạnh, TP.HCM',
        'Tạo tài khoản (Có/Không)': 'Có',
        'Mật khẩu': '123456'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    worksheet['!cols'] = [
      { wch: 22 }, // Họ và tên
      { wch: 16 }, // SĐT
      { wch: 22 }, // Email
      { wch: 18 }, // Giới tính
      { wch: 22 }, // Ngày sinh
      { wch: 20 }, // Trình độ
      { wch: 18 }, // CCCD
      { wch: 25 }, // Địa chỉ
      { wch: 24 }, // Tạo tài khoản
      { wch: 15 }  // Mật khẩu
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mau_Giao_Vien');
    XLSX.writeFile(workbook, 'Mau_Import_Giao_Vien.xlsx');
  };

  // 3. ĐỌC FILE EXCEL & MAP THUỘC TÍNH
  const processExcelFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          alert('File Excel không có dữ liệu!');
          return;
        }

        const parsedRows: TeacherRow[] = rawJson.map((item, idx) => {
          // Map thông minh các cột tiếng Việt hoặc tiếng Anh
          const hoTen = item['Họ và tên *'] || item['Họ và tên'] || item['hoTen'] || item['HoTen'] || item['FullName'] || item['Tên'] || '';
          const sdtRaw = item['Số điện thoại *'] || item['Số điện thoại'] || item['sdt'] || item['SDT'] || item['Phone'] || '';
          const sdt = String(sdtRaw).trim().replace(/\D/g, '');
          const email = item['Email'] || item['email'] || '';
          const rawGender = item['Giới tính (Nam/Nữ)'] || item['Giới tính'] || item['gioiTinh'] || item['Gender'] || 'Nam';
          const gioiTinh = (String(rawGender).toLowerCase().includes('nữ') || String(rawGender).toLowerCase() === 'f') ? 'F' : 'M';
          const ngaySinh = item['Ngày sinh (YYYY-MM-DD)'] || item['Ngày sinh'] || item['ngaySinh'] || '';
          const trinhDo = item['Trình độ'] || item['trinhDo'] || 'Cử nhân Sư phạm';
          const rawCccd = item['Số CCCD (12 số)'] || item['Số CCCD'] || item['cccd'] || item['CCCD'] || '';
          const cccd = String(rawCccd).trim().replace(/\D/g, '');
          const diaChi = item['Địa chỉ'] || item['diaChi'] || item['Address'] || '';
          const rawTaoTk = item['Tạo tài khoản (Có/Không)'] || item['Tạo tài khoản'] || item['taoTaiKhoan'] || 'Có';
          const taoTaiKhoan = !String(rawTaoTk).toLowerCase().includes('không');
          const matKhau = item['Mật khẩu'] || item['matKhau'] || '123456';

          return {
            id: Date.now() + idx + Math.random(),
            hoTen: String(hoTen).trim(),
            sdt,
            email: String(email).trim(),
            gioiTinh,
            ngaySinh: String(ngaySinh).trim(),
            trinhDo: String(trinhDo).trim(),
            cccd,
            diaChi: String(diaChi).trim(),
            taoTaiKhoan,
            matKhau: String(matKhau).trim() || '123456'
          };
        });

        setRows(parsedRows);
      } catch (err) {
        console.error('Lỗi khi đọc file Excel:', err);
        alert('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file!');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processExcelFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processExcelFile(e.target.files[0]);
    }
  };

  // Cập nhật ô dữ liệu thủ công
  const handleCellChange = (id: number | string, field: keyof TeacherRow, value: any) => {
    setRows(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, [field]: value };
      }
      return r;
    }));
  };

  const handleAddRow = () => {
    setRows(prev => [...prev, createEmptyRow()]);
  };

  const handleRemoveRow = (id: number | string) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ bảng dữ liệu hiện tại?')) {
      setRows([createEmptyRow()]);
      setFileName('');
      setBatchResult(null);
    }
  };

  // 4. TIẾN HÀNH GỬI HÀNG LOẠT VỚI CƠ CHẾ CHUNK 50 OBJECTS
  const handleSubmitBatch = async () => {
    const validRowsToSubmit = evaluatedRows.filter(r => r.isValid && r.hoTen.trim());
    if (validRowsToSubmit.length === 0) {
      alert('Không có bản ghi hợp lệ nào để cập nhật! Vui lòng kiểm tra các ô báo lỗi đỏ.');
      return;
    }

    if (invalidRowCount > 0) {
      const confirmProceed = window.confirm(
        `Phát hiện ${invalidRowCount} dòng có lỗi (sẽ bị bỏ qua).\nBạn có muốn tiếp tục cập nhật ${validRowsToSubmit.length} dòng hợp lệ vào hệ thống không?`
      );
      if (!confirmProceed) return;
    }

    // Tách thành các nhóm tối đa 50 objects
    const chunks: EvaluatedTeacherRow[][] = [];
    for (let i = 0; i < validRowsToSubmit.length; i += CHUNK_SIZE) {
      chunks.push(validRowsToSubmit.slice(i, i + CHUNK_SIZE));
    }

    setIsProcessing(true);
    setTotalChunks(chunks.length);
    setProcessStep(0);
    setProgressPercent(0);

    const idDn = user?.idDoanhNghiep || 1;
    let accumulatedSuccess = 0;
    let accumulatedFailed = 0;
    const accumulatedErrors: string[] = [];

    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index];
      const chunkNum = index + 1;
      setProcessStep(chunkNum);
      setProcessStatusText(`Đang gửi nhóm ${chunkNum}/${chunks.length} (${chunk.length} giáo viên)...`);

      // Chuẩn hóa payload cho backend DTO
      const payload: GiaoVienBulkDto[] = chunk.map(r => ({
        hoTen: r.hoTen.trim(),
        sdt: r.cleanSdt || undefined,
        email: r.email.trim() || undefined,
        gioiTinh: r.gioiTinh || 'M',
        ngaySinh: r.ngaySinh || undefined,
        trinhDo: r.trinhDo || undefined,
        cccd: r.cleanCccd ? Number(r.cleanCccd) : undefined,
        diaChi: r.diaChi || undefined,
        idCn: targetBranchId ? Number(targetBranchId) : undefined,
        taoTaiKhoan: r.taoTaiKhoan,
        matKhau: r.matKhau || '123456'
      }));

      try {
        const response = await dichVuNhanSu.luuGiaoVienHangLoat(idDn, payload);
        const data = response && (response as any).data !== undefined ? (response as any).data : response;

        if (data) {
          accumulatedSuccess += (data.thanhCong || 0);
          accumulatedFailed += (data.thatBai || 0);
          if (data.danhSachLoi && Array.isArray(data.danhSachLoi)) {
            accumulatedErrors.push(...data.danhSachLoi);
          }
        }
      } catch (err: any) {
        console.error(`Lỗi gửi nhóm ${chunkNum}:`, err);
        const errMsg = err?.response?.data?.message || err?.message || 'Lỗi mạng hoặc máy chủ bận';
        accumulatedFailed += chunk.length;
        accumulatedErrors.push(`Nhóm ${chunkNum} (${chunk.length} dòng): ${errMsg}`);
      }

      const percent = Math.round(((index + 1) / chunks.length) * 100);
      setProgressPercent(percent);
    }

    setIsProcessing(false);
    setBatchResult({
      tongSo: validRowsToSubmit.length,
      thanhCong: accumulatedSuccess,
      thatBai: accumulatedFailed,
      danhSachLoi: accumulatedErrors
    });

    if (accumulatedSuccess > 0 && onSuccess) {
      onSuccess();
    }
  };

  return (
    <ModalNhapGiaoVienHangLoatView
      isOpen={isOpen}
      onClose={onClose}
      activeMode={activeMode}
      setActiveMode={setActiveMode}
      targetBranchId={targetBranchId}
      setTargetBranchId={setTargetBranchId}
      chiNhanhs={chiNhanhs}
      fileName={fileName}
      isDragging={isDragging}
      setIsDragging={setIsDragging}
      evaluatedRows={evaluatedRows}
      validRowCount={validRowCount}
      invalidRowCount={invalidRowCount}
      isProcessing={isProcessing}
      progressPercent={progressPercent}
      processStatusText={processStatusText}
      batchResult={batchResult}
      onDownloadTemplate={handleDownloadTemplate}
      onFileDrop={handleFileDrop}
      onFileInput={handleFileInput}
      onCellChange={handleCellChange}
      onAddRow={handleAddRow}
      onRemoveRow={handleRemoveRow}
      onClearAll={handleClearAll}
      onSubmitBatch={handleSubmitBatch}
    />
  );
};

export default ModalNhapGiaoVienHangLoat;
