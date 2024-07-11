import { FastifySchema } from "fastify";
import { MontoInvoicePortalStatus } from "../enums/InvoiceEnums.ts";

export const getInvoiceFilterSchema: FastifySchema = {
  querystring: {
    type: "object",
    properties: {
      portal_name: { type: "string" },
      buyer: { type: "string" },
      status: MontoInvoicePortalStatus,
      start_date: { type: "string", format: "date-time" },
      end_date: { type: "string", format: "date-time" },
      min_total: { type: "number" },
      max_total: { type: "number" },
    },
    additionalProperties: true,
    required: [],
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

export const getInvoiceByIdSchema: FastifySchema = {
  querystring: {
    type: "object",
    properties: {
      id: { type: "string" },
    },
    additionalProperties: true,
    required: [],
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

export interface getAllInvoicesAPIResponseFilter {
  start_date?: Date;
  end_date?: Date;
  portal?: string;
  status?: string;
}
