const express = require('express');
const router = express.Router();

const cartServices = require('../services/cartServices');
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.get('/', async function (req, res) {

    // 1. get the content of the shopping cart
    const items = await cartServices.getCart(req.session.user.id);

    // 2. create line items (like an invoice)
    const lineItems = [];
    const meta = []; // store product id, and the quantity order (can consider storing the unit price)

    for (let i of items) {
        // the `keys` here are from Stripe for creating a line item
        // we cannot anyhow use the keys
        let singleLineItem = {
            quantity: i.get('quantity'),
            price_data: {
                'currency': 'SGD',
                // retrieve the cost from the related product
                // important: make sure product is fetched withRelated:['product']
                'unit_amount': i.related('product').get('cost'),
                'product_data': {
                    'name': i.related('product').get('name')
                }
            }
        }
        // check if to add in an image
        // stripe does not allow falsify values for image
        if (i.related('product').get('image_url')) {
            singleLineItem.price_data.product_data.images = [
                i.related('product').get('image_url')
            ]
        }

        lineItems.push(singleLineItem);
        meta.push({
            'product_id': i.get('product_id'),
            'quantity': i.get('quantity')
        })
    }

    // 3. create a payment session with Stripe
    // by passing line items
    const metaDataString = JSON.stringify(meta);
    const payment = {
        payment_method_types: ['card'],  // use credit card
        mode: 'payment',
        line_items: lineItems,
        success_url: process.env.STRIPE_SUCCESS_URL,
        cancel_url: process.env.STRIPE_ERROR_URL,
        metadata: {
            'orders': metaDataString
        }
    }

    const stripeSession = await Stripe.checkout.sessions.create(payment);

    // 4. redirect the user to the stripe payment form
    res.render('checkout/checkout', {
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY,
        'sessionId': stripeSession.id
    })
})

router.get('/success', function (req, res) {
    res.send("Payment done")
})

router.get('/error', function (req, res) {
    res.send("Payment failed")
})

// router.post('/asd123', function(req,res){
//     console.log("router.post/asd123/")
//     res.send("hi");
// })

// webhook for the stripe to call
router.post('/process_payment', express.raw({
    type: 'application/json'
}), function (req, res) {
    console.log("process_payment");
    // 1. verify that this is actually called by Stripe
    const payload = req.body;
    const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
    const sigHeader = req.headers['stripe-signature'];
    let event;
    // 2. check the event and whether is 'checkout.session.completed'
    try {
        event = Stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);
        if (event.type === 'checkout.session.completed') {
            const stripeSession = event.data.object;
            console.log(stripeSession);

            // 3. if so, then we need to store the transaction info
            // todo: you have to create the order and order details

            res.send({
                'recieved': true
            })

        }
    } catch (e) {
        console.log(e.message);
        res.status(500);
        res.send({
            'error': e.message
        })
    }



});

module.exports = router;