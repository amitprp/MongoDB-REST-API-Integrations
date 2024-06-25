import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Initialize Sentry
Sentry.init({
  dsn: 'https://77fbeaea02e0b1eb986a5583c066280e@o4507407914631168.ingest.us.sentry.io/4507407917449216',
  integrations: [
    nodeProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});


import mongoose from 'mongoose';
import * as dotenv from 'dotenv';



import fastify from 'fastify';
import MontoInvoiceModel from '../Models/InvoiceModel.ts';
import { invoiceSchema } from '../schemas/invoiceSchema.ts';
import { filterSchema } from '../schemas/filterSchema.ts'
import { updateInvoiceSchema } from '../schemas/updateInvoiceSchema.ts';
import { deleteSchema } from '../schemas/deleteSchema.ts';



// ATTACH EXTRA DATA TO SENTRY - pictures. searchable tags for sorting ( username, portalname )
// ATTACH sequence that made me go to the error ( response and other data )
// Checking Docker for mongoDB

// Load the .env file
dotenv.config({ path: '.env'});

// CONSTANTS
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000; // Default to 3000 if PORT is not set
const HOST = process.env.HOST
const MONGO_URI=process.env.MONGO_URI
const DATABASE_NAME=process.env.DATABASE_NAME
const SENTRY_DSN=process.env.SENTRY_DSN



// MongoDB
  // Initialize Connection
mongoose.connect(`${MONGO_URI}${DATABASE_NAME}`);

  // Handle Connection
const dbConnection = mongoose.connection;
dbConnection.on('error', console.error.bind(console, 'MongoDB connection error:'));
dbConnection.once('open', () => {
  console.log('Connected to MongoDB');
});


// Fastify Server
  // Create Fastify instance
const app = fastify({ logger: true });

// Sentry Middleware
Sentry.setupFastifyErrorHandler(app);

app.setErrorHandler((error, request, reply) => {
  Sentry.captureException(error);
  reply.status(500).send({ error: 'Internal Server Error' });
})

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
    // Respond with an error message
    reply.code(500).send({ error: 'Internal Server Error' });
  }
  // throw new Error('This is a deliberate error for testing Sentry integration');
});

// DELETE Endpoint
app.delete('/invoice/:id', {
  schema: deleteSchema
}, async (request, reply) => {
  const { id } = request.params as { id: string };

  try {
    const result = await MontoInvoiceModel.findByIdAndDelete(id);

    if (!result) {
      return reply.status(404).send({ error: 'Invoice not found' });
    }

    reply.status(200).send({ status: 'success', message: 'Invoice deleted successfully' });
  } catch (error) {
    request.log.error('Error deleting invoice:', error);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
});




// Define PUT endpoint to update invoices
app.put('/invoice/:id', { schema: updateInvoiceSchema }, async (request, reply) => {
  const { id } = request.params as { id: string };
  const updateData = request.body;

  try {
    const updatedInvoice = await MontoInvoiceModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedInvoice) {
      return reply.status(404).send({ error: 'Invoice not found' });
    }

    reply.status(200).send({ status: 'success', invoice: updatedInvoice });
  } catch (error) {
    request.log.error('Error updating invoice:', error);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
});

app.post('/invoice', {
  schema: {
    body: invoiceSchema
    }
  }, 
  async (request, reply) => {
  const invoice = request.body;

  try{
    const newInvoice = new MontoInvoiceModel(invoice);
    console.log(newInvoice)
    await newInvoice.save();
    reply.status(201).send({ status: 'success', invoice: newInvoice });
  } catch(error){
    reply.status(404).send({ error: 'Failed to save invoice' })
  }
});

// Define GET endpoint with filters and validation
app.get('/invoices', { schema: filterSchema }, async (request, reply) => {
  try {
    const filters: Record<string, any> = {};

    // Extract query parameters
    const { portal_name, buyer, status, start_date, end_date, min_total, max_total, ...extraParams } = request.query as any;


    // Check for any extraneous parameters
    if (Object.keys(extraParams).length > 0) {
      return reply.status(404).send({ error: 'Invalid query parameters', extraParams });
    }

    // Add filters based on query parameters
    if (portal_name) filters.portal_name = portal_name;
    if (buyer) filters.buyer = buyer;
    if (status) filters.status = status;
    if (start_date || end_date) {
      filters.invoice_date = {};
      if (start_date) filters.invoice_date.$gte = new Date(start_date);
      if (end_date) filters.invoice_date.$lte = new Date(end_date);
    }
    if (min_total || max_total) {
      filters.total = {};
      if (min_total) filters.total.$gte = min_total;
      if (max_total) filters.total.$lte = max_total;
    }

    

    // Fetch filtered data from MongoDB
    const invoices = await MontoInvoiceModel.find(filters);

    reply.send(invoices);
  } catch (error) {
    request.log.error('Error fetching invoices:', error);
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