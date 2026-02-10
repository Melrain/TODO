/**
 * 数据迁移脚本：将 status 为 in_progress 的任务迁移为 todo
 * 运行方式: npx tsx scripts/migrate-in-progress-to-todo.ts
 */
import mongoose from 'mongoose';

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('请设置 MONGODB_URI 环境变量');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DB_NAME || 'dev-tasks',
    });
    console.log('MongoDB 已连接');

    const result = await (mongoose.connection.collection('tasks') as any).updateMany(
      { status: 'in_progress' },
      { $set: { status: 'todo' } }
    );

    console.log(`迁移完成: 更新了 ${result.modifiedCount} 条 in_progress 任务为 todo`);
  } catch (error) {
    console.error('迁移失败:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB 已断开连接');
    process.exit(0);
  }
}

migrate();
