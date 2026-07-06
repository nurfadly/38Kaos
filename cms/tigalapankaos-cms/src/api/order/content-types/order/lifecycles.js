'use strict';

/**
 * Ketika admin mengubah status Pesanan (Order) lewat Content Manager,
 * otomatis catat mutasi di Riwayat Stok (Stock Movement) supaya stok produk
 * ikut ter-update tanpa perlu diinput manual dua kali:
 *
 * - Status berubah jadi "berhasil"   -> catat 1 mutasi "keluar" sejumlah quantity pesanan.
 * - Status "berhasil" lalu diubah jadi "dibatalkan" -> catat 1 mutasi "masuk" untuk
 *   mengembalikan stok yang sempat terpotong.
 * - Transisi status lain (mis. menunggu -> dibatalkan) tidak menyentuh stok sama sekali,
 *   karena stok belum pernah dikurangi untuk pesanan itu.
 */

function extractProductId(entity) {
  if (!entity) return null;
  const p = entity.product;
  if (!p) return null;
  return typeof p === 'object' ? p.id : p;
}

module.exports = {
  async beforeUpdate(event) {
    const { params } = event;
    const existing = await strapi.db.query('api::order.order').findOne({ where: params.where });
    event.state = { previousStatus: existing ? existing.status : null };
  },

  async afterUpdate(event) {
    const { result, state } = event;
    const previousStatus = state && state.previousStatus;
    const newStatus = result.status;

    if (previousStatus === newStatus) return;

    const productId = extractProductId(result);
    if (!productId) return;

    const quantity = result.quantity || 1;

    if (newStatus === 'berhasil' && previousStatus !== 'berhasil') {
      await strapi.query('api::stock-movement.stock-movement').create({
        data: {
          product: productId,
          type: 'keluar',
          quantity,
          note: `Otomatis dari Pesanan #${result.id} (${result.customerName || '-'})`,
          date: new Date(),
        },
      });
    }

    if (newStatus === 'dibatalkan' && previousStatus === 'berhasil') {
      await strapi.query('api::stock-movement.stock-movement').create({
        data: {
          product: productId,
          type: 'masuk',
          quantity,
          note: `Pembatalan Pesanan #${result.id} (${result.customerName || '-'})`,
          date: new Date(),
        },
      });
    }
  },
};
