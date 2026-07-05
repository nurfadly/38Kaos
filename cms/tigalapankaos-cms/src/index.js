'use strict';

/**
 * Bootstrap: otomatis mengaktifkan akses publik (read-only) untuk
 * Product, Article, Branch, Testimonial, Hero Slide, dan Size,
 * supaya website bisa langsung fetch data tanpa perlu setting manual
 * di Settings > Roles > Public.
 *
 * Lead (data form Contact Us) sengaja HANYA diberi izin "create" untuk
 * publik, supaya pengunjung bisa mengirim form tapi data lead tidak
 * bisa dibaca sembarang orang dari internet.
 */
module.exports = {
  register() {},

  async bootstrap({ strapi }) {
    const actionsToEnable = [
      'api::product.product.find',
      'api::product.product.findOne',
      'api::article.article.find',
      'api::article.article.findOne',
      'api::branch.branch.find',
      'api::branch.branch.findOne',
      'api::testimonial.testimonial.find',
      'api::testimonial.testimonial.findOne',
      'api::hero-slide.hero-slide.find',
      'api::hero-slide.hero-slide.findOne',
      'api::size.size.find',
      'api::size.size.findOne',
      'api::site-setting.site-setting.find',
      // Leads: publik hanya boleh mengirim (create), tidak boleh membaca
      'api::lead.lead.create',
    ];

    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (publicRole) {
      for (const action of actionsToEnable) {
        const existing = await strapi
          .query('plugin::users-permissions.permission')
          .findOne({ where: { action, role: publicRole.id } });

        if (!existing) {
          await strapi.query('plugin::users-permissions.permission').create({
            data: { action, role: publicRole.id },
          });
        }
      }
    }

    // Seed ukuran default (S, M, L, XL, XXL) supaya admin tinggal
    // pilih (select) tanpa perlu membuat entri satu-satu dulu.
    const defaultSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    for (let i = 0; i < defaultSizes.length; i++) {
      const name = defaultSizes[i];
      const existingSize = await strapi
        .query('api::size.size')
        .findOne({ where: { name } });

      if (!existingSize) {
        await strapi.query('api::size.size').create({
          data: { name, order: i },
        });
      }
    }

    // Seed 1 entri default untuk Pengaturan Website (single type) supaya
    // langsung ada nomor WhatsApp default begitu CMS pertama kali jalan.
    // Admin tinggal ubah angkanya lewat Content Manager > Pengaturan Website.
    const existingSetting = await strapi.query('api::site-setting.site-setting').findOne({});
    if (!existingSetting) {
      await strapi.query('api::site-setting.site-setting').create({
        data: {
          whatsappNumber: '6281234567890',
          whatsappDefaultMessage: 'Halo, saya tertarik dengan produk Tigalapankaos.',
        },
      });
    }
  },
};
