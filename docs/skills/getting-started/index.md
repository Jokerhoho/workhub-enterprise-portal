---
title: Skill、Agent、Plugin 与 MCP 安全安装指南
description: 从选择来源、项目级安装到权限审查和回退验证，安全接入第三方 AI 能力。
---

# 安装前先建立一道门

Skill 是按需加载的专业工作说明；Agent 通常带有角色、目标和可用工具；Plugin 会把 Skill、Agent、命令、Hooks 或应用连接器打成一个安装包；MCP 则让 AI 连接外部系统和数据。四者影响范围不同，安装时不能只看名字和演示效果。

## 推荐安装路径

```mermaid
flowchart LR
  A[明确任务] --> B[查看来源和许可]
  B --> C[先列出内容]
  C --> D[检查脚本与权限]
  D --> E[项目级安装]
  E --> F[测试项目试运行]
  F --> G[记录版本与负责人]
```

## 安装前的 7 项检查

| 检查项 | 要确认什么 | 不通过时 |
| --- | --- | --- |
| 来源 | 作者、组织、仓库地址是否可信 | 不安装 |
| 许可 | 是否允许公司内部使用、修改和分发 | 交法务或开源负责人确认 |
| 内容 | `SKILL.md`、脚本、Hooks、依赖是否完整可读 | 先只读审查 |
| 权限 | 是否会访问网络、密钥、浏览器、文件或外部系统 | 缩小权限后再试 |
| 范围 | 项目级还是全局安装 | 默认项目级 |
| 版本 | 是否记录仓库与版本，能否回退 | 固定版本或保留安装记录 |
| 验证 | 是否有无敏感数据的测试任务 | 未验证不进入正式项目 |

::: warning 不建议使用“全自动 + 全局 + 跳过确认”的组合
不要把来源不明的仓库直接全局安装，也不要在首次安装时使用跳过所有确认的参数。Skill 本质上是会影响 Agent 行为的指令与资源包，Plugin 还可能带来更大的执行范围。
:::

## 用开放 Skills CLI 安装

先查看仓库中有哪些 Skill：

```bash
npx skills add vercel-labs/agent-skills --list
```

只把目标 Skill 安装到当前项目，并指定 Codex：

```bash
npx skills add vercel-labs/agent-skills --skill web-design-guidelines -a codex
```

查看、更新和移除：

```bash
npx skills list
npx skills update web-design-guidelines
npx skills remove web-design-guidelines
```

项目级安装便于团队审查和版本管理；只有经过组织批准、确实需要跨项目使用的能力，才考虑全局安装。

## 安装 OpenAI Plugins

在 Codex 中打开 **Plugins**，从官方目录选择所需插件并安装。官方示例仓库里的插件可以同时包含 Skill、Agent、命令、Hooks、MCP 和应用连接器，因此安装后要再次查看它申请的连接与权限。

- [OpenAI Plugins 官方仓库](https://github.com/openai/plugins)
- [Codex CLI 与 Plugins 使用说明](https://learn.chatgpt.com/docs/codex/cli)

## 安装 Superpowers

在 Codex App 左侧打开 **Plugins**，在 Coding 分类搜索 `Superpowers`，点击加号并按提示完成安装；在 Codex CLI 中可打开 `/plugins` 搜索并安装。这个工作流包会强约束需求澄清、计划、测试和审查，建议先在独立测试仓库体验，再决定是否进入团队默认环境。

## 第一次运行怎么验收

用一个可回退、没有敏感数据的小任务测试：

```text
请使用刚安装的 Skill 审查当前页面，但不要修改文件。
输出：触发了哪项能力、读取了哪些文件、计划使用哪些工具、发现的问题、建议修改。
任何网络访问、写文件、安装依赖或外部操作都先征求确认。
```

确认它只在声明范围内工作、没有隐藏外部动作，输出结构与团队预期一致后，再进入真实任务。

## 维护记录模板

| 字段 | 示例 |
| --- | --- |
| 能力名称 | web-design-guidelines |
| 来源 | vercel-labs/agent-skills |
| 安装范围 | 项目级 |
| 引入日期 | 2026-08-31 |
| 负责人 | 前端平台组 |
| 核准权限 | 只读代码、运行本地检查 |
| 回退方式 | 移除 Skill 并恢复锁定版本 |

## 资料来源

- [Vercel Labs Skills CLI](https://github.com/vercel-labs/skills)
- [OpenAI Plugins](https://github.com/openai/plugins)
- [Agent Skills 规范](https://agentskills.io/specification)
- [Superpowers](https://github.com/obra/superpowers)

> 本页于 2026 年 8 月核对来源。第三方仓库可能更新；安装前请再次检查当前 README、许可与变更记录。
