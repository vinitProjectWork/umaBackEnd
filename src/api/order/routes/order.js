'use strict';

/**
 * order router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter("api::order.order");

const customRouter = (innerRouter, extraRoutes = []) => {
    let routes;
    return {
        get prefix() {
            return innerRouter.prefix;
        },
        get routes() {
            if (!routes) routes = innerRouter.routes.concat(extraRoutes);
            return routes;
        },
    };
};

const myExtraRoutes = [
    {
        method: "GET",
        path: "/cartDetails",
        handler: "order.cartDetails",
    },
    {
        method: "POST",
        path: "/checkOut",
        handler: "order.checkOut",
    },
];

module.exports = customRouter(defaultRouter, myExtraRoutes);