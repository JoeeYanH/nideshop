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

### 1. 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY . .

# 编译应用
RUN npm run compile

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nideshop -u 1001

# 更改文件所有者
RUN chown -R nideshop:nodejs /app
USER nideshop

# 暴露端口
EXPOSE 8360

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# 启动应用
CMD ["node", "production.js"]
```

### 2. 创建健康检查文件

创建 `healthcheck.js`：

```javascript
const http = require('http');

const options = {
  host: 'localhost',
  port: 8360,
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
version: '3.8'

services:
  # 应用服务
  nideshop:
    build: .
    ports:
      - "8360:8360"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_NAME=nideshop
      - DB_USER=nideshop
      - DB_PASSWORD=your_secure_password
    depends_on:
      - mysql
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    networks:
      - nideshop-network

  # MySQL 数据库
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: nideshop
      MYSQL_USER: nideshop
      MYSQL_PASSWORD: your_secure_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./nideshop.sql:/docker-entrypoint-initdb.d/nideshop.sql:ro
    command: --default-authentication-plugin=mysql_native_password
    restart: unless-stopped
    networks:
      - nideshop-network

  # Redis 缓存
  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - nideshop-network

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./www:/usr/share/nginx/html:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - nideshop
    restart: unless-stopped
    networks:
      - nideshop-network

volumes:
  mysql_data:
  redis_data:

networks:
  nideshop-network:
    driver: bridge
```

### 4. 创建 Nginx 配置

创建 `nginx/conf.d/nideshop.conf`：

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

### 5. 部署命令

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f nideshop

# 停止服务
docker-compose down

# 重新构建镜像
docker-compose build --no-cache

# 更新服务
docker-compose pull && docker-compose up -d
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
