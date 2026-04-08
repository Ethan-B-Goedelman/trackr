const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Trackr API',
      version: '1.0.0',
      description:
        'REST API for Trackr — an interview tracking app that helps job seekers manage their entire application pipeline.',
      contact: {
        name: 'Trackr',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token (from /api/auth/login) in the format: Bearer <token>',
        },
      },
      schemas: {
        Application: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            company: { type: 'string', example: 'Acme Corp' },
            role: { type: 'string', example: 'Senior Software Engineer' },
            status: {
              type: 'string',
              enum: ['Applied', 'Phone Screen', 'Technical', 'Onsite', 'Offer', 'Accepted', 'Rejected'],
            },
            location: { type: 'string', example: 'Remote' },
            salaryMin: { type: 'number', example: 120000 },
            salaryMax: { type: 'number', example: 160000 },
            jobUrl: { type: 'string' },
            dateApplied: { type: 'string', format: 'date-time' },
            notes: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Interview: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            application: { type: 'string', description: 'Application ID' },
            scheduledAt: { type: 'string', format: 'date-time' },
            type: {
              type: 'string',
              enum: ['Phone', 'Video', 'Technical', 'Onsite', 'Behavioral', 'Other'],
            },
            interviewerName: { type: 'string' },
            prepNotes: { type: 'string' },
            reflection: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
          },
        },
        Contact: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            company: { type: 'string' },
            role: { type: 'string' },
            notes: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentication & account management' },
      { name: 'Applications', description: 'Job application CRUD' },
      { name: 'Interviews', description: 'Interview scheduling & notes' },
      { name: 'Contacts', description: 'Recruiter & contact management' },
      { name: 'Stats', description: 'Dashboard analytics' },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Trackr API Docs',
      customCss: '.swagger-ui .topbar { background-color: #1976d2; }',
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );

  // Serve raw spec as JSON (useful for SwaggerHub import)
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

module.exports = { setupSwagger, swaggerSpec };
