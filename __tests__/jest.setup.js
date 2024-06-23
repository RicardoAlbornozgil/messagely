// jest.setup.js

process.env.NODE_ENV = 'test'; // Set environment to test
BCRYPT_WORK_FACTOR=1;

describe('Jest setup', () => {
  test('should successfully set up Jest environment', () => {
    expect(true).toBe(true); // Placeholder test assertion
  });
});
