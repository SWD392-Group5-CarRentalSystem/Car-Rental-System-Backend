import swaggerJsdoc from "swagger-jsdoc";

const port = process.env.PORT || "3000";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Car Rental System API",
      version: "1.0.0",
      description: "API documentation for Car Rental System Backend",
      contact: {
        name: "API Support",
        email: "support@carrental.com",
      },
    },
    servers: [
      {
        // Relative URL helps Swagger call the same host/port where docs are being served.
        url: "/api/v1",
        description: "Current server",
      },
      {
        url: `http://localhost:${port}/api/v1`,
        description: "Local development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "User ID",
            },
            username: {
              type: "string",
              description: "User's full name",
            },
            email: {
              type: "string",
              description: "User's email address",
            },
            phoneNumber: {
              type: "string",
              description: "User's phone number",
            },
            role: {
              type: "string",
              enum: ["manager", "staff", "driver", "customer"],
              description: "User role",
            },
            DOB: {
              type: "string",
              format: "date",
              description: "Date of birth",
            },
            avatar: {
              type: "string",
              description: "Avatar URL",
            },
            is_active: {
              type: "boolean",
              description: "Account status",
            },
          },
        },
        Staff: {
          allOf: [
            { $ref: "#/components/schemas/User" },
            {
              type: "object",
              properties: {
                role: {
                  type: "string",
                  enum: ["staff"],
                  default: "staff",
                },
              },
            },
          ],
        },
        Driver: {
          allOf: [
            { $ref: "#/components/schemas/User" },
            {
              type: "object",
              properties: {
                role: {
                  type: "string",
                  enum: ["driver"],
                  default: "driver",
                },
                licenseNumber: {
                  type: "number",
                  description: "Driver's license number",
                },
                Rating: {
                  type: "number",
                  description: "Driver rating",
                  default: 0,
                },
              },
            },
          ],
        },
        Vehicle: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Vehicle ID",
            },
            make: {
              type: "string",
              description: "Vehicle manufacturer",
            },
            model: {
              type: "string",
              description: "Vehicle model",
            },
            year: {
              type: "number",
              description: "Manufacturing year",
            },
            licensePlate: {
              type: "string",
              description: "Vehicle license plate",
            },
            pricePerDay: {
              type: "number",
              description: "Rental price per day",
            },
            status: {
              type: "string",
              enum: ["available", "rented", "maintenance"],
              description: "Vehicle status",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
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
  apis: ["./src/modules/*/routes/*.ts", "./src/modules/*/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
