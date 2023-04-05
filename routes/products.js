const express = require('express');
const { Product } = require('../models');
const router = express.Router();


router.get('/', async(req,res)=>{
    // .collection() -- access all the rows
    // .fetch() -- execute the query
    const products = await Product.collection().fetch();
   
    // if we want the results to be in an array of objects form
    // we have to call .toJSON on the results
    res.render('products/index',{
        'products': products.toJSON()
    })
})

router.get('/create', async(req,res)=>{
    res.send("Render a form to create a new product");
})

module.exports = router;