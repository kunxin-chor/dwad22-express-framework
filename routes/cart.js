const express = require('express');
const router = express.Router();
const cartServices = require('../services/cartServices');
const { checkIfAuthenticated } = require('../middlewares');

router.get('/', [checkIfAuthenticated], async function (req, res) {
    const cartItems = await cartServices.getCart(req.session.user.id);
    return res.render('cart/index', {
        cartItems: cartItems.toJSON()
    })
});

router.get('/:productId/add', [checkIfAuthenticated], async function (req, res) {
    await cartServices.addToCart(req.session.user.id, req.params.productId, 1);
    req.flash("success", "Item added to cart");
    res.redirect('/cart/');
})

router.get('/:productId/remove', [checkIfAuthenticated], async function (req, res) {
    // the current userId (get from the session)
    const userId = req.session.user.id;
    if (await cartServices.removeFromCart(userId, req.params.productId)) {
        req.flash('success', 'Item removed from cart');
    } else {
        req.flash('error', 'Unable to delete item from cart');
    }

    res.redirect('/cart');  // re-display the shopping cart

})

router.post("/:productId/updateQuantity", [checkIfAuthenticated], async function(req,res){
    const userId = req.session.user.id;
    const newQuantity = req.body.newQuantity;
    if (await cartServices.updateQuantity(userId, req.params.productId, newQuantity)) {
        req.flash('success', 'Quantity updated');    
    } else {
        req.flash('error', 'Unable to update quantity');
    }
    res.redirect('/cart');
})

module.exports = router;