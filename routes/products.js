const express = require('express');
const { Product } = require('../models');
const { createProductForm, bootstrapField } = require('../forms');
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
    const form = createProductForm();
    res.render('products/create', {
        'form': form.toHTML(bootstrapField)
    })
})

router.post('/create', async(req,res)=>{
    // use caolan form to handle the request
    const form = createProductForm();
    form.handle(req,{
        "success": async (form) => {
            // if the form has no errors
            // to access the data in the form, we use form.data

            // if we create a new instance of a model
            // const x = new ModelX();
            // then the x refers to ONE ROW IN THE TABLE
            const product = new Product();  // creating a new row in the Product table
            product.set('name', form.data.name);
            product.set('cost', form.data.cost);
            product.set('description', form.data.description);
            // remember to save
            await product.save();
            res.redirect('/products');

        },
        "empty": async (form) => {
            // if the form is empty (no data provided)
            res.render('products/create', {
                'form': form.toHTML(bootstrapField)
            });

        },
        "error": async (form) => {
            // if the form has errors in validation 
            res.render('products/create',{
                'form': form.toHTML(bootstrapField)
            })
        }
    } )
})

router.get('/:productId/update', async(req,res)=>{
    // fetch one row using Bookshelf
    const product = await Product.where({
        "id": req.params.productId
    }).fetch({
        'require': true
    });

    const productForm = createProductForm();
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description')

    res.render('products/update',{
        'form': productForm.toHTML(bootstrapField)
    });
})

router.post('/:productId/update', async function(req,res){
    const productForm = createProductForm();
    const product = await Product.where({
        'id': req.params.productId
    }).fetch({
        'required': true
    })
    productForm.handle(req,{
        "success": async(form) => {
            product.set(form.data);
            product.save();
            res.redirect('/products');
        },
        "empty": async (form) => {
            res.render('products/update',{
                'form': productForm.toHTML(bootstrapField)
            })
        },
        "error": async (form) => {
            res.render('products/update',{
                'form': productForm.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:productId/delete', async function(req,res){
    const product = await Product.where({
        'id': req.params.productId
    }).fetch({
        'required': true
    });

    res.render('products/delete',{
        'product': product.toJSON()
    })
});

router.post('/:productId/delete', async function(req,res){
    const product = await Product.where({
        'id': req.params.productId
    }).fetch({
        'require': true
    });
    await product.destroy(); // remove the row
    res.redirect('/products');

})

module.exports = router;