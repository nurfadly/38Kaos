import PluginIcon from './admin/src/components/PluginIcon';

/**
 * Admin entry point untuk plugin lokal "inventory-import".
 * Menambahkan menu "Import Stok" di sidebar admin Strapi, supaya import file
 * Moka + dashboard ringkasan stok bisa diakses langsung dari dalam admin
 * panel (1 sistem), tanpa perlu buka halaman terpisah.
 *
 * Ini menggunakan Admin Panel API resmi Strapi (addMenuLink), BUKAN API
 * "Homepage Widgets" yang pernah dicoba sebelumnya dan tidak ada di versi
 * Strapi ini - addMenuLink didukung penuh di Strapi 5.
 */
export default {
  register(app) {
    app.addMenuLink({
      to: '/plugins/inventory-import',
      icon: PluginIcon,
      intlLabel: {
        id: 'inventory-import.plugin.name',
        defaultMessage: 'Import Stok',
      },
      Component: async () => {
        const { default: ImportStokPage } = await import('./admin/src/pages/ImportStokPage');
        return ImportStokPage;
      },
      permissions: [],
    });

    app.registerPlugin({
      id: 'inventory-import',
      name: 'Import Stok',
    });
  },
  bootstrap() {},
};
