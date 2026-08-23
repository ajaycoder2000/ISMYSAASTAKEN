import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
  connected: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache || { conn: null, promise: null, connected: false };

if (!global._mongooseCache) {
  global._mongooseCache = cached;
}

export function isMongoConnected(): boolean {
  return cached.connected && !!cached.conn && cached.conn.connection.readyState === 1;
}

async function dbConnect(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) {
    return null;
  }

  if (cached.conn && cached.conn.connection.readyState === 1) {
    cached.connected = true;
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 1500, // fast timeout for seamless local dev fallback
      connectTimeoutMS: 1500,
    };
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        cached.connected = true;
        return m;
      })
      .catch((err) => {
        cached.connected = false;
        cached.promise = null;
        console.warn('MongoDB connection unavailable — using local persistent dev store fallback.');
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
    cached.connected = !!cached.conn && cached.conn.connection.readyState === 1;
    return cached.conn;
  } catch {
    cached.promise = null;
    cached.connected = false;
    return null;
  }
}

export default dbConnect;
