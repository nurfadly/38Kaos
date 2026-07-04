'use strict';

/**
 * Bootstrap: otomatis mengaktifkan akses publik (read-only) untuk
 * Product, Article, dan Branch, supaya website bisa langsung fetch
 * data tanpa perlu setting manual di Settings > Roles > Public.
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
    ];

    const publicRole = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) return;

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
  },
};
