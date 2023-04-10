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
  // the addColumn function is to add a new column to a table
  // ALTER TABLE products ADD COLUMN product_id unsigned int 
  // arguments:
  // first argument: the name of the table,
  // second argument: the name of the new column to add
  // third argument: definition of the column
  return db.addColumn("products", "category_id", {
    "type":"int",
    "unsigned":true,
    "notNull": true
  })
};

exports.down = function(db) {
  return db.removeColumn("products", "category_id");
};

exports._meta = {
  "version": 1
};
