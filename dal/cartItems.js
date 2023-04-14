const { CartItem } = require('../models');

// get cart item by user id and product id
async function getCartItemByUserAndProduct(userId, productId) {
    return await CartItem.where({
        'user_id': userId,
        'product_id': productId
    }).fetch({
        require: false
    })
}

async function updateQuantity(userId, productId, quantity) {
    const cartItem = await getCartItemByUserAndProduct(userId, productId);
    if (cartItem) {
        cartItem.set('quantity', quantity);
        await cartItem.save();
        return true;
    }
    return false;
}

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

async function removeFromCart(user_id, product_id) {
    // find the cart item using bookshelf
    const cartItem = await getCartItemByUserAndProduct(user_id, product_id);
    if (cartItem) {
        await cartItem.destroy();
        return true;
    }
    return false;
}


module.exports = { createCartItem, getCart, getCartItemByUserAndProduct, updateQuantity, removeFromCart};