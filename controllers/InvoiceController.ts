import Sentry from "../services/sentry.ts";
import { FastifyReply, FastifyRequest } from "fastify";
import { getInvoicesCollection } from "../services/mongo.ts";
import { MontoInvoiceDatabase, MontoInvoiceGet, MontoInvoiceSite } from "../types/InvoiceTypes.ts";
import { getInvoices, getAuthentication } from "../index.ts";
import { ObjectId } from "mongodb";
import { MontoAuthentication } from "../types/AuthInterfaces.ts";
import { getAllInvoicesAPIResponseFilter } from "../schemas/getInvoiceFilterSchema.ts";
import { Cache } from "../services/cache.ts";
import * as hash from "hash";


const invoicesCollection = getInvoicesCollection();
const cache = new Cache();

export const addInvoice = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const collection = await invoicesCollection();
    const invoice = req.body as MontoInvoiceDatabase;
    await collection.insertOne(invoice);
    reply.send(invoice);
  } catch (err) {
    Sentry.captureException(err);
    reply.code(500).send({ error: err });
  }
};

export const getInvoicesByFilter = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const filters: Record<string, any> = {};

    // Extract query parameters
    const {
      portal_name,
      buyer,
      status,
      start_date,
      end_date,
      min_total,
      max_total,
      ...extraParams
    } = req.query as Partial<MontoInvoiceGet>;

    // Check for any extraneous parameters
    if (Object.keys(extraParams).length > 0) {
      return reply
        .status(404)
        .send({ error: "Invalid query parameters", extraParams });
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
    const collection = await invoicesCollection();
    const invoices = await collection.find(filters).toArray();

    reply.send(invoices);
  } catch (err) {
    Sentry.captureException(err);
    req.log.error("Error fetching invoices:", err);
    reply.code(500).send({ error: "Internal Server Error" });
  }
};

export const getAllInvoicesFromAPI = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    let invoices: MontoInvoiceSite[];
    const {
      date,
      portal,
      status,
      ...extraParams
    } = req.query as Partial<getAllInvoicesAPIResponseFilter>;

    if (Object.keys(extraParams).length > 0) {
      return reply
        .status(404)
        .send({ error: "Invalid query parameters", extraParams });
    }

    const filters: Record<string, any> = {
      date,
      portal,
      status
    };


  

    const key = hash.code("invoices" + JSON.stringify(filters));

    invoices = await cache.get(key)

    if(!invoices) {
      const authentication: MontoAuthentication = await getAuthentication({
        rootUrl: process.env.URL || "",
        username: process.env.USERNAME || "",
        password: process.env.PASSWORD || "",
      });
      
      invoices = await getInvoices(authentication, filters);
      await cache.set(key, invoices, 5 * 60 * 1000); // 5 minutes TTL
      for (let i = 0; i < invoices.length; i++) {
        const invoice = invoices[i];
        const collection = await invoicesCollection();
        const id = new ObjectId(invoice._id);
        await collection.findOneAndUpdate({ _id: id }, { $set: invoice }, { upsert: true });
      }
    }
    
    reply.send(invoices);
    
  } catch (err) {
    Sentry.captureException(err);
    req.log.error("Error fetching invoices:", err);
    reply.code(500).send({ error: err });
  }
};
export const getInvoiceById = async (
    req: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const collection = await invoicesCollection();
      const params = req.params as { id: string };
      const invoiceId: ObjectId = new ObjectId(params.id);
      const invoice = await collection.findOne({ _id: invoiceId });
      if (!invoice) {
        reply.code(404).send({ error: "Invoice not found" });
      } else {
        reply.send(invoice);
      }
    } catch (err) {
      Sentry.captureException(err);
      reply.code(500).send({ error: err });
    }
  };
  
export const deleteInvoice = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const collection = await invoicesCollection();
    const params = req.params as { id: string };
    const invoiceId: ObjectId = new ObjectId(params.id);
    const result = await collection.deleteOne({ _id: invoiceId });
    if (result.deletedCount === 0) {
      reply.code(404).send({ error: "Invoice not found" });
    } else {
      reply.send({ message: `Invoice deleted successfully, id: ${invoiceId}` });
    }
  } catch (err) {
    Sentry.captureException(err);
    reply.code(500).send({ error: err });
  }
};

export const updateInvoice = async (
  req: FastifyRequest,
  rep: FastifyReply
) => {
  try {
    const collection = await invoicesCollection();
    const params = req.params as { id: string };
    const invoiceId: ObjectId = new ObjectId(params.id);
    const updateData = req.body as MontoInvoiceDatabase;
    const result = await collection.updateOne(
      { _id: invoiceId },
      { $set: updateData }
    );
    if (result.modifiedCount === 0) {
      rep.code(404).send({ error: "Invoice not found" });
    } else {
      rep.send({ message: `Invoice updated successfully, new Invoice: ${updateData}` });
    }
  } catch (err) {
    Sentry.captureException(err);
    rep.code(500).send({ error: err });
  }
}

export default {
  addInvoice,
  deleteInvoice,
  getInvoicesByFilter,
  getInvoiceById,
  updateInvoice
};
