'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const XLSX = require('xlsx');
const { getLowStockThreshold } = require('../../../utils/stock-status');

const UID = 'api::inventory-snapshot.inventory-snapshot';

function toNumber(v) {
  if (v === undefined || v === null || v === '') return 0;
  const n = parseInt(String(v).replace(/[^0-9-]/g, ''), 10);
  return Number.isNaN(n) ? 0 : n;
}

function pick(row, keys) {
  for (const k of keys) {
    if (row[k] !== undefined) return row[k];
  }
  return undefined;
}

function mapRow(row) {
  return {
    nameVariant: String(pick(row, ['Name - Variant', 'Name-Variant', 'Name', 'name_variant']) || '').trim(),
    category: String(pick(row, ['Category', 'category']) || '').trim(),
    outlet: String(pick(row, ['Outlet', 'outlet']) || '').trim(),
    beginning: toNumber(pick(row, ['Beginning', 'beginning'])),
    purchaseOrder: toNumber(pick(row, ['Purchase Order', 'purchase_order'])),
    sales: toNumber(pick(row, ['Sales', 'sales'])),
    transfer: toNumber(pick(row, ['Transfer', 'transfer'])),
    adjustment: toNumber(pick(row, ['Adjustment', 'adjustment'])),
    ending: toNumber(pick(row, ['Ending', 'ending'])),
  };
}

function checkImportKey(ctx) {
  const configuredKey = process.env.INVENTORY_IMPORT_KEY;
  if (!configuredKey) {
    return 'INVENTORY_IMPORT_KEY belum diatur di file .env server. Tambahkan dulu, lalu restart CMS.';
  }
  const providedKey = ctx.request.header['x-import-key'] || ctx.request.header['x-import-key'.toLowerCase()];
  if (providedKey !== configuredKey) {
    return 'Kunci import salah atau tidak dikirim.';
  }
  return null;
}

module.exports = createCoreController(UID, ({ strapi }) => ({
  async import(ctx) {
    const keyError = checkImportKey(ctx);
    if (keyError) return ctx.unauthorized(keyError);

    const filesObj = ctx.request.files || {};
    const fileEntry = filesObj.file || Object.values(filesObj)[0];
    const file = Array.isArray(fileEntry) ? fileEntry[0] : fileEntry;

    if (!file) {
      return ctx.badRequest('Tidak ada file yang diupload. Kirim file dengan field name "file".');
    }

    const filePath = file.filepath || file.path;
    let rawRows;
    try {
      const workbook = XLSX.readFile(filePath, { raw: true });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rawRows = XLSX.utils.sheet_to_json(sheet, { defval: 0 });
    } catch (err) {
      return ctx.badRequest('Gagal membaca file: ' + err.message);
    }

    const mapped = rawRows.map(mapRow).filter((r) => r.nameVariant);

    if (!mapped.length) {
      return ctx.badRequest(
        "File tidak berisi data yang valid. Pastikan header kolom sesuai format export Moka (Name - Variant, Category, Outlet, Beginning, Purchase Order, Sales, Transfer, Adjustment, Ending)."
      );
    }

    // Setiap import MENIMPA seluruh data lama - bukan menambah/menggabung.
    await strapi.db.query(UID).deleteMany({ where: {} });

    const chunkSize = 1000;
    for (let i = 0; i < mapped.length; i += chunkSize) {
      const chunk = mapped.slice(i, i + chunkSize);
      await strapi.db.query(UID).createMany({ data: chunk });
    }

    const outlets = new Set(mapped.map((r) => r.outlet));
    const categories = new Set(mapped.map((r) => r.category));
    const products = new Set(mapped.map((r) => r.nameVariant));

    ctx.body = {
      success: true,
      totalRows: mapped.length,
      totalProdukUnik: products.size,
      totalOutlet: outlets.size,
      totalKategori: categories.size,
      importedAt: new Date().toISOString(),
    };
  },

  async summary(ctx) {
    const keyError = checkImportKey(ctx);
    if (keyError) return ctx.unauthorized(keyError);

    const rows = await strapi.db.query(UID).findMany({});

    if (!rows.length) {
      return (ctx.body = {
        success: true,
        empty: true,
        message: 'Belum ada data. Silakan import file Inventory Summary dari Moka terlebih dahulu.',
      });
    }

    const threshold = await getLowStockThreshold(strapi);

    let totalEnding = 0;
    let totalSales = 0;
    let totalBeginning = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;
    let lastImportedAt = null;

    const byCategory = new Map();
    const byOutlet = new Map();
    const byProduct = new Map(); // agregat per nameVariant (lintas outlet)

    for (const r of rows) {
      totalEnding += r.ending || 0;
      totalSales += r.sales || 0;
      totalBeginning += r.beginning || 0;
      if ((r.ending || 0) <= 0) outOfStockCount++;
      else if ((r.ending || 0) <= threshold) lowStockCount++;

      if (r.createdAt && (!lastImportedAt || new Date(r.createdAt) > new Date(lastImportedAt))) {
        lastImportedAt = r.createdAt;
      }

      const cat = r.category || '(Tanpa Kategori)';
      const catAgg = byCategory.get(cat) || { category: cat, ending: 0, sales: 0, skuCount: 0 };
      catAgg.ending += r.ending || 0;
      catAgg.sales += r.sales || 0;
      catAgg.skuCount += 1;
      byCategory.set(cat, catAgg);

      const out = r.outlet || '(Tanpa Outlet)';
      const outAgg = byOutlet.get(out) || { outlet: out, ending: 0, sales: 0, skuCount: 0 };
      outAgg.ending += r.ending || 0;
      outAgg.sales += r.sales || 0;
      outAgg.skuCount += 1;
      byOutlet.set(out, outAgg);

      const prodAgg = byProduct.get(r.nameVariant) || {
        nameVariant: r.nameVariant,
        category: r.category,
        ending: 0,
        sales: 0,
      };
      prodAgg.ending += r.ending || 0;
      prodAgg.sales += r.sales || 0;
      byProduct.set(r.nameVariant, prodAgg);
    }

    const byCategoryArr = Array.from(byCategory.values()).sort((a, b) => b.ending - a.ending);
    const byOutletArr = Array.from(byOutlet.values()).sort((a, b) => b.ending - a.ending);
    const byProductArr = Array.from(byProduct.values());
    const topSelling = [...byProductArr].sort((a, b) => b.sales - a.sales).slice(0, 15);
    const lowStockList = byProductArr
      .filter((p) => p.ending > 0 && p.ending <= threshold)
      .sort((a, b) => a.ending - b.ending)
      .slice(0, 30);
    const outOfStockList = byProductArr
      .filter((p) => p.ending <= 0)
      .slice(0, 30);

    ctx.body = {
      success: true,
      empty: false,
      lastImportedAt,
      totalRows: rows.length,
      totalProdukUnik: byProduct.size,
      totalOutlet: byOutlet.size,
      totalKategori: byCategory.size,
      totalEnding,
      totalSales,
      totalBeginning,
      lowStockThreshold: threshold,
      outOfStockCount,
      lowStockCount,
      byCategory: byCategoryArr,
      byOutlet: byOutletArr,
      topSelling,
      lowStockList,
      outOfStockList,
    };
  },
}));
