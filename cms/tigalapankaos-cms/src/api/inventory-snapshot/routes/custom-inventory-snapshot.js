'use strict';

/**
 * Route khusus untuk Import & Summary Ringkasan Stok Moka.
 * config: { auth: false } artinya route ini TIDAK dicek lewat sistem
 * Role & Permission bawaan Strapi (Settings > Roles) - keamanan
 * sepenuhnya ditangani manual di controller lewat header "x-import-key"
 * yang harus cocok dengan INVENTORY_IMPORT_KEY di file .env.
 */
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/inventory-snapshots/import',
      handler: 'inventory-snapshot.import',
      config: { auth: false },
    },
    {
      method: 'GET',
      path: '/inventory-snapshots/summary',
      handler: 'inventory-snapshot.summary',
      config: { auth: false },
    },
  ],
};
