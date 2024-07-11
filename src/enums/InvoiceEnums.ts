const MontoInvoicePortalStatus = {
  type: "string",
  enum: ["Approved", "Pending Approval", "Paid", "Rejected", "Canceled"],
};

const MontoInvoiceInternalStatus = {
  type: "string",
  enum: ["in_process", "pending_action", "pending_buyer", "uploaded", "processed", "preprocessed"],
};

export { MontoInvoicePortalStatus, MontoInvoiceInternalStatus };
