CREATE DATABASE webtuyendung;
USE webtuyendung;

-- 1. Bảng Người Dùng (NHÀ TUYỂN DỤNG, NGƯỜI XIN VIỆC, ADMIN)
CREATE TABLE Nguoi_Dung (
    id_nguoidung INT AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mat_khau VARCHAR(255) NOT NULL,
    vai_tro ENUM('nguoitimviec', 'nhatuyendung', 'quantri') NOT NULL,
    trang_thai ENUM('active', 'locked') DEFAULT 'active',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_capnhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Bảng Công Ty (NHÀ TUYỂN DỤNG)
CREATE TABLE Cong_Ty (
    id_congty INT AUTO_INCREMENT PRIMARY KEY,
    id_nhatuyendung INT NOT NULL,
    ten_congty VARCHAR(150) NOT NULL,
    nganh_nghe VARCHAR(100) NOT NULL,
    mo_ta TEXT,
    dia_chi VARCHAR(200),
    website VARCHAR(200),
    logo TEXT,
    FOREIGN KEY (id_nhatuyendung) REFERENCES Nguoi_Dung(id_nguoidung)
);

-- 3. Bảng Danh Mục Kỹ Năng
CREATE TABLE Danh_Muc_Ky_Nang (
    id_kynang INT AUTO_INCREMENT PRIMARY KEY,
    ten_kynang VARCHAR(100) NOT NULL
);

-- 4. Bảng Công Việc (NHÀ TUYỂN DỤNG)
CREATE TABLE Cong_Viec (
    id_congviec INT AUTO_INCREMENT PRIMARY KEY,
    id_nhatuyendung INT NOT NULL,
    id_congty INT NOT NULL,
    tieu_de VARCHAR(150) NOT NULL,
    mo_ta TEXT NOT NULL,
    yeu_cau TEXT NOT NULL,
    luong DECIMAL(15, 2) NOT NULL,
    dia_diem VARCHAR(200) NOT NULL,
    ngay_dang DATE NOT NULL,
    ngay_het_han DATE NOT NULL,
    trang_thai ENUM('hoatdong', 'khonghoatdong') NOT NULL,
    FOREIGN KEY (id_nhatuyendung) REFERENCES Nguoi_Dung(id_nguoidung),
    FOREIGN KEY (id_congty) REFERENCES Cong_Ty(id_congty)
);

-- 5. Bảng Hồ Sơ Cá Nhân (NGƯỜI XIN VIỆC)
CREATE TABLE Ho_So_Ca_Nhan (
    id_hoso INT AUTO_INCREMENT PRIMARY KEY,
    id_nguoitimviec INT NOT NULL,
    so_dien_thoai VARCHAR(15) NOT NULL,
    gioi_tinh ENUM('Nam', 'Nữ', 'Khác') NOT NULL,
    ky_nang TEXT NOT NULL,
    kinh_nghiem TEXT NOT NULL,
    hoc_van TEXT NOT NULL,
    ngay_tai_len TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nguoitimviec) REFERENCES Nguoi_Dung(id_nguoidung)
);


-- 6. Bảng Hồ Sơ Ứng Tuyển (NHÀ TUYỂN DỤNG, NGƯỜI XIN VIỆC)
CREATE TABLE Ho_So_Ung_Tuyen (
    id_hoso INT AUTO_INCREMENT PRIMARY KEY,
    id_congviec INT NOT NULL,
    id_nguoitimviec INT NOT NULL,
    trang_thai ENUM('daxuly', 'choxuly', 'dachapnhan', 'bituchoi') NOT NULL,
    ngay_nop TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_congviec) REFERENCES Cong_Viec(id_congviec),
    FOREIGN KEY (id_nguoitimviec) REFERENCES Nguoi_Dung(id_nguoidung)
);

-- 7. Bảng Thông Báo (NHÀ TUYỂN DỤNG, NGƯỜI XIN VIỆC)
CREATE TABLE Thong_Bao (
    id_thongbao INT AUTO_INCREMENT PRIMARY KEY,
    id_nguoidung INT NOT NULL,
    noi_dung TEXT NOT NULL,
    loai ENUM('congviec', 'hoso', 'hethong') NOT NULL,
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nguoidung) REFERENCES Nguoi_Dung(id_nguoidung)
);

