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
  const cache = await Cache.getInstance();
  const token = await cache.get(key);

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
  cache.set(
    connectionData.key,
    connectionData.token,
    min(5 * 60 * 1000, connectionData.ttl)
  ); // 5 minutes TTL

  return { token: connectionData.token };
}
