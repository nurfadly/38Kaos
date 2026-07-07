# Panduan Setup di Komputer Lain

Project ini terdiri dari 2 bagian:

1. **Website** (`index.html`) — file HTML statis, tidak butuh instalasi apa pun.
2. **CMS** (`cms/tigalapankaos-cms`) — aplikasi Node.js (Strapi). Menggunakan `package.json`, **bukan** `requirements.txt` (itu format untuk project Python; project ini pakai Node.js/JavaScript).

## Syarat (Prerequisites)

Install di komputer yang mau dipakai:

- **Node.js** versi 18–22 (cek dengan `node -v`). Download di [nodejs.org](https://nodejs.org)
- **npm** (otomatis terinstall bareng Node.js)
- **Git** (untuk clone/pull repo)

## Langkah Setup CMS

```bash
# 1. Clone repo (kalau belum ada)
git clone https://github.com/nurfadly/38Kaos.git
cd 38Kaos/cms/tigalapankaos-cms

# 2. Install semua dependensi (dari package.json)
npm install

# 3. Buat file .env dari contoh yang sudah disediakan
cp .env.example .env
```

Lalu buka file `.env` dan isi bagian secret (`APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`) dengan nilai acak. Bisa generate satu per satu dengan:

```bash
openssl rand -base64 32
```

Isi juga `INVENTORY_IMPORT_KEY` dengan teks rahasia bebas (dipakai untuk menu Import Stok, lihat bagian [Import Stok Moka](#import-stok-moka) di bawah).

## Menjalankan CMS

Mode development (auto-reload saat ada perubahan kode):
```bash
npm run develop
```

Mode production (build dulu, lalu jalankan hasil build — dipakai kalau `npm run develop` bermasalah, misalnya di GitHub Codespaces):
```bash
npm run build
npm run start
```

Setelah jalan, buka:
- Admin panel: `http://localhost:1337/admin`
- API: `http://localhost:1337/api/...`

## Import Stok Moka

Data stok dikelola satu pintu lewat file export "Inventory Summary" dari Moka (bukan diinput manual di Content Manager). Caranya:

1. Login ke admin Strapi (`http://localhost:1337/admin`), lalu klik menu **Import Stok** di sidebar kiri (ikon kotak).
2. Masukkan **Kunci Import** — harus sama persis dengan nilai `INVENTORY_IMPORT_KEY` di file `.env` server.
3. Pilih file `.csv` atau `.xlsx` hasil export Moka, lalu klik **Import Sekarang**.
4. Setiap import akan **menimpa seluruh data stok lama** dengan data dari file yang baru diupload (bukan menambah/menggabung).
5. Dashboard ringkasan (total produk, per kategori, per outlet, stok menipis/habis, terlaris) otomatis muncul di halaman yang sama setelah import berhasil, atau klik **Muat Ulang** kapan saja.

Data mentahnya juga bisa dilihat/dicari lewat Content Manager di admin Strapi, menu **Ringkasan Stok Moka**.

Ada juga versi cadangan di `<alamat CMS>/import-stok.html` (halaman mandiri di luar admin) kalau sewaktu-waktu menu di admin bermasalah — fungsinya identik.

## Menjalankan Website

Cukup buka file `index.html` langsung di browser, atau serve dengan server statis apa saja (Live Server di VS Code, `npx serve`, dll). Kalau mau website tersambung ke CMS lokal, ubah nilai `API_BASE_URL` di dalam `index.html` (cari di bagian `<script>`) sesuai alamat CMS yang sedang jalan.

## Daftar Dependensi CMS (dari `package.json`)

| Package | Versi |
|---|---|
| @strapi/strapi | 5.10.1 |
| @strapi/plugin-cloud | 5.10.1 |
| @strapi/plugin-users-permissions | 5.10.1 |
| better-sqlite3 | 11.3.0 |
| pg | 8.11.3 |
| react | ^18.0.0 |
| react-dom | ^18.0.0 |
| react-router-dom | ^6.0.0 |
| styled-components | ^6.0.0 |
| xlsx | ^0.18.5 |

Semua ini otomatis terinstall lewat `npm install` — tidak perlu diinstall satu-satu manual.
