import mongoose from 'mongoose';

// تخزين الاتصال في الـ global object لتثبيته عبر الـ Serverless Invocations
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  const DATABASEURL = process.env.DB_URL;

  if (!DATABASEURL) {
    throw new Error('DB_URL is missing in environment variables');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // يمنع خيار البفرة المسبب للـ Timeout
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(DATABASEURL, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}