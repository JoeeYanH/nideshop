const mysql = require('think-model-mysql');

module.exports = {
  handle: mysql,
  database: process.env.DB_NAME || 'nideshop',
  prefix: 'nideshop_',
  encoding: 'utf8mb4',
  host: process.env.DB_HOST || 'mysql',
  port: process.env.DB_PORT || '3306',
  user: process.env.DB_USER || 'nideshop',
  password: process.env.DB_PASSWORD || 'nideshop123',
  dateStrings: true,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};
