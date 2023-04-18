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
  return db.createTable('cart_items',{
      id: {
        type:'int',
        unsigned: true,
        autoIncrement: true,
        primaryKey: true,
      },
      quantity: {
        type:'int',
        unsigned: true
      },
      user_id: {
        type:'int',
        unsigned: true,
        notNull: true,
        foreignKey:{
          name: 'cart_item_user_fk',
          table: 'users',
          mapping: 'id',
          rules:{
            onDelete:'CASCADE',
            onUpdate:'RESTRICT'
          }
        }
      },
      product_id: {
        type:'int',
        unsigned: true,
        notNull: true,
        foreignKey:{
          name:'cart_items_product_fk',
          table: 'products',
          mapping: 'id',
          rules: {
            onDelete:"CASCADE",
            onUpdate:"RESTRICT"
          }
        }
      }
  });
};

exports.down = async function(db) {
   await db.removeForeignKey('cart_items', 'cart_items_product_fk');
   await db.removeForeignKey('cart_items', 'cart_item_user_fk');
   await db.dropTable('cart_items');
   return db;
  
};

exports._meta = {
  "version": 1
};