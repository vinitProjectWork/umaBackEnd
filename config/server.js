module.exports = ({ env }) => ({
  host: env('HOST', 'https://1f5d-2405-201-2024-d030-5c0e-1e9d-88d3-7100.in.ngrok.io'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
  },
});
