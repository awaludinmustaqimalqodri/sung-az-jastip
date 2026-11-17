-- Database: db_sung_az_jastip

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    no_hp VARCHAR(20),
    alamat TEXT,
    role ENUM('pembeli', 'owner') DEFAULT 'pembeli',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE produk_jastip (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_produk VARCHAR(150) NOT NULL,
    kategori ENUM('Tiket Konser', 'Fashion', 'Elektronik', 'Kuliner', 'Request Jastip') NOT NULL,
    harga_asli DECIMAL(12,2) NOT NULL,
    biaya_jastip DECIMAL(12,2) NOT NULL,
    gambar_url TEXT,
    deskripsi TEXT,
    is_custom_request BOOLEAN DEFAULT FALSE,
    status_verifikasi ENUM('Disetujui', 'Menunggu Harga Owner') DEFAULT 'Disetujui'
);

CREATE TABLE pesanan (
    id VARCHAR(20) PRIMARY KEY, -- Contoh: INV-2026001
    user_id INT,
    produk_id INT,
    harga_barang DECIMAL(12,2) NOT NULL,
    biaya_jastip DECIMAL(12,2) NOT NULL,
    ongkir DECIMAL(12,2) NOT NULL,
    total_bayar DECIMAL(12,2) NOT NULL,
    metode_pembayaran ENUM('QRIS', 'Transfer Bank', 'E-Wallet / COD') NOT NULL,
    bukti_transfer_url TEXT NULL,
    status_pembayaran ENUM('Menunggu Verifikasi', 'Lunas') DEFAULT 'Menunggu Verifikasi',
    status_pesanan ENUM('Pending', 'Diproses', 'Belanja', 'Siap Dikirim', 'Sedang Diantar', 'Selesai') DEFAULT 'Pending',
    alamat_tujuan TEXT NOT NULL,
    jarak_km INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (produk_id) REFERENCES produk_jastip(id)
);