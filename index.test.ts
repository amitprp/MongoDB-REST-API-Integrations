import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Cache } from "./services/cache.ts";

const cache = new Cache();

const credentials = {
  rootUrl: process.env.ROOT_URL!,
  username: process.env.USER_NAME!,
  password: process.env.PASSWORD!,
};

// Sleep function to pause execution for a given amount of time
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Cache Utility", () => {
  const key = "test_key";
  const value = { foo: "bar" };
  const ttl = 3000;

  it("Should set a cache key", async () => {
    assert.doesNotThrow(async () => cache.set(key, value, ttl));
  });

  it("Should retrieve a cache key", async () => {
    const cacheValue = await cache.get(key);
    assert.deepStrictEqual(cacheValue, value);
  });

  it("Should retrieve an expired cache key", async () => {
    await cache.set(key, value, ttl);
    await sleep(ttl);
    const cacheValue = await cache.get(key);
    assert.deepStrictEqual(cacheValue, null);
  });
});

// describe("Invoices Data Extractor", () => {
//     it("Should get authentication", async () => {
//         const authentication = await getAuthentication(credentials);
//         assert(authentication.token);
//     });

//     it("Should get scraped invoices", async () => {
//         const authentication = await getAuthentication(credentials);
//         const invoices = await getInvoices(authentication);
//         assert(invoices.length > 0);
//     });

//     it("Should get scraped filtered invoices", async () => {
//         const authentication = await getAuthentication(credentials);
//         const filters = {
//             date: "2024-02-04"
//         };
//         const invoices = await getInvoices(authentication, filters);
//         assert(invoices.length > 0);
//     });
//     //
//     // it("Should get scraped invoices from API", async () => {
//     //     const url = "http://localhost:3000/invoices/scrape";
//     //     const options = {
//     //         method: "GET",
//     //         headers: {
//     //             "Content-Type": "application/json",
//     //         }
//     //     };
//     //     const response = await fetch(url, options);
//     //     const data = await response.json();
//     //
//     //     assert(data.length > 0);
//     // });
// });
