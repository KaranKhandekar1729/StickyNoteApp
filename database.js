// loading the env variables
require('dotenv').config(); // reads the .env and makes the var available in process.env
const mysql = require('mysql2'); // mysql instance

// creates a pool of connections that can be reused by the app, essential for performance
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise(); // export pool with promise support, lets use async/await