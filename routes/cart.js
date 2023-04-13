const express = require('express');
const router = express.Router();
const cartServices = require('../services/cartServices');
const { checkIfAuthenticated} = require('../middlewares');

router.get('/', [checkIfAuthenticated ],async function(req,res){    
    const cartItems = await cartServices.getCart(req.session.user.id);
    return res.render('cart/index', {
        cartItems: cartItems.toJSON()
    })
});

router.get('/:productId/add', [checkIfAuthenticated], async function(req,res){
   await cartServices.addToCart(req.session.user.id, req.params.productId, 1);
   req.flash("success", "Item added to cart");
   res.redirect('/cart/');
})

module.exports = router;