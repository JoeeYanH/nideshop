# NideShop 部署指南

本文档详细介绍了 NideShop 电商平台的各种部署方式，包括传统部署、Docker 部署以及生产环境的配置。

## 目录

- [系统要求](#系统要求)
- [环境准备](#环境准备)
- [传统部署](#传统部署)
- [Docker 部署](#docker-部署)
- [生产环境部署](#生产环境部署)
- [配置说明](#配置说明)
- [常见问题](#常见问题)
- [维护管理](#维护管理)

---

## 系统要求

### 基础环境

- **Node.js**: >= 6.0.0 (推荐使用 Node.js 14.x 或 16.x LTS 版本)
- **MySQL**: >= 5.7 (推荐 MySQL 8.0)
- **系统**: Linux (CentOS 7+, Ubuntu 18.04+) 或 Windows 10+

### 可选组件

- **Redis**: 用于缓存和会话存储 (推荐)
- **Nginx**: 反向代理和静态资源服务器 (推荐)
- **PM2**: Node.js 进程管理器 (生产环境推荐)
- **Docker**: 容器化部署

---

## 环境准备

### 1. 安装 Node.js

#### CentOS/RHEL
```bash
# 使用 NodeSource 仓库
curl -fsSL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs
```

#### Ubuntu/Debian
```bash
# 使用 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 验证安装
```bash
node --version
npm --version
```

### 2. 安装 MySQL

#### CentOS 7
```bash
# 安装 MySQL 官方 Yum Repository
wget https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm
sudo rpm -Uvh mysql80-community-release-el7-3.noarch.rpm
sudo yum install -y mysql-server

# 启动 MySQL
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 获取临时密码
sudo grep 'temporary password' /var/log/mysqld.log
```

#### Ubuntu
```bash
sudo apt update
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
sudo mysql_secure_installation
```

### 3. 创建数据库和用户

```sql
-- 创建数据库
CREATE DATABASE nideshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权
CREATE USER 'nideshop'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON nideshop.* TO 'nideshop'@'localhost';
FLUSH PRIVILEGES;
```

---

## 传统部署

### 1. 下载源码

```bash
# 克隆项目
git clone https://github.com/tumobi/nideshop.git
cd nideshop

# 或者下载压缩包
wget https://github.com/tumobi/nideshop/archive/master.zip
unzip master.zip
cd nideshop-master
```

### 2. 安装依赖

```bash
# 安装 Node.js 依赖
npm install

# 如果速度慢可以使用国内镜像
npm install --registry=https://registry.npmmirror.com
```

### 3. 配置数据库

```bash
# 导入数据库结构和初始数据
mysql -u nideshop -p nideshop < nideshop.sql
```

### 4. 修改配置文件

编辑 `src/common/config/database.js`：

```javascript
const mysql = require('think-model-mysql');

module.exports = {
  handle: mysql,
  database: 'nideshop',
  prefix: 'nideshop_',
  encoding: 'utf8mb4',
  host: '127.0.0.1',
  port: '3306',
  user: 'nideshop',
  password: 'your_secure_password',
  dateStrings: true
};
```

编辑 `src/common/config/config.js` 配置微信支付等：

```javascript
module.exports = {
  default_module: 'api',
  weixin: {
    appid: 'your_wechat_appid',
    secret: 'your_wechat_secret',
    mch_id: 'your_merchant_id',
    partner_key: 'your_partner_key',
    notify_url: 'https://yourdomain.com/api/pay/notify'
  },
  express: {
    appid: 'your_kdniao_appid',
    appkey: 'your_kdniao_appkey',
    request_url: 'http://api.kdniao.cc/Ebusiness/EbusinessOrderHandle.aspx'
  }
};
```

### 5. 启动应用

#### 开发环境
```bash
npm start
```

#### 生产环境
```bash
# 编译代码
npm run compile

# 启动生产服务器
node production.js

# 或使用 PM2 进程管理
npm install -g pm2
pm2 start pm2.json
```

---

## Docker 部署

Docker 部署是推荐的现代化部署方式，提供了环境一致性和便捷的管理。基于实际部署经验，我们提供了经过测试和优化的配置。

### 快速部署 (推荐)

如果您想要快速启动 NideShop，可以按照以下步骤操作：

```bash
# 1. 克隆项目
git clone https://github.com/tumobi/nideshop.git
cd nideshop

# 2. 启动服务
docker compose up -d --build

# 3. 等待启动完成（约 3-5 分钟）
docker compose ps

# 4. 访问应用
# 应用地址：http://localhost:8360
# API 测试：curl http://localhost:8360/api/index/index
```

### 详细配置

### 1. 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖（包含开发依赖，用于编译）
RUN npm install && npm cache clean --force

# 复制源代码
COPY . .

# 编译应用
RUN npm run compile

# 暴露端口
EXPOSE 8360

# 启动应用
CMD ["node", "production.js"]
```

**重要提示：** 由于项目需要 `babel-cli` 等开发依赖来编译代码，我们在 Docker 构建过程中使用 `npm install` 而不是 `npm ci --only=production`。这确保了编译步骤能够成功执行。

### 2. 修改数据库配置支持环境变量

首先需要修改数据库配置文件来支持环境变量。创建 `src/common/config/database.production.js`：

```javascript
const mysql = require('think-model-mysql');

module.exports = {
  handle: mysql,
  database: process.env.DB_NAME || 'nideshop',
  prefix: 'nideshop_',
  encoding: 'utf8mb4',
  host: process.env.DB_HOST || 'mysql',
  port: process.env.DB_PORT || '3306',
  user: process.env.DB_USER || 'nideshop',
  password: process.env.DB_PASSWORD || 'your_secure_password',
  dateStrings: true,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};
```

同时修改 `src/common/config/config.production.js` 来支持更多环境变量：

```javascript
// production config, it will load in production environment
module.exports = {
  workers: 0,
  port: process.env.PORT || 8360,
  weixin: {
    appid: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || '',
    mch_id: process.env.WECHAT_MCH_ID || '',
    partner_key: process.env.WECHAT_PARTNER_KEY || '',
    notify_url: process.env.WECHAT_NOTIFY_URL || ''
  },
  express: {
    appid: process.env.KDNIAO_APPID || '',
    appkey: process.env.KDNIAO_APPKEY || '',
    request_url: 'http://api.kdniao.cc/Ebusiness/EbusinessOrderHandle.aspx'
  }
};
```

### 3. 创建健康检查文件

创建 `healthcheck.js`：

```javascript
const http = require('http');

const options = {
  host: 'localhost',
  port: process.env.PORT || 8360,
  path: '/api/index/index',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode == 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.log('ERROR:', err);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('TIMEOUT');
  req.destroy();
  process.exit(1);
});

req.end();
```

### 3. 创建 docker-compose.yml

```yaml
services:
  nideshop:
    build: .
    ports:
      - "8360:8360"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_NAME=nideshop
      - DB_USER=nideshop
      - DB_PASSWORD=nideshop123
    depends_on:
      - mysql
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: nideshop
      MYSQL_USER: nideshop
      MYSQL_PASSWORD: nideshop123
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./nideshop.sql:/docker-entrypoint-initdb.d/nideshop.sql:ro
    command: --default-authentication-plugin=mysql_native_password
    restart: unless-stopped

volumes:
  mysql_data:
```

**重要说明：** 
- 移除了过时的 `version` 属性，现代 Docker Compose 不再需要此属性
- 简化了配置，专注于核心功能
- 确保数据库正确初始化

### 4. 创建 Docker 相关配置文件

#### MySQL 初始化脚本

创建 `docker/mysql/init.sql`：

```sql
-- 设置时区
SET time_zone = '+8:00';

-- 创建额外的索引来优化性能
USE nideshop;

-- 商品表索引优化
ALTER TABLE nideshop_goods ADD INDEX idx_category_id (category_id);
ALTER TABLE nideshop_goods ADD INDEX idx_brand_id (brand_id);
ALTER TABLE nideshop_goods ADD INDEX idx_is_on_sale (is_on_sale);
ALTER TABLE nideshop_goods ADD INDEX idx_sort_order (sort_order);

-- 订单表索引优化
ALTER TABLE nideshop_order ADD INDEX idx_user_id (user_id);
ALTER TABLE nideshop_order ADD INDEX idx_order_status (order_status);
ALTER TABLE nideshop_order ADD INDEX idx_add_time (add_time);

-- 购物车索引优化
ALTER TABLE nideshop_cart ADD INDEX idx_user_id (user_id);
ALTER TABLE nideshop_cart ADD INDEX idx_session_id (session_id);

-- 创建管理员账户 (用户名: admin, 密码: admin123)
INSERT IGNORE INTO nideshop_admin (id, username, password, password_salt, last_login_time, last_login_ip, add_time, update_time) 
VALUES (1, 'admin', '59a57b43b09550b0c50d99cb61d64cdf', 'nideshop_backend', 0, '', 0, 0);

-- 插入基础配置
INSERT IGNORE INTO nideshop_system (id, key_name, key_value, key_type) VALUES 
(1, 'mall_name', 'NideShop商城', 'text'),
(2, 'mall_phone', '400-888-8888', 'text'),
(3, 'mall_qq', '123456789', 'text'),
(4, 'mall_address', '上海市普陀区真北路925号', 'text');
```

#### Redis 配置文件

创建 `docker/redis/redis.conf`：

```conf
# Redis 配置文件

# 网络配置
bind 0.0.0.0
port 6379
timeout 300
keepalive 300

# 内存配置
maxmemory 256mb
maxmemory-policy allkeys-lru

# 持久化配置
save 900 1
save 300 10
save 60 10000

# 日志配置
loglevel notice
logfile ""

# 数据库数量
databases 16

# AOF 持久化
appendonly yes
appendfsync everysec

# 慢查询日志
slowlog-log-slower-than 10000
slowlog-max-len 128

# 客户端配置
tcp-keepalive 60
tcp-backlog 511
```

#### Nginx 配置文件

创建 `docker/nginx/nginx.conf`：

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    '$request_time $upstream_response_time';
    
    access_log /var/log/nginx/access.log main;
    
    # 基础配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 20M;
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # 包含站点配置
    include /etc/nginx/conf.d/*.conf;
}
```

创建 `docker/nginx/conf.d/nideshop.conf`：

```nginx
upstream nideshop_backend {
    server nideshop:8360 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# HTTP 服务器配置
server {
    listen 80;
    server_name localhost yourdomain.com www.yourdomain.com;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # 日志配置
    access_log /var/log/nginx/nideshop_access.log main;
    error_log /var/log/nginx/nideshop_error.log;
    
    # 根目录
    root /usr/share/nginx/html;
    index index.html index.htm;
    
    # 静态文件处理
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
        
        # 跨域配置
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
        
        try_files $uri $uri/ @backend;
    }
    
    # 上传文件
    location /uploads/ {
        expires 1y;
        add_header Cache-Control "public";
    }
    
    # API 接口代理
    location /api/ {
        proxy_pass http://nideshop_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
        proxy_send_timeout 300s;
        
        # 缓冲区设置
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
    
    # 管理后台代理
    location /admin/ {
        proxy_pass http://nideshop_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 微信验证文件
    location ~* \.(txt)$ {
        try_files $uri $uri/ @backend;
    }
    
    # 默认后端处理
    location @backend {
        proxy_pass http://nideshop_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 首页和其他路由
    location / {
        try_files $uri $uri/ @backend;
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # 隐藏 Nginx 版本
    server_tokens off;
}

# HTTPS 配置示例 (需要 SSL 证书)
# server {
#     listen 443 ssl http2;
#     server_name yourdomain.com www.yourdomain.com;
#     
#     ssl_certificate /etc/nginx/ssl/cert.pem;
#     ssl_certificate_key /etc/nginx/ssl/key.pem;
#     ssl_session_timeout 1d;
#     ssl_session_cache shared:SSL:50m;
#     ssl_session_tickets off;
#     
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
#     ssl_prefer_server_ciphers off;
#     
#     add_header Strict-Transport-Security "max-age=63072000" always;
#     
#     # 其余配置与 HTTP 相同...
# }
```

### 5. 创建环境配置文件

创建 `.env` 文件：

```bash
# 基础配置
NODE_ENV=production
PORT=8360

# 数据库配置
DB_HOST=mysql
DB_PORT=3306
DB_NAME=nideshop
DB_USER=nideshop
DB_PASSWORD=your_secure_password_change_me
MYSQL_ROOT_PASSWORD=root_password_change_me

# 微信配置
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
WECHAT_MCH_ID=your_merchant_id
WECHAT_PARTNER_KEY=your_partner_key
WECHAT_NOTIFY_URL=https://yourdomain.com/api/pay/notify

# 快递鸟配置
KDNIAO_APPID=your_kdniao_appid
KDNIAO_APPKEY=your_kdniao_appkey

# 域名配置
DOMAIN=yourdomain.com

# 时区设置
TZ=Asia/Shanghai
```

创建 `.env.example` 模板文件：

```bash
# 复制此文件为 .env 并填写实际配置

# 基础配置
NODE_ENV=production
PORT=8360

# 数据库配置 - 请修改为强密码
DB_HOST=mysql
DB_PORT=3306
DB_NAME=nideshop
DB_USER=nideshop
DB_PASSWORD=请设置强密码
MYSQL_ROOT_PASSWORD=请设置强密码

# 微信配置 - 从微信公众平台获取
WECHAT_APPID=请填写微信小程序AppID
WECHAT_SECRET=请填写微信小程序Secret
WECHAT_MCH_ID=请填写微信商户号
WECHAT_PARTNER_KEY=请填写微信支付密钥
WECHAT_NOTIFY_URL=https://yourdomain.com/api/pay/notify

# 快递鸟配置 - 从快递鸟官网申请
KDNIAO_APPID=请填写快递鸟用户ID
KDNIAO_APPKEY=请填写快递鸟API密钥

# 域名配置
DOMAIN=yourdomain.com

# 时区设置
TZ=Asia/Shanghai
```

```nginx
upstream nideshop_backend {
    server nideshop:8360;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL 配置
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;
    
    # 现代化 SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # 静态文件
    location /static/ {
        root /usr/share/nginx/html;
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip on;
        gzip_types text/css application/javascript application/json image/svg+xml;
        gzip_comp_level 9;
    }
    
    # API 接口代理
    location /api/ {
        proxy_pass http://nideshop_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # 管理后台代理
    location /admin/ {
        proxy_pass http://nideshop_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # 首页
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

### 6. 部署步骤

#### 准备部署

```bash
# 1. 克隆项目代码
git clone https://github.com/tumobi/nideshop.git
cd nideshop

# 2. 复制环境配置文件
cp .env.example .env
vim .env  # 编辑配置文件，填写实际参数

# 3. 创建必要的目录结构
mkdir -p docker/mysql docker/redis docker/nginx/conf.d logs/nginx uploads ssl

# 4. 设置文件权限
chmod +x healthcheck.js
chmod 644 .env
chmod -R 755 docker/
```

#### 首次部署

```bash
# 1. 克隆项目代码
git clone https://github.com/tumobi/nideshop.git
cd nideshop

# 2. 构建并启动所有服务
docker compose up -d --build

# 3. 等待服务启动完成 (约 60 秒)
docker compose ps

# 4. 查看服务状态和日志
docker compose logs -f

# 5. 验证服务是否正常运行
docker ps
curl -i http://localhost:8360/api/index/index
```

#### Docker 部署常见问题和解决方案

**问题1：npm ci 失败，提示需要 package-lock.json**
```
Error: The `npm ci` command can only install with an existing package-lock.json
```
**解决方案：** 修改 Dockerfile 使用 `npm install` 而不是 `npm ci`，因为项目可能没有 package-lock.json 文件。

**问题2：babel 命令未找到**
```
sh: babel: not found
```
**解决方案：** 确保 Dockerfile 中安装了所有依赖（包括开发依赖）：
```dockerfile
RUN npm install && npm cache clean --force
```
而不是：
```dockerfile
RUN npm install --only=production && npm cache clean --force
```

**问题3：Docker Compose 警告版本属性过时**
```
WARN: the attribute `version` is obsolete, it will be ignored, please remove it
```
**解决方案：** 从 docker-compose.yml 中移除 `version: '3.8'` 行，现代 Docker Compose 不再需要此属性。

**问题4：容器启动失败**
```bash
# 查看详细错误信息
docker compose logs service_name

# 重新构建镜像（清除缓存）
docker compose build --no-cache

# 清理 Docker 系统
docker system prune -f
```

#### 验证部署

```bash
# 检查所有服务状态
docker-compose ps

# 查看应用日志
docker-compose logs nideshop

# 查看 Nginx 访问日志
docker-compose logs nginx

# 查看数据库日志
docker-compose logs mysql

# 进入应用容器
docker-compose exec nideshop sh

# 进入数据库容器
docker-compose exec mysql mysql -u nideshop -p
```

#### 常用管理命令

```bash
# 停止所有服务
docker compose down

# 停止服务并删除数据卷 (谨慎使用)
docker compose down -v

# 重新构建镜像
docker compose build --no-cache

# 更新服务
docker compose pull && docker compose up -d

# 重启单个服务
docker compose restart nideshop
docker compose restart mysql

# 查看容器资源使用情况
docker stats

# 清理未使用的资源
docker system prune -f

# 备份数据
docker compose exec mysql mysqldump -u nideshop -pnideshop123 nideshop > backup_$(date +%Y%m%d).sql

# 恢复数据
docker compose exec -T mysql mysql -u nideshop -pnideshop123 nideshop < backup_20250829.sql

# 更新应用 (当有新版本时)
git pull
docker compose build nideshop
docker compose up -d nideshop

# 实时查看服务日志
docker compose logs -f --tail=100 nideshop

# 监控容器健康状态
watch 'docker compose ps'

# 进入容器调试
docker compose exec nideshop /bin/sh
docker compose exec mysql /bin/bash
```

---

## 生产环境部署

### 1. 服务器配置

#### 安装基础软件
```bash
# CentOS
sudo yum update -y
sudo yum install -y git wget curl vim nginx

# Ubuntu
sudo apt update -y
sudo apt install -y git wget curl vim nginx
```

#### 配置防火墙
```bash
# CentOS (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=8360/tcp
sudo firewall-cmd --reload

# Ubuntu (ufw)
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8360
sudo ufw enable
```

### 2. 使用 PM2 部署

#### 安装 PM2
```bash
npm install -g pm2
```

#### 修改 PM2 配置文件

编辑 `pm2.json`：

```json
{
  "apps": [{
    "name": "nideshop",
    "script": "production.js",
    "cwd": "/var/www/nideshop",
    "instances": "max",
    "exec_mode": "cluster",
    "max_memory_restart": "1G",
    "autorestart": true,
    "watch": false,
    "env": {
      "NODE_ENV": "production",
      "PORT": "8360"
    },
    "env_production": {
      "NODE_ENV": "production",
      "PORT": "8360"
    },
    "log_date_format": "YYYY-MM-DD HH:mm Z",
    "error_file": "./logs/err.log",
    "out_file": "./logs/out.log",
    "log_file": "./logs/combined.log"
  }]
}
```

#### 启动和管理
```bash
# 启动应用
pm2 start pm2.json --env production

# 重启应用
pm2 restart nideshop

# 停止应用
pm2 stop nideshop

# 查看状态
pm2 status

# 查看日志
pm2 logs nideshop

# 监控
pm2 monit

# 设置开机自启
pm2 startup
pm2 save
```

### 3. 配置 Nginx 反向代理

编辑 `/etc/nginx/sites-available/nideshop`：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/nideshop/www;
    
    # 日志配置
    access_log /var/log/nginx/nideshop_access.log;
    error_log /var/log/nginx/nideshop_error.log;
    
    # 静态文件处理
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip on;
        gzip_types text/css application/javascript application/json image/svg+xml;
    }
    
    # API 代理
    location / {
        proxy_pass http://127.0.0.1:8360;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 启用配置
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/nideshop /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx
```

### 4. SSL 证书配置 (Let's Encrypt)

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 测试自动续期
sudo certbot renew --dry-run

# 设置自动续期任务
echo "0 2 * * * root certbot renew --quiet" | sudo tee -a /etc/crontab
```

---

## 配置说明

### 1. 数据库配置

支持通过环境变量配置数据库连接：

```javascript
// src/common/config/database.js
module.exports = {
  handle: mysql,
  database: process.env.DB_NAME || 'nideshop',
  prefix: 'nideshop_',
  encoding: 'utf8mb4',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || '3306',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  dateStrings: true
};
```

### 2. 应用配置

```javascript
// src/common/config/config.js
module.exports = {
  default_module: 'api',
  port: process.env.PORT || 8360,
  weixin: {
    appid: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || '',
    mch_id: process.env.WECHAT_MCH_ID || '',
    partner_key: process.env.WECHAT_PARTNER_KEY || '',
    notify_url: process.env.WECHAT_NOTIFY_URL || ''
  },
  express: {
    appid: process.env.KDNIAO_APPID || '',
    appkey: process.env.KDNIAO_APPKEY || '',
    request_url: 'http://api.kdniao.cc/Ebusiness/EbusinessOrderHandle.aspx'
  }
};
```

### 3. 环境变量文件

创建 `.env` 文件：

```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nideshop
DB_USER=nideshop
DB_PASSWORD=your_secure_password

# 应用配置
NODE_ENV=production
PORT=8360

# 微信配置
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
WECHAT_MCH_ID=your_merchant_id
WECHAT_PARTNER_KEY=your_partner_key
WECHAT_NOTIFY_URL=https://yourdomain.com/api/pay/notify

# 快递鸟配置
KDNIAO_APPID=your_kdniao_appid
KDNIAO_APPKEY=your_kdniao_appkey
```

---

## 常见问题

### 1. 端口占用问题

```bash
# 查看端口占用
sudo lsof -i :8360

# 杀死占用进程
sudo kill -9 PID
```

### 2. 数据库连接问题

```bash
# 检查数据库服务状态
sudo systemctl status mysql

# 检查数据库连接
mysql -u nideshop -p -h localhost nideshop

# 检查用户权限
SHOW GRANTS FOR 'nideshop'@'localhost';
```

### 3. 权限问题

```bash
# 设置正确的文件权限
sudo chown -R www-data:www-data /var/www/nideshop
sudo chmod -R 755 /var/www/nideshop
```

### 4. 内存不足

```bash
# 检查内存使用情况
free -h

# 添加 swap 空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 维护管理

### 1. 日志管理

```bash
# 查看应用日志
tail -f /var/www/nideshop/logs/combined.log

# 查看 Nginx 访问日志
tail -f /var/log/nginx/nideshop_access.log

# 查看 Nginx 错误日志
tail -f /var/log/nginx/nideshop_error.log

# 日志轮转配置
sudo vim /etc/logrotate.d/nideshop
```

### 2. 性能监控

```bash
# 使用 PM2 监控
pm2 monit

# 系统资源监控
htop
iotop
nethogs
```

### 3. 数据备份

```bash
#!/bin/bash
# 数据库备份脚本
BACKUP_DIR="/backup/nideshop"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="nideshop"
DB_USER="nideshop"
DB_PASS="your_password"

mkdir -p $BACKUP_DIR

# 备份数据库
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/nideshop_$DATE.sql

# 压缩备份文件
gzip $BACKUP_DIR/nideshop_$DATE.sql

# 删除 7 天前的备份
find $BACKUP_DIR -name "nideshop_*.sql.gz" -mtime +7 -delete

echo "Database backup completed: nideshop_$DATE.sql.gz"
```

### 4. 应用更新

```bash
#!/bin/bash
# 应用更新脚本
cd /var/www/nideshop

# 拉取最新代码
git pull origin master

# 安装新依赖
npm install --production

# 编译应用
npm run compile

# 重启应用
pm2 restart nideshop

echo "Application updated successfully"
```

### 5. 健康检查

```bash
#!/bin/bash
# 健康检查脚本
URL="http://localhost:8360/api/index/index"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $HTTP_STATUS -eq 200 ]; then
    echo "Service is healthy"
    exit 0
else
    echo "Service is unhealthy, status: $HTTP_STATUS"
    # 重启服务
    pm2 restart nideshop
    exit 1
fi
```

---

## 总结

本部署指南涵盖了 NideShop 的多种部署方式：

1. **开发环境**: 使用 `npm start` 快速启动
2. **传统部署**: 使用 PM2 + Nginx 的经典方案
3. **Docker 部署**: 使用容器化的现代化部署方式
4. **生产环境**: 包含安全、监控、备份等完整方案

选择合适的部署方式取决于您的技术栈、运维经验和业务需求。推荐生产环境使用 Docker 部署方式，便于管理和扩展。

如有问题，请查看日志文件或联系技术支持团队。
