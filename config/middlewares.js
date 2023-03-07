// module.exports = [
//   'strapi::errors',
//   'strapi::security',
//   'strapi::poweredBy',
//   {
//     name: 'strapi::cors',
//     config: {
//       enabled: true,
//       headers: '*',
//       origin: '*'
//     }
//   },
//   'strapi::logger',
//   'strapi::query',
//   'strapi::body',
//   'strapi::session',
//   'strapi::favicon',
//   'strapi::public',
// ];

module.exports = [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
