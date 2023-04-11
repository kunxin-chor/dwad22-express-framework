// const bookshelf = require('../bookshelf/index.js')
const bookshelf = require('../bookshelf'); // if we require a folder
                                            // without stating the file, by default, we are requiring in
                                            // the index.js in that folder

// create a product model
// A Bookshelf Model represents one table in your database

// the first parameter: the name of the Model
const Product = bookshelf.model('Product',{
    "tableName":"products",  // indicate the table that this product is linked to

    // relationships in Bookshelf are defined via functions
    // the name of the function is the name of the relationship
    category() {
        // one Product model belongs to one Category model
        // we have use the model name
        return this.belongsTo('Category');
    },
    tags() {
        return this.belongsToMany('Tag');
    }
});

const Tag = bookshelf.model('Tag', {
    'tableName':'tags',
    products() {
        return this.belongsToMany('Product');
    }
})


const Category = bookshelf.model('Category', {
    "tableName":"categories",
    // for the relationship to work in Bookshelf, the foregin key column must be
    // <singular_form_of_table>_id
    products() {
        return this.hasMany('Product');
    }
})

const User = bookshelf.model('User',{
    'tableName':'users'
})

module.exports = { Product, Category, Tag, User }