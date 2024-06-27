import mongoose, { Document, Schema, Model } from 'mongoose';
import { MontoInvoiceStatus } from '../schemas/enums.ts';
import {MontoInvoice} from '../schemas/types.ts';
// Mongoose schema for MontoInvoice
interface IMontoInvoice extends MontoInvoice, Document { }

const montoInvoiceSchema = new Schema<IMontoInvoice>(
  {
    portal_name: { type: String, required: true },
    invoice_number: { type: String, required: true },
    po_number: { type: String, required: false },
    buyer: { type: String, required: true },
    status: MontoInvoiceStatus,
    invoice_date: { type: Date, required: true },
    currency: { type: String, required: true },
    total: { type: Number, required: true },

  });

// Create the Mongoose model
const MontoInvoiceModel: Model<IMontoInvoice> = mongoose.model<IMontoInvoice>('MontoInvoice', montoInvoiceSchema, 'Invoices');

export default MontoInvoiceModel;
