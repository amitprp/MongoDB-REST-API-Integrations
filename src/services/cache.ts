import * as path from "path";
import * as fs from "fs";
import * as crypto from "crypto";

export class Cache {
  private static instance: Cache;
  private cacheData: { [key: string]: { value: any; ttl: number } };
  private DATA_PATH: string;

  private constructor() {
    // Path to the cookie file
    this.DATA_PATH = path.resolve(process.env.SESSION_FILE!);
    this.cacheData = {};
  }

  // Cache is a singleton
  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  async init() {
    // Loading of Cache Data
    if (fs.existsSync(this.DATA_PATH)) {
      const cacheFile = await fs.promises.readFile(this.DATA_PATH, "utf8");
      Cache.instance.cacheData = cacheFile ? JSON.parse(cacheFile) : {};
      console.log("Cache Data Loaded");
    }

    setInterval(async () => {
      await fs.promises.writeFile(
        this.DATA_PATH,
        JSON.stringify(this.cacheData, null, 2)
      );
    }, 1000 * 60 * 3);
  }

  async saveCache(): Promise<any> {
    await fs.promises.writeFile(
      this.DATA_PATH,
      JSON.stringify(this.cacheData, null, 2)
    );
  }

  async get(key: string): Promise<any> {
    let cacheEntry;
    const hashedKey = this.hashString(key);
    if (this.cacheData[hashedKey]) {
      cacheEntry = this.cacheData[hashedKey];
    }
    if (cacheEntry && cacheEntry?.ttl > Date.now()) {
      return cacheEntry.value;
    }
    return null;
  }

  async set(key: string, data: any, ttl: number = 1000) {
    const hashedKey = this.hashString(key);
    // Remove expired entries
    Object.keys(this.cacheData).forEach((key) => {
      if (this.cacheData[key].ttl < Date.now()) {
        delete this.cacheData[key];
      }
    });

    this.cacheData[hashedKey] = { value: data, ttl: ttl + Date.now() };
  }

  hashString = (str: string): string => {
    const hash = crypto.createHash("sha256");
    hash.update(str);
    return hash.digest("hex");
  };
}
