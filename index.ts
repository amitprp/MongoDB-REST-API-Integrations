import * as puppeteer from "puppeteer";
import * as path from "path";
import * as fs from "fs";
import { MontoAuthentication, MontoCredential } from "./types/AuthInterfaces.ts";

const URL = process.env.URL;
const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

// Sleep function to pause execution for a given amount of time
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class cache {
  private cacheData: { [key: string]: { value: any; ttl: number } };
  private SESSION_PATH: string;

  constructor() {
    // Path to the cookie file
    this.SESSION_PATH = path.resolve("./cookieSession.json");
    this.cacheData = {};
  }

  async get(key: string): Promise<any> {
    let cacheEntry;
    if (this.cacheData[key]) {
      cacheEntry = this.cacheData[key];
    } else if (fs.existsSync(this.SESSION_PATH)) {
      const appSessionString = fs.readFileSync(this.SESSION_PATH, "utf8");
      cacheEntry = JSON.parse(appSessionString);
    }
    if (cacheEntry && cacheEntry?.ttl > Date.now() / 1000) {
      return cacheEntry.value;
    }
    return null;
  }

  async set(key: string, token: any, ttl: number) {
    this.cacheData[key] = { value: token, ttl: ttl };
    // Save cache data to file
    fs.writeFileSync(
      this.SESSION_PATH,
      JSON.stringify(this.cacheData, null, 2)
    );
  }
}

// Function to save cookies to a file
async function getSessionCookie(page): Promise<any | null> {
  const key = "appSession";
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


async function getAuthentication(credential: MontoCredential): Promise<MontoAuthentication> {
    const { rootUrl, username, password } = credential;
    const cacheObj = new cache();
    const token = await cacheObj.get("appSession");

    if (token) {
        return { token };
    }

    const browser = await puppeteer.launch({
        headless: true,
    });
    const page = await browser.newPage();
    await page.goto(rootUrl);

    await page.waitForSelector("input#username");
    await page.waitForSelector("input#password");
    await page.type("input#username", username);
    await page.type("input#password", password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    const cookieData = await getSessionCookie(page);
    cacheObj.set(cookieData.key, cookieData.token, 5 * 60 * 1000 + Date.now()); // 5 minutes TTL

    return { token: cookieData.token };
}

async function Main() {
    const credential: MontoCredential = { rootUrl: String(URL), username: String(USERNAME), password: String(PASSWORD)};
    const authentication: MontoAuthentication = await getAuthentication(credential);
    console.log(authentication);

//   let token;
//   const browser = await puppeteer.launch({
//     headless: false,
//   });
//   const cacheObj = new cache();
//   const page = await browser.newPage();
//   await page.goto(url);
//   token = await cacheObj.get("appSession");
//   if (!token) {
//     await page.waitForSelector("input#username");
//     await page.waitForSelector("input#password");
//     await page.type("input#username", username);
//     await page.type("input#password", password);
//     await page.click('button[type="submit"]');
//     await page.waitForNavigation();
//     const cookieData = await getSessionCookie(page);
//     cacheObj.set(cookieData.key, cookieData.token, cookieData.ttl);
//     token = cookieData.token;
//   }

//   await sleep(2000);

//   console.log(token);

  //   // Usage example:
  //   await sleep(2000); // Pause execution for 2 seconds

  //   const appSessionToken = await loadCookies();

  //   const response = await fetch(
  //     "https://backoffice.dev.montopay.com/api/monto/fetch_all_invoices?tab=new",
  //     {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/json",
  //         //   'cookie': `appSession=${appSessionToken}`,
  //         Referer: "https://backoffice.dev.montopay.com/invoices?tab=new",
  //       },
  //     }
  //   );

  //   console.log(response);
  //   //   await browser.close();
}

Main();
