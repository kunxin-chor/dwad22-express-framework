// knex is a dependency of bookshelf
const knex = require('knex')({
    "client": "mysql",
    "connection":{
        "user":"foo",
        "password":"bar",
        "database":"organic",
        "host":"127.0.0.1"
    }
});

// setting up bookshelf
const bookshelf = require('bookshelf')(knex);

module.exports = bookshelf;