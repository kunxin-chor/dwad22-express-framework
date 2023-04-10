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
  // first argument: the table to add the fk to
  // second argument: the table that the foreign key will refer to
  // third argument: the name of the foreign key
  // four argument: define the foregin key
  return db.addForeignKey('products', 'categories', 'product_category_fk',{
    'category_id':'id'
  },{
      onDelete:'CASCADE',  // if the category is deleted, then all products with that category_id as fk will be deleted as well
      onUpdate:'RESTRICT' // prevent category from changing their PKs
    });
};

exports.down = function(db) {
  return db.removeForeignKey('products', 'product_category_fk');
};

exports._meta = {
  "version": 1
};
