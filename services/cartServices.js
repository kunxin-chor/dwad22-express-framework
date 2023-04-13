
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

module.exports = { getCart, addToCart};