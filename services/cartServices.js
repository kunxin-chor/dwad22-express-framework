
const cartDataLayer = require('../dal/cartItems')

async function getCart(userId) {

    // todo: check all the cart products
    // if any of them the products has reached 0,
    // remove them and inform the user

    return await cartDataLayer.getCart(userId);
}

async function addToCart(userId, productId, quantity) {
    // todo: checking quantity if enough,
    // check if limited product etc.

    // if the product is already in the cart,
    // retrieve the existing cart item and add to 1 instead

    cartDataLayer.createCartItem(userId, productId, quantity);
}

module.exports = { getCart, addToCart};