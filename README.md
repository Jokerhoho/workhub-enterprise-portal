# WorkHub 企业 AI 工作台

面向企业内部团队的 WorkBuddy 知识与工具门户，统一承载操作指南、真实案例、Skills、自动化与组织落地方法。

**公网访问：** https://jokerhoho.github.io/workhub-enterprise-portal/

## 改版特点

- 企业内网门户式首页与统一搜索入口
- 办公、文件、知识、研究、内容和自动化六类场景导航
- 基础能力、场景实践、系统沉淀和组织落地四条路径
- 深蓝与青绿色企业视觉，支持深色模式和响应式布局
- 内网 Docker/Nginx 与公网 GitHub Pages 双部署方案
- 内网模式默认禁止搜索引擎索引

## 本地运行

需要 Node.js 20～24，推荐 Node.js 22。

```bash
npm ci
npm run dev
```

生产构建：

```bash
npm run docs:build
```

## 部署

推送到 `main` 后，GitHub Actions 会自动构建并发布 GitHub Pages。公司内网部署、Docker 配置和安全建议见 [DEPLOYMENT.md](./DEPLOYMENT.md)。信息架构与视觉改版说明见 [PORTAL_REDESIGN.md](./PORTAL_REDESIGN.md)。

## 内容与版权

本项目基于 [AlephAITech/WorkBuddyGuide](https://github.com/AlephAITech/WorkBuddyGuide) 改版，保留原项目的 WorkBuddy 实战内容、MIT License 与原作者版权声明。新版主要重构了品牌、首页信息架构、导航、视觉系统、交互和部署配置。

涉及产品功能、价格、可用范围和安全策略等时效性信息时，请以 WorkBuddy 官方渠道为准。对外发布前，请检查并移除不适合公开的公司资料、联系人和截图。
