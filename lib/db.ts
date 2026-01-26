import { MongoClient, Db, ObjectId } from 'mongodb';

let isConnected: boolean = false;
let client: MongoClient | null = null;
let db: Db | null = null;

const checkConnection = async (client: MongoClient): Promise<boolean> => {
  try {
    // Ping the database to check if connection is alive
    await client.db('admin').command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
};

export const connectToDatabase = async (): Promise<Db> => {
  if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
  }

  if (!process.env.MONGODB_DB_NAME) {
    throw new Error('Please add your Mongo DB name to .env.local');
  }

  // Check if we have an existing connection and if it's still alive
  if (isConnected && client && db) {
    const isAlive = await checkConnection(client);
    if (isAlive) {
      return db;
    } else {
      // Connection is dead, reset state
      console.log('MongoDB connection is dead, reconnecting...');
      isConnected = false;
      client = null;
      db = null;
    }
  }

  try {
    let uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;

    // Ensure connection string has proper parameters
    if (uri && !uri.includes('retryWrites')) {
      const separator = uri.includes('?') ? '&' : '?';
      uri = `${uri}${separator}retryWrites=true&w=majority`;
    }

    // MongoDB client options
    const options = {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      retryReads: true,
    };

    // In development, use global variable to preserve connection across hot reloads
    if (process.env.NODE_ENV === 'development') {
      const globalWithMongo = global as typeof globalThis & {
        _mongoClient?: MongoClient;
        _mongoDb?: Db;
      };

      // Check if global connection exists and is alive
      if (globalWithMongo._mongoClient && globalWithMongo._mongoDb) {
        const isAlive = await checkConnection(globalWithMongo._mongoClient);
        if (isAlive) {
          client = globalWithMongo._mongoClient;
          db = globalWithMongo._mongoDb;
          isConnected = true;
          return db;
        } else {
          // Close dead connection
          try {
            await globalWithMongo._mongoClient.close();
          } catch {
            // Ignore close errors
          }
          delete globalWithMongo._mongoClient;
          delete globalWithMongo._mongoDb;
        }
      }

      client = new MongoClient(uri, options);
      await client.connect();
      db = client.db(dbName);
      isConnected = true;

      globalWithMongo._mongoClient = client;
      globalWithMongo._mongoDb = db;

      console.log('MongoDB is connected');
      return db;
    } else {
      // Production: create new connection
      client = new MongoClient(uri, options);
      await client.connect();
      db = client.db(dbName);
      isConnected = true;

      console.log('MongoDB is connected');
      return db;
    }
  } catch (error: any) {
    console.error('MongoDB connection failed:', error);
    isConnected = false;
    client = null;
    db = null;
    throw error;
  }
};

export async function getDb(): Promise<Db> {
  return await connectToDatabase();
}

export type Project = {
  _id?: ObjectId;
  id: string; // Always present after toProject conversion
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  _id?: ObjectId;
  id: string; // Always present after toTask conversion
  projectId: string;
  title: string;
  description: string | null;
  category: 'bug' | 'feature' | 'refactor' | 'docs' | 'test' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'todo' | 'in_progress' | 'done';
  tags: string[];
  created_at: string;
  updated_at: string;
};

// Helper function to convert MongoDB document to Project type
export function toProject(doc: any): Project {
  if (!doc._id) {
    throw new Error('Document must have an _id field');
  }

  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description || undefined,
    created_at: doc.created_at || doc._id.getTimestamp().toISOString(),
    updated_at: doc.updated_at || doc._id.getTimestamp().toISOString(),
  };
}

// Helper function to convert MongoDB document to Task type
export function toTask(doc: any): Task {
  if (!doc._id) {
    throw new Error('Document must have an _id field');
  }

  return {
    id: doc._id.toString(),
    projectId: doc.projectId || '',
    title: doc.title,
    description: doc.description || null,
    category: doc.category,
    priority: doc.priority,
    status: doc.status,
    tags: doc.tags || [],
    created_at: doc.created_at || doc._id.getTimestamp().toISOString(),
    updated_at: doc.updated_at || doc._id.getTimestamp().toISOString(),
  };
}
