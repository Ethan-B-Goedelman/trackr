require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

// Mock nodemailer so tests don't send real emails
jest.mock('../utils/email', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue({}),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({}),
}));

const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/trackr_test';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_MONGODB_URI);
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns 201', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Password1!',
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toMatch(/verification/i);
  });

  it('returns 400 with missing required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'nofirstname@example.com',
      password: 'Password1!',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('details');
  });

  it('returns 400 with short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane2@example.com',
      password: 'short',
    });

    expect(res.status).toBe(400);
  });

  it('returns 409 when email is already registered', async () => {
    await request(app).post('/api/auth/register').send({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Password1!',
    });

    const res = await request(app).post('/api/auth/register').send({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Password1!',
    });

    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    // Create and verify a user directly in DB
    const user = await User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Password1!',
      isVerified: true,
    });
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'jane@example.com',
      password: 'Password1!',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('jane@example.com');
  });

  it('returns 401 with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'jane@example.com',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
  });

  it('returns 401 with non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@example.com',
      password: 'Password1!',
    });

    expect(res.status).toBe(401);
  });

  it('returns 403 for unverified user', async () => {
    await User.create({
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@example.com',
      password: 'Password1!',
      isVerified: false,
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'bob@example.com',
      password: 'Password1!',
    });

    expect(res.status).toBe(403);
    expect(res.body.needsVerification).toBe(true);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeEach(async () => {
    await User.create({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: 'Password1!',
      isVerified: true,
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'jane@example.com',
      password: 'Password1!',
    });
    token = res.body.token;
  });

  it('returns current user when authenticated', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('jane@example.com');
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('returns 200 even when email does not exist (prevents enumeration)', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nobody@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/if that email/i);
  });
});
