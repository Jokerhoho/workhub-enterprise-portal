---
title: WorkBuddy 社区案例集
description: 汇集 WorkBuddy 用户提交的真实案例，了解不同场景使用了哪些 Skills、如何执行以及最终呈现了什么效果。
breadcrumbTitle: 社区案例集
aside: false
outline: false
pageClass: community-cases-page
---

# WorkBuddy 社区案例集

这里收录由 WorkBuddy 用户提交的真实实践。每个案例都会说明它解决了什么场景、使用了哪些 Skills、在 WorkBuddy 中怎样执行，以及最终交付了什么结果。

社区案例通过完整性、安全性和可读性审核后即可发布；经过进一步复现和编辑的经典任务，未来可能被收录进《WorkBuddy 实战蓝皮书》正文。

## 如何提交 Case

1. 先搜索左侧的社区 Case 和[蓝皮书目录](/bluebook/)，确认场景或任务没有重复。
2. 阅读[Case 投稿指南](/community/case-contributing)，复制标准模板。
3. 在 `docs/cases/submissions/` 下新增一个 Case 文件夹。
4. 写清场景、使用的 Skills、操作过程、实际效果和验收标准。
5. 本地构建通过后提交 Pull Request，审核合并后会自动出现在左侧案例目录和本页列表中。

::: warning 提交前请自行检查
如果已有 Case 使用相同目标和流程，请优先补充原案例；如果使用了不同的 Skill、方法或交付方式，请在 PR 中明确说明差异。
:::

<div class="case-intro-actions">
  <a class="case-intro-button case-intro-button--primary" href="/community/case-contributing">提交你的 Case</a>
  <a class="case-intro-button" href="/bluebook/">阅读蓝皮书</a>
</div>

<div class="case-editor-note">
  <strong>从社区案例到蓝皮书正文</strong>
  <p>我们会持续观察案例的可复现性、代表性和读者反馈。通过二次验证的经典任务，将在保留原作者署名的前提下进入蓝皮书正式章节。</p>
</div>

<style>
.community-cases-page .VPDoc .container {
  max-width: 1280px;
}

.community-cases-page .VPDoc .content {
  max-width: none;
}

.case-intro-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 28px 0 8px;
}

.case-intro-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 20px;
  border: 1px solid var(--vp-c-text-1);
  border-radius: 4px;
  color: var(--vp-c-text-1) !important;
  font-weight: 700;
  text-decoration: none !important;
}

.case-intro-button--primary {
  background: var(--vp-c-text-1);
  color: var(--vp-c-bg) !important;
}

.case-editor-note {
  margin-top: 48px;
  padding: 24px;
  border-left: 5px solid var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}

.case-editor-note strong {
  font-size: 18px;
}

.case-editor-note p {
  margin: 8px 0 0;
}

</style>
