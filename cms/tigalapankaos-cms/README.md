# Tigalapankaos CMS (Strapi)

CMS untuk mengelola konten website Tigalapankaos: **Produk**, **Artikel**, dan **Cabang**.
Setelah deploy, admin panel bisa diakses di `https://<url-cms-kamu>/admin` untuk tambah/edit/hapus konten tanpa perlu sentuh kode website.

## Isi Content-Type
- **Product**: name, slug, category (unisex/men/women), price, material, description, colors (json array hex), sizes (json array), images, featured, stockAvailable
- **Article**: title, slug, category, excerpt, body (richtext), cover image, publishedDate
- **Branch**: city, address, whatsapp, order

## Jalan di Lokal (opsional, untuk coba-coba)
```bash
npm install
cp .env.example .env
# isi APP_KEYS dkk di .env dengan random string (boleh generate: openssl rand -base64 32)
npm run develop
```
Buka `http://localhost:1337/admin` untuk buat akun admin pertama kali.

## Deploy ke Production (Rekomendasi: Railway)
1. Buat project baru di https://railway.app, pilih **Deploy from GitHub repo**, arahkan ke folder `tigalapankaos-cms` di repo ini.
2. Tambahkan **PostgreSQL** plugin di Railway (klik "+ New" > Database > PostgreSQL). Railway otomatis akan menyediakan `DATABASE_URL`.
3. Di tab **Variables**, tambahkan:
   - `DATABASE_CLIENT=postgres`
   - `DATABASE_SSL=true`
   - `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY` (generate random string untuk masing-masing)
   - `NODE_ENV=production`
4. Set **Start Command**: `npm run build && npm run start`
5. Setelah deploy sukses, buka `https://<domain-railway>/admin` dan buat akun admin.
6. Masuk ke **Settings > API Tokens**, buat token baru (read-only) kalau ingin akses lebih aman, atau cukup andalkan permission publik yang sudah otomatis diaktifkan (lihat `src/index.js`) untuk endpoint `find` & `findOne`.

## Alternatif Hosting
- **Strapi Cloud** (https://cloud.strapi.io) — paling mudah, dikelola langsung oleh tim Strapi, tinggal connect repo GitHub ini.
- **Render.com** — mirip Railway, pilih Web Service dari repo ini, tambahkan PostgreSQL instance terpisah.

## Endpoint API yang dipakai website
```
GET /api/products?populate=*
GET /api/articles?populate=*
GET /api/branches?sort=order:asc
```
Ganti `API_BASE_URL` di file `tigalapankaos-website-prototype.html` (bagian atas `<script>`) dengan URL CMS production kamu, contoh:
```js
const API_BASE_URL = "https://tigalapankaos-cms.up.railway.app";
```
Kalau `API_BASE_URL` dikosongkan (`""`), website otomatis fallback ke data statis bawaan (aman untuk preview tanpa CMS).
