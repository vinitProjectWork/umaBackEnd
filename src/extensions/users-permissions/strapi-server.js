"use strict";
'use strict';

const _ = require('lodash');
const utils = require('@strapi/utils');
const { yup, validateYupSchema } = require('@strapi/utils');
const { sendOTP } = require('../../helper/helper');

const { sanitize } = utils;
const { ApplicationError, ValidationError } = utils.errors;



module.exports = (plugin) => {

    plugin.routes['content-api'].routes.push({
        method: 'POST',
        path: '/block',
        handler: 'auth.block'
    }, {
        method: 'POST',
        path: '/approve',
        handler: 'auth.approve'
    },)

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
    plugin.controllers.auth.register = async (ctx) => {
        const pluginStore = await strapi.store({ type: 'plugin', name: 'users-permissions' });

        const settings = await pluginStore.get({ key: 'advanced' });

        if (!settings.allow_register) {
            throw new ApplicationError('Register action is currently disabled');
        }

        const params = {
            ..._.omit(ctx.request.body, [
                'confirmed',
                'blocked',
                'confirmationToken',
                'resetPasswordToken',
                'provider',
            ]),
            provider: 'local',
        };

        await validateRegisterBody(params);

        const role = await strapi
            .query('plugin::users-permissions.role')
            .findOne({ where: { type: settings.default_role } });

        if (!role) {
            throw new ApplicationError('Impossible to find the default role');
        }

        const { email, username, provider } = params;

        const identifierFilter = {
            $or: [
                { email: email.toLowerCase() },
                { username: email.toLowerCase() },
                { username },
                { email: username },
            ],
        };

        const conflictingUserCount = await strapi.query('plugin::users-permissions.user').count({
            where: { ...identifierFilter, provider },
        });

        if (conflictingUserCount > 0) {
            throw new ApplicationError('Email or Username are already taken');
        }

        if (settings.unique_email) {
            const conflictingUserCount = await strapi.query('plugin::users-permissions.user').count({
                where: { ...identifierFilter },
            });

            if (conflictingUserCount > 0) {
                throw new ApplicationError('Email or Username are already taken');
            }
        }

        const newUser = {
            ...params,
            role: role.id,
            email: email.toLowerCase(),
            username,
            confirmed: false,
        };

        const user = await getService('user').add(newUser);

        const sanitizedUser = await sanitizeUser(user, ctx);

        if (settings.email_confirmation) {
            try {
                await getService('user').sendConfirmationEmail(sanitizedUser);
            } catch (err) {
                throw new ApplicationError(err.message);
            }

            return ctx.send({ user: sanitizedUser });
        }

        return ctx.send({
            message: 'User Registered Sucessfully',
            flag: true
        });
    }
    plugin.controllers.auth.block = async (ctx) => {

        try {
            await strapi.entityService.update("plugin::users-permissions.user", ctx.request.body.id, {
                data: { blocked: true, confirm: false }
            })
            return ctx.send({
                message: 'User Block Sucessfully',
                flag: true
            });
        } catch (error) {
            throw new ApplicationError('Something Went Wrong, Please try again in sometime');
        }
    }
    plugin.controllers.auth.approve = async (ctx) => {
        try {
            await strapi.entityService.update("plugin::users-permissions.user", ctx.request.body.id, {
                data: { confirm: true, blocked: false }
            })
            return ctx.send({
                message: 'User Approved Sucessfully',
                flag: true
            });
        } catch (error) {
            throw new ApplicationError('Something Went Wrong, Please try again in sometime');
        }
    }
    return plugin;
}