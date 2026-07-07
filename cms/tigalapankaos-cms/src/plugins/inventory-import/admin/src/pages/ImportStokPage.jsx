import React, { useState, useEffect, useCallback } from 'react';

const KEY_STORAGE = 'inv_import_key';

function fmtNum(n) {
  return Number(n || 0).toLocaleString('id-ID');
}

function esc(s) {
  return String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/**
 * Halaman "Import Stok" - masuk ke sidebar admin Strapi lewat addMenuLink
 * (lihat strapi-admin.js). Fungsinya sama persis dengan public/import-stok.html
 * (dipertahankan sebagai cadangan), tapi sekarang bisa diakses langsung dari
 * dalam admin panel tanpa buka halaman/URL terpisah.
 */
export default function ImportStokPage() {
  const [importKey, setImportKey] = useState(() => localStorage.getItem(KEY_STORAGE) || '');
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // { type, message }
  const [dashboard, setDashboard] = useState(null);
  const [dashboardError, setDashboardError] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  const loadSummary = useCallback(async (key) => {
    const useKey = key !== undefined ? key : importKey;
    if (!useKey) {
      setDashboardError('Masukkan kunci import terlebih dahulu.');
      setDashboard(null);
      return;
    }
    localStorage.setItem(KEY_STORAGE, useKey);
    setLoadingDashboard(true);
    setDashboardError(null);
    try {
      const res = await fetch('/api/inventory-snapshots/summary', {
        headers: { 'x-import-key': useKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data.error && data.error.message) || 'Gagal memuat dashboard');
      if (data.empty) {
        setDashboard(null);
        setDashboardError(data.message);
      } else {
        setDashboard(data);
      }
    } catch (err) {
      setDashboardError('Gagal memuat: ' + err.message);
      setDashboard(null);
    } finally {
      setLoadingDashboard(false);
    }
  }, [importKey]);

  useEffect(() => {
    if (importKey) loadSummary(importKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doImport() {
    if (!importKey.trim()) {
      setImportStatus({ type: 'error', message: 'Kunci import wajib diisi.' });
      return;
    }
    if (!file) {
      setImportStatus({ type: 'error', message: 'Pilih file terlebih dahulu.' });
      return;
    }
    // eslint-disable-next-line no-alert
    if (!window.confirm('Import akan MENIMPA seluruh data stok yang lama. Lanjutkan?')) return;

    localStorage.setItem(KEY_STORAGE, importKey);
    const formData = new FormData();
    formData.append('file', file);

    setImporting(true);
    setImportStatus({ type: 'info', message: 'Mengupload & memproses file, mohon tunggu (bisa beberapa puluh detik untuk file besar)...' });

    try {
      const res = await fetch('/api/inventory-snapshots/import', {
        method: 'POST',
        headers: { 'x-import-key': importKey },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data.error && data.error.message) || data.message || 'Import gagal');
      setImportStatus({
        type: 'success',
        message: `Import berhasil! ${fmtNum(data.totalRows)} baris, ${fmtNum(data.totalProdukUnik)} produk unik, ${data.totalOutlet} outlet.`,
      });
      setFile(null);
      loadSummary(importKey);
    } catch (err) {
      setImportStatus({ type: 'error', message: 'Gagal: ' + err.message });
    } finally {
      setImporting(false);
    }
  }

  const statusColors = {
    info: { background: '#eef2ff', color: '#3730a3' },
    success: { background: '#e8f5e9', color: '#2e7d32' },
    error: { background: '#fdecea', color: '#b91c1c' },
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, fontFamily: 'inherit' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Import &amp; Dashboard Stok Moka</h1>
      <div style={{ color: '#8E8E8E', fontSize: 13, marginBottom: 24 }}>
        Upload file "Inventory Summary" hasil export dari Moka. Setiap import akan MENIMPA seluruh data stok sebelumnya dengan data baru dari file ini.
      </div>

      <div style={cardStyle}>
        <h2 style={cardTitleStyle}>Import File</h2>
        <div style={{ background: '#fff8e1', color: '#8a6100', fontSize: 12, padding: '10px 14px', borderRadius: 4, marginBottom: 16 }}>
          ⚠️ Import akan menghapus seluruh data Ringkasan Stok Moka yang lama dan menggantinya dengan isi file ini. Pastikan file yang diupload sudah benar.
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12 }}>
          <div style={{ flex: '1 1 220px' }}>
            <label style={labelStyle}>Kunci Import</label>
            <input
              type="password"
              value={importKey}
              onChange={(e) => setImportKey(e.target.value)}
              placeholder="Sesuai INVENTORY_IMPORT_KEY di .env"
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '2 1 300px' }}>
            <label style={labelStyle}>File (.csv atau .xlsx)</label>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files[0] || null)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <button type="button" onClick={doImport} disabled={importing} style={buttonStyle(importing)}>
              {importing ? 'Mengimport...' : 'Import Sekarang'}
            </button>
          </div>
        </div>
        {importStatus && (
          <div style={{ marginTop: 10, fontSize: 13, padding: '10px 14px', borderRadius: 4, ...statusColors[importStatus.type] }}>
            {importStatus.message}
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ ...cardTitleStyle, margin: 0 }}>Dashboard Stok</h2>
          <button type="button" onClick={() => loadSummary(importKey)} style={buttonStyle(false)}>
            Muat Ulang
          </button>
        </div>

        {loadingDashboard && <div style={emptyNoteStyle}>Memuat...</div>}
        {!loadingDashboard && dashboardError && <div style={{ ...emptyNoteStyle, color: '#b91c1c' }}>{dashboardError}</div>}
        {!loadingDashboard && !dashboardError && !dashboard && (
          <div style={emptyNoteStyle}>Masukkan kunci import lalu klik "Muat Ulang" untuk menampilkan dashboard.</div>
        )}
        {!loadingDashboard && dashboard && <Dashboard d={dashboard} />}
      </div>
    </div>
  );
}

