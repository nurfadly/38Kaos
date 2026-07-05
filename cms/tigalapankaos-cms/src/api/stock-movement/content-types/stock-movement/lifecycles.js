'use strict';

const { computeStockStatus, getLowStockThreshold } = require('../../../../utils/stock-status');

/**
 * Setiap ada perubahan Riwayat Stok (tambah/edit/hapus), hitung ulang
 * total stok produk terkait berdasarkan seluruh riwayat "masuk" - "keluar",
 * lalu simpan hasilnya ke field Product.stockQuantity & stockStatus. Jadi
 * admin tidak perlu edit angka/status stok produk secara manual lagi,
 * cukup catat mutasinya di sini.
 */

function extractProductId(entity) {
  if (!entity) return null;
  const p = entity.product;
  if (!p) return null;
  return typeof p === 'object' ? p.id : p;
}

async function recomputeProductStock(productId, strapi) {
  if (!productId) return;

  const movements = await strapi.db.query('api::stock-movement.stock-movement').findMany({
    where: { product: productId },
  });

  let total = 0;
  for (const m of movements) {
    if (m.type === 'masuk') total += m.quantity || 0;
    else if (m.type === 'keluar') total -= m.quantity || 0;
  }
  if (total < 0) total = 0;

  const threshold = await getLowStockThreshold(strapi);
  const stockStatus = computeStockStatus(total, threshold);

  await strapi.db.query('api::product.product').update({
    where: { id: productId },
    data: { stockQuantity: total, stockStatus },
  });
}

module.exports = {
  async afterCreate(event) {
    await recomputeProductStock(extractProductId(event.result), strapi);
  },
  async afterUpdate(event) {
    await recomputeProductStock(extractProductId(event.result), strapi);
  },
  async afterDelete(event) {
    await recomputeProductStock(extractProductId(event.result), strapi);
  },
};
