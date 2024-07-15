import { MongoClient } from "mongodb";

//CONSTANTS

const MONGO_URI = process.env.MONGO_URI;
const DATABASE_NAME = process.env.DATABASE_NAME;
const INVOICES_COLLECTION = process.env.INVOICES_COLLECTION;

// Initialize Connection
let db;
export const mongoClient = new MongoClient(MONGO_URI);

export const connectToMongo = async () => {
  try {
    await mongoClient.connect();
    db = mongoClient.db(DATABASE_NAME);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

export const closeMongoConnection = async () => {
  console.log("Closing MongoDB connection");
  await mongoClient.close();
};

export const getInvoicesCollection = () => {
  return async () => db.collection(INVOICES_COLLECTION);
};

export default db;
// class MongoDB {
//   private static instance: MongoDB;
//   private db: any;

//   private constructor() {
//     // Initialize Connection
//     this.db = null;
//   }

//   public static getInstance(): MongoDB {
//     if (!MongoDB.instance) {
//       MongoDB.instance = new MongoDB();
//     }
//     return MongoDB.instance;
//   }

//   public async connect(): Promise<void> {
//     try {
//       await mongoClient.connect();
//       this.db = mongoClient.db(DATABASE_NAME);
//       console.log("Connected to MongoDB");
//     } catch (error) {
//       console.error("MongoDB connection error:", error);
//     }
//   }

//   public async closeConnection(): Promise<void> {
//     console.log("Closing MongoDB connection");
//     await mongoClient.close();
//   }

//   public getInvoicesCollection() {
//     return this.db.collection(INVOICES_COLLECTION);
//   }
// }

// export default MongoDB.getInstance();