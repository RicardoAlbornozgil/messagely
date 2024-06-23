/** Database connection for messagely. */

const { Client } = require('pg');
const { DB_URI } = require('./config');

const client = new Client({
  connectionString: DB_URI,
  ssl: {
    rejectUnauthorized: false
  }
});

let isConnected = false;

async function connect() {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
      console.log('Connected to PostgreSQL');
    } catch (error) {
      console.error('Error connecting to PostgreSQL:', error.message);
    }
  }
}

async function closeClient() {
  if (isConnected) {
    try {
      await client.end();
      isConnected = false;
      console.log('Disconnected from PostgreSQL');
    } catch (error) {
      console.error('Error disconnecting from PostgreSQL:', error.message);
    }
  }
}

module.exports = {
  query: (text, params) => client.query(text, params),
  connect,
  closeClient
};
