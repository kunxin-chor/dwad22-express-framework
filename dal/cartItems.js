const { CartItem } = require('../models');

// get the shopping cart for this particular userId
async function getCart(userId) {
    return await CartItem.collection()
        .where({
            user_id: userId
        })
        .fetch({
            require: false,
            withRelated: ['product', 'product.category']
        })
}

async function createCartItem(user_id, product_id, quantity) {
    const cartItem = new CartItem({
        user_id, product_id, quantity
    });
    await cartItem.save();
    return cartItem;
}

module.exports = { createCartItem, getCart};