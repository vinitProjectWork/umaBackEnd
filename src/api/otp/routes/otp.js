module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/send-otp',
     handler: 'otp.sendOTP'
    },
    {
      method: 'POST',
      path: '/verify-otp',
      handler: 'otp.verifyOTP'
     },
  ],
};
