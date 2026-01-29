// @ts-ignore
import swaggerJsdoc from "swagger-jsdoc";

const options: any = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CRUD API with JWT Authentication",
      version: "1.0.0",
      description: "Complete CRUD API with user authentication and role-based access control",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
