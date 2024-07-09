import { MontoInvoicePortalStatus } from "../enums/InvoiceEnums.ts";

// TypeScript type for MontoInvoice
export type MontoInvoiceDatabase = {
  id?: string;
  portal_name: string;
  invoice_number: string;
  po_number?: string;
  buyer: string;
  status: typeof MontoInvoicePortalStatus;
  invoice_date: Date;
  currency: string;
  total: number;
};
export type MontoInvoiceSite = {
    _id?: string;
    monto_customer: string;
    buyer: any;
    portal_name: string;
    invoice_number: string;
    status: string;
    type: string;
    monto_backoffice_data: any;
    due_date: string;
    invoice_date: string;
    total: number;
    created_by: any;
    created_time: string;
    is_poc_participant: null | boolean;
  };

export type MontoInvoiceGet = {
  portal_name: string;
  buyer: string;
  status: typeof MontoInvoicePortalStatus;
  start_date: string; // Assuming date-time format is represented as a string
  end_date: string; // Assuming date-time format is represented as a string
  min_total: number;
  max_total: number;
};
