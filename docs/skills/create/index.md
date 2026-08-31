---
title: 创建第一个团队 Skill
description: 把一次成功任务沉淀成团队可安装、可验证、可维护的 Skill。
---

# 把经验变成可复用能力

一个好 Skill 不是“超长提示词”，而是一套有触发条件、输入要求、执行步骤、验证标准和安全边界的工作方法。先从团队每周都会重复、结果容易验收的任务开始。

![从任务输入到验证交付的六阶段工作流](/images/skills/six-stage-workflow.webp)

## 六步结构

1. **需求拆解**：明确谁在什么场景下需要它。
2. **制定计划**：列出输入、步骤、工具和交付物。
3. **小步实现**：先覆盖一个最常见场景。
4. **运行测试**：准备正常、缺失和异常三类样例。
5. **人工审查**：检查事实、权限、数据和副作用。
6. **发布复盘**：记录版本、负责人、失败回退与后续改进。

## 最小目录

```text
meeting-action-skill/
├── SKILL.md
├── references/
│   └── output-template.md
└── examples/
    ├── input.md
    └── expected-output.md
```

## 可直接使用的 SKILL.md

```markdown
---
name: meeting-action-extractor
description: 将会议记录整理成决策、待办、负责人、截止时间和待确认项。用户要求整理会议、生成行动清单或追踪会后执行时使用。
---

# Meeting Action Extractor

## 输入要求
- 会议记录或转写文本
- 会议日期与项目名称

## 执行步骤
1. 区分已确认决策、讨论意见与未决问题。
2. 提取待办、负责人、截止时间和依赖。
3. 缺失的信息标记“待确认”，不要猜测。
4. 按 references/output-template.md 输出。

## 验收
- 每条待办都能回溯到原文。
- 决策与建议没有混写。
- 不包含材料之外的姓名、日期或结论。

## 安全边界
- 不对外发送，不创建日程，不修改任务系统，除非用户单独确认。
```

## 建立测试样例

至少准备三组：信息完整的正常样例、缺负责人或日期的残缺样例、包含敏感信息与相互矛盾结论的边界样例。每次修改 Skill 后都用同一组样例回归，比较结构、遗漏率和越权行为。

## 发布到团队

在当前目录初始化模板：

```bash
npx skills init meeting-action-skill
```

放入公司 Git 仓库后，团队成员可按仓库安装：

```bash
npx skills add your-company/meeting-action-skill -a codex
```

如果 Skill 需要连接器、MCP、命令或 Agent 角色，再升级为 Plugin；不要一开始就扩大权限面。

## 上线验收

- 触发描述清楚，不会在无关任务中频繁误触发。
- 输入不足时会停下来说明缺什么。
- 每个关键结论能回溯到输入或权威资料。
- 写文件、联网、发送消息和修改外部系统都有明确边界。
- 有版本、负责人、测试样例和回退办法。

## 延伸阅读

- [WorkBuddy：打造 Skill](/bluebook/第三篇%20进阶篇：把案例变成自己的工作系统/第%2022%20章%20打造skill：将书和视频蒸馏为可执行%20Skill/)
- [Vercel Labs Skills CLI](https://github.com/vercel-labs/skills)
- [Agent Skills 规范](https://agentskills.io/specification)
