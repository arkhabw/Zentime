# Zentime — Panduan Rilis ke Chrome Web Store (Release Guide)

Panduan langkah demi langkah untuk mempublikasikan ekstensi **Zentime** ke Google Chrome Web Store.

---

## 🛠️ Persiapan Awal

### 1. Akun Pengembang Chrome Web Store
1. Buka [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Masuk dengan akun Google Anda.
3. Bayar biaya pendaftaran pengembang satu kali sebesar **$5 USD** (kebijakan resmi Google untuk mencegah spam).

### 2. File Distribusi (.ZIP)
Bundle zip siap rilis sudah dibuat di:
```text
web-timer-extension/dist/zentime-v1.0.0.zip
```
Jika ingin membuat ulang atau mengupdate file zip di kemudian hari, cukup jalankan:
```powershell
node package.js
# atau
.\package-extension.ps1
```

---

## 🚀 Langkah Publikasi di Dashboard Pengembang

### Langkah 1: Upload Item Baru
1. Di [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole), klik tombol **+ Item baru** (+ New Item) di kanan atas.
2. Tarik dan lepas (drag-and-drop) file `dist/zentime-v1.0.0.zip`.
3. Dashboard akan memvalidasi `manifest.json` secara otomatis.

---

### Langkah 2: Mengisi Listing Toko (Store Listing)
Buka file [`STORE_LISTING.md`](STORE_LISTING.md) dan salin informasinya ke formulir:

1. **Nama Produk**: `Zentime - Web Timer & Screen Time`
2. **Deskripsi Singkat**:
   - *Bahasa Inggris*: `Mindful focus timer, daily website limits, and 7-day screen time analytics. Stay in flow with zero distractions.`
   - *Bahasa Indonesia*: `Timer fokus, batas pemakaian web harian, dan analitik layar 7 hari. Tetap fokus dan produktif tanpa distraksi.`
3. **Deskripsi Lengkap**: Salin isi blok markdown dari file `STORE_LISTING.md`.
4. **Kategori**: Pilih **Produktivitas (Productivity)**.
5. **Bahasa Utama**: English atau Indonesian.

---

### Langkah 3: Mengunggah Aset Grafis (Store Assets)
Buka file [`store-assets/preview.html`](store-assets/preview.html) di browser Google Chrome Anda (cukup double-click file tersebut).
1. Klik tombol **⬇️ Download All PNGs** untuk mengekspor 6 gambar PNG resolusi tinggi.
2. Di Dashboard Chrome:
   - **Ikon Toko (Store Icon)**: Sudah otomatis membaca `icons/icon128.png`.
   - **Tangkapan Layar (Screenshots)**: Unggah:
     - `zentime-screenshot-1-timer.png` (1280x800)
     - `zentime-screenshot-2-blocker.png` (1280x800)
     - `zentime-screenshot-3-insights.png` (1280x800)
     - `zentime-screenshot-4-settings.png` (1280x800)
   - **Ubin Promosi Kecil (Small Promo Tile)**: Unggah `zentime-promo-small-440x280.png` (440x280).
   - **Banner Marquee (Marquee Tile)**: Unggah `zentime-marquee-1400x560.png` (1400x560).

---

### Langkah 4: Mengisi Praktik Privasi (Privacy Practices)
Tab **Praktik Privasi** adalah bagian terpenting untuk kelulusan review Google:

1. **Tujuan Tunggal (Single Purpose)**:
   > *Salin dari bagian Single-Purpose Description di `STORE_LISTING.md`.*

2. **Justifikasi Izin (Permission Justifications)**:
   Isi kotak justifikasi untuk masing-masing izin:
   - **`tabs`**: Salin justifikasi `tabs` dari tabel di `STORE_LISTING.md`.
   - **`alarms`**: Salin justifikasi `alarms` dari tabel di `STORE_LISTING.md`.
   - **`notifications`**: Salin justifikasi `notifications` dari tabel di `STORE_LISTING.md`.
   - **`storage`**: Salin justifikasi `storage` dari tabel di `STORE_LISTING.md`.
   - **`offscreen`**: Salin justifikasi `offscreen` dari tabel di `STORE_LISTING.md`.
   - **`contextMenus`**: Salin justifikasi `contextMenus` dari tabel di `STORE_LISTING.md`.

3. **Host Permissions**:
   - Zentime tidak meminta host permission / `<all_urls>`, sehingga tidak memerlukan justifikasi tambahan.

4. **Penggunaan Data (Data Usage)**:
   - Pilih: **"Tidak, saya tidak mengumpulkan atau menggunakan data pengguna"** (*No, I am not collecting or using user data*).
   - Centang ketiga klausul sertifikasi pengembang Google (kepatuhan pada kebijakan data terbatas).

5. **Tautan Kebijakan Privasi (Privacy Policy URL)**:
   - Anda dapat menautkan ke file [`PRIVACY_POLICY.md`](PRIVACY_POLICY.md) yang di-host di GitHub repository Anda:
     ```text
     https://github.com/arkhabw/Zentime/blob/main/PRIVACY_POLICY.md
     ```

---

### Langkah 5: Kirim untuk Ditinjau (Submit for Review)
1. Periksa kembali semua tanda centang hijau di sisi kiri dashboard.
2. Klik tombol **Kirim untuk ditinjau** (*Submit for Review*).
3. Proses review Google umumnya memakan waktu **1 hingga 3 hari kerja**.
4. Karena Zentime memiliki izin minimal (tanpa remote code, tanpa webRequest, tanpa server luar), ekstensi ini memiliki profil risiko paling rendah dan umumnya disetujui dengan cepat!

---

🎉 **Selamat! Zentime siap membantu ribuan pengguna meningkatkan fokus mereka.**
