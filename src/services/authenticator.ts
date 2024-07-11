import * as puppeteer from "puppeteer";
import { Cache } from "./cache.ts";
import {
  MontoAuthentication,
  MontoCredential,
} from "../types/AuthInterfaces.ts";
import * as utils from "./utils.ts";

export class Authenticator {
  private rootUrl: string;
  private username: string;
  private password: string;
  private cache: Cache;

  async setAuthentication(
    credential: MontoCredential,
  ): Promise<void> {
    const { rootUrl, username, password } = credential;
    this.rootUrl = rootUrl;
    this.username = username;
    this.password = password;
    this.cache = new Cache();
  }

  // Function to save cookies to a file
  async getSessionCookie(key, page): Promise<any | null> {
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

  async getAuthentication(): Promise<MontoAuthentication> {
    if (!this.rootUrl || !this.username || !this.password) {
      throw new Error("Authentication credentials not set");
    }
    const key = this.username + this.password;
    const token = await this.cache.get(key);

    if (token) {
      return { token };
    }

    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto(this.rootUrl);

    await page
      .waitForSelector("input#username")
      .then(async () => await page.type("input#username", this.username));
    await page
      .waitForSelector("input#password")
      .then(async () => await page.type("input#password", this.password));
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    const connectionData = await this.getSessionCookie(key, page);
    this.cache.set(
      connectionData.key,
      connectionData.token,
      utils.min(5 * 60 * 1000, connectionData.ttl)
    ); // 5 minutes TTL
    return { token: connectionData.token };
  }
}
