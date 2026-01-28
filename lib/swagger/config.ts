import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kitchen of Tech API Documentation',
      version: '1.0.0',
      description: `
        Comprehensive API documentation for Kitchen of Tech platform.
        
        ## Authentication
        Most endpoints require JWT authentication. Include the JWT token in the Authorization header:
        \`\`\`
        Authorization: Bearer <your_jwt_token>
        \`\`\`
        
        ## CSRF Protection
        POST, PATCH, PUT, and DELETE requests require CSRF tokens. Include the token in the header:
        \`\`\`
        x-csrf-token: <csrf_token>
        \`\`\`
        
        ## Rate Limiting
        - **Authentication endpoints**: 5 requests per 5 minutes per IP
        - **Mutation endpoints**: 10 requests per minute per IP
        - **Query endpoints**: 30 requests per minute per IP
        - **File uploads**: 3 requests per 5 minutes per IP
        
        Rate limit exceeded responses return HTTP 429 with Retry-After header.
      `,
      contact: {
        name: 'Kitchen of Tech Support',
        email: 'support@kitchenoftech.org',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://kitchenoftech.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from /api/auth/login',
        },
        csrfToken: {
          type: 'apiKey',
          in: 'header',
          name: 'x-csrf-token',
          description: 'CSRF token for mutation operations',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            username: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            full_name: {
              type: 'string',
            },
            role_id: {
              type: 'string',
              format: 'uuid',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            amount: {
              type: 'number',
              minimum: 0.01,
            },
            currency: {
              type: 'string',
              enum: ['USD', 'EUR', 'GBP'],
            },
            payment_method: {
              type: 'string',
              enum: ['bkash', 'nagad', 'rocket', 'bank_transfer', 'credit_card'],
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
            },
            user_id: {
              type: 'string',
              format: 'uuid',
            },
            description: {
              type: 'string',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Testimonial: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            company: {
              type: 'string',
            },
            position: {
              type: 'string',
            },
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            message: {
              type: 'string',
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
            },
            created_at: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./app/api/**/*.ts', './app/api/**/*.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
