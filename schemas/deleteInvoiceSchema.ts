import { FastifySchema } from "fastify";
import { MontoInvoiceStatus } from "./enums.ts";

export const deleteInvoiceSchema: FastifySchema = {
  params: {
    type: "object",
    properties: {
      id: { type: "string" },
    },
    required: ["id"],
    additionalProperties: false,
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
        invoice_date: { type: "string", format: "date-time" },
        currency: { type: "string" },
        total: { type: "number" },
      },
    },
  },
};