function Dashboard({ d }) {
  const lastImport = d.lastImportedAt ? new Date(d.lastImportedAt).toLocaleString('id-ID') : '-';
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
        <Stat num={d.totalProdukUnik} label="Produk Unik" />
        <Stat num={d.totalOutlet} label="Outlet" />
        <Stat num={d.totalKategori} label="Kategori" />
        <Stat num={d.totalEnding} label="Total Stok Akhir" />
        <Stat num={d.totalSales} label="Total Sales" />
        <Stat num={d.lowStockCount} label={`Baris Stok Menipis (<=${d.lowStockThreshold})`} color="#b45309" />
        <Stat num={d.outOfStockCount} label="Baris Stok Habis" color="#b91c1c" />
      </div>
      <div style={{ fontSize: 12, color: '#8E8E8E', marginTop: 10 }}>
        Total {fmtNum(d.totalRows)} baris data &middot; Terakhir diimpor: {lastImport}
      </div>

      <div style={twoColStyle}>
        <div>
          <h3 style={subTitleStyle}>Ringkasan per Kategori</h3>
          <Table
            headers={['Kategori', 'SKU', 'Stok Akhir', 'Sales']}
            rows={d.byCategory.map((c) => [esc(c.category), fmtNum(c.skuCount), fmtNum(c.ending), fmtNum(c.sales)])}
          />
        </div>
        <div>
          <h3 style={subTitleStyle}>Ringkasan per Outlet</h3>
          <Table
            headers={['Outlet', 'SKU', 'Stok Akhir', 'Sales']}
            rows={d.byOutlet.map((o) => [esc(o.outlet), fmtNum(o.skuCount), fmtNum(o.ending), fmtNum(o.sales)])}
          />
        </div>
      </div>

      <div style={twoColStyle}>
        <div>
          <h3 style={subTitleStyle}>Terlaris (Top 15 Sales, gabungan semua outlet)</h3>
          <Table
            headers={['Nama - Varian', 'Sales', 'Sisa Stok']}
            rows={d.topSelling.map((p) => [esc(p.nameVariant), fmtNum(p.sales), fmtNum(p.ending)])}
          />
        </div>
        <div>
          <h3 style={subTitleStyle}>Stok Menipis (&le;{d.lowStockThreshold}, gabungan semua outlet)</h3>
          {d.lowStockList.length ? (
            <Table headers={['Nama - Varian', 'Sisa Stok']} rows={d.lowStockList.map((p) => [esc(p.nameVariant), fmtNum(p.ending)])} />
          ) : (
            <div style={{ color: '#8E8E8E', fontSize: 13 }}>Tidak ada</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ num, label, color }) {
  return (
    <div style={{ background: '#EFEFEF', borderRadius: 6, padding: 16, textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 900, color: color || '#0F0F0F' }}>{fmtNum(num)}</div>
      <div style={{ fontSize: 11, color: '#8E8E8E', textTransform: 'uppercase', letterSpacing: '.04em', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={thStyle(i > 0)}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci} style={tdStyle(ci > 0)} dangerouslySetInnerHTML={{ __html: cell }} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const cardStyle = {
  background: '#fff',
  borderRadius: 8,
  padding: '22px 24px',
  marginBottom: 20,
  boxShadow: '0 2px 10px rgba(0,0,0,.04)',
};
const cardTitleStyle = { fontSize: 15, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 16 };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: '#555' };
const inputStyle = { width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 4, fontSize: 13, background: '#fff' };
const emptyNoteStyle = { color: '#8E8E8E', fontSize: 13, padding: '20px 0', textAlign: 'center' };
const twoColStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 26 };
const subTitleStyle = { fontSize: 13, marginBottom: 10 };

function buttonStyle(disabled) {
  return {
    background: disabled ? '#999' : '#0F0F0F',
    color: '#fff',
    border: 'none',
    padding: '11px 22px',
    borderRadius: 4,
    fontWeight: 700,
    fontSize: 13,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
function thStyle(numCol) {
  return {
    textAlign: numCol ? 'right' : 'left',
    padding: '9px 10px',
    borderBottom: '1px solid #eee',
    color: '#8E8E8E',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '.03em',
  };
}
function tdStyle(numCol) {
  return { textAlign: numCol ? 'right' : 'left', padding: '9px 10px', borderBottom: '1px solid #eee' };
}
