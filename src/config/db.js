const mysql = require('mysql2/promise');
require('dotenv').config();
const { resolveDatabaseConfig } = require("./runtime");

const databaseConfig = resolveDatabaseConfig();

const pool = mysql.createPool({
    host: databaseConfig.host,
    user: databaseConfig.user,
    password: databaseConfig.password,
    database: databaseConfig.database,
    port: databaseConfig.port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
