const { Category, Tag, Product } = require('../models');

async function getAllCategories() {
    const allCategories = await Category.fetchAll().map(category => {
        return [category.get('id'), category.get('name')]
    });
    return allCategories;
}

async function getAllProducts() {
    return await Product.fetchAll();
}

async function getAllTags() {
    const allTags = await Tag.fetchAll().map(tag => {
        return [tag.get('id'), tag.get('name')];
    });
    return allTags;
}

async function getProductById(id) {
    const product = await Product.where({
        'id': id
    }).fetch({
        'required': true,
        'withRelated': ['tags', 'category']
    });
    return product;

}

async function createNewProduct(productData, tags=[]) {
    const product = new Product();  // creating a new row in the Product table
    product.set('name', productData.name);
    product.set('cost', productData.cost);
    product.set('description', productData.description);
    product.set('category_id', productData.category_id);
    product.set('image_url', productData.image_url);
    // remember to save the product
    await product.save();
    if (tags) {
        await product.tags().attach(tags);
    }

    return product;
}

async function updateProduct(product, productData) {
    product.set(productData);
    await product.save();
    return product;
}

async function deleteProduct(product) {
    // if (Number.isInteger(product)) {
    //     product = await getProductById(produt);
    // }

    await product.destroy(); // remove the row
}

module.exports = {
    getAllCategories,
    getAllTags,
    getProductById,
    createNewProduct,
    updateProduct,
    deleteProduct,
    getAllProducts
}