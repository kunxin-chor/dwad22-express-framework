'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  /*
  CREATE TABLE products (
      id int unsigned PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      cost INT NOT NULL,
      description TEXT
  ); 
  */
 // first parameter of db.createTable is the name of the table
 // second parameter is an object, the key will be COLUMN NAMES
 // the VALUE will be the definition of the column
  return db.createTable('products', {
    "id": {
      "type":"int",
      "primaryKey": true,
      "autoIncrement": true,
      "unsigned": true
    },
    "name":{
      "type":"string",
      "length": 100,
      "notNull":true
    },
    "cost":{
      "type":"int",
      "unsigned": true,
      "notNull": true
    },
    "description":{
      "type":"text",
    }
  })
};

exports.down = function(db) {
  return db.dropTable('products');
};

exports._meta = {
  "version": 1
};
