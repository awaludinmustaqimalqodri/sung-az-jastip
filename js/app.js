let selectedProduct = null;
let salesChartInstance = null;

const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

// --- INISIALISASI HALAMAN ---
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('katalog-grid')) {
        renderKatalog('Semua');
        renderUserOrders();
    }
});

// --- SWITCH ROLE (PEMBELI VS OWNER) ---
function switchRole(role) {
    const viewPembeli = document.getElementById('view-pembeli');
    const viewOwner = document.getElementById('view-owner');
    const btnPembeli = document.getElementById('btn-role-pembeli');
    const btnOwner = document.getElementById('btn-role-owner');

    if (role === 'pembeli') {
        viewPembeli.classList.remove('hidden');
        viewOwner.classList.add('hidden');
        btnPembeli.className = 'px-4 py-2 rounded-lg text-sm font-bold bg-sungTeal text-white transition';
        btnOwner.className = 'px-4 py-2 rounded-lg text-sm font-bold text-slate-600 transition';
        renderKatalog('Semua');
        renderUserOrders();
    } else {
        viewPembeli.classList.add('hidden');
        viewOwner.classList.remove('hidden');
        btnOwner.className = 'px-4 py-2 rounded-lg text-sm font-bold bg-sungOrange text-white transition';
        btnPembeli.className = 'px-4 py-2 rounded-lg text-sm font-bold text-slate-600 transition';
        renderOwnerDashboard();
    }
}

// --- NAVIGASI TAB PEMBELI ---
function showUserTab(tab) {
    ['katalog', 'riwayat', 'profil'].forEach(t => {
        document.getElementById(`tab-user-${t}`).classList.add('hidden');
    });
    document.getElementById(`tab-user-${tab}`).classList.remove('hidden');
}

// --- KATALOG & FILTER KATEGORI ---
function filterKategori(kat) {
    renderKatalog(kat);
}

function renderKatalog(kategori) {
    const db = getDB();
    const grid = document.getElementById('katalog-grid');
    const filtered = kategori === 'Semua' 
        ? db.produk 
        : db.produk.filter(p => p.kategori === kategori);

    grid.innerHTML = filtered.map(p => `
        <div class="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden border flex flex-col justify-between">
            <div>
                <div class="relative">
                    <img src="${p.gambar}" class="h-48 w-full object-cover">
                    <span class="absolute top-3 left-3 bg-sungDark/85 text-white text-xs font-bold px-3 py-1 rounded-full">${p.kategori}</span>
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-base text-sungDark">${p.nama}</h3>
                    <div class="mt-3 space-y-1 text-xs text-slate-600">
                        <div class="flex justify-between"><span>Harga Barang:</span> <strong>${formatRupiah(p.hargaAsli)}</strong></div>
                        <div class="flex justify-between text-sungOrange"><span>Jastip Fee:</span> <strong>${p.status === 'Menunggu Harga Owner' ? 'Menunggu Review' : formatRupiah(p.jastipFee)}</strong></div>
                    </div>
                </div>
            </div>
            <div class="p-4 pt-0">
                ${p.status === 'Disetujui' 
                    ? `<button onclick="openCheckout(${p.id})" class="w-full bg-sungTeal hover:bg-sungDark text-white font-bold py-2.5 rounded-xl text-sm transition">Titip Sekarang</button>`
                    : `<button disabled class="w-full bg-slate-200 text-slate-500 font-bold py-2.5 rounded-xl text-xs cursor-not-allowed">Menunggu Penetapan Fee Owner</button>`
                }
            </div>
        </div>
    `).join('');
}

// --- REQUEST JASTIP CUSTOM ---
function openRequestModal() {
    document.getElementById('request-modal').classList.remove('hidden');
}

function submitCustomRequest(e) {
    e.preventDefault();
    const db = getDB();
    const newReq = {
        id: Date.now(),
        nama: `[Request] ${document.getElementById('req-nama').value}`,
        kategori: 'Request Jastip',
        hargaAsli: Number(document.getElementById('req-harga').value),
        jastipFee: 0,
        gambar: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=80',
        status: 'Menunggu Harga Owner'
    };
    db.produk.unshift(newReq);
    saveDB(db);
    document.getElementById('request-modal').classList.add('hidden');
    e.target.reset();
    renderKatalog('Semua');
    alert('Request Jastip berhasil dikirim! Silakan cek Dashboard Owner untuk menetapkan Jastip Fee.');
}

