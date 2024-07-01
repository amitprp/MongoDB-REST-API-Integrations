import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Import MongoDB native driver

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

import fastify from "fastify";
import { endpointRoutes } from "../services/routes.ts";
import { postInvoiceRoute, deleteInvoiceRoute } from "../services/routes.ts";
import {
  closeMongoConnection,
  connectToMongo,
  getInvoicesCollection,
} from "../services/mongo.ts";

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

// After defining all routes

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

// Sentry Middleware

// GET Routes
// Define GET endpoint /hello
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

process.on("SIGINT", async () => {
  await closeMongoConnection();
  process.exit(0);
});

// Call the startServer function to initiate the server
startServer();
// app.get("/hello", async (request, reply) => {
//   const { name } = request.query as { name: string };

//   if (!name) {
//     reply.code(400).send({ error: "Name parameter is required" });
//     return;
//   }

//   reply.send({ message: `Hello ${name}` });
// });

// // Define GET endpoint /error
// app.get("/error", async (request, reply) => {
//   try {
//     throw new Error(
//       "This is a deliberate error for testing Sentry integration"
//     );
//   } catch (error) {
//     Sentry.captureException(error);
//     request.log.error({ error: "Internal Server Error" });
//     reply.code(500).send({ error: "Internal Server Error" });
//   }
// });
