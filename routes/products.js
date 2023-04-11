const express = require('express');
const { Product, Category, Tag } = require('../models');
const { createProductForm, bootstrapField } = require('../forms');
const router = express.Router();


router.get('/', async(req,res)=>{


    // .collection() -- access all the rows
    // .fetch() -- execute the query
    const products = await Product.collection().fetch({
        'withRelated':['category', 'tags']  // fetch the cateogry relationship
                                    // we have provide the name of the relationship
    });
   
    console.log(products.toJSON());

    // if we want the results to be in an array of objects form
    // we have to call .toJSON on the results
    res.render('products/index',{
        'products': products.toJSON()
    })
})

router.get('/create', async(req,res)=>{


    // example of how the categories must be represented:
    //  [
        //     [1, "Egg Replacement"],
        //     [2, "Starch Replacement"],
        //     [3, "Desserts"]
        // ]

    // we use bookshelf to get all the categories
    // fetchAll() will return all the rows, each row is one bookshelf object
    // we use the .get function on the bookshelf object to retrieve the value of each column
    const allCategories = await Category.fetchAll().map( category =>{
        return [ category.get('id'), category.get('name')]
    });

    const allTags = await Tag.fetchAll().map( tag => {
        return [ tag.get('id'), tag.get('name')];
    })

    const form = createProductForm(allCategories, allTags);
    res.render('products/create', {
        'form': form.toHTML(bootstrapField)
    })
})

router.post('/create', async(req,res)=>{

    const allCategories = await Category.fetchAll().map( category =>{
        return [ category.get('id'), category.get('name')]
    });

    const allTags = await Tag.fetchAll().map( tag => {
        return [ tag.get('id'), tag.get('name')];
    })

    // use caolan form to handle the request
    const form = createProductForm(allCategories, allTags);
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
            product.set('category_id', form.data.category_id);
            // remember to save the product
            await product.save();

            // after saving the product, associate the tags with it
            // note: form.data.tags is a comma delimited string
            if (form.data.tags) {
                product.tags().attach(form.data.tags.split(','))
            }
         
            // display a flash message
            // argument 1: the category of the flash message
            // argument 2: the content of the flash message
            req.flash('success', 'Product created successfully!');
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

    // fetch all the categories
    const allCategories = await Category.fetchAll().map( c => [c.get('id'), c.get('name')]);

    // fetch all the tags
    const allTags = await Tag.fetchAll().map ( t => [t.get('id'), t.get('name')]);

    // fetch one row using Bookshelf
    const product = await Product.where({
        "id": req.params.productId
    }).fetch({
        'require': true,
        'withRelated': ['tags']  // fetch all the tags
    });

    const productForm = createProductForm(allCategories, allTags);
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description')
    productForm.fields.category_id.value = product.get('category_id');

    // get all the selected tags of the product
    // 'pluck' function only exists for bookshelf -- extracts out one key and put into an array
    let selectedTags = await product.related('tags').pluck('id');  // example: [1,2,3,4]

    // put the selectedTags into the product fields
    productForm.fields.tags.value = selectedTags;

    res.render('products/update',{
        'form': productForm.toHTML(bootstrapField)
    });
})

router.post('/:productId/update', async function(req,res){
    const productForm = createProductForm();
    const product = await Product.where({
        'id': req.params.productId
    }).fetch({
        'required': true,
        'withRelated':['tags']
    })
    productForm.handle(req,{
        "success": async(form) => {
            const {tags, ...productData} = form.data;
            product.set(productData);
            product.save();

            // begin the synchronization of tags
            const incomingTags = tags.split(",");
            const existingTags = await product.related('tags').pluck('id');

            // find the tags to remove
            let toRemove = existingTags.filter( t => incomingTags.includes(t) === false);
            await product.tags().detach(toRemove);

            // find the tags to add
            let toAdd = incomingTags.filter( t  => existingTags.includes(t) === false);
            await product.tags().attach(toAdd);

            res.redirect('/products');
        },
        "empty": async (form) => {
            res.render('products/update',{
                'form': form.toHTML(bootstrapField)
            })
        },
        "error": async (form) => {
            res.render('products/update',{
                'form': form.toHTML(bootstrapField)
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