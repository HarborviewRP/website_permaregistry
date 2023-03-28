import { Db, MongoClient } from "mongodb";

let uri = process.env.MONGODB_URI;
let dbName = process.env.MONGODB_DB;

let cachedClient: MongoClient | null;
let cachedDb: Db | null;

if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env"
  );
}

if (!dbName) {
  throw new Error(
    "Please define the MONGODB_DB environment variable inside .env"
  );
}

export async function dbConnect() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }
  const client = await MongoClient.connect(uri as string, {
    maxPoolSize: 15,
  });

  const db = await client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export const closeConnection = async (client: MongoClient) => {
  if (cachedClient === client) {
    await client.close();
    cachedClient = null;
    cachedDb = null;
  }
};

export const getApplicationCollection = async () => {
  const client = await dbConnect();
  return {
    collection: client.db.collection("applications"),
    client: client.client,
  };
};

export const getInterviewCollection = async () => {
  const client = await dbConnect();
  return {
    collection: client.db.collection("interviews"),
    client: client.client,
  };
};

export const getUserCollection = async () => {
  const client = await dbConnect();
  return {
    collection: client.db.collection("users"),
    client: client.client,
  };
};
