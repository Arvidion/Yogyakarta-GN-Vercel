-- Schema for MySQL (reference). Adjust types for your DB as needed.

CREATE TABLE Negara (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_iso CHAR(2) NOT NULL UNIQUE,
    nama VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS Bidang (
  id INT AUTO_INCREMENT PRIMARY KEY,
  jenis VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Partner (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  tipe ENUM ('Mitra Utama', 'Mitra Teknis', 'Mitra Non-Teknis', 'Pelaksana/Pendukung Non-Mitra') NOT NULL,
  negara_id INT NOT NULL,
  kota VARCHAR(255) NOT NULL,
  jenis VARCHAR(255),
  status ENUM ('Aktif', 'Tidak aktif', 'Selesai') NOT NULL,
  deskripsi TEXT,
  situs1 VARCHAR(255),
  gambar JSON,
  FOREIGN KEY (negara_id) REFERENCES Negara(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS PartnerBidangs (
  PartnerId INT NOT NULL,
  BidangId INT NOT NULL,
  PRIMARY KEY (PartnerId, BidangId),
  FOREIGN KEY (PartnerId) REFERENCES Partner(id) ON DELETE CASCADE,
  FOREIGN KEY (BidangId) REFERENCES Bidang(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Program (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  partner_id INT,
  negara_id INT,
  tanggal DATE,
  lokasi VARCHAR(255),
  status ENUM ('Aktif', 'Tidak aktif', 'Selesai'),
  deskripsi TEXT,
  situs TEXT,
  gambar JSON,
  dokumen JSON,
  FOREIGN KEY (partner_id) REFERENCES Partner(id) ON DELETE SET NULL,
  FOREIGN KEY (negara_id) REFERENCES Negara(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ProgramBidangs (
  ProgramId INT NOT NULL,
  BidangId INT NOT NULL,
  PRIMARY KEY (ProgramId, BidangId),
  FOREIGN KEY (ProgramId) REFERENCES Program(id) ON DELETE CASCADE,
  FOREIGN KEY (BidangId) REFERENCES Bidang(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS User (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

