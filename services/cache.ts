import * as path from "path";
import * as fs from "fs";

export class Cache {
  private cacheData: { [key: string]: { value: any; ttl: number } };
  private DATA_PATH: string;

  constructor() {
    // Path to the cookie file
    this.DATA_PATH = path.resolve(process.env.SESSION_PATH!);
    this.cacheData = {};
  }

  async get(key: string): Promise<any> {
    let cacheEntry;
    if (this.cacheData[key]) {
      cacheEntry = this.cacheData[key];
    } else if (fs.existsSync(this.DATA_PATH)) {
      const appSessionString = fs.readFileSync(this.DATA_PATH, "utf8");
      cacheEntry = JSON.parse(appSessionString);
    }
    if (cacheEntry && cacheEntry?.ttl > Date.now()) {
      return cacheEntry.value;
    }
    return null;
  }

  async set(key: string, data: any, ttl: number = 1000) {
    this.cacheData[key] = { value: data, ttl: ttl + Date.now() };
    // Save Cache data to file
    fs.writeFileSync(
      this.DATA_PATH,
      JSON.stringify(this.cacheData, null, 2)
    );
  }
}
