const MontoInvoiceStatus = {
  type: "string",
  enum: ["Approved", "Pending Approval", "Paid", "Rejected", "Canceled"],
};

export { MontoInvoiceStatus };
