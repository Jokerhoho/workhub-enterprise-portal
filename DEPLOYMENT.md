# WorkHub 部署说明

这个项目是 VitePress 静态站点，支持两类部署：公司内网部署与公网部署。默认按内网安全策略构建：页面会输出 `noindex`，构建产物中的 `robots.txt` 会禁止搜索引擎抓取。

## 构建基线

- Node.js：22（支持 20～24）
- 安装：`npm ci`
- 构建：`npm run docs:build`
- 产物：`docs/.vitepress/dist`
- 本地预览：`npm run docs:preview`

构建前设置两个变量：

| 变量 | 内网建议值 | 公网建议值 |
| --- | --- | --- |
| `VITEPRESS_SITE_URL` | `https://workhub.intra.example.com` | `https://ai.example.com` |
| `VITEPRESS_PUBLIC_MODE` | `false` | `true` |

`VITEPRESS_PUBLIC_MODE=true` 会启用 sitemap 和可索引的 SEO 元信息；默认 `false` 会输出 `noindex, nofollow, noarchive`。

## 方案 A：公司内网容器部署（推荐）

仓库已提供 `Dockerfile`、`docker-compose.yml` 和 `nginx.conf`。容器只提供静态内容，不需要数据库；可部署到公司 Kubernetes、Docker 主机或内部应用平台。

```bash
cp .env.example .env
# 将 .env 中的地址改为公司内网域名，并保持 VITEPRESS_PUBLIC_MODE=false
docker compose up -d --build
```

默认暴露 `8080`。在公司网关或负载均衡器中：

1. 将内部域名转发到该端口。
2. 由网关终止 HTTPS。
3. 如需身份认证，优先在网关接入公司 SSO/OIDC，不在静态前端中保存密钥。
4. 限制来源网段或要求 VPN/零信任访问。
5. 如需展示访问统计，将 `/api/traffic` 反向代理到独立服务；未配置时仅统计卡片显示离线，不影响知识库使用。

## 方案 B：内网静态文件服务

在 CI 中运行 `npm ci && npm run docs:build`，再将 `docs/.vitepress/dist` 同步到现有 Nginx、对象存储静态站点或公司制品平台。必须支持 VitePress 的 clean URL：访问 `/foo` 时能回退到 `/foo.html`。仓库中的 `nginx.conf` 可直接作为参考。

## 方案 C：公网 Cloudflare Pages

Cloudflare Pages 连接你的公司仓库后使用：

| 配置项 | 值 |
| --- | --- |
| Production branch | `main` |
| Framework preset | `VitePress` 或 `None` |
| Build command | `npm run docs:build` |
| Build output directory | `docs/.vitepress/dist` |
| Root directory | `/` |
| Node.js version | `22` |

生产环境变量：

```text
VITEPRESS_SITE_URL=https://ai.example.com
VITEPRESS_PUBLIC_MODE=true
```

公网前请额外完成：

- 确认所有内部资料、人员信息、联系方式和截图都允许公开。
- 在边缘访问策略中保护尚未公开的路径。
- 配置自定义域名、HTTPS、WAF 与访问日志。
- 将 GitHub 项目中的原始二维码、社区联系人等内容替换或删除。
- 如启用访问统计，再配置 Cloudflare D1 与三个 Analytics Secret；浏览器端不得出现任何 Secret。

## 可选：Cloudflare 访问统计

原项目保留了 Pages Function、D1 迁移和定时归档 Worker。需要统计时再启用：

1. 创建 D1 数据库，并更新 `wrangler.jsonc`、`wrangler.collector.jsonc` 中的名称和数据库 ID。
2. 配置 `CF_ANALYTICS_TOKEN`、`CF_ACCOUNT_ID`、`CF_WEB_ANALYTICS_SITE_TAG`。
3. 为 Pages 与收集 Worker 配置相同的 `TRAFFIC_SYNC_TOKEN`。
4. 将 `wrangler.collector.jsonc` 中的 `TRAFFIC_SYNC_URL` 改为你的正式域名。
5. 执行远程迁移并部署 Worker。

这些值必须保存在部署平台 Secret 中，不能使用 `VITE_` 前缀，也不能提交到仓库。

## 上线检查

- 首页、知识中心、案例页和搜索可用。
- 手机与桌面端无横向滚动。
- 内网模式响应包含 `noindex`；公网模式生成 sitemap 且允许索引。
- HTTPS、SSO、网段限制和内容权限符合公司制度。
- `/api/traffic` 未启用时不会影响主流程。
- 保留原项目 MIT License 与版权声明，并标注内容来源。
