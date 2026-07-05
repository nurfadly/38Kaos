import LogoWhite from './extensions/logo-white.png';

export default {
  register(app) {
    app.widgets.register([
      {
        title: { id: 'widget.leads.title', defaultMessage: 'Total Leads Masuk' },
        component: async () => {
          const mod = await import('./extensions/widgets/LeadsWidget');
          return mod.default;
        },
        id: 'leads-total-widget',
        pluginId: 'tigalapankaos',
      },
      {
        title: { id: 'widget.stock.title', defaultMessage: 'Stok Produk' },
        component: async () => {
          const mod = await import('./extensions/widgets/StockWidget');
          return mod.default;
        },
        id: 'stock-overview-widget',
        pluginId: 'tigalapankaos',
      },
    ]);
  },
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