// --- CHECKOUT & KALKULATOR TRANSPARAN ---
function openCheckout(productId) {
    const db = getDB();
    selectedProduct = db.produk.find(p => p.id === productId);
    document.getElementById('checkout-item-info').innerHTML = `
        <p class="font-bold text-sungDark">${selectedProduct.nama}</p>
        <p class="text-xs text-slate-500">Kategori: ${selectedProduct.kategori}</p>
    `;
    document.getElementById('checkout-modal').classList.remove('hidden');
    recalculateCheckout();
    togglePaymentDetails();
}

function closeCheckout() {
    document.getElementById('checkout-modal').classList.add('hidden');
}

function recalculateCheckout() {
    if (!selectedProduct) return;
    const ongkir = 0;
    const total = selectedProduct.hargaAsli + selectedProduct.jastipFee + ongkir;

    document.getElementById('calc-harga').innerText = formatRupiah(selectedProduct.hargaAsli);
    document.getElementById('calc-fee').innerText = formatRupiah(selectedProduct.jastipFee);
    document.getElementById('calc-ongkir').innerText = 'Rp 0 (Gratis Ongkir)';
    document.getElementById('calc-total').innerText = formatRupiah(total);
}

function togglePaymentDetails() {
    const method = document.getElementById('checkout-payment').value;
    document.getElementById('pay-detail-qris').classList.toggle('hidden', method !== 'QRIS');
    document.getElementById('pay-detail-bank').classList.toggle('hidden', method !== 'Transfer Bank');
    document.getElementById('pay-detail-cod').classList.toggle('hidden', method !== 'E-Wallet / COD');
}

function submitOrder() {
    const db = getDB();
    const ongkir = 0;
    const metode = document.getElementById('checkout-payment').value;
    const alamat = document.getElementById('prof-alamat').value;

    const newOrder = {
        id: 'SAZ-' + Math.floor(100000 + Math.random() * 900000),
        produkNama: selectedProduct.nama,
        hargaAsli: selectedProduct.hargaAsli,
        jastipFee: selectedProduct.jastipFee,
        ongkir: ongkir,
        total: selectedProduct.hargaAsli + selectedProduct.jastipFee + ongkir,
        metodeBayar: metode,
        statusBayar: metode === 'QRIS' ? 'Lunas' : 'Menunggu Verifikasi',
        statusPesanan: 'Pending',
        alamat: alamat
    };

    db.pesanan.unshift(newOrder);
    saveDB(db);
    closeCheckout();
    showUserTab('riwayat');
    renderUserOrders();
    alert(`Pesanan ${newOrder.id} berhasil dibuat!`);
}

