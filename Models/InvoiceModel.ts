import mongoose, { Document, Schema, Model } from 'mongoose';

// Invoice status
const MontoInvoiceStatus = {
    APPROVED: "Approved",
    PENDING_APPROVAL: "Pending Approval",
    PAID: "Paid",
    REJECTED: "Rejected",
    CANCELED: "Canceled",
  };
  
// TypeScript type for MontoInvoice
  type MontoInvoice = {
    portal_name: string;
    invoice_number: string;
    po_number?: string;
    buyer: string;
    status: string;
    invoice_date: Date;
    currency: string;
    total: number;
  };



// Mongoose schema for MontoInvoice
interface IMontoInvoice extends MontoInvoice, Document {}

const montoInvoiceSchema = new Schema<IMontoInvoice>({
  portal_name: { type: String, required: true },
  invoice_number: { type: String, required: true },
  po_number: { type: String, required: false },
  buyer: { type: String, required: true },
  status: { type: String, required: true, enum: Object.values(MontoInvoiceStatus) },
  invoice_date: { type: Date, required: true },
  currency: { type: String, required: true },
  total: { type: Number, required: true },
});

// Create the Mongoose model
const MontoInvoiceModel: Model<IMontoInvoice> = mongoose.model<IMontoInvoice>('MontoInvoice', montoInvoiceSchema);

export default MontoInvoiceModel;
  