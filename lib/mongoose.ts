import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const cached = global.mongoose ?? { conn: null, promise: null };
if (!global.mongoose) {
  global.mongoose = cached;
}

// 监听连接事件
mongoose.connection.on('connected', () => {
  console.log('MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected');
});


mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

// 检查连接是否真正可用（仅 connected 状态，不含 connecting）
const isConnectionReady = (): boolean => {
  return mongoose.connection.readyState === mongoose.ConnectionStates.connected;
};

export const connectToDatabase = async (): Promise<void> => {
  mongoose.set('strictQuery', true);

  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI environment variable is not set. Please configure it in your environment variables.'
    );
  }

  // 连接已建立且状态正常，直接返回
  if (isConnectionReady()) {
    return;
  }

  // 正在连接中，等待现有连接完成
  if (cached.promise) {
    await cached.promise;
    return;
  }

  const maxRetries = 3;
  let lastError: Error | null = null;

  cached.promise = (async () => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await mongoose.connect(process.env.MONGODB_URI!, {
          bufferCommands: false,
          dbName: process.env.MONGODB_DB_NAME || 'dev-tasks',
          serverSelectionTimeoutMS: 15000,
          connectTimeoutMS: 15000,
          socketTimeoutMS: 45000,
          maxPoolSize: 10,
          minPoolSize: 1,
          maxIdleTimeMS: 30000,
          retryWrites: true,
          w: 'majority',
        });

        console.log('MongoDB is connected');
        return mongoose;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          console.warn(`MongoDB connection attempt ${attempt}/${maxRetries} failed (will retry):`, lastError);
        } else {
          console.error(`MongoDB connection failed after ${maxRetries} attempts:`, lastError);
        }

        // 仅在失败时关闭已有连接以便重试
        if (mongoose.connection.readyState !== mongoose.ConnectionStates.disconnected) {
          try {
            await mongoose.connection.close();
          } catch (closeError) {
            console.warn('Error closing connection before retry:', closeError);
          }
        }

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        } else {
          cached.promise = null;
          throw new Error(
            `Failed to connect to MongoDB after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}. ` +
              `Please check your MONGODB_URI and ensure MongoDB Atlas IP whitelist includes your server's IP address.`
          );
        }
      }
    }

    cached.promise = null;
    throw lastError ?? new Error('Failed to connect to MongoDB');
  })();

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
};
