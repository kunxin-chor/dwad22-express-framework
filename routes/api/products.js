const express = require('express');
const productDataLayer = require('../../dal/products');
const { createProductForm } = require('../../forms');
const router = express.Router();

// const router = require('express').Router();

router.get('/', async function(req,res){
    // use the DAL to retrieve all the products
    const products = await productDataLayer.getAllProducts();
    // in a RESTFul endpoint, we'll send back JSON data
    res.json(products.toJSON());
});

router.post('/', async function(req,res){
    const allCategories = await productDataLayer.getAllCategories();
    const allTags = await productDataLayer.getAllTags();
    const productForm = createProductForm(allCategories, allTags);

    productForm.handle(req, {
        "success": async function(form){
            let {tags, ...productData} = form.data;
            const product = await productDataLayer.createNewProduct(productData, tags.split(","));
            res.json({
                'product': product.toJSON()
            })
        },
        "error": async function(form) {
            let errors = {};
            for (let key in form.fields) {
                if (form.fields[key].error) {
                    errors[key] = form.fields[key].error
                }
            }
            res.status(400);
            res.json({
                errors
            })
        },
        "empty": async function(form) {
            res.status(400);
            res.json({
                'error':'Empty payload recieved'
            })
        }
    })
})

module.exports = router;