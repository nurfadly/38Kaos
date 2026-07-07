'use strict';

/**
 * Server entry point untuk plugin lokal "inventory-import".
 * Plugin ini TIDAK mendefinisikan API server sendiri - endpoint import & summary
 * sudah ada di src/api/inventory-snapshot/routes/custom-inventory-snapshot.js.
 * Plugin ini hanya dipakai untuk menambahkan menu "Import Stok" di sidebar admin
 * (lihat strapi-admin.js), supaya semuanya bisa diakses dari 1 sistem (admin Strapi).
 */
module.exports = () => ({
  register() {},
  bootstrap() {},
  destroy() {},
  config: {
    default: {},
    validator() {},
  },
  controllers: {},
  routes: [],
  services: {},
  contentTypes: {},
  policies: {},
  middlewares: {},
});
