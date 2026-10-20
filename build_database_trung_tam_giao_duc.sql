-- =============================================================================
-- TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI - KHOA CÔNG NGHỆ THÔNG TIN
-- BÀI TẬP LỚN MÔN: LẬP TRÌNH WEB
-- ĐỀ TÀI: HỆ THỐNG QUẢN LÝ TRUNG TÂM GIÁO DỤC (EDUCATION CENTER MANAGEMENT SYSTEM)
-- SCRIPT BUILD CƠ SỞ DỮ LIỆU & SEED DATA (MYSQL 8.0+)
-- Database: trung_tam_giao_duc_dbv4
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `trung_tam_giao_duc_dbv4` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `trung_tam_giao_duc_dbv4`;

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. BẢNG DOANH NGHIỆP, CỔ ĐÔNG & CHI NHÁNH
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `gop_von_so_huu`;
DROP TABLE IF EXISTS `chu_co_dong`;
DROP TABLE IF EXISTS `phong_hoc`;
DROP TABLE IF EXISTS `chi_nhanh`;
DROP TABLE IF EXISTS `doanh_nghiep`;

CREATE TABLE `doanh_nghiep` (
  `id_dn` INT AUTO_INCREMENT PRIMARY KEY,
  `ten_doanh_nghiep` VARCHAR(255) NOT NULL,
  `ma_so_thue` VARCHAR(50),
  `dia_chi` VARCHAR(255),
  `so_dien_thoai` VARCHAR(20),
  `email` VARCHAR(100),
  `xoa` TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chi_nhanh` (
  `id_cn` INT AUTO_INCREMENT PRIMARY KEY,
  `id_dn` INT NOT NULL,
  `ten_cn` VARCHAR(255) NOT NULL,
  `dia_chi` VARCHAR(255),
  `sdt` VARCHAR(20),
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_chi_nhanh_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `phong_hoc` (
  `id_phong` INT AUTO_INCREMENT PRIMARY KEY,
  `id_cn` INT NOT NULL,
  `ten_phong` VARCHAR(100) NOT NULL,
  `suc_chua` INT DEFAULT 30,
  `trang_thai` VARCHAR(50) DEFAULT 'HoatDong',
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_phong_hoc_cn` FOREIGN KEY (`id_cn`) REFERENCES `chi_nhanh` (`id_cn`) ON DELETE CASCADE,
  CONSTRAINT `fk_phong_hoc_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chu_co_dong` (
  `id_ccd` INT AUTO_INCREMENT PRIMARY KEY,
  `id_dn` INT NOT NULL,
  `ho_ten` VARCHAR(255) NOT NULL,
  `so_dien_thoai` VARCHAR(20),
  `email` VARCHAR(100),
  `cccd` VARCHAR(20),
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_co_dong_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `gop_von_so_huu` (
  `id_gop_von` INT AUTO_INCREMENT PRIMARY KEY,
  `id_ccd` INT NOT NULL,
  `id_dn` INT NOT NULL,
  `so_tien_gop` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `ti_le_phan_tram` DECIMAL(5,2) DEFAULT 0.00,
  `ngay_gop` DATE,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_gop_von_ccd` FOREIGN KEY (`id_ccd`) REFERENCES `chu_co_dong` (`id_ccd`) ON DELETE CASCADE,
  CONSTRAINT `fk_gop_von_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. BẢNG TÀI KHOẢN, PHÂN QUYỀN & BẢO MẬT JWT
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `refresh_token`;
DROP TABLE IF EXISTS `tai_khoan_admin`;
DROP TABLE IF EXISTS `tai_khoan_ql`;
DROP TABLE IF EXISTS `tai_khoan_gv`;
DROP TABLE IF EXISTS `tai_khoan_ccd`;
DROP TABLE IF EXISTS `tai_khoan`;

CREATE TABLE `tai_khoan` (
  `id_tk` INT AUTO_INCREMENT PRIMARY KEY,
  `ten_dang_nhap` VARCHAR(100) NOT NULL UNIQUE,
  `mat_khau` VARCHAR(255) NOT NULL,
  `trang_thai` VARCHAR(50) DEFAULT 'HoatDong',
  `id_tai_khoan_vai_tro` INT,
  `xoa` TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tai_khoan_admin` (
  `id_tk_admin` INT AUTO_INCREMENT PRIMARY KEY,
  `id_tk` INT NOT NULL,
  `id_admin` INT,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_tk_admin_tk` FOREIGN KEY (`id_tk`) REFERENCES `tai_khoan` (`id_tk`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tai_khoan_ql` (
  `id_tk_ql` INT AUTO_INCREMENT PRIMARY KEY,
  `id_tk` INT NOT NULL,
  `id_ql` INT,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_tk_ql_tk` FOREIGN KEY (`id_tk`) REFERENCES `tai_khoan` (`id_tk`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tai_khoan_gv` (
  `id_tk_gv` INT AUTO_INCREMENT PRIMARY KEY,
  `id_tk` INT NOT NULL,
  `id_gv` INT,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_tk_gv_tk` FOREIGN KEY (`id_tk`) REFERENCES `tai_khoan` (`id_tk`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tai_khoan_ccd` (
  `id_tk_ccd` INT AUTO_INCREMENT PRIMARY KEY,
  `id_tk` INT NOT NULL,
  `id_ccd` INT,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_tk_ccd_tk` FOREIGN KEY (`id_tk`) REFERENCES `tai_khoan` (`id_tk`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `refresh_token` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `token` VARCHAR(500) NOT NULL UNIQUE,
  `id_tk` INT NOT NULL,
  `ngay_het_han` DATETIME NOT NULL,
  `da_thu_hoi` TINYINT(1) DEFAULT 0,
  `tao_luc` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_refresh_token_tk` FOREIGN KEY (`id_tk`) REFERENCES `tai_khoan` (`id_tk`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. BẢNG NHÂN SỰ, GIÁO VIÊN & CHUYÊN MÔN
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `giao_vien_chuyen_mon`;
DROP TABLE IF EXISTS `giao_vien_chi_nhanh`;
DROP TABLE IF EXISTS `chung_chi_giao_vien`;
DROP TABLE IF EXISTS `chi_tiet_gv`;
DROP TABLE IF EXISTS `chuyen_mon`;
DROP TABLE IF EXISTS `quan_ly`;
DROP TABLE IF EXISTS `giao_vien`;
DROP TABLE IF EXISTS `admin`;

CREATE TABLE `admin` (
  `id_admin` INT AUTO_INCREMENT PRIMARY KEY,
  `id_dn` INT NOT NULL,
  `ho_ten` VARCHAR(255) NOT NULL,
  `so_dien_thoai` VARCHAR(20),
  `email` VARCHAR(100),
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_admin_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quan_ly` (
  `id_ql` INT AUTO_INCREMENT PRIMARY KEY,
  `id_dn` INT NOT NULL,
  `id_cn` INT,
  `ho_ten` VARCHAR(255) NOT NULL,
  `so_dien_thoai` VARCHAR(20),
  `email` VARCHAR(100),
  `chuc_vu` VARCHAR(100) DEFAULT 'Quản lý cơ sở',
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_quan_ly_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `giao_vien` (
  `id_gv` INT AUTO_INCREMENT PRIMARY KEY,
  `id_dn` INT NOT NULL,
  `ho_ten` VARCHAR(255) NOT NULL,
  `gioi_tinh` VARCHAR(10),
  `ngay_sinh` DATE,
  `sdt` VARCHAR(20),
  `email` VARCHAR(100),
  `con_hoat_dong` TINYINT(1) DEFAULT 1,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_giao_vien_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chi_tiet_gv` (
  `id_chi_tiet_gv` INT AUTO_INCREMENT PRIMARY KEY,
  `id_gv` INT NOT NULL,
  `luong_co_ban` DECIMAL(18,2) DEFAULT 0.00,
  `don_gia_buoi_day` DECIMAL(18,2) DEFAULT 300000.00,
  `so_tai_khoan_nh` VARCHAR(50),
  `ten_ngan_hang` VARCHAR(100),
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_ct_gv_gv` FOREIGN KEY (`id_gv`) REFERENCES `giao_vien` (`id_gv`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chuyen_mon` (
  `id_cm` INT AUTO_INCREMENT PRIMARY KEY,
  `ten_chuyen_mon` VARCHAR(150) NOT NULL,
  `mo_ta` TEXT,
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_chuyen_mon_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chung_chi_giao_vien` (
  `id_chung_chi` INT AUTO_INCREMENT PRIMARY KEY,
  `id_gv` INT NOT NULL,
  `ten_chung_chi` VARCHAR(255) NOT NULL,
  `don_vi_cap` VARCHAR(255),
  `ngay_cap` DATE,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_cc_gv_gv` FOREIGN KEY (`id_gv`) REFERENCES `giao_vien` (`id_gv`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `giao_vien_chi_nhanh` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_gv` INT NOT NULL,
  `id_cn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_gv_cn_gv` FOREIGN KEY (`id_gv`) REFERENCES `giao_vien` (`id_gv`) ON DELETE CASCADE,
  CONSTRAINT `fk_gv_cn_cn` FOREIGN KEY (`id_cn`) REFERENCES `chi_nhanh` (`id_cn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `giao_vien_chuyen_mon` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_gv` INT NOT NULL,
  `id_cm` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_gv_cm_gv` FOREIGN KEY (`id_gv`) REFERENCES `giao_vien` (`id_gv`) ON DELETE CASCADE,
  CONSTRAINT `fk_gv_cm_cm` FOREIGN KEY (`id_cm`) REFERENCES `chuyen_mon` (`id_cm`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. BẢNG HỌC SINH, PHỤ HUYNH & HỒ SƠ 360°
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `bao_luu_khoa_hoc`;
DROP TABLE IF EXISTS `dang_ky_hoc`;
DROP TABLE IF EXISTS `phu_huynh_hoc_sinh`;
DROP TABLE IF EXISTS `hoc_sinh`;
DROP TABLE IF EXISTS `phu_huynh`;

CREATE TABLE `phu_huynh` (
  `id_ph` INT AUTO_INCREMENT PRIMARY KEY,
  `ho_ten` VARCHAR(255) NOT NULL,
  `so_dien_thoai` VARCHAR(20) NOT NULL,
  `email` VARCHAR(100),
  `dia_chi` VARCHAR(255),
  `nghe_nghiep` VARCHAR(100),
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_phu_huynh_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `hoc_sinh` (
  `id_hs` INT AUTO_INCREMENT PRIMARY KEY,
  `id_ph` INT,
  `id_dn` INT NOT NULL,
  `ho_ten` VARCHAR(255) NOT NULL,
  `ngay_sinh` DATE,
  `gioi_tinh` VARCHAR(10),
  `so_dien_thoai` VARCHAR(20),
  `cccd` VARCHAR(20),
  `dia_chi` VARCHAR(255),
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_hoc_sinh_ph` FOREIGN KEY (`id_ph`) REFERENCES `phu_huynh` (`id_ph`) ON DELETE SET NULL,
  CONSTRAINT `fk_hoc_sinh_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `phu_huynh_hoc_sinh` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_ph` INT NOT NULL,
  `id_hs` INT NOT NULL,
  `moi_quan_he` VARCHAR(50) DEFAULT 'Bố/Mẹ',
  `la_nguoi_giam_ho_chinh` TINYINT(1) DEFAULT 1,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_ph_hs_ph` FOREIGN KEY (`id_ph`) REFERENCES `phu_huynh` (`id_ph`) ON DELETE CASCADE,
  CONSTRAINT `fk_ph_hs_hs` FOREIGN KEY (`id_hs`) REFERENCES `hoc_sinh` (`id_hs`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. BẢNG KHUNG ĐÀO TẠO, KHÓA HỌC & LỚP HỌC
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `diem_danh_hoc_sinh`;
DROP TABLE IF EXISTS `diem_danh_giao_vien`;
DROP TABLE IF EXISTS `buoi_hoc`;
DROP TABLE IF EXISTS `thoi_khoa_bieu_tuan`;
DROP TABLE IF EXISTS `khung_lich_hoc_co_dinh`;
DROP TABLE IF EXISTS `hoc_sinh_khoa_hoc`;
DROP TABLE IF EXISTS `lop_hoc`;
DROP TABLE IF EXISTS `khoa_hoc`;
DROP TABLE IF EXISTS `mon_hoc`;
DROP TABLE IF EXISTS `bo_mon`;
DROP TABLE IF EXISTS `tuan_hoc`;
DROP TABLE IF EXISTS `thang_hoc`;
DROP TABLE IF EXISTS `ky_hoc`;
DROP TABLE IF EXISTS `nam_hoc`;

CREATE TABLE `nam_hoc` (
  `id_nam_hoc` INT AUTO_INCREMENT PRIMARY KEY,
  `id_dn` INT NOT NULL,
  `ten_nam_hoc` VARCHAR(100) NOT NULL,
  `nam_bat_dau` INT,
  `nam_ket_thuc` INT,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_nam_hoc_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ky_hoc` (
  `id_ky_hoc` INT AUTO_INCREMENT PRIMARY KEY,
  `id_nam_hoc` INT NOT NULL,
  `ten_ky_hoc` VARCHAR(100) NOT NULL,
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_ky_hoc_nh` FOREIGN KEY (`id_nam_hoc`) REFERENCES `nam_hoc` (`id_nam_hoc`) ON DELETE CASCADE,
  CONSTRAINT `fk_ky_hoc_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `thang_hoc` (
  `id_thang_hoc` INT AUTO_INCREMENT PRIMARY KEY,
  `id_ky_hoc` INT NOT NULL,
  `ten_thang_hoc` VARCHAR(50) NOT NULL,
  `thang` INT,
  `nam` INT,
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_thang_hoc_kh` FOREIGN KEY (`id_ky_hoc`) REFERENCES `ky_hoc` (`id_ky_hoc`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tuan_hoc` (
  `id_tuan_hoc` INT AUTO_INCREMENT PRIMARY KEY,
  `id_thang_hoc` INT NOT NULL,
  `so_tuan` INT,
  `ngay_bat_dau` DATE,
  `ngay_ket_thuc` DATE,
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_tuan_hoc_th` FOREIGN KEY (`id_thang_hoc`) REFERENCES `thang_hoc` (`id_thang_hoc`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `bo_mon` (
  `id_bo_mon` INT AUTO_INCREMENT PRIMARY KEY,
  `ten_bo_mon` VARCHAR(150) NOT NULL,
  `mo_ta` TEXT,
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_bo_mon_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `mon_hoc` (
  `id_mh` INT AUTO_INCREMENT PRIMARY KEY,
  `id_bo_mon` INT NOT NULL,
  `ten_mon` VARCHAR(150) NOT NULL,
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_mon_hoc_bm` FOREIGN KEY (`id_bo_mon`) REFERENCES `bo_mon` (`id_bo_mon`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `khoa_hoc` (
  `id_khoa_hoc` INT AUTO_INCREMENT PRIMARY KEY,
  `id_bo_mon` INT NOT NULL,
  `id_lop` INT,
  `id_mh` INT,
  `ten_khoa_hoc` VARCHAR(255) NOT NULL,
  `so_tiet` INT DEFAULT 36,
  `so_buoi_da_day` INT DEFAULT 0,
  `trang_thai_hoan_thanh` TINYINT(1) DEFAULT 0,
  `ngay_bat_dau` DECIMAL(18,2),
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_khoa_hoc_bm` FOREIGN KEY (`id_bo_mon`) REFERENCES `bo_mon` (`id_bo_mon`) ON DELETE CASCADE,
  CONSTRAINT `fk_khoa_hoc_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lop_hoc` (
  `id_lop` INT AUTO_INCREMENT PRIMARY KEY,
  `id_cn` INT NOT NULL,
  `id_kh` INT NOT NULL,
  `id_gv` INT,
  `id_mh` INT,
  `id_ky_hoc` INT,
  `id_bo_mon` INT,
  `ten_lop` VARCHAR(150) NOT NULL,
  `trang_thai` VARCHAR(50) DEFAULT 'DangMo',
  `si_so_toi_da` INT DEFAULT 20,
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_lop_hoc_cn` FOREIGN KEY (`id_cn`) REFERENCES `chi_nhanh` (`id_cn`) ON DELETE CASCADE,
  CONSTRAINT `fk_lop_hoc_gv` FOREIGN KEY (`id_gv`) REFERENCES `giao_vien` (`id_gv`) ON DELETE SET NULL,
  CONSTRAINT `fk_lop_hoc_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `hoc_sinh_khoa_hoc` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_hs` INT NOT NULL,
  `id_khoa_hoc` INT NOT NULL,
  `id_lop` INT,
  `ngay_dang_ky` DATE,
  `trang_thai` VARCHAR(50) DEFAULT 'DangHoc',
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_hs_kh_hs` FOREIGN KEY (`id_hs`) REFERENCES `hoc_sinh` (`id_hs`) ON DELETE CASCADE,
  CONSTRAINT `fk_hs_kh_kh` FOREIGN KEY (`id_khoa_hoc`) REFERENCES `khoa_hoc` (`id_khoa_hoc`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `dang_ky_hoc` (
  `id_dang_ky` INT AUTO_INCREMENT PRIMARY KEY,
  `id_hs` INT NOT NULL,
  `id_khoa_hoc` INT NOT NULL,
  `ngay_dang_ky` DATE,
  `so_tien_phai_dong` DECIMAL(18,2) DEFAULT 0.00,
  `trang_thai_thanh_toan` VARCHAR(50) DEFAULT 'ChuaThanhToan',
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_dang_ky_hs` FOREIGN KEY (`id_hs`) REFERENCES `hoc_sinh` (`id_hs`) ON DELETE CASCADE,
  CONSTRAINT `fk_dang_ky_kh` FOREIGN KEY (`id_khoa_hoc`) REFERENCES `khoa_hoc` (`id_khoa_hoc`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `bao_luu_khoa_hoc` (
  `id_bao_luu` INT AUTO_INCREMENT PRIMARY KEY,
  `id_hs` INT NOT NULL,
  `id_khoa_hoc` INT NOT NULL,
  `ngay_bao_luu` DATE NOT NULL,
  `thoi_han_thang` INT DEFAULT 3,
  `ly_do` TEXT,
  `so_buoi_con_lai` INT DEFAULT 0,
  `trang_thai` VARCHAR(50) DEFAULT 'DangBaoLuu',
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_bao_luu_hs` FOREIGN KEY (`id_hs`) REFERENCES `hoc_sinh` (`id_hs`) ON DELETE CASCADE,
  CONSTRAINT `fk_bao_luu_kh` FOREIGN KEY (`id_khoa_hoc`) REFERENCES `khoa_hoc` (`id_khoa_hoc`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `khung_lich_hoc_co_dinh` (
  `id_khung_lich` INT AUTO_INCREMENT PRIMARY KEY,
  `id_lop` INT NOT NULL,
  `thu_trong_tuan` INT NOT NULL, -- 2: Thứ 2, 3: Thứ 3...
  `ca_hoc` INT NOT NULL,
  `gio_bat_dau` TIME NOT NULL,
  `gio_ket_thuc` TIME NOT NULL,
  `id_phong` INT NOT NULL,
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_khung_lich_lop` FOREIGN KEY (`id_lop`) REFERENCES `lop_hoc` (`id_lop`) ON DELETE CASCADE,
  CONSTRAINT `fk_khung_lich_phong` FOREIGN KEY (`id_phong`) REFERENCES `phong_hoc` (`id_phong`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `thoi_khoa_bieu_tuan` (
  `id_tkb_tuan` INT AUTO_INCREMENT PRIMARY KEY,
  `id_lop` INT NOT NULL,
  `id_tuan` INT,
  `ghi_chu` TEXT,
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_tkb_tuan_lop` FOREIGN KEY (`id_lop`) REFERENCES `lop_hoc` (`id_lop`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `buoi_hoc` (
  `id_buoi_hoc` INT AUTO_INCREMENT PRIMARY KEY,
  `id_tkb_tuan` INT,
  `id_khoa_hoc` INT NOT NULL,
  `id_lop` INT NOT NULL,
  `id_phong` INT NOT NULL,
  `ngay_hoc` DATE NOT NULL,
  `ca_hoc` INT,
  `gio_bat_dau` TIME,
  `gio_ket_thuc` TIME,
  `noi_dung` TEXT,
  `id_dn` INT NOT NULL,
  `id_th` INT,
  `id_tuan` INT,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_buoi_hoc_lop` FOREIGN KEY (`id_lop`) REFERENCES `lop_hoc` (`id_lop`) ON DELETE CASCADE,
  CONSTRAINT `fk_buoi_hoc_phong` FOREIGN KEY (`id_phong`) REFERENCES `phong_hoc` (`id_phong`) ON DELETE CASCADE,
  CONSTRAINT `fk_buoi_hoc_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `diem_danh_hoc_sinh` (
  `id_diem_danh` INT AUTO_INCREMENT PRIMARY KEY,
  `id_buoi_hoc` INT NOT NULL,
  `id_khoa_hoc` INT NOT NULL,
  `id_hs` INT NOT NULL,
  `trang_thai` TINYINT(1) DEFAULT 1, -- 1: Có mặt, 0: Vắng
  `ghi_chu` VARCHAR(255),
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_dd_hs_buoi` FOREIGN KEY (`id_buoi_hoc`) REFERENCES `buoi_hoc` (`id_buoi_hoc`) ON DELETE CASCADE,
  CONSTRAINT `fk_dd_hs_hs` FOREIGN KEY (`id_hs`) REFERENCES `hoc_sinh` (`id_hs`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `diem_danh_giao_vien` (
  `id_dd_gv` INT AUTO_INCREMENT PRIMARY KEY,
  `id_buoi_hoc` INT NOT NULL,
  `id_gv` INT NOT NULL,
  `co_mat` TINYINT(1) DEFAULT 1,
  `so_gio_day` DECIMAL(4,2) DEFAULT 2.00,
  `ghi_chu` VARCHAR(255),
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_dd_gv_buoi` FOREIGN KEY (`id_buoi_hoc`) REFERENCES `buoi_hoc` (`id_buoi_hoc`) ON DELETE CASCADE,
  CONSTRAINT `fk_dd_gv_gv` FOREIGN KEY (`id_gv`) REFERENCES `giao_vien` (`id_gv`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. BẢNG TÀI CHÍNH, HỌC PHÍ, LƯƠNG & SỔ QUỸ
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS `thu_chi_tuan_hoc`;
DROP TABLE IF EXISTS `thu_chi_thang_hoc`;
DROP TABLE IF EXISTS `thu_chi_ky_hoc`;
DROP TABLE IF EXISTS `thu_chi_nam_hoc`;
DROP TABLE IF EXISTS `so_quy_thu_chi`;
DROP TABLE IF EXISTS `thanh_toan_giao_vien_khoa_hoc`;
DROP TABLE IF EXISTS `thanh_toan_giao_vien`;
DROP TABLE IF EXISTS `thanh_toan_hoc_phi_khoa_hoc_hoc_sinh`;
DROP TABLE IF EXISTS `phieu_thu_hoc_phi`;

CREATE TABLE `phieu_thu_hoc_phi` (
  `id_phieu_thu` INT AUTO_INCREMENT PRIMARY KEY,
  `id_dang_ky` INT,
  `id_hs` INT NOT NULL,
  `id_khoa_hoc` INT,
  `id_thanh_toan_kh` INT,
  `id_thang_hoc` INT,
  `id_tuan_hoc` INT,
  `id_tc_thang` INT,
  `id_tc_tuan` INT,
  `so_tien_thu` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `phan_tram_giam` DECIMAL(5,2) DEFAULT 0.00,
  `ngay_thu` DATE DEFAULT (CURRENT_DATE),
  `phuong_thuc` VARCHAR(50) DEFAULT 'TIEN_MAT', -- TIEN_MAT, CHUYEN_KHOAN, QUET_THE
  `ghi_chu` TEXT,
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_phieu_thu_hs` FOREIGN KEY (`id_hs`) REFERENCES `hoc_sinh` (`id_hs`) ON DELETE CASCADE,
  CONSTRAINT `fk_phieu_thu_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `thanh_toan_hoc_phi_khoa_hoc_hoc_sinh` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `id_hs` INT NOT NULL,
  `id_khoa_hoc` INT NOT NULL,
  `tong_tien_hoc_phi` DECIMAL(18,2) DEFAULT 0.00,
  `da_dong` DECIMAL(18,2) DEFAULT 0.00,
  `con_no` DECIMAL(18,2) DEFAULT 0.00,
  `trang_thai` VARCHAR(50) DEFAULT 'ChuaXong',
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_tt_hp_hs` FOREIGN KEY (`id_hs`) REFERENCES `hoc_sinh` (`id_hs`) ON DELETE CASCADE,
  CONSTRAINT `fk_tt_hp_kh` FOREIGN KEY (`id_khoa_hoc`) REFERENCES `khoa_hoc` (`id_khoa_hoc`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `thanh_toan_giao_vien` (
  `id_tt_gv` INT AUTO_INCREMENT PRIMARY KEY,
  `id_gv` INT NOT NULL,
  `id_thang_hoc` INT,
  `so_buoi_day` INT DEFAULT 0,
  `tong_tien_luong` DECIMAL(18,2) DEFAULT 0.00,
  `ngay_chi` DATE,
  `trang_thai` VARCHAR(50) DEFAULT 'DaThanhToan',
  `id_dn` INT NOT NULL,
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_tt_gv_gv` FOREIGN KEY (`id_gv`) REFERENCES `giao_vien` (`id_gv`) ON DELETE CASCADE,
  CONSTRAINT `fk_tt_gv_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `so_quy_thu_chi` (
  `id_giao_dich` INT AUTO_INCREMENT PRIMARY KEY,
  `id_dn` INT NOT NULL,
  `id_cn` INT,
  `loai_giao_dich` VARCHAR(20) NOT NULL, -- THU, CHI
  `so_tien` DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `ngay_giao_dich` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `hang_muc` VARCHAR(150),
  `noi_dung` TEXT,
  `nguoi_thuc_hien` VARCHAR(100),
  `xoa` TINYINT(1) DEFAULT 0,
  CONSTRAINT `fk_so_quy_dn` FOREIGN KEY (`id_dn`) REFERENCES `doanh_nghiep` (`id_dn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. SEED DATA MẪU KHỞI TẠO HỆ THỐNG
-- -----------------------------------------------------------------------------

-- Doanh nghiệp & Chi nhánh
INSERT INTO `doanh_nghiep` (`id_dn`, `ten_doanh_nghiep`, `ma_so_thue`, `dia_chi`, `so_dien_thoai`, `email`)
VALUES (1, 'Trung Tâm Giáo Dục & Đào Tạo Tri Thức Việt', '0108999888', 'Số 3 Cầu Giấy, Hà Nội', '0243.888.9999', 'info@trithucviet.edu.vn');

INSERT INTO `chi_nhanh` (`id_cn`, `id_dn`, `ten_cn`, `dia_chi`, `sdt`) VALUES 
(1, 1, 'Cơ sở 1 - Cầu Giấy', 'Tòa nhà A, Số 3 Cầu Giấy, Hà Nội', '0912.345.678'),
(2, 1, 'Cơ sở 2 - Đống Đa', 'Số 12 Chùa Lộc, Đống Đa, Hà Nội', '0988.765.432');

INSERT INTO `phong_hoc` (`id_phong`, `id_cn`, `ten_phong`, `suc_chua`, `trang_thai`, `id_dn`) VALUES
(1, 1, 'Phòng 101 (Phòng lý thuyết)', 25, 'HoatDong', 1),
(2, 1, 'Phòng 201 (Phòng Lab Tin học)', 30, 'HoatDong', 1),
(3, 2, 'Phòng 301 (Phòng Ngoại ngữ)', 20, 'HoatDong', 1);

-- Cổ đông
INSERT INTO `chu_co_dong` (`id_ccd`, `id_dn`, `ho_ten`, `so_dien_thoai`, `email`, `cccd`) VALUES
(1, 1, 'Nguyễn Văn An', '0912.345.678', 'an.nv@trithucviet.edu.vn', '001200001234'),
(2, 1, 'Trần Minh Tuấn', '0988.111.222', 'tuan.tm@trithucviet.edu.vn', '001200005678');

INSERT INTO `gop_von_so_huu` (`id_gop_von`, `id_ccd`, `id_dn`, `so_tien_gop`, `ti_le_phan_tram`, `ngay_gop`) VALUES
(1, 1, 1, 600000000.00, 60.00, '2025-01-10'),
(2, 2, 1, 400000000.00, 40.00, '2025-01-10');

-- Tài khoản người dùng (Mật khẩu: 123456)
-- Hash BCrypt mẫu: $2a$11$qR0qZ/tL... hoặc text 123456
INSERT INTO `tai_khoan` (`id_tk`, `ten_dang_nhap`, `mat_khau`, `trang_thai`, `id_tai_khoan_vai_tro`) VALUES
(1, 'admin_an', '123456', 'HoatDong', 1),
(2, 'quanly_caugiay', '123456', 'HoatDong', 1),
(3, 'gv_hoangyen', '123456', 'HoatDong', 1);

INSERT INTO `tai_khoan_admin` (`id_tk_admin`, `id_tk`, `id_admin`) VALUES (1, 1, 1);
INSERT INTO `tai_khoan_ql` (`id_tk_ql`, `id_tk`, `id_ql`) VALUES (1, 2, 1);
INSERT INTO `tai_khoan_gv` (`id_tk_gv`, `id_tk`, `id_gv`) VALUES (1, 3, 1);

-- Đội ngũ Nhân sự & Giáo viên
INSERT INTO `admin` (`id_admin`, `id_dn`, `ho_ten`, `so_dien_thoai`, `email`) VALUES
(1, 1, 'Nguyễn Văn An', '0912.345.678', 'an.nv@trithucviet.edu.vn');

INSERT INTO `quan_ly` (`id_ql`, `id_dn`, `id_cn`, `ho_ten`, `so_dien_thoai`, `email`, `chuc_vu`) VALUES
(1, 1, 1, 'Phạm Quốc Bảo', '0903.444.555', 'bao.pq@trithucviet.edu.vn', 'Trưởng cơ sở Cầu Giấy');

INSERT INTO `giao_vien` (`id_gv`, `id_dn`, `ho_ten`, `gioi_tinh`, `ngay_sinh`, `sdt`, `email`, `con_hoat_dong`) VALUES
(1, 1, 'ThS. Lê Hoàng Yến', 'Nu', '1992-05-18', '0903.111.222', 'yen.lh@trithucviet.edu.vn', 1),
(2, 1, 'Thầy Nguyễn Văn Nam', 'Nam', '1989-11-20', '0977.888.999', 'nam.nv@trithucviet.edu.vn', 1);

INSERT INTO `chi_tiet_gv` (`id_chi_tiet_gv`, `id_gv`, `luong_co_ban`, `don_gia_buoi_day`, `so_tai_khoan_nh`, `ten_ngan_hang`) VALUES
(1, 1, 5000000.00, 350000.00, '190333888999', 'Techcombank'),
(2, 2, 6000000.00, 400000.00, '102888777666', 'Vietcombank');

INSERT INTO `chuyen_mon` (`id_cm`, `ten_chuyen_mon`, `mo_ta`, `id_dn`) VALUES
(1, 'Tiếng Anh IELTS', 'Luyện thi chứng chỉ IELTS 6.5 - 8.0', 1),
(2, 'Lập Trình Web & Phần Mềm', 'Đào tạo C#, .NET Core, React, SQL', 1);

INSERT INTO `giao_vien_chuyen_mon` (`id_gv`, `id_cm`) VALUES (1, 1), (2, 2);
INSERT INTO `giao_vien_chi_nhanh` (`id_gv`, `id_cn`) VALUES (1, 1), (2, 1);

-- Khung đào tạo
INSERT INTO `nam_hoc` (`id_nam_hoc`, `id_dn`, `ten_nam_hoc`, `nam_bat_dau`, `nam_ket_thuc`) VALUES
(1, 1, '2026 - 2027', 2026, 2027);

INSERT INTO `ky_hoc` (`id_ky_hoc`, `id_nam_hoc`, `ten_ky_hoc`, `id_dn`) VALUES
(1, 1, 'Học kỳ 1 (Thu - Đông)', 1),
(2, 1, 'Học kỳ 2 (Xuân - Hè)', 1);

INSERT INTO `bo_mon` (`id_bo_mon`, `ten_bo_mon`, `mo_ta`, `id_dn`) VALUES
(1, 'Khoa Ngoại Ngữ', 'Các chương trình đào tạo chứng chỉ tiếng Anh quốc tế', 1),
(2, 'Khoa Công Nghệ Thông Tin', 'Đào tạo lập trình ứng dụng doanh nghiệp', 1);

INSERT INTO `khoa_hoc` (`id_khoa_hoc`, `id_bo_mon`, `ten_khoa_hoc`, `so_tiet`, `so_buoi_da_day`, `trang_thai_hoan_thanh`, `id_dn`) VALUES
(1, 1, 'IELTS Master 6.5+ Toàn Diện', 36, 12, 0, 1),
(2, 2, 'Lập Trình Fullstack .NET & React', 40, 8, 0, 1);

INSERT INTO `lop_hoc` (`id_lop`, `id_cn`, `id_kh`, `id_gv`, `id_ky_hoc`, `id_bo_mon`, `ten_lop`, `trang_thai`, `si_so_toi_da`, `id_dn`) VALUES
(1, 1, 1, 1, 1, 1, 'IELTS Intensive 01', 'DangMo', 20, 1),
(2, 1, 2, 2, 1, 2, 'React .NET K64', 'DangMo', 25, 1);

-- Phụ huynh & Học sinh
INSERT INTO `phu_huynh` (`id_ph`, `ho_ten`, `so_dien_thoai`, `email`, `dia_chi`, `id_dn`) VALUES
(1, 'Nguyễn Văn Bình', '0912.345.678', 'binh.nv@gmail.com', 'Cầu Giấy, Hà Nội', 1),
(2, 'Trần Văn Long', '0988.765.432', 'long.tv@gmail.com', 'Thanh Xuân, Hà Nội', 1);

INSERT INTO `hoc_sinh` (`id_hs`, `id_ph`, `id_dn`, `ho_ten`, `ngay_sinh`, `gioi_tinh`, `so_dien_thoai`, `cccd`, `dia_chi`) VALUES
(1, 1, 1, 'Nguyễn Văn An', '2010-04-12', 'Nam', '0912.345.678', '001201001111', 'Cầu Giấy, Hà Nội'),
(2, 2, 1, 'Trần Bảo Nam', '2012-09-08', 'Nam', '0988.765.432', '001201202222', 'Thanh Xuân, Hà Nội'),
(3, 1, 1, 'Lê Hoàng Yến', '2011-02-25', 'Nu', '0903.111.222', '001201103333', 'Đống Đa, Hà Nội'),
(4, 2, 1, 'Phạm Đức Minh', '2010-10-15', 'Nam', '0977.888.999', '001201004444', 'Hà Đông, Hà Nội'),
(5, 1, 1, 'Vũ Thùy Linh', '2012-07-30', 'Nu', '0936.555.777', '001201205555', 'Ba Đình, Hà Nội');

-- Gán học sinh vào khóa học & lớp
INSERT INTO `hoc_sinh_khoa_hoc` (`id_hs`, `id_khoa_hoc`, `id_lop`, `ngay_dang_ky`, `trang_thai`, `id_dn`) VALUES
(1, 1, 1, '2026-09-01', 'DangHoc', 1),
(2, 1, 1, '2026-09-02', 'DangHoc', 1),
(3, 1, 1, '2026-09-03', 'DangHoc', 1),
(4, 1, 1, '2026-09-04', 'DangHoc', 1),
(5, 1, 1, '2026-09-05', 'DangHoc', 1);

-- Buổi học & Điểm danh
INSERT INTO `buoi_hoc` (`id_buoi_hoc`, `id_khoa_hoc`, `id_lop`, `id_phong`, `ngay_hoc`, `ca_hoc`, `gio_bat_dau`, `gio_ket_thuc`, `noi_dung`, `id_dn`) VALUES
(1, 1, 1, 1, '2026-10-20', 1, '08:00:00', '10:00:00', 'Unit 12: IELTS Writing Task 2 - Opinion Essays', 1);

INSERT INTO `diem_danh_hoc_sinh` (`id_buoi_hoc`, `id_khoa_hoc`, `id_hs`, `trang_thai`, `ghi_chu`, `id_dn`) VALUES
(1, 1, 1, 1, 'Chuẩn bị bài đầy đủ, hăng hái', 1),
(1, 1, 2, 0, 'Phụ huynh xin nghỉ ốm', 1),
(1, 1, 3, 1, 'Đạt điểm tối đa bài test 15 phút', 1),
(1, 1, 4, 0, 'Vắng không phép', 1),
(1, 1, 5, 1, 'Đi học đúng giờ', 1);

-- Phiếu thu học phí & Sổ quỹ
INSERT INTO `phieu_thu_hoc_phi` (`id_phieu_thu`, `id_hs`, `id_khoa_hoc`, `so_tien_thu`, `phan_tram_giam`, `ngay_thu`, `phuong_thuc`, `ghi_chu`, `id_dn`) VALUES
(1, 1, 1, 6000000.00, 0.00, '2026-09-01', 'CHUYEN_KHOAN', 'Đã thu trọn gói 36 buổi khóa IELTS', 1),
(2, 2, 1, 5100000.00, 15.00, '2026-09-02', 'CHUYEN_KHOAN', 'Học bổng đầu khóa 15%', 1);

INSERT INTO `so_quy_thu_chi` (`id_giao_dich`, `id_dn`, `id_cn`, `loai_giao_dich`, `so_tien`, `ngay_giao_dich`, `hang_muc`, `noi_dung`, `nguoi_thuc_hien`) VALUES
(1, 1, 1, 'THU', 6000000.00, '2026-09-01 09:30:00', 'Thu học phí', 'Thu học phí học viên Nguyễn Văn An', 'Quản lý cơ sở'),
(2, 1, 1, 'THU', 5100000.00, '2026-09-02 10:15:00', 'Thu học phí', 'Thu học phí học viên Trần Bảo Nam', 'Quản lý cơ sở');

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- HOÀN TẤT BUILD DATABASE & SEED DATA!
-- =============================================================================
