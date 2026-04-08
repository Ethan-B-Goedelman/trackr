const mongoose = require('mongoose');

// Use in-memory or test DB — set TEST_MONGODB_URI in env or fall back to a local test DB
const MONGODB_TEST_URI =
  process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/trackr_test';

beforeAll(async () => {
  await mongoose.connect(MONGODB_TEST_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});
