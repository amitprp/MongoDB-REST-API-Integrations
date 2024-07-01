import { str } from "ajv";
import { FastifySchema } from "fastify";
import { MontoInvoiceStatus } from "../enums/InvoiceEnums.ts";


export const postInvoiceSchema: FastifySchema = {
  body: {
    type: "object",
    properties: {
      portal_name: { type: "string" },
      invoice_number: { type: "string" },
      po_number: { type: "string" },
      buyer: { type: "string" },
      status: MontoInvoiceStatus,
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
    additionalProperties: true,
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
        status: MontoInvoiceStatus,
        invoice_date: { type: "string", format: "date-time"},
        currency: { type: "string" },
        total: { type: "number" },
      },
    },
  },
};
