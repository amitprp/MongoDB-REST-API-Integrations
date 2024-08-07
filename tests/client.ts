import { Error } from "mongoose";

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
const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || 'localhost'
const invoicesRoute = 'invoices'

async function fetchHello(name: string) {
    try {
        const response: Response = await fetch(`http://${HOST}:${PORT}/hello?name=HiThere`);
        const responseData: JSON = await response.json()
        if (!response.ok) {
            throw new Error(JSON.stringify(responseData))
        }
        console.log('Response:', responseData);
      } catch (error) {
        console.error(error)
      }
}

async function fetchError() {
  try {
      const response: Response = await fetch(`http://${HOST}:${PORT}/error`);
      console.log(response)
      const data = await response.json();
      console.log('Response:', data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
}

async function createInvoice(data: any) {
  try {
    const response = await fetch(`http://localhost:3000/${invoicesRoute}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error creating invoice: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Invoice created:', responseData);
    return responseData;
  } catch (error) {
    console.error(error.message);
  }
}
async function fetchInvoiceById(invoiceId: string) {
  try {
    const response = await fetch(`http://localhost:3000/${invoicesRoute}/${invoiceId}`);
    const data = await response.json();
    console.log('Invoice:', data);
    return data;
  } catch (error) {
    console.error('Error fetching invoice:', error);
    throw error;
  }
}

async function fetchInvoices(filters: Record<string, any>) {
  try {
    const query = new URLSearchParams(filters).toString();
    const response = await fetch(`http://localhost:3000/${invoicesRoute}?${query}`);
    // const response = await fetch(`http://localhost:3000/${invoicesRoute}/get`);
    const data = await response.json()
    // .then ((data: {error?: String; extraParams?: Record <string, any>}) => {
    //   if (data.error) {
    //     const extraParamsString: string = JSON.stringify(data.extraParams)
    //     throw new Error(`Problem with query: ${data.error}: ${extraParamsString}`);
    //   } else {
    //     console.log('Success:\n', data); // Logs the response data if no error
    //     return data
    //   }
    // })
    
    console.log('Invoices:', data)
  } catch (error){
    if (error)
    console.error('Error fetching invoices:', error);
  }
  return
}

async function updateInvoice(invoiceId, updateData) {
  try {
    const response = await fetch(`http://localhost:3000/${invoicesRoute}/${invoiceId}`, {
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
    const response = await fetch(`http://localhost:3000/${invoicesRoute}/${invoiceId}`, {
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
  portal_name: 'Bill.com',
}

const invoiceData = {
  portal_name: 'newArcTry',
  invoice_number: 'INV123',
  buyer: 'John Doe',
  status: 'Approved',
  invoice_date: new Date().toISOString(),
  currency: 'USD',
  total: 200,
  h: '32'
};

const invoiceId = '6671ad48eecd8f79771f2f33';
const updateData = {
  portal_name: 'Bill',
  invoice_number: 'INV-123456',
  po_number: 'PO-987654',
  buyer: 'New Buyer',
  status: 'Approved',
  invoice_date: '2023-06-25T00:00:00.000Z',
  currency: 'USD',
  total: 1500.00,
};



// fetchHello('Amit');
// fetchError()
createInvoice(invoiceData)
// fetchInvoiceById(invoiceId);
// fetchInvoices(fetchProperties);
// console.log(invoice)
// updateInvoice(invoiceId, updateData);
// deleteInvoice(invoiceId)