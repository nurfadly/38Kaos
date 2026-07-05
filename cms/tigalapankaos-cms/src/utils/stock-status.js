'use strict';

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

/**
 * Tentukan status stok berdasarkan jumlah & batas minimum (lowStockThreshold).
 * - stok_habis: jumlah 0 atau kurang
 * - perlu_restock: jumlah lebih dari 0 tapi <= threshold
 * - stok_aman: jumlah lebih dari threshold
 */
function computeStockStatus(quantity, threshold) {
  const qty = quantity || 0;
  const min = typeof threshold === 'number' && threshold >= 0 ? threshold : DEFAULT_LOW_STOCK_THRESHOLD;
  if (qty <= 0) return 'stok_habis';
  if (qty <= min) return 'perlu_restock';
  return 'stok_aman';
}

/**
 * Ambil batas minimum stok (lowStockThreshold) dari Pengaturan Website (Site Setting).
 * Kalau belum diatur, pakai default 5.
 */
async function getLowStockThreshold(strapi) {
  try {
    const setting = await strapi.db.query('api::site-setting.site-setting').findOne({});
    if (setting && typeof setting.lowStockThreshold === 'number') {
      return setting.lowStockThreshold;
    }
  } catch (e) {
    // Site setting belum ada / gagal diambil, pakai default.
  }
  return DEFAULT_LOW_STOCK_THRESHOLD;
}

module.exports = {
  DEFAULT_LOW_STOCK_THRESHOLD,
  computeStockStatus,
  getLowStockThreshold,
};
