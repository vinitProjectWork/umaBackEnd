'use strict';

const utils = require('@strapi/utils');
const Configure = require('../../../helper/ccavenueHelper');
const { ValidationError } = utils.errors;
const working_key = '0568AF4045203557F9CDA0B2621762EB';	//Put in the 32-Bit key shared by CCAvenues.
const merchant_id = 2114311;
const access_code = 'AVDZ04KC71BA82ZDAB';
const ccav = new Configure({
    merchant_id,
    working_key
});
/**
 * order controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({

    // async update(ctx, next){
    //     const { id } = ctx.request.params
    //     let oldEntries = await strapi.entityService.findOne('api::order.order',id);
    //     const data = ctx.request.body.data
    //     if (oldEntries?.OrderStatus === "Pending" && data?.OrderStatus === "Placed"){
    //         data?.orderDetails?.map(async item => {
    //             const product = await strapi.entityService.findOne("api::product.product", item.productid)
    //             if(product){
    //                 const models = [...JSON.parse(product?.modelDetailUpdated)].map((modelDetail,index) => {
    //                     const modelIndex = item?.model?.findIndex(a => a.value === modelDetail.value)
    //                     let qty = parseInt(modelDetail.qty)
    //                     if(modelIndex > -1){
    //                         qty -= parseInt(item?.model[modelIndex]?.addedQty)
    //                     }
    //                     if(qty){
    //                         return {
    //                             ...modelDetail,
    //                             qty
    //                         }
    //                     }
    //                     return modelDetail

    //                 })
    //                 await strapi.entityService.update("api::product.product", product.id,{
    //                     data: { ...product,modelDetailUpdated:JSON.stringify(models)}
    //                 })
    //             }
    //         })
    //     }

    //     let entries = await strapi.entityService.findOne('api::order.order', id);

    //     return { data: entries };
    // },
    // async find(...args) {
    //     // Calling the default core controller
    //     const { pagination } = await super.find(...args);
    //     let entries = await strapi.entityService.findMany('api::order.order', {
    //         populate: ['users_permissions_user'],
    //     });

    //     entries = entries.map(item => {
    //         const user = item.users_permissions_user
    //         delete item.users_permissions_user
    //         return { ...item, user: { id: user.id, mobileNumber: user.mobileNumber }}
    //     })

    //     return { data:entries, pagination };
    // },

    async cartDetails(ctx) {

        try {

            const entries = await strapi.db.query('api::order.order').findOne({
                where: {
                    $and: [
                        {
                            OrderStatus: 'cart',
                        },
                        {
                            users_permissions_user: { id: ctx.state.user.id },
                        },
                    ],
                },
            });
            return { data: entries };

        } catch (error) {
            throw new ValidationError('Error in Feching Cart Data.');
        }
    },

    async orderHistory(ctx) {
        try {

            const entries = await strapi.db.query('api::order.order').findMany({
                where: {
                    $and: [
                        {
                            OrderStatus: { $ne: 'cart' },
                        },
                        {
                            users_permissions_user: { id: ctx.state.user.id },
                        },
                    ],
                },
            });
            return { data: entries };

        } catch (error) {
            throw new ValidationError('Error in Feching Order History Data.');
        }
    },

    async checkOut(ctx) {
        try {
            const user = ctx.state.user
            const { data: { userId } } = ctx.request.body
            if (user.id === userId) {
                console.log(merchant_id);
                const orderParams = {
                    merchant_id,
                    order_id: '16547968646351654684786',
                    amount: 100,
                    currency: 'INR',
                    redirect_url: 'https://api.umaenterpriseindia.com/api/payment-success',
                    cancel_url: 'https://api.umaenterpriseindia.com/api/payment-failure',
                    language: 'EN',
                    billing_name: user.shop_name,
                    billing_address: user.address1 +", " + user.address2,
                    billing_city: user.city,
                    billing_state: user.states,
                    billing_zip: user.zipcode,
                    billing_country: 'India',
                    billing_email: user.email,
                    delivery_name: user.shop_name,
                    delivery_address: user.address1 + ", " + user.address2,
                    delivery_city: user.city,
                    delivery_state: user.states,
                    delivery_zip: user.zipcode,
                    delivery_country: 'India'
                };
                const encRequest = ccav.encrypt(orderParams);
                const form = `<form id="nonseamless" method="post" name="redirect" action="https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction"/> <input type="hidden" id="encRequest" name="encRequest" value="${encRequest}"><input type="hidden" name="access_code" id="access_code" value="${access_code}"></form>`
                return form;
            } else {
                throw new ValidationError('Requeset body is not proper.');
            }
        } catch (error) {
            throw new ValidationError('Error in Payment Gateway.');
        }
    },

    async paymentSuccess(ctx){
        const reqBody = ctx.request.body;
        const decRequest = ccav.decrypt(reqBody.encResp);
        console.log(decRequest);
        ctx.redirect('https://umaenterpriseindia.com/success-payment')

    },
    async paymentFailure(ctx) {

        ctx.redirect('https://umaenterpriseindia.com/failure-payment')
    },
}));
