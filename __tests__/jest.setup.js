// jest.setup.js
process.env.NODE_ENV = 'test'; // Set environment to test
process.env.DB_URI = 'postgresql://postgres:postgres@localhost:5432/messagely_test'; // Override DB URI for testing
