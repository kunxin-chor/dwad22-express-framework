// const bookshelf = require('../bookshelf/index.js')
const bookshelf = require('../bookshelf'); // if we require a folder
                                            // without stating the file, by default, we are requiring in
                                            // the index.js in that folder

// create a product model
// A Bookshelf Model represents one table in your database

// the first parameter: the name of the Model
const Product = bookshelf.model('Product',{
    "tableName":"products"  // indicate the table that this product is linked to
});


module.exports = { Product }