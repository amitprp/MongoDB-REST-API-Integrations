import { MontoInvoiceStatus } from "../enums/InvoiceEnums.ts";

// TypeScript type for MontoInvoice
export type MontoInvoice = {
  portal_name: string;
  invoice_number: string;
  po_number?: string;
  buyer: string;
  status: typeof MontoInvoiceStatus;
  invoice_date: Date;
  currency: string;
  total: number;
};

export type MontoInvoiceGet = {
  portal_name: string;
  buyer: string;
  status: typeof MontoInvoiceStatus;
  start_date: string; // Assuming date-time format is represented as a string
  end_date: string; // Assuming date-time format is represented as a string
  min_total: number;
  max_total: number;
};
