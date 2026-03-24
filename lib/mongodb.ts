import { MongoClient, type Db } from "mongodb";

interface GlobalMongo {
  _mongoClientPromise?: Promise<MongoClient>;
}

const globalWithMongo = globalThis as unknown as GlobalMongo;

function requireEnv(name: "MONGODB_URI" | "MONGODB_DB"): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Define ${name} en .env.local (o en el entorno de despliegue).`);
  }
  return v;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = requireEnv("MONGODB_URI");
  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = new MongoClient(uri).connect();
  }
  return globalWithMongo._mongoClientPromise;
}

/** Cliente reutilizable (patrón recomendado en desarrollo / serverless). */
export async function getMongoClient(): Promise<MongoClient> {
  return getClientPromise();
}

export async function getEvaluationsDb(): Promise<Db> {
  const dbName = requireEnv("MONGODB_DB");
  const client = await getMongoClient();
  return client.db(dbName);
}

export const EVALUATIONS_COLLECTION = "evaluations";
