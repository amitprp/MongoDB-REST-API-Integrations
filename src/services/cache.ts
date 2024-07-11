import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";

export class Cache {
  private cacheData: { [key: string]: { value: any; ttl: number } };
  private DATA_PATH: string;

  constructor() {
    // Path to the cookie file
    this.DATA_PATH = path.resolve("./cache.json");
    this.cacheData = {};
  }

  async get(key: string): Promise<any> {
    let cacheEntry;
    const hashedKey = this.hashString(key);
    if (this.cacheData[hashedKey]) {
      cacheEntry = this.cacheData[hashedKey];
    } else if (fs.existsSync(this.DATA_PATH)) {
      const appSessionString = await fs.promises.readFile(
        this.DATA_PATH,
        "utf8"
      );
      cacheEntry = JSON.parse(appSessionString);
    }
    if (cacheEntry && cacheEntry?.ttl > Date.now()) {
      return cacheEntry.value;
    }
    return null;
  }

  async set(key: string, data: any, ttl: number = 1000) {
    const hashedKey = this.hashString(key);

    // Step 1: Read existing cache data
    try {
      if (fs.existsSync(this.DATA_PATH)) {
        const data = await fs.promises.readFile(this.DATA_PATH, "utf8");
        this.cacheData = JSON.parse(data);
      }
    } catch (error) {
      console.error("Error reading cache data:", error);
      // If the file doesn't exist or there's an error, we start with an empty object
    }

    // Remove expired entries
    Object.keys(this.cacheData).forEach((key) => {
      if (this.cacheData[key].ttl < Date.now()) {
        delete this.cacheData[key];
      }
    });

    this.cacheData[hashedKey] = { value: data, ttl: ttl + Date.now() };
    // Save Cache data to file
    try {
      await fs.promises.writeFile(
        this.DATA_PATH,
        JSON.stringify(this.cacheData, null, 2)
      );
    } catch (error) {
      console.error("Error saving cache data:", error);
    }
  }

  hashString = (str: string): string => {
    const hash = crypto.createHash("sha256");
    hash.update(str);
    return hash.digest("hex");
  };
}
