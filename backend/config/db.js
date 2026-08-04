const { Sequelize } = require('sequelize');
const pg = require('pg');
require('dotenv').config();

const DB_PORT = process.env.DB_PORT || 5432;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_DIALECT = process.env.DB_DIALECT || 'postgres';

const sequelize = new Sequelize(
  DB_NAME,
  DB_USER, 
  DB_PASS, 
  {
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DIALECT,
    dialectModule: pg,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

module.exports = sequelize;
