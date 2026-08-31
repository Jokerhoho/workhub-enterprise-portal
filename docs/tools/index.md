---
title: AI 工具库
description: WorkHub 企业 AI 工作台的工具教程入口，首批收录千问办公与 Codex。
outline: false
---

# AI 工具库

先根据任务类型选工具，再进入对应教程。当前只维护两个核心工具，确保内容清晰、可执行、可持续更新。

<div class="wb-tool-directory">
  <a class="wb-tool-directory__card" href="./qwen-office/">
    <span>办公生产 · QWENWORK</span>
    <h2>千问办公</h2>
    <p>文档、表格、演示、文件处理与办公协作。</p>
    <strong>进入教程 →</strong>
  </a>
  <a class="wb-tool-directory__card" href="./codex/">
    <span>研发协作 · OPENAI CODEX</span>
    <h2>Codex</h2>
    <p>理解代码库、实现需求、修复问题、测试与审查变更。</p>
    <strong>进入教程 →</strong>
  </a>
</div>

## 怎么选择

| 你的任务 | 优先使用 | 交付重点 |
| --- | --- | --- |
| 写报告、整理资料、分析表格、制作汇报 | 千问办公 | 可继续编辑的 Word、Excel、PPT 或网页成果 |
| 看懂代码、修改网站、修复问题、运行测试 | Codex | 可审查、可验证、可回退的代码变更 |

::: tip 共同使用原则
先说明目标、输入材料、交付格式和验收标准；涉及内部数据、账号权限、对外发送或代码发布时，必须由负责人复核。
:::

## 教程维护方式

每个工具页面固定包含五部分：工具定位、快速上手、可复制任务模板、验收清单、安全边界。功能入口可能随版本变化，页面末尾保留官方资料，更新时优先核对官方说明。

<style>
.wb-tool-directory { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin: 28px 0 36px; }
.vp-doc .wb-tool-directory__card { display: flex; min-height: 230px; flex-direction: column; padding: 26px; border: 1px solid var(--portal-line); border-radius: 14px; color: var(--portal-ink); background: var(--portal-panel); text-decoration: none; box-shadow: 0 12px 32px rgba(23,50,77,.05); transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
.vp-doc .wb-tool-directory__card:hover { border-color: var(--portal-blue); box-shadow: 0 16px 34px rgba(23,50,77,.09); transform: translateY(-3px); }
.wb-tool-directory__card > span { color: var(--portal-blue); font-family: var(--portal-mono); font-size: 11px; font-weight: 700; letter-spacing: .06em; }
.wb-tool-directory__card h2 { margin: 35px 0 0; padding: 0; border: 0; font-size: 27px; }
.wb-tool-directory__card p { margin: 9px 0 24px; color: var(--portal-muted); }
.wb-tool-directory__card strong { margin-top: auto; color: var(--portal-teal); font-size: 14px; }
@media (max-width: 640px) { .wb-tool-directory { grid-template-columns: 1fr; } }
</style>
