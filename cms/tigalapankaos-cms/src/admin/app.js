import LogoWhite from './extensions/logo-white.png';

export default {
  // Catatan: fitur "Homepage Widgets" (app.widgets.register) TIDAK tersedia
  // di Strapi 5.10.1 yang dipakai project ini (app.widgets = undefined),
  // sehingga sempat menyebabkan admin panel gagal render total (layar putih).
  // Widget Total Leads & Stok Produk sudah dicabut. Untuk sementara, cek
  // total Leads & stok produk langsung lewat menu Content Manager.
  register(app) {},
  config: {
    // Logo Tigalapankaos di sidebar (menu) dan halaman login admin
    auth: {
      logo: LogoWhite,
    },
    menu: {
      logo: LogoWhite,
    },
    head: {
      favicon: LogoWhite,
    },
    translations: {
      id: {
        'Auth.form.welcome.title': 'Selamat datang di Tigalapankaos CMS!',
      },
    },
    locales: [],
    tutorials: false,
    notifications: { releases: false },
  },
  bootstrap(app) {},
};