-- 8. Bảng Quản Trị Hoạt Động (ADMIN)
CREATE TABLE Quan_Tri_Hoat_Dong (
    id_hoatdong INT AUTO_INCREMENT PRIMARY KEY,
    id_quantri INT NOT NULL,
    loai_hoatdong ENUM('chan_nguoidung', 'xoa_congviec', 'phe_duyet_hoso') NOT NULL,
    ngay_thuchien TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_quantri) REFERENCES Nguoi_Dung(id_nguoidung)
);

-- 9. Bảng Liên Kết Công Việc và Kỹ Năng (NHÀ TUYỂN DỤNG)
CREATE TABLE Cong_Viec_Ky_Nang (
    id_congviec INT NOT NULL,
    id_kynang INT NOT NULL,
    PRIMARY KEY (id_congviec, id_kynang),
    FOREIGN KEY (id_congviec) REFERENCES Cong_Viec(id_congviec),
    FOREIGN KEY (id_kynang) REFERENCES Danh_Muc_Ky_Nang(id_kynang)
);

-- 10. Bảng Tài Liệu Công Việc (NHÀ TUYỂN DỤNG)
CREATE TABLE Tai_Lieu_Cong_Viec (
    id_tailieu INT AUTO_INCREMENT PRIMARY KEY,
    id_congviec INT NOT NULL,
    duong_dan VARCHAR(255) NOT NULL,
    loai ENUM('pdf', 'image', 'other') NOT NULL,
    ngay_tai_len TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_congviec) REFERENCES Cong_Viec(id_congviec)
);


-- 11. Bảng Lịch Sử Công Việc (NHÀ TUYỂN DỤNG)
CREATE TABLE Lich_Su_Cong_Viec (
    id_lichsu INT AUTO_INCREMENT PRIMARY KEY,
    id_congviec INT NOT NULL,
    id_nhatuyendung INT NOT NULL,
    tieu_de_cu VARCHAR(150),
    mo_ta_cu TEXT,
    ngay_chinh_sua TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_congviec) REFERENCES Cong_Viec(id_congviec),
    FOREIGN KEY (id_nhatuyendung) REFERENCES Nguoi_Dung(id_nguoidung)
);

-- 12. Bảng Thống Kê Công Việc (NHÀ TUYỂN DỤNG)
CREATE TABLE Thong_Ke_Cong_Viec (
    id_thongke INT AUTO_INCREMENT PRIMARY KEY,
    id_congviec INT NOT NULL,
    luot_xem INT DEFAULT 0,
    luot_ung_tuyen INT DEFAULT 0,
    ngay_cap_nhat TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_congviec) REFERENCES Cong_Viec(id_congviec)
);

-- 13. Bảng Ứng Viên Lưu (NHÀ TUYỂN DỤNG)
CREATE TABLE Ung_Vien_Luu (
    id_luu INT AUTO_INCREMENT PRIMARY KEY,
    id_nhatuyendung INT NOT NULL,
    id_nguoitimviec INT NOT NULL,
    ghi_chu TEXT,
    ngay_luu TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nhatuyendung) REFERENCES Nguoi_Dung(id_nguoidung),
    FOREIGN KEY (id_nguoitimviec) REFERENCES Nguoi_Dung(id_nguoidung)
);

-- 14. Bảng Phản Hồi (NHÀ TUYỂN DỤNG)
CREATE TABLE Phan_Hoi (
    id_phanhoi INT AUTO_INCREMENT PRIMARY KEY,
    id_hoso INT NOT NULL,
    id_nhatuyendung INT NOT NULL,
    noi_dung TEXT NOT NULL,
    ngay_gui TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_hoso) REFERENCES Ho_So_Ung_Tuyen(id_hoso),
    FOREIGN KEY (id_nhatuyendung) REFERENCES Nguoi_Dung(id_nguoidung)
);