// --- RIWAYAT PESANAN PEMBELI ---
function renderUserOrders() {
    const db = getDB();
    const container = document.getElementById('user-orders-list');
    container.innerHTML = db.pesanan.map(o => `
        <div class="bg-white p-5 rounded-2xl shadow border flex flex-wrap justify-between items-center gap-4">
            <div>
                <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded">${o.id}</span>
                    <span class="text-xs font-bold px-2.5 py-0.5 rounded-full ${o.statusBayar === 'Lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">${o.statusBayar} (${o.metodeBayar})</span>
                </div>
                <h4 class="font-bold text-sungDark mt-2">${o.produkNama}</h4>
                <p class="text-xs text-slate-500 mt-0.5">Tujuan: ${o.alamat}</p>
                <p class="text-sm font-extrabold text-sungOrange mt-1">Total: ${formatRupiah(o.total)}</p>
            </div>
            <div class="text-right space-y-2">
                <div>
                    <span class="text-xs text-slate-500 block">Status Proses:</span>
                    <span class="font-bold text-sm text-sungTeal">${o.statusPesanan}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function saveUserProfile(e) {
    e.preventDefault();
    alert('Profil & alamat pengiriman berhasil disimpan!');
}

// --- DASHBOARD OWNER ---
function renderOwnerDashboard() {
    const db = getDB();

    // 1. Statistik Ringkasan
    const totalPendapatan = db.pesanan.reduce((acc, o) => acc + o.total, 0);
    const selesaiCount = db.pesanan.filter(o => o.statusPesanan === 'Selesai').length;

    document.getElementById('stat-pendapatan').innerText = formatRupiah(totalPendapatan);
    document.getElementById('stat-masuk').innerText = `${db.pesanan.length} Pesanan`;
    document.getElementById('stat-selesai').innerText = `${selesaiCount} Pesanan`;

    // 2. Grafik Penjualan
    const ctx = document.getElementById('salesChart').getContext('2d');
    if (salesChartInstance) salesChartInstance.destroy();
    salesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
            datasets: [{
                label: 'Omzet Harian (Rp)',
                data: [450000, 720000, 510000, 890000, 1250000, 1600000, totalPendapatan],
                backgroundColor: '#0F4C5C',
                borderRadius: 6
            }]
        }
    });

    // 3. Tabel Manajemen Pesanan
    const tbody = document.getElementById('owner-orders-table');
    tbody.innerHTML = db.pesanan.map((o, idx) => `
        <tr>
            <td class="p-3 font-mono font-bold text-xs">${o.id}</td>
            <td class="p-3 font-semibold">${o.produkNama}</td>
            <td class="p-3">
                <div class="font-bold">${formatRupiah(o.total)}</div>
                <div class="text-xs text-slate-500">${o.metodeBayar}</div>
            </td>
            <td class="p-3">
                <button onclick="toggleVerifyPayment(${idx})" class="text-xs font-bold px-2.5 py-1 rounded ${o.statusBayar === 'Lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
                    ${o.statusBayar} (Klik Ubah)
                </button>
            </td>
            <td class="p-3">
                <select onchange="updateOrderStatus(${idx}, this.value)" class="border rounded p-1.5 text-xs font-semibold">
                    ${['Pending', 'Diproses', 'Belanja', 'Siap Dikirim', 'Sedang Diantar', 'Selesai'].map(st => 
                        `<option value="${st}" ${o.statusPesanan === st ? 'selected' : ''}>${st}</option>`
                    ).join('')}
                </select>
            </td>
        </tr>
    `).join('');

    // 4. List Produk & Request Verifikasi
    const prodList = document.getElementById('owner-product-list');
    prodList.innerHTML = db.produk.map((p, idx) => `
        <div class="flex justify-between items-center p-2.5 border rounded-lg text-xs">
            <div>
                <p class="font-bold">${p.nama}</p>
                <p class="text-slate-500">${p.kategori} | Barang: ${formatRupiah(p.hargaAsli)} | Fee: ${formatRupiah(p.jastipFee)}</p>
            </div>
            <div class="flex gap-1">
                ${p.status === 'Menunggu Harga Owner' 
                    ? `<button onclick="setRequestFee(${idx})" class="bg-emerald-600 text-white px-2 py-1 rounded font-bold">Set Fee</button>` 
                    : ''}
                <button onclick="deleteProduct(${idx})" class="bg-red-100 text-red-600 px-2 py-1 rounded font-bold">Hapus</button>
            </div>
        </div>
    `).join('');

}

// --- AKSI-AKSI OWNER ---
function toggleVerifyPayment(idx) {
    const db = getDB();
    db.pesanan[idx].statusBayar = db.pesanan[idx].statusBayar === 'Lunas' ? 'Menunggu Verifikasi' : 'Lunas';
    saveDB(db);
    renderOwnerDashboard();
}

function updateOrderStatus(idx, newStatus) {
    const db = getDB();
    db.pesanan[idx].statusPesanan = newStatus;
    saveDB(db);
    renderOwnerDashboard();
}

function ownerAddProduct(e) {
    e.preventDefault();
    const db = getDB();
    db.produk.unshift({
        id: Date.now(),
        nama: document.getElementById('new-prod-nama').value,
        kategori: document.getElementById('new-prod-kat').value,
        hargaAsli: Number(document.getElementById('new-prod-harga').value),
        jastipFee: Number(document.getElementById('new-prod-fee').value),
        gambar: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
        status: 'Disetujui'
    });
    saveDB(db);
    e.target.reset();
    renderOwnerDashboard();
}

function setRequestFee(idx) {
    const fee = prompt('Masukkan Biaya Jasa Titip (Rp) untuk request ini:', '35000');
    if (fee !== null && !isNaN(fee)) {
        const db = getDB();
        db.produk[idx].jastipFee = Number(fee);
        db.produk[idx].status = 'Disetujui';
        saveDB(db);
        renderOwnerDashboard();
    }
}

function deleteProduct(idx) {
    const db = getDB();
    db.produk.splice(idx, 1);
    saveDB(db);
    renderOwnerDashboard();
}

function logoutCustomer() {
    localStorage.removeItem('sung_az_customer_logged_in');
    localStorage.removeItem('sung_az_active_customer');
    window.location.href = 'login-pelanggan.html';
}

// Isi otomatis data profil pelanggan yang sedang login
window.addEventListener('DOMContentLoaded', () => {
    const activeCust = JSON.parse(localStorage.getItem('sung_az_active_customer'));
    if (activeCust) {
        if (document.getElementById('prof-nama')) document.getElementById('prof-nama').value = activeCust.nama;
        if (document.getElementById('prof-wa')) document.getElementById('prof-wa').value = activeCust.wa;
        if (document.getElementById('prof-alamat')) document.getElementById('prof-alamat').value = activeCust.alamat;
    }
});