import * as puppeteer from "puppeteer";
import * as hash from "hash";
import { Cache } from "./services/cache.ts";
import {
  MontoAuthentication,
  MontoCredential,
} from "./types/AuthInterfaces.ts";
import { getAllInvoicesAPIResponseFilter } from "./schemas/getInvoiceFilterSchema.ts";
import { MontoInvoiceSite } from "./types/InvoiceTypes.ts";

const rootURL = process.env.URL!;
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
  const key = hash.code(username + password);
  const cacheObj = new Cache();
  const token = await cacheObj.get("appSession");

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
    `${rootURL}/api/monto/fetch_all_invoices?tab=new`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        cookie: `appSession=${authentication.token}`,
        Referer: `${rootURL}/invoices?tab=new`,
      },
    }
  );
  const data = await response.json();
  const filteredInvoices: getAllInvoicesAPIResponseFilter = data
    .filter((invoiceData: any) => {
      if (filters?.date) {
        const invoiceDate = new Date(invoiceData.invoice_date);
        if (invoiceDate != new Date(filters.date)) {
          return false;
        }
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

// async function Main() {
//   const credential: MontoCredential = {
//     rootUrl: String(URL),
//     username: String(USERNAME),
//     password: String(PASSWORD),
//   };
//   const authentication: MontoAuthentication = await getAuthentication(
//     credential
//   );
//   console.log(authentication);

//   const invoices: MontoInvoiceSite[] = await getInvoices(authentication);
//   console.log(invoices);

// }

// Main();
