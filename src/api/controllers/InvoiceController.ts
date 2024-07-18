import Sentry from "../../services/sentry.ts";
import { FastifyReply, FastifyRequest } from "fastify";
import { MongoDB } from "../../services/mongoDB.ts";
// import { getInvoicesCollection } from "../../services/mongoDB.ts";
import {
  MontoInvoiceDatabase,
  MontoInvoiceGet,
  MontoInvoiceSite,
} from "../../types/InvoiceTypes.ts";
import { ObjectId } from "mongodb";
import { Authenticator } from "../../services/authenticator.ts";
import { MontoAuthentication } from "../../types/AuthInterfaces.ts";
import { getAllInvoicesAPIResponseFilter } from "../../schemas/getInvoiceFilterSchema.ts";

const mongoDBInstance = MongoDB.getInstance();
import { Cache } from "../../services/cache.ts";

const invoicesCollection = await mongoDBInstance.getInvoicesCollection();
// const invoicesCollection = getInvoicesCollection()
const cache = Cache.getInstance();
const authenticator = new Authenticator();


export async function getInvoices(
  authentication: MontoAuthentication,
  filters?: getAllInvoicesAPIResponseFilter
): Promise<any> {
  const response = await fetch(`${URL}api/monto/fetch_all_invoices?tab=new`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      cookie: `appSession=${authentication.token}`,
      Referer: `${URL}invoices?tab=new`,
    },
  });
  const data = await response.json();
  const filteredInvoices: getAllInvoicesAPIResponseFilter = data
    .filter((invoiceData: any) => {
      let start_date, end_date;
      if (!filters?.start_date) {
        start_date = 0;
      } else {
        start_date = filters.start_date.getTime();
      }
      if (!filters?.end_date) {
        end_date = Infinity;
      } else {
        end_date = filters.end_date.getTime();
      }
      const invoiceDate = new Date(invoiceData.invoice_date).getTime();
      if (invoiceDate > end_date || invoiceDate < start_date) {
        return false;
      }
      if (filters?.status) {
        if (invoiceData.status != filters.status) {
          return false;
        }
      }
      if (filters?.portal) {
        if (invoiceData.portal_name != filters.portal) {
          return false;
        }
      }
      return true;
    })
    .map((invoiceData: any) => {
      const invoice: MontoInvoiceSite = {
        _id: invoiceData._id,
        monto_customer: invoiceData.monto_customer,
        buyer: invoiceData.buyer,
        portal_name: invoiceData.portal_name,
        invoice_number: invoiceData.invoice_number,
        status: invoiceData.status,
        type: invoiceData.type,
        monto_backoffice_data: invoiceData.monto_backoffice_data,
        due_date: invoiceData.due_date,
        invoice_date: invoiceData.invoice_date,
        total: invoiceData.total,
        created_by: invoiceData.created_by,
        created_time: invoiceData.created_time,
        is_poc_participant: invoiceData.is_poc_participant,
      };
      return invoice;
    });
  return filteredInvoices;
}


export const addInvoice = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const collection = invoicesCollection;
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
    const { start_date, end_date, portal, status, ...extraParams } =
      req.query as Partial<getAllInvoicesAPIResponseFilter>;

    if (Object.keys(extraParams).length > 0) {
      return reply
        .status(404)
        .send({ error: "Invalid query parameters", extraParams });
    }

    const filters: Record<string, any> = {};
    if (start_date) filters.start_date = start_date;
    if (end_date) filters.end_date = end_date;
    if (portal) filters.portal = portal;
    if (status) filters.status = status;

    // const filters = req.query as Partial<getAllInvoicesAPIResponseFilter>;

    const key = "invoices" + JSON.stringify(filters);

    invoices = await cache.get(key);

    if (!invoices) {
      await authenticator.setAuthentication({
        rootUrl: process.env.URL || "",
        username: process.env.USERNAME || "",
        password: process.env.PASSWORD || "",
      });
      
      const authentication: MontoAuthentication = await authenticator.getAuthentication();

      invoices = await getInvoices(authentication, filters);
      await cache.set(key, invoices, 5 * 60 * 1000); // 5 minutes TTL
      const collection = await invoicesCollection();
      for (let i = 0; i < invoices.length; i++) {
        const invoice = invoices[i];
        const id = new ObjectId(invoice._id);
        delete invoice._id;
        await collection.findOneAndUpdate(
          { _id: id },
          { $set: invoice },
          { upsert: true }
        );
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

export const updateInvoice = async (req: FastifyRequest, rep: FastifyReply) => {
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
      rep.send({
        message: `Invoice updated successfully, new Invoice: ${updateData}`,
      });
    }
  } catch (err) {
    Sentry.captureException(err);
    rep.code(500).send({ error: err });
  }
};

export default {
  addInvoice,
  deleteInvoice,
  getAllInvoicesFromAPI,
  getInvoicesByFilter,
  getInvoiceById,
  updateInvoice,
};
