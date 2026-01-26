import { MongoClient, Db, ObjectId } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

if (!process.env.MONGODB_DB_NAME) {
  throw new Error('Please add your Mongo DB name to .env.local')
}

let uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB_NAME

// Ensure connection string has proper parameters
if (uri && !uri.includes('retryWrites')) {
  const separator = uri.includes('?') ? '&' : '?'
  uri = `${uri}${separator}retryWrites=true&w=majority`
}

// MongoDB client options for better connection handling
// Note: mongodb+srv:// automatically handles TLS, so we don't need to set it explicitly
const options = {
  maxPoolSize: 10,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 15000, // Increased timeout for Atlas connections
  socketTimeoutMS: 45000,
  connectTimeoutMS: 15000,
  retryWrites: true,
  retryReads: true,
  // For MongoDB Atlas, add these options
  directConnection: false,
  // Heartbeat frequency
  heartbeatFrequencyMS: 10000,
  // Explicitly set TLS options to handle potential environment issues
  tls: true,
  tlsAllowInvalidCertificates: true, // Only for troubleshooting, try to connect even if cert check fails
}

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
    _mongoClient?: MongoClient
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClient = client
    
    // Add error handling for connection
    globalWithMongo._mongoClientPromise = client.connect().catch((error) => {
      console.error('MongoDB connection error:', error.message)
      // Reset the promise so it can be retried
      delete globalWithMongo._mongoClientPromise
      throw error
    })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect().catch((error) => {
    console.error('MongoDB connection error:', error.message)
    throw error
  })
}

export async function getDb(): Promise<Db> {
  try {
    const client = await clientPromise
    return client.db(dbName)
  } catch (error: any) {
    console.error('Failed to get MongoDB database:', error.message)
    // Re-throw with more context
    throw new Error(`MongoDB connection failed: ${error.message}`)
  }
}

export type Task = {
  _id?: ObjectId
  id: string  // Always present after toTask conversion
  title: string
  description: string | null
  category: 'bug' | 'feature' | 'refactor' | 'docs' | 'test' | 'other'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'todo' | 'in_progress' | 'done'
  tags: string[]
  created_at: string
  updated_at: string
}

// Helper function to convert MongoDB document to Task type
export function toTask(doc: any): Task {
  if (!doc._id) {
    throw new Error('Document must have an _id field')
  }
  
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description || null,
    category: doc.category,
    priority: doc.priority,
    status: doc.status,
    tags: doc.tags || [],
    created_at: doc.created_at || doc._id.getTimestamp().toISOString(),
    updated_at: doc.updated_at || doc._id.getTimestamp().toISOString(),
  }
}
