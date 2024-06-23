const request = require('supertest');
const app = require('../app');
const db = require('../db');
const Message = require('../models/message');
const User = require('../models/user');
let server;

jest.setTimeout(20000); // Increase timeout to 20 seconds

describe('Test Message class', function () {
  beforeAll(async function () {
    // Start the server
    server = app.listen(3000, () => {
      console.log('Test server running on port 3000');
    });

    await db.query('DELETE FROM messages');
    await db.query('DELETE FROM users');
    await User.register({
      username: 'test1',
      password: 'password',
      first_name: 'Test',
      last_name: 'User',
      phone: '123-456-7890',
    });
  });

  afterAll(async function () {
    // Close the server connection after tests
    server.close();

    await db.query('DELETE FROM messages');
    await db.query('DELETE FROM users');
    await db.end();
  });

  test('can create', async () => {
    const message = await Message.create({
      from_username: 'test1',
      to_username: 'test2',
      body: 'Hello!'
    });
    expect(message).toHaveProperty('id');
  }, 20000); // Increase timeout for this test

  test('can mark read', async () => {
    const message = await Message.create({
      from_username: 'test1',
      to_username: 'test2',
      body: 'Hello!'
    });
    await Message.markRead(message.id);
    const updatedMessage = await Message.get(message.id);
    expect(updatedMessage.read_at).not.toBeNull();
  }, 20000); // Increase timeout for this test

  test('can get', async () => {
    const message = await Message.create({
      from_username: 'test1',
      to_username: 'test2',
      body: 'Hello!'
    });
    const fetchedMessage = await Message.get(message.id);
    expect(fetchedMessage).toHaveProperty('id');
    expect(fetchedMessage.body).toBe('Hello!');
  }, 20000); // Increase timeout for this test

});
