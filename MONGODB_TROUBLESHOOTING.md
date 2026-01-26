# MongoDB 连接问题排查指南

## 当前错误
```
MongoNetworkError: Client network socket disconnected before secure TLS connection was established
```

## 可能的原因和解决方案

### 1. 检查 MongoDB Atlas IP 白名单

**最重要！** MongoDB Atlas 默认只允许白名单中的 IP 地址连接。

**解决步骤：**
1. 登录 [MongoDB Atlas](https://cloud.mongodb.com/)
2. 进入你的 Cluster
3. 点击 **Network Access** (左侧菜单)
4. 点击 **Add IP Address**
5. 选择以下选项之一：
   - **Add Current IP Address** - 添加你当前的 IP
   - **Allow Access from Anywhere** - 允许所有 IP (仅用于开发，生产环境不推荐)
     - IP Address: `0.0.0.0/0`
6. 点击 **Confirm**

**注意：** IP 白名单更改可能需要几分钟生效。

### 2. 检查连接字符串格式

确保 `.env.local` 中的连接字符串格式正确：

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
MONGODB_DB_NAME=dev-tasks
```

**重要：**
- 连接字符串中应该包含数据库名称（在 `/` 之后）
- 应该包含 `retryWrites=true&w=majority` 参数
- 密码中的特殊字符需要 URL 编码

### 3. 检查网络连接

**测试连接：**
```bash
# 测试是否能访问 MongoDB Atlas
ping cluster0.3dtv3yo.mongodb.net
```

**检查防火墙：**
- 确保防火墙没有阻止 MongoDB 连接
- MongoDB Atlas 使用端口 27017 (mongodb+srv:// 会自动处理)

### 4. 检查 MongoDB Atlas Cluster 状态

1. 登录 MongoDB Atlas
2. 检查 Cluster 状态是否为 **Running**
3. 如果 Cluster 已暂停，点击 **Resume** 恢复

### 5. 验证用户名和密码

1. 在 MongoDB Atlas 中，进入 **Database Access**
2. 确认用户名和密码正确
3. 确保用户有适当的权限（至少需要 `readWrite` 权限）

### 6. 更新连接字符串

如果连接字符串缺少数据库名称，更新 `.env.local`：

```env
# 旧格式（可能有问题）
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster0

# 新格式（推荐）
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dev-tasks?retryWrites=true&w=majority
```

### 7. 使用本地 MongoDB (开发环境)

如果 Atlas 连接持续有问题，可以临时使用本地 MongoDB：

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=dev-tasks
```

**安装本地 MongoDB：**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# 启动 MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

## 已实施的优化

代码中已经添加了以下优化：
- ✅ 增加了连接超时时间（15秒）
- ✅ 添加了重试机制
- ✅ 改进了错误处理
- ✅ 自动添加连接字符串参数

## 测试连接

重启开发服务器后，检查：
1. 控制台是否还有连接错误
2. 页面是否能正常加载
3. 是否能创建/读取任务

## 如果问题仍然存在

1. **检查 MongoDB Atlas 日志：**
   - 在 Atlas 控制台查看连接日志
   - 查看是否有被拒绝的连接尝试

2. **联系 MongoDB Atlas 支持：**
   - 如果所有配置都正确但仍无法连接
   - 可能是 Atlas 服务端问题

3. **使用 MongoDB Compass 测试：**
   - 下载 [MongoDB Compass](https://www.mongodb.com/products/compass)
   - 使用相同的连接字符串测试连接
   - 如果 Compass 能连接，说明问题在应用代码
   - 如果 Compass 也不能连接，说明问题在 Atlas 配置

## 快速检查清单

- [ ] IP 地址已添加到 Atlas 白名单
- [ ] 连接字符串格式正确
- [ ] 用户名和密码正确
- [ ] Cluster 状态为 Running
- [ ] 用户有适当的数据库权限
- [ ] 网络连接正常
- [ ] 防火墙未阻止连接
