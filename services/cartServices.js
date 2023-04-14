
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
    try {
        const cartItem = await cartDataLayer.getCartItemByUserAndProduct(userId, productId);
        if (cartItem) {
            // retrieve the existing cart item and add to 1 instead
           await cartDataLayer.updateQuantity(userId, productId, cartItem.get('quantity') + quantity);
        } else {
            await cartDataLayer.createCartItem(userId, productId, quantity);
        }
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

async function removeFromCart(userId, productId) {
    // todo: indicate the user's interest in the product type
    // todo: add this item to the list of removed items
    // and when there's enough send an email with a discount code
    return await cartDataLayer.removeFromCart(userId, productId);

}

async function updateQuantity(userId, productId, newQuantity) {
    // todo: make sure that there's enough stock
    return await cartDataLayer.updateQuantity(userId, productId, newQuantity);
}

module.exports = { getCart, addToCart, removeFromCart, updateQuantity};