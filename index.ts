import * as puppeteer from "puppeteer";
import { Cache } from "./src/services/cache.ts";
import {
  MontoAuthentication,
  MontoCredential,
} from "./src/types/AuthInterfaces.ts";
import { getAllInvoicesAPIResponseFilter } from "./src/schemas/getInvoiceFilterSchema.ts";
import { MontoInvoiceSite } from "./src/types/InvoiceTypes.ts";

const URL = process.env.URL!;
const USERNAME = process.env.USERNAME!;
const PASSWORD = process.env.PASSWORD!;

// Sleep function to pause execution for a given amount of time
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function min(a: number, b: number): number {
  return a < b ? a : b;
}

// Function to save cookies to a file
async function getSessionCookie(key, page): Promise<any | null> {
  const cookies = await page.cookies();
  const { token, ttl } = cookies.reduce(
    (acc, cookie) => {
      if (cookie.name === "appSession") {
        acc.token = cookie.value;
        acc.ttl = cookie.expires;
      }
      return acc;
    },
    { token: null, ttl: null }
  );

  return { key, token, ttl };
}

export async function getAuthentication(
  credential: MontoCredential
): Promise<MontoAuthentication> {
  const { rootUrl, username, password } = credential;
  const key = username + password;
  const cacheObj = new Cache();
  const token = await cacheObj.get(key);

  if (token) {
    return { token };
  }

  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(rootUrl);

  await page
    .waitForSelector("input#username")
    .then(async () => await page.type("input#username", username));
  await page
    .waitForSelector("input#password")
    .then(async () => await page.type("input#password", password));
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  const connectionData = await getSessionCookie(key, page);
  cacheObj.set(
    connectionData.key,
    connectionData.token,
    min(5 * 60 * 1000, connectionData.ttl)
  ); // 5 minutes TTL

  return { token: connectionData.token };
}

export async function getInvoices(
  authentication: MontoAuthentication,
  filters?: getAllInvoicesAPIResponseFilter
): Promise<any> {
  const response = await fetch(
    `${URL}api/monto/fetch_all_invoices?tab=new`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: `appSession=${authentication.token}`,
        Referer: `${URL}invoices?tab=new`,
      },
    }
  );
  const data = await response.json();
  const filteredInvoices: getAllInvoicesAPIResponseFilter = data
    .filter((invoiceData: any) => {
      let start_date, end_date;
      if (!filters?.start_date) {
        start_date = 0;
      } else {start_date = filters.start_date.getTime();}
      if(!filters?.end_date){
        end_date = Infinity;
      } else {end_date = filters.end_date.getTime();}
      const invoiceDate = new Date(invoiceData.invoice_date).getTime();
      if (invoiceDate > end_date || invoiceDate < start_date) {
        return false;
      }
      if (filters?.status) {
        if (invoiceData.status != filters.status) {
          return false;
        }
      }
      if (filters?.portal) {
        if (invoiceData.portal_name != filters.portal) {
          return false;
        }
      }
      return true;
    })
    .map((invoiceData: any) => {
      const invoice: MontoInvoiceSite = {
        _id: invoiceData._id,
        monto_customer: invoiceData.monto_customer,
        buyer: invoiceData.buyer,
        portal_name: invoiceData.portal_name,
        invoice_number: invoiceData.invoice_number,
        status: invoiceData.status,
        type: invoiceData.type,
        monto_backoffice_data: invoiceData.monto_backoffice_data,
        due_date: invoiceData.due_date,
        invoice_date: invoiceData.invoice_date,
        total: invoiceData.total,
        created_by: invoiceData.created_by,
        created_time: invoiceData.created_time,
        is_poc_participant: invoiceData.is_poc_participant,
      };
      return invoice;
    });
  return filteredInvoices;
}
