import { MongoClient } from "mongodb";

//CONSTANTS

const MONGO_URI = process.env.MONGO_URI;
const DATABASE_NAME = process.env.DATABASE_NAME;
const INVOICES_COLLECTION = process.env.INVOICES_COLLECTION;

// Initialize Connection
// let db;
// export const mongoClient = new MongoClient(MONGO_URI);

// export const connectToMongo = async () => {
//   try {
//     await mongoClient.connect();
//     db = mongoClient.db(DATABASE_NAME);
//     console.log("Connected to MongoDB");
//   } catch (error) {
//     console.error("MongoDB connection error:", error);
//   }
// };

// export const closeMongoConnection = async () => {
//   console.log("Closing MongoDB connection");
//   await mongoClient.close();
// };

// export const getInvoicesCollection = () => {
//   return async () => db.collection(INVOICES_COLLECTION);
// };

// export default db;
export class MongoDB {
  private static instance: MongoDB;
  private db: any;
  private mongoClient: MongoClient;

  private constructor() {
    // Initialize Connection
    this.db = null;
    this.mongoClient = new MongoClient(MONGO_URI);
  }

  public static getInstance(): MongoDB {
    if (!MongoDB.instance) {
      MongoDB.instance = new MongoDB();
      // await MongoDB.instance.connectToMongo();
    }
    return MongoDB.instance;
  }

  public async connectToMongo(): Promise<void> {
    try {
      await MongoDB.instance.mongoClient.connect();
      MongoDB.instance.db = MongoDB.instance.mongoClient.db(DATABASE_NAME);
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
    }
  }

  public async closeMongoConnection(): Promise<void> {
    console.log("Closing MongoDB connection");
    await MongoDB.instance.mongoClient.close();
  }

  public async getInvoicesCollection() {
    if (MongoDB.instance.db) {
      return MongoDB.instance.db.collection(INVOICES_COLLECTION);
    } else {
      return null;
    }
  }
}

export default MongoDB.getInstance();