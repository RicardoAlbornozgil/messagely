const request = require('supertest');
const app = require('../app');
const db = require('../db');
const User = require('../models/user');
let server;

jest.setTimeout(20000); // Increase timeout to 20 seconds

describe('Test User class', function () {
  beforeAll(async function () {
    // Start the server
    server = app.listen(3000, () => {
      console.log('Test server running on port 3000');
    });

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

    await db.query('DELETE FROM users');
    await db.end();
  });

  test('can register', async () => {
    const user = await User.register({
      username: 'test2',
      password: 'password',
      first_name: 'Test',
      last_name: 'User',
      phone: '123-456-7890',
    });
    expect(user).toHaveProperty('username', 'test2');
  }, 20000); // Increase timeout for this test

  test('can authenticate', async () => {
    const isAuthenticated = await User.authenticate('test1', 'password');
    expect(isAuthenticated).toBeTruthy();
  }, 20000); // Increase timeout for this test

  test('can update login timestamp', async () => {
    await User.updateLoginTimestamp('test1');
    const user = await User.get('test1');
    expect(user.last_login_at).not.toBeNull();
  }, 20000); // Increase timeout for this test

  test('can get', async () => {
    const user = await User.get('test1');
    expect(user).toHaveProperty('username', 'test1');
  }, 20000); // Increase timeout for this test

  test('can get all', async () => {
    const users = await User.all();
    expect(users.length).toBeGreaterThan(0);
  }, 20000); // Increase timeout for this test

  // Add other tests here
});
