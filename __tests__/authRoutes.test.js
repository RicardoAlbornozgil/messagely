const request = require('supertest');
const app = require('../app'); // Adjust the path to your app module
jest.mock('../db'); // Mock the database module
const db = require('../db');

beforeAll(() => {
  // Any setup required before tests run
});

afterAll(() => {
  // Any teardown required after tests run
});

describe('Auth Routes', () => {
  beforeEach(() => {
    // Reset any changes to mocks between tests
    jest.clearAllMocks();
  });

  it('should register a new user', async () => {
    // Mock database response for the insert query
    db.query.mockResolvedValueOnce({
      rows: [{ username: 'testuser', first_name: 'Test', last_name: 'User', phone: '1234567890' }]
    });

    const response = await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        password: 'password',
        first_name: 'Test',
        last_name: 'User',
        phone: '1234567890'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User',
      phone: '1234567890'
    });
  });

  it('should authenticate a user with correct credentials', async () => {
    // Mock database response for the authentication query
    db.query.mockResolvedValueOnce({
      rows: [{ password: await bcrypt.hash('password', 12) }]
    });

    const response = await request(app)
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'password'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: 'Authenticated'
    });
  });

  it('should fail to authenticate a user with incorrect credentials', async () => {
    // Mock database response for the authentication query
    db.query.mockResolvedValueOnce({
      rows: [{ password: await bcrypt.hash('wrongpassword', 12) }]
    });

    const response = await request(app)
      .post('/auth/login')
      .send({
        username: 'testuser',
        password: 'password'
      });

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({
      error: 'Invalid username/password'
    });
  });

  // Add more tests as needed
});
