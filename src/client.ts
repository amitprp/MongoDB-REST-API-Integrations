import { Error } from "mongoose";
import { invoiceSchema } from '../schemas/invoiceSchema.ts';
import MontoInvoiceModel from '../Models/InvoiceModel.ts';

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


// CONSTANTS
const PORT = 3000
const HOST = '0.0.0.0'

async function fetchHello(name: string) {
    try {
        const response: Response = await fetch(`http://${HOST}:${PORT}/hello?name=World`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Response:', data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
}

async function fetchError() {
  try {
      const response: Response = await fetch(`http://${HOST}:${PORT}/error`);
      console.log(response)
      // if (!response.ok) {
      //   throw new Error('Network response was not ok');
      // }
      const data = await response.json();
      console.log('Response:', data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
}

async function createInvoice(data: any) {
  try {
    const response = await fetch('http://localhost:3000/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const responseData = await response.json();
    console.log('Invoice created:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}


async function fetchInvoices(filters: Record<string, any>): Promise<MontoInvoice[] | undefined>  {
  try {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`http://localhost:3000/invoices?${query}`);
    const data = response.json()
    .then ((data: {error?: String; extraParams?: Record <string, any>}) => {
      if (data.error) {
        const extraParamsString: string = JSON.stringify(data.extraParams)
        throw new Error(`Problem with query: ${data.error}: ${extraParamsString}`);
      } else {
        console.log('Success:\n', data); // Logs the response data if no error
        return data
      }
    })
  } catch (error){
    if (error)
    console.error('Error fetching invoices:', error);
  }
  return
}

async function updateInvoice(invoiceId, updateData) {
  try {
    const response = await fetch(`http://localhost:3000/invoice/${invoiceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} - ${errorData.error}`);
    }

    const data = await response.json();
    console.log('Invoice updated successfully:', data);
  } catch (error) {
    console.error('Error updating invoice:', error.message);
  }
}

async function deleteInvoice(invoiceId) {
  try {
    const response = await fetch(`http://localhost:3000/invoice/${invoiceId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error: ${response.status} - ${errorData.error}`);
    }

    const data = await response.json();
    console.log('Invoice deleted successfully:', data);
  } catch (error) {
    console.error('Error deleting invoice:', error.message);
  }
}



// Data checks
const fetchProperties = {
  portal_name: 'New Data Invoice'
}

const invoiceData = {
  portal_name: 'New Data Invoice',
  invoice_number: 'INV123',
  buyer: 'John Doe',
  status: 'Approved',
  invoice_date: new Date().toISOString(),
  currency: 'USD',
  total: 200,
  h: '32'
};

const invoiceId = '6672ba29ace03ea8d75900d8';
const updateData = {
  portal_name: 'New Portal',
  invoice_number: 'INV-123456',
  po_number: 'PO-987654',
  buyer: 'New Buyer',
  status: 'Approved',
  invoice_date: '2023-06-25T00:00:00.000Z',
  currency: 'USD',
  total: 1500.00
};



// fetchHello('Amit');
// fetchError()
createInvoice(invoiceData)
const invoice: Promise<MontoInvoice[] | undefined> = fetchInvoices(fetchProperties);
const id = invoice[0].invoiceId
console.log(id)
// updateInvoice(invoiceId, updateData);
// deleteInvoice(invoiceId)