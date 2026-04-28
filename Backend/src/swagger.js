import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HealthTrack API',
      version: '1.0.0',
      description: 'API documentation for HealthTrack',
    },
    components: {
      securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
       bearerAuth: [],
      },
    ],
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./src/routes/*.js'], // where your route comments live
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;