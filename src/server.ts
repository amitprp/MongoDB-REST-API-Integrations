import Sentry from "./services/sentry.ts";
import fastify from "fastify";
import { endpointRoutes } from "./api/routes/invoiceAPIRoutes.ts";
import {
  closeMongoConnection,
  connectToMongo,
} from "./services/mongo.ts";

// ATTACH EXTRA DATA TO SENTRY - pictures. searchable tags for sorting ( username, portalname )
// ATTACH sequence that made me go to the error ( response and other data )
// Checking Docker for mongoDB

// CONSTANTS
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000; // Default to 3000 if PORT is not set
const HOST = process.env.HOST;


// Fastify Server
// Create Fastify instance
const app = fastify({
  logger: true,
  ajv: {
    customOptions: {
      strict: false,
      validateFormats: true,
    },
  },
});


// Sentry Middleware
Sentry.setupFastifyErrorHandler(app);

// Custom Error Handler
app.setErrorHandler((error, request, reply) => {
  // Check if the error has a statusCode property
  const statusCode = error.statusCode || 500; // Default to 500 if no statusCode is present

  // Initialize a Sentry event
  const eventId = Sentry.captureException(error, (scope) => {
    // Tag the error with its status code
    scope.setTag("error_status", String(statusCode));
    return scope;
  });

  // Optionally, you can log the eventId or use it in your response
  console.log(`Error reported to Sentry with Event ID: ${eventId}`);

  // Standard error handling response
  reply.status(statusCode).send({
    message: "An internal server error occurred",
  });
});


// Register all routes
endpointRoutes.forEach((route) => {
  app.register((app, opts, done) => {
    app.route(route);
    done();
  });
});

// Start the server using an options object
const startServer = async () => {
  try {
    await app.listen({
      port: PORT,
      host: HOST,
    });
    console.log(`Server listening on 'http://${HOST}:${PORT}/'`);
    connectToMongo();
  } catch (err) {
    console.error("Error starting Fastify server:", err);
    await closeMongoConnection();
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  await closeMongoConnection();
  process.exit(0);
});

// Call the startServer function to initiate the server
startServer();
