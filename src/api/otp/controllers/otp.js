'use strict';

const { sendOTP } = require("../../../helper/helper");

/**
 * A set of functions called "actions" for `otp`
 */

module.exports = {
  sendOTP: async (ctx, next) => {
    const ctxs = strapi.requestContext.get();
    const user = ctxs.state.user;
    return sendOTP(user);
  },
  verifyOTP: async (ctx, next) => {
    const { otp, mobileNumber } = ctx.request.body;
    try {
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: {
          provider: "local",
          $and: [{ otp }, { username: mobileNumber }],
        },
      });
      if (!user) {
        throw new ValidationError('Invalid identifier or password');
      } else {
        strapi.entityService.update('plugin::users-permissions.user', user.id, {
          data: { otp: "" }
        });
      }
      return ctx.send({
        jwt: strapi.plugin('users-permissions').service('jwt').issue({ id: user.id }), 
        user: {
          id: user.id,
          shop_name: user.shop_name,
          username: user.username,
        },
      });
    } catch (err) {
      console.log(err);
      ctx.body = err;
    }
  }
};
