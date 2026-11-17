const DB_KEY = 'sung_az_jastip_db_v1';

const initialData = {
    produk: [
        {
            id: 1,
            nama: 'Tiket Konser Coldplay Jakarta (CAT 1)',
            kategori: 'Tiket Konser',
            hargaAsli: 2500000,
            jastipFee: 250000,
            gambar: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=500&q=80',
            status: 'Disetujui'
        },
        {
            id: 2,
            nama: 'Jaket Windbreaker Outdoor Series',
            kategori: 'Fashion',
            hargaAsli: 450000,
            jastipFee: 45000,
            gambar: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&q=80',
            status: 'Disetujui'
        },
        {
            id: 3,
            nama: 'TWS ANC Wireless Earbuds Pro',
            kategori: 'Elektronik',
            hargaAsli: 890000,
            jastipFee: 60000,
            gambar: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80',
            status: 'Disetujui'
        },
        {
            id: 4,
            nama: 'Bolu Susu Lembang & Bakpia Kukus',
            kategori: 'Kuliner',
            hargaAsli: 120000,
            jastipFee: 25000,
            gambar: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
            status: 'Disetujui'
        }
    ],
    pesanan: [
        {
            id: 'SAZ-202601',
            produkNama: 'Jaket Windbreaker Outdoor Series',
            hargaAsli: 450000,
            jastipFee: 45000,
            ongkir: 15000,
            total: 510000,
            metodeBayar: 'QRIS',
            statusBayar: 'Lunas',
            statusPesanan: 'Sedang Diantar',
            kurir: 'JNE REG',
            alamat: 'Alamat demo, Kab. Bogor'
        }
    ]
};

function getDB() {
    const saved = localStorage.getItem(DB_KEY);
    if (!saved) {
        localStorage.setItem(DB_KEY, JSON.stringify(initialData));
        return initialData;
    }
    const data = JSON.parse(saved);
    const hasCourierData = 'kurir' in data || data.pesanan.some(order =>
        Object.prototype.hasOwnProperty.call(order, 'kurirId')
    );

    if (hasCourierData) {
        delete data.kurir;
        data.pesanan = data.pesanan.map(({ kurirId, ...order }) => order);
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    }

    return data;
}

function saveDB(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}