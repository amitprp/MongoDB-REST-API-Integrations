import { FastifySchema } from "fastify";
import { MontoInvoicePortalStatus } from "../../enums/InvoiceEnums.ts";

export const updateInvoiceSchema: FastifySchema = {
  body: {
    type: "object",
    properties: {
      portal_name: { type: "string" },
      invoice_number: { type: "string" },
      po_number: { type: "string" },
      buyer: { type: "string" },
      status: MontoInvoicePortalStatus,
      invoice_date: { type: "string", format: "date-time" },
      currency: { type: "string" },
      total: { type: "number" },
    },
    required: [
      "portal_name",
      "invoice_number",
      "buyer",
      "status",
      "invoice_date",
      "currency",
      "total",
    ],
    additionalProperties: false,
  },
  params: {
    type: "object",
    properties: {
      id: { type: "string", pattern: "^[0-9a-fA-F]{24}$" }, // Assuming MongoDB ObjectId
    },
    required: ["id"],
  },
  response: {
    200: {
      description: "Successful response",
      type: "object",
      properties: {
        _id: { type: "string" },
        portal_name: { type: "string" },
        invoice_number: { type: "string" },
        po_number: { type: "string" },
        buyer: { type: "string" },
        status: MontoInvoicePortalStatus,
        invoice_date: { type: "string", format: "date-time" },
        currency: { type: "string" },
        total: { type: "number" },
      },
    },
  },
};
