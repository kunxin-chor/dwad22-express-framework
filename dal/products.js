const { Category, Tag, Product } = require('../models');

async function getAllCategories() {
    const allCategories = await Category.fetchAll().map(category => {
        return [category.get('id'), category.get('name')]
    });
    return allCategories;
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

async function createNewProduct(productData) {
    const product = new Product();  // creating a new row in the Product table
    product.set('name', form.data.name);
    product.set('cost', form.data.cost);
    product.set('description', form.data.description);
    product.set('category_id', form.data.category_id);
    product.set('image_url', form.data.image_url);
    // remember to save the product
    await product.save();
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
    deleteProduct
}