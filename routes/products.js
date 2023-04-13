const express = require('express');
const { Product, Category, Tag } = require('../models');
const { createProductForm, createSearchForm, bootstrapField } = require('../forms');
const { getAllCategories, getAllTags, getProductById, createNewProduct, updateProduct } = require('../dal/products');
const router = express.Router();

router.get('/', async (req, res) => {

    const allCategories= await getAllCategories();
    // add a category with id 0 (meaning: any categories)
    allCategories.unshift([0, "------"])

    const allTags = await getAllTags();

    const searchForm = createSearchForm(allCategories, allTags);
    // query builder
    // use javascript functions on the query builder to
    // inject in MySQL commands

    // the query to fetch EVERYTHING
    let q = Product.collection();   // => SELECT * FROM products WHERE 1

    searchForm.handle(req, {
        "success": async function (form) {
            if (form.data.name) {
                // add in: AND WHERE name LIKE '%<somename>%'
                q.where('name', 'LIKE', '%' + form.data.name + '%');
            }

            if (form.data.min_cost) {
                q.where('cost', '>=', form.data.min_cost);
            }

            if (form.data.max_cost) {
                q.where('cost', '<=', form.data.max_cost);
            }

            if (form.data.category_id && form.data.category_id != "0") {
                q.where('category_id', '=', form.data.category_id);
            }

            if (form.data.tags) {
                // JOIN products_tags ON products.id = products_tags.product_id
                q.query('join', 'products_tags', 'products.id', 'product_id')
                  .where('tag_id', 'in', form.data.tags.split(','))
            }

            let products = await q.fetch({
                'withRelated':['tags', 'category']
            });

            res.render('products/index',{
                products: products.toJSON(),
                form: form.toHTML(bootstrapField)
            })


        },
        "empty": async function (form) {
            // .collection() -- access all the rows
            // .fetch() -- execute the query
            const products = await q.fetch({
                'withRelated': ['category', 'tags']  // fetch the cateogry relationship
                // we have provide the name of the relationship
            });

            // if we want the results to be in an array of objects form
            // we have to call .toJSON on the results
            res.render('products/index', {
                'products': products.toJSON(),
                'form': searchForm.toHTML(bootstrapField)
            })

        },
        "error": async function (form) {
            // .collection() -- access all the rows
            // .fetch() -- execute the query
            const products = await q.fetch({
                'withRelated': ['category', 'tags']  // fetch the cateogry relationship
                // we have provide the name of the relationship
            });

            // if we want the results to be in an array of objects form
            // we have to call .toJSON on the results
            res.render('products/index', {
                'products': products.toJSON(),
                'form': searchForm.toHTML(bootstrapField)
            })

        }
    })




})

router.get('/create', async (req, res) => {


    // example of how the categories must be represented:
    //  [
    //     [1, "Egg Replacement"],
    //     [2, "Starch Replacement"],
    //     [3, "Desserts"]
    // ]

    // we use bookshelf to get all the categories
    // fetchAll() will return all the rows, each row is one bookshelf object
    // we use the .get function on the bookshelf object to retrieve the value of each column
    const allCategories = await getAllCategories();

    const allTags = await getAllTags();

    const form = createProductForm(allCategories, allTags);
    res.render('products/create', {
        'form': form.toHTML(bootstrapField),
        'cloudinaryName': process.env.CLOUDINARY_NAME,
        'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
        'cloudinaryPreset': process.env.CLOUDINARY_PRESET
    })
})

router.post('/create', async (req, res) => {

    const allCategories = await getAllCategories();

    const allTags = await getAllTags();

    // use caolan form to handle the request
    const form = createProductForm(allCategories, allTags);
    form.handle(req, {
        "success": async (form) => {

            // if the form has no errors
            // to access the data in the form, we use form.data

            // if we create a new instance of a model
            // const x = new ModelX();
            // then the x refers to ONE ROW IN THE TABLE
            const product = await createNewProduct(form.data);

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
                'form': form.toHTML(bootstrapField),
                'cloudinaryName': process.env.CLOUDINARY_NAME,
                'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
                'cloudinaryPreset': process.env.CLOUDINARY_PRESET
            });

        },
        "error": async (form) => {
            // if the form has errors in validation 
            res.render('products/create', {
                'form': form.toHTML(bootstrapField),
                'cloudinaryName': process.env.CLOUDINARY_NAME,
                'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
                'cloudinaryPreset': process.env.CLOUDINARY_PRESET
            })
        }
    })
})

router.get('/:productId/update', async (req, res) => {

    // fetch all the categories
    const allCategories = await getAllCategories();

    // fetch all the tags
    const allTags = await getAllTags();

    // fetch one row using Bookshelf
    const product = await getProductById(req.params.productId);

    const productForm = createProductForm(allCategories, allTags);
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description')
    productForm.fields.category_id.value = product.get('category_id');
    productForm.fields.image_url.value = product.get('image_url');

    // get all the selected tags of the product
    // 'pluck' function only exists for bookshelf -- extracts out one key and put into an array
    let selectedTags = await product.related('tags').pluck('id');  // example: [1,2,3,4]

    // put the selectedTags into the product fields
    productForm.fields.tags.value = selectedTags;

    res.render('products/update', {
        'product': product.toJSON(),
        'form': productForm.toHTML(bootstrapField),
        'cloudinaryName': process.env.CLOUDINARY_NAME,
        'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
        'cloudinaryPreset': process.env.CLOUDINARY_PRESET
    });
})

router.post('/:productId/update', async function (req, res) {
    const productForm = createProductForm();
    const product = await getProductById(req.params.productId);
    productForm.handle(req, {
        "success": async (form) => {
            const { tags, ...productData } = form.data;

            // todo: check if the image has been replaced
            // if the incoming image_url is different from the one in the product already
            // use the cloudinary API to delete it

            await updateProduct(product, productData);

            // begin the synchronization of tags
            const incomingTags = tags.split(",");
            const existingTags = await product.related('tags').pluck('id');

            // find the tags to remove
            let toRemove = existingTags.filter(t => incomingTags.includes(t) === false);
            await product.tags().detach(toRemove);

            // find the tags to add
            let toAdd = incomingTags.filter(t => existingTags.includes(t) === false);
            await product.tags().attach(toAdd);

            res.redirect('/products');
        },
        "empty": async (form) => {
            res.render('products/update', {
                'form': form.toHTML(bootstrapField),
                'cloudinaryName': process.env.CLOUDINARY_NAME,
                'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
                'cloudinaryPreset': process.env.CLOUDINARY_PRESET
            })
        },
        "error": async (form) => {
            res.render('products/update', {
                'form': form.toHTML(bootstrapField),
                'cloudinaryName': process.env.CLOUDINARY_NAME,
                'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
                'cloudinaryPreset': process.env.CLOUDINARY_PRESET
            })
        }
    })
})

router.get('/:productId/delete', async function (req, res) {
    const product = await getProductById(req.params.productId)

    res.render('products/delete', {
        'product': product.toJSON()
    })
});

router.post('/:productId/delete', async function (req, res) {
    const product = await getProductById(req.params.productId);
    await deleteProduct(product);
    res.redirect('/products');

})

module.exports = router;