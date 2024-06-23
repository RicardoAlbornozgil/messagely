/** Server startup for Message.ly. */

const app = require('./app');
const { connect } = require('./db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connect();  // Ensure the database is connected before starting the server
  app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
  });
}

startServer();