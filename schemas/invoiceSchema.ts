const MontoInvoiceStatus = {
    type: 'string',
    enum: ['Approved', 'Pending Approval', 'Paid', 'Rejected', 'Canceled']
  };
  
  export const invoiceSchema = {
    type: 'object',
    properties: {
      portal_name: { type: 'string' },
      invoice_number: { type: 'string' },
      po_number: { type: 'string' },
      buyer: { type: 'string' },
      status: MontoInvoiceStatus,
      invoice_date: { type: 'string', format: 'date-time' },
      currency: { type: 'string' },
      total: { type: 'number' }
    },
    required: ['portal_name', 'invoice_number', 'buyer', 'status', 'invoice_date', 'currency', 'total'],
    additionalProperties: false
  };