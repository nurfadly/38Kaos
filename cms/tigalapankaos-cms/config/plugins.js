module.exports = () => ({
  // Plugin lokal yang menambahkan menu "Import Stok" di sidebar admin,
  // supaya import file Moka + dashboard ringkasan stok ada di 1 sistem
  // (admin Strapi) tanpa perlu buka halaman terpisah.
  'inventory-import': {
    enabled: true,
    resolve: './src/plugins/inventory-import',
  },
});
