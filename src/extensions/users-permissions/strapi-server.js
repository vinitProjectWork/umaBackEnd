"use strict";
'use strict';

const _ = require('lodash');
const utils = require('@strapi/utils');
const { yup, validateYupSchema } = require('@strapi/utils');
const { sendOTP } = require('../../helper/helper');

const { sanitize } = utils;
const { ApplicationError, ValidationError } = utils.errors;



module.exports = (plugin) => {

    plugin.controllers.auth.callback = async (ctx) => {
        
        const provider = ctx.params.provider || 'local';
        const params = ctx.request.body;

        const store = strapi.store({ type: 'plugin', name: 'users-permissions' });
        const grantSettings = await store.get({ key: 'grant' });

        const grantProvider = provider === 'local' ? 'email' : provider;

        if (!_.get(grantSettings, [grantProvider, 'enabled'])) {
            throw new ApplicationError('This provider is disabled');
        }

        if (provider === 'local') {
            if (!params.identifier) {
                throw new ValidationError('Invalid identifier');
            }
            const { identifier } = params;

            // Check if the user exists.
            const user = await strapi.query('plugin::users-permissions.user').findOne({
                where: {
                    provider,
                    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
                },
            });

            if (!user) {
                throw new ValidationError('Invalid identifier or password');
            }

            if (!user.password) {
                throw new ValidationError('Invalid identifier or password');
            }

            const validPassword = await strapi.plugin('users-permissions').service('user').validatePassword(
                params.password,
                user.password
            );

            if (!validPassword) {
                throw new ValidationError('Invalid identifier or password');
            }

            if (user.blocked === true) {
                throw new ApplicationError('Your account has been blocked by an administrator');
            }

            await sendOTP(user);

            return ctx.send({
                //jwt: strapi.plugin('users-permissions').service('jwt').issue({ id: user.id }) 
                message: "Valid user!",
                flag: true,
            });
        }

    }
    return plugin;
}