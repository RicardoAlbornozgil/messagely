/** Database connection for messagely. */

const { Client } = require("pg");
const { DB_URI } = require("./config");



const client = new Client({
  connectionString: DB_URI,
  ssl: {
    rejectUnauthorized: false
  }
});

// Connect to PostgreSQL only once
client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Error connecting to PostgreSQL:', err.message));


module.exports = client;
