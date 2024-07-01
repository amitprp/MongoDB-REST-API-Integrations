import { RouteOptions } from 'fastify';
import MontoInvoiceModel from "../Models/InvoiceModel.ts";
import { postInvoiceSchema } from "../schemas/postInvoiceSchema.ts";
import { MontoInvoiceGet, MontoInvoice } from "../types/InvoiceTypes.ts";
import { getInvoiceByIdSchema, getInvoiceFilterSchema } from "../schemas/getInvoiceFilterSchema.ts";
import { updateInvoiceSchema } from "../schemas/updateInvoiceSchema.ts";
import { deleteInvoiceSchema } from "../schemas/deleteInvoiceSchema.ts";
import * as invoicesController from '../controllers/invoiceController.ts';

export const getInvoicesByFilterRoute: RouteOptions = {
    method: 'GET',
    url: '/invoices',
    handler: invoicesController.getInvoicesByFilter,
    schema: getInvoiceFilterSchema, 

};
export const getInvoiceByIDRoute: RouteOptions = {
    method: 'GET',
    url: '/invoices/:id',
    handler: invoicesController.getInvoiceById,
    schema: getInvoiceByIdSchema,
};


export const postInvoiceRoute: RouteOptions = {
    method: 'POST',
    url: '/invoices',
    handler: invoicesController.addInvoice,
    schema: postInvoiceSchema,
};

export const deleteInvoiceRoute: RouteOptions = {
    method: 'DELETE',
    url: '/invoices/:id',
    handler: invoicesController.deleteInvoice,
    schema: deleteInvoiceSchema,
};

const updateInvoiceRoute: RouteOptions = {
    method: 'PUT',
    url: '/invoices/:id',
    handler: invoicesController.updateInvoice,
    schema: updateInvoiceSchema,
};

export const endpointRoutes: RouteOptions[] = [
    getInvoiceByIDRoute,
    getInvoicesByFilterRoute,
    postInvoiceRoute,
    deleteInvoiceRoute,
    updateInvoiceRoute,
];
