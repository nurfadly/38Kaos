'use strict';

const { computeStockStatus } = require('../../../../utils/stock-status');

/**
 * Kalau batas minimum stok (lowStockThreshold) diubah lewat Pengaturan Website,
 * status stok SEMUA produk dihitung ulang supaya langsung sesuai dengan
 * batas yang baru (tidak perlu menunggu ada mutasi stok baru dulu).
 */
module.exports = {
  async afterUpdate(event) {
    const threshold = event.result && typeof event.result.lowStockThreshold === 'number'
      ? event.result.lowStockThreshold
      : 5;

    const products = await strapi.db.query('api::product.product').findMany({
      select: ['id', 'stockQuantity'],
    });

    for (const p of products) {
      const stockStatus = computeStockStatus(p.stockQuantity, threshold);
      await strapi.db.query('api::product.product').update({
        where: { id: p.id },
        data: { stockStatus },
      });
    }
  },
};
