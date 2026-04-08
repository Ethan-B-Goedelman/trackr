require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Application = require('../models/Application');

jest.mock('../utils/email', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue({}),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({}),
}));

const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/trackr_test';

let token;
let userId;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_MONGODB_URI);
  }

  const user = await User.create({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: 'Password1!',
    isVerified: true,
  });
  userId = user._id;

  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'test@example.com',
    password: 'Password1!',
  });
  token = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

afterEach(async () => {
  await Application.deleteMany({});
});

const authHeader = () => ({ Authorization: `Bearer ${token}` });

describe('POST /api/applications', () => {
  it('creates a new application', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set(authHeader())
      .send({ company: 'Acme Corp', role: 'Engineer' });

    expect(res.status).toBe(201);
    expect(res.body.application.company).toBe('Acme Corp');
    expect(res.body.application.status).toBe('Applied');
  });

  it('returns 400 when company is missing', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set(authHeader())
      .send({ role: 'Engineer' });

    expect(res.status).toBe(400);
  });

  it('returns 401 without auth token', async () => {
    const res = await request(app)
      .post('/api/applications')
      .send({ company: 'Acme', role: 'Engineer' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/applications', () => {
  beforeEach(async () => {
    await Application.insertMany([
      { user: userId, company: 'Acme Corp', role: 'Engineer', status: 'Applied' },
      { user: userId, company: 'Beta Inc', role: 'Developer', status: 'Phone Screen' },
      { user: userId, company: 'Gamma LLC', role: 'Manager', status: 'Offer' },
    ]);
  });

  it('returns all applications for the user', async () => {
    const res = await request(app).get('/api/applications').set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.applications).toHaveLength(3);
    expect(res.body.pagination.total).toBe(3);
  });

  it('filters by status', async () => {
    const res = await request(app)
      .get('/api/applications?status=Phone Screen')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.applications).toHaveLength(1);
    expect(res.body.applications[0].company).toBe('Beta Inc');
  });

  it('searches by company name (server-side)', async () => {
    const res = await request(app)
      .get('/api/applications?q=acme')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.applications).toHaveLength(1);
    expect(res.body.applications[0].company).toBe('Acme Corp');
  });

  it('paginates results', async () => {
    const res = await request(app)
      .get('/api/applications?page=1&limit=2')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.applications).toHaveLength(2);
    expect(res.body.pagination.pages).toBe(2);
  });
});

describe('PUT /api/applications/:id', () => {
  let appId;

  beforeEach(async () => {
    const app = await Application.create({
      user: userId,
      company: 'Acme Corp',
      role: 'Engineer',
    });
    appId = app._id.toString();
  });

  it('updates an application', async () => {
    const res = await request(app)
      .put(`/api/applications/${appId}`)
      .set(authHeader())
      .send({ role: 'Senior Engineer', status: 'Phone Screen' });

    expect(res.status).toBe(200);
    expect(res.body.application.role).toBe('Senior Engineer');
    expect(res.body.application.status).toBe('Phone Screen');
  });

  it('returns 400 for invalid status', async () => {
    const res = await request(app)
      .put(`/api/applications/${appId}`)
      .set(authHeader())
      .send({ status: 'InvalidStatus' });

    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent application', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/applications/${fakeId}`)
      .set(authHeader())
      .send({ role: 'Eng' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/applications/:id', () => {
  it('deletes an application', async () => {
    const created = await Application.create({
      user: userId,
      company: 'Acme Corp',
      role: 'Engineer',
    });

    const res = await request(app)
      .delete(`/api/applications/${created._id}`)
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);

    const found = await Application.findById(created._id);
    expect(found).toBeNull();
  });
});

describe('PATCH /api/applications/:id/status', () => {
  it('updates status only', async () => {
    const created = await Application.create({
      user: userId,
      company: 'Acme Corp',
      role: 'Engineer',
      status: 'Applied',
    });

    const res = await request(app)
      .patch(`/api/applications/${created._id}/status`)
      .set(authHeader())
      .send({ status: 'Onsite' });

    expect(res.status).toBe(200);
    expect(res.body.application.status).toBe('Onsite');
  });
});
