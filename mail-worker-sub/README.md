# Xi-Mail Sub Worker

轻量子 Worker —— 只负责接收邮件和提供查询 API，无用户系统、无登录页面。

## 部署

```bash
cd mail-worker-sub
npm install

# 创建 D1 数据库
npx wrangler d1 create xi-mail-sub

# 配置
cp wrangler.example.toml wrangler.toml
# 编辑 wrangler.toml：填入 database_id、api_token、domain

# 部署
npx wrangler deploy

# 初始化数据库（只需一次）
curl -H "x-api-token: <your-token>" https://your-sub-worker.workers.dev/init
```

## 配置 Email Routing

在 Cloudflare Dashboard 中为子 Worker 的域名配置 Email Routing，将邮件转发到此 Worker。

## API

所有接口需要 `x-api-token` header。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/info` | 返回名称、域名列表、版本 |
| GET | `/api/domains` | 域名列表 |
| GET | `/api/addresses` | 已收邮件的地址列表 |
| GET | `/api/mails?address=xxx&limit=20&offset=0` | 按地址查邮件 |
| GET | `/api/mail/:id` | 单封邮件详情 |

## 与主 Worker 对接

在主 Worker 的系统设置中添加子服务器：填入此 Worker 的 URL 和 API Token。
