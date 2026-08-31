---
title: 案例：建立 AI 代码审查门禁
description: 使用 Code Review & Quality Skill 把正确性、可读性、架构、安全与性能变成可重复的合并前检查。
---

# 案例：合并前的五维代码审查

**适用对象：** 研发团队、技术负责人  
**预计耗时：** 15–45 分钟  
**最终交付：** 带证据和优先级的审查报告

## 安装

```bash
npx skills add addyosmani/agent-skills --skill code-review-and-quality -a codex
```

该仓库说明单独安装一个 Skill 时，仓库级共享参考资料可能不会一起复制。首次使用前应核对 Skill 中引用的文件是否完整；团队推广时优先评估完整插件或仓库级集成。

## 审查任务模板

```text
请使用 code-review-and-quality 审查当前分支相对 main 的差异，不要修改代码。

需求与验收标准：【粘贴工单】
重点风险：【权限 / 数据 / 兼容 / 性能】

从正确性、可读性、架构、安全、性能五个维度检查。
只报告能够从差异、调用链或测试中证实的问题。
每项包含：优先级、文件与位置、触发条件、影响、建议修复和建议测试。
最后给出：可合并 / 修复后合并 / 暂停合并。
```

## 推荐流程

1. 先由实现者运行测试并提供变更摘要。
2. 用 Codex 的 `/review` 或差异审查能力查看未提交变更、分支或指定提交。
3. 使用 Skill 统一审查维度与报告格式。
4. 只修复有证据、处于本次范围的问题。
5. 重新运行测试和定向复核，再由人决定合并。

## 报告格式

```text
[P1] 权限校验发生在数据读取之后
位置：src/api/report.ts
触发：非管理员请求任意 reportId
影响：可能读取不属于当前用户的报告元数据
修复：在查询前校验资源归属
测试：新增跨租户 reportId 的拒绝用例
```

## 验收

- 每条问题能指出具体证据和触发条件。
- 不把格式偏好误报为缺陷。
- 修复不夹带无关重构。
- 测试覆盖原始失败条件，并能在修复前失败、修复后通过。
- 推送、合并和发布仍由负责人确认。

## 来源

- [Code Review & Quality Skill](https://github.com/addyosmani/agent-skills/blob/main/skills/code-review-and-quality/SKILL.md)
- [Codex Code Review](https://learn.chatgpt.com/docs/code-review)
