'use strict';

const { sendOTP } = require("../../../helper/helper");
const utils = require('@strapi/utils');
const { ValidationError } = utils.errors;

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
      if(otp.toString().length < 6){
        throw new ValidationError('OTP must be 6 number.');
      }
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
          data: { otp: "0" }
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
