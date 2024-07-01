import { RouteOptions } from 'fastify';
import MontoInvoiceModel from "../Models/InvoiceModel.ts";
import { postInvoiceSchema } from "../schemas/postInvoiceSchema.ts";
import { MontoInvoiceGet, MontoInvoice } from "../types/InvoiceTypes.ts";
import { getInvoiceByIdSchema, getInvoiceFilterSchema } from "../schemas/getInvoiceFilterSchema.ts";
import { updateInvoiceSchema } from "../schemas/updateInvoiceSchema.ts";
import { deleteInvoiceSchema } from "../schemas/deleteInvoiceSchema.ts";
import * as invoicesController from '../controllers/invoiceController.ts';
import Sentry from './sentry.ts';

export const getHelloRoute: RouteOptions = {
    method: 'GET',
    url: '/hello',
    handler: async (request, reply) => {
        reply.send({ hello: 'world' });
    },
};

export const getErrorRoute: RouteOptions = {
    method: 'GET',
    url: '/error',
    handler: async (request, reply) => {
        try{
            throw new Error('This is a deliberate error for testing Sentry integration');
        } catch (error) {
            Sentry.captureException(error);
            request.log.error({ error: 'Internal Server Error' });
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    },
};

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
