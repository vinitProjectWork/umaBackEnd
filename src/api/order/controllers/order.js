'use strict';

const utils = require('@strapi/utils');
const { ValidationError } = utils.errors;
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

}));
