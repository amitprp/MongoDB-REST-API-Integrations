import fastify from 'fastify';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import mongoose from 'mongoose';
import MontoInvoiceModel from '../Models/InvoiceModel.ts';

// CONSTANTS
const PORT = 3000
const HOST = '0.0.0.0'
const mongoURL = 'mongodb://localhost:27017/';
const dataBase = 'IbrahimDemo'

// MongoDB
  // Initialize Connection
mongoose.connect(`${mongoURL}${dataBase}`);

  // Handle Connection
const dbConnection = mongoose.connection;
dbConnection.on('error', console.error.bind(console, 'MongoDB connection error:'));
dbConnection.once('open', () => {
  console.log('Connected to MongoDB');
});

// Initialize Sentry
Sentry.init({
    dsn: "https://77fbeaea02e0b1eb986a5583c066280e@o4507407914631168.ingest.us.sentry.io/4507407917449216",
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
  
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });

// Fastify Server
  // Create Fastify instance
const app = fastify({ logger: true });
  // GET Routes
    // Define GET endpoint /hello
app.get('/hello', async (request, reply) => {
  const { name } = request.query as { name: string };

  if (!name) {
    reply.code(400).send({ error: 'Name parameter is required' });
    return;
  }

  reply.send({ message: `Hello ${name}` });
});

    // Define GET endpoint /error
app.get('/error', async (request, reply) => {
  try {
    throw new Error('This is a deliberate error for testing Sentry integration');
  } catch (error) {
    // Capture the error with Sentry
    Sentry.captureException(error);

    // Respond with an error message
    reply.code(500).send({ error: 'Internal Server Error' });
  }
});

// Start the server using an options object
const startServer = async () => {
    try {
      await app.listen({
        port: PORT,
        host: HOST
      });
      console.log(`Server listening on 'http://${HOST}:${PORT}/'`);
    } catch (err) {
      console.error('Error starting Fastify server:', err);
      process.exit(1);
    }
  };
  
  // Call the startServer function to initiate the server
  startServer();