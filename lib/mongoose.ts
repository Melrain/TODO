import mongoose from 'mongoose';

let isConnected: boolean = false;
let connectionPromise: Promise<void> | null = null;

// 监听连接事件，自动重置状态
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('MongoDB connection disconnected');
});

mongoose.connection.on('error', (error) => {
  isConnected = false;
  console.error('MongoDB connection error:', error);
});

// 检查连接是否真正可用
const isConnectionReady = (): boolean => {
  return (
    mongoose.connection.readyState === mongoose.ConnectionStates.connected ||
    mongoose.connection.readyState === mongoose.ConnectionStates.connecting
  );
};

export const connectToDatabase = async (): Promise<void> => {
  mongoose.set('strictQuery', true);

  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI environment variable is not set. Please configure it in your environment variables.'
    );
  }

  // 如果连接已经建立且状态正常，直接返回
  if (isConnectionReady()) {
    return;
  }

  // 如果正在连接中，等待现有连接完成
  if (connectionPromise) {
    return connectionPromise;
  }

  // 如果之前连接过但已断开，重置状态
  if (isConnected && !isConnectionReady()) {
    isConnected = false;
  }

  // 创建新的连接 Promise，带重试机制
  connectionPromise = (async () => {
    const maxRetries = 2;
    let lastError: Error | null = null;

    try {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          // 如果已经有连接实例但状态不对，先断开
          if (mongoose.connection.readyState !== mongoose.ConnectionStates.disconnected) {
            try {
              await mongoose.connection.close();
            } catch (closeError) {
              // 忽略关闭错误，继续尝试连接
              console.warn('Error closing existing connection:', closeError);
            }
          }

          await mongoose.connect(process.env.MONGODB_URI!, {
            dbName: process.env.MONGODB_DB_NAME || 'dev-tasks',
            serverSelectionTimeoutMS: 10000, // 10 秒超时
            socketTimeoutMS: 45000,
            maxPoolSize: 10, // 连接池大小
            minPoolSize: 1,
            maxIdleTimeMS: 30000, // 30 秒空闲超时
            retryWrites: true,
            w: 'majority',
          });

          isConnected = true;
          console.log('MongoDB is connected');
          return; // 连接成功，退出重试循环
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed:`, lastError);

          // 如果不是最后一次尝试，等待一下再重试
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // 递增延迟：1s, 2s
          }
        }
      }

      // 所有重试都失败了
      isConnected = false;
      throw new Error(
        `Failed to connect to MongoDB after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}. ` +
        `Please check your MONGODB_URI and ensure MongoDB Atlas IP whitelist includes your server's IP address.`
      );
    } finally {
      // 无论成功或失败，都清除 Promise，允许后续新的连接请求
      connectionPromise = null;
    }
  })();

  return connectionPromise;
};
