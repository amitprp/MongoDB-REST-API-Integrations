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
