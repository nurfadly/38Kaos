module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      // Pakai string '*' (bukan array) supaya header Access-Control-Allow-Origin
      // SELALU dikirim apa adanya, tidak bergantung pada header Origin dari request.
      // Ini penting karena proxy GitHub Codespaces/dev tunnel kadang menghapus
      // header Origin sebelum sampai ke Strapi, sehingga pengecekan berbasis
      // array (mencocokkan ke Origin request) gagal dan header CORS tidak terkirim.
      // Ganti dengan domain website production kamu kalau sudah live permanen,
      // misal: 'https://tigalapankaos.id'
      origin: '*',
      headers: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
