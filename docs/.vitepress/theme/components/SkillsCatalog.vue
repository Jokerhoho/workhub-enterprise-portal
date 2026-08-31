<script setup lang="ts">
import { computed, ref } from "vue";

type SkillCategory = "全部" | "基础设施" | "设计" | "研发" | "办公" | "工作流";

interface CatalogItem {
  name: string;
  source: string;
  publisher: string;
  category: Exclude<SkillCategory, "全部">;
  kind: string;
  level: "官方" | "精选社区";
  description: string;
  command?: string;
  installLabel?: string;
  guide: string;
  repository: string;
  tags: string[];
}

const categories: SkillCategory[] = ["全部", "基础设施", "设计", "研发", "办公", "工作流"];
const query = ref("");
const selectedCategory = ref<SkillCategory>("全部");
const copiedCommand = ref("");

const items: CatalogItem[] = [
  {
    name: "OpenAI Plugins",
    source: "openai/plugins",
    publisher: "OpenAI",
    category: "基础设施",
    kind: "PLUGIN · AGENT · MCP",
    level: "官方",
    description: "Codex 官方插件示例与市场目录，覆盖 Skill、Agent、MCP、命令与应用连接器。",
    installLabel: "Codex → Plugins → 选择并安装",
    guide: "/skills/getting-started/#安装-openai-plugins",
    repository: "https://github.com/openai/plugins",
    tags: ["Codex", "Marketplace", "MCP"],
  },
  {
    name: "Skills CLI",
    source: "vercel-labs/skills",
    publisher: "Vercel Labs",
    category: "基础设施",
    kind: "INSTALLER",
    level: "精选社区",
    description: "面向开放 Agent Skills 生态的安装、查找、更新与移除工具，支持 Codex 等多种 Agent。",
    command: "npx skills find",
    guide: "/skills/getting-started/",
    repository: "https://github.com/vercel-labs/skills",
    tags: ["安装器", "跨平台", "Codex"],
  },
  {
    name: "Web Design Guidelines",
    source: "vercel-labs/agent-skills",
    publisher: "Vercel Labs",
    category: "设计",
    kind: "SKILL",
    level: "精选社区",
    description: "用可访问性、交互、响应式和视觉一致性检查网页，适合上线前的 UI 质量巡检。",
    command: "npx skills add vercel-labs/agent-skills --skill web-design-guidelines -a codex",
    guide: "/skills/cases/web-design-review/",
    repository: "https://github.com/vercel-labs/agent-skills",
    tags: ["UI/UX", "可访问性", "前端"],
  },
  {
    name: "Code Review & Quality",
    source: "addyosmani/agent-skills",
    publisher: "Addy Osmani",
    category: "研发",
    kind: "SKILL",
    level: "精选社区",
    description: "从正确性、可读性、架构、安全与性能五个维度建立合并前质量门禁。",
    command: "npx skills add addyosmani/agent-skills --skill code-review-and-quality -a codex",
    guide: "/skills/cases/code-review-gate/",
    repository: "https://github.com/addyosmani/agent-skills",
    tags: ["代码审查", "质量门禁", "Codex"],
  },
  {
    name: "Anthropic Skills",
    source: "anthropics/skills",
    publisher: "Anthropic",
    category: "办公",
    kind: "SKILL PACK",
    level: "官方",
    description: "包含文档、表格、演示与 PDF 等示例 Skill；跨 Agent 使用前应先检查兼容性与许可。",
    command: "npx skills add anthropics/skills --list",
    guide: "/skills/cases/document-pipeline/",
    repository: "https://github.com/anthropics/skills",
    tags: ["文档", "表格", "演示"],
  },
  {
    name: "Superpowers",
    source: "obra/superpowers",
    publisher: "Prime Radiant",
    category: "工作流",
    kind: "PLUGIN · SKILL PACK",
    level: "精选社区",
    description: "覆盖需求澄清、计划、测试驱动、代码审查与分支收尾的完整研发工作流。",
    installLabel: "Codex → Plugins → 搜索 Superpowers",
    guide: "/skills/getting-started/#安装-superpowers",
    repository: "https://github.com/obra/superpowers",
    tags: ["研发流程", "TDD", "工作流"],
  },
];

const filteredItems = computed(() => {
  const keyword = query.value.trim().toLocaleLowerCase("zh-CN");

  return items.filter((item) => {
    const categoryMatches = selectedCategory.value === "全部" || item.category === selectedCategory.value;
    const searchMatches = !keyword || [item.name, item.source, item.publisher, item.description, ...item.tags]
      .join(" ")
      .toLocaleLowerCase("zh-CN")
      .includes(keyword);
    return categoryMatches && searchMatches;
  });
});

const withBase = (path: string) => `${import.meta.env.BASE_URL || "/"}${path.replace(/^\//, "")}`;

const copyCommand = async (command: string) => {
  try {
    await navigator.clipboard.writeText(command);
    copiedCommand.value = command;
    window.setTimeout(() => {
      if (copiedCommand.value === command) copiedCommand.value = "";
    }, 1800);
  } catch {
    copiedCommand.value = "";
  }
};
</script>

<template>
  <section class="skills-platform" aria-labelledby="skills-platform-title">
    <header class="skills-hero">
      <div class="skills-hero__copy">
        <span class="skills-kicker">WORKHUB / SKILLS PLATFORM</span>
        <h1 id="skills-platform-title">给 AI 工具装上<br />可复用的专业能力</h1>
        <p>精选 Skill、Agent、Plugin 与 MCP，提供可复制的安装方式、实操文档、案例和上线前安全检查。</p>
        <div class="skills-hero__actions">
          <a :href="withBase('/skills/getting-started/')">先看安全安装指南 →</a>
          <a :href="withBase('/skills/create/')">创建团队 Skill</a>
        </div>
        <dl>
          <div><dt>06</dt><dd>首批精选</dd></div>
          <div><dt>05</dt><dd>能力分类</dd></div>
          <div><dt>03</dt><dd>实战案例</dd></div>
        </dl>
      </div>
      <img :src="withBase('/images/skills/ai-tools-and-skills-hero.webp')" alt="三个 AI 工作区与 Skills 模块协同的系统插画" width="1600" height="900" />
    </header>

    <div class="skills-toolbar" aria-label="筛选 Skills">
      <label>
        <span class="sr-only">搜索 Skill、来源或用途</span>
        <input v-model="query" type="search" placeholder="搜索 Skill、来源或用途" />
      </label>
      <div class="skills-filters" aria-label="按分类筛选">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          :class="{ 'is-active': selectedCategory === category }"
          :aria-pressed="selectedCategory === category"
          @click="selectedCategory = category"
        >{{ category }}</button>
      </div>
    </div>

    <p class="skills-results" aria-live="polite">显示 {{ filteredItems.length }} 个条目</p>

    <div v-if="filteredItems.length" class="skills-grid">
      <article v-for="(item, index) in filteredItems" :key="item.name" class="skills-card">
        <header>
          <span class="skills-card__index">{{ String(index + 1).padStart(2, "0") }}</span>
          <div><span>{{ item.kind }}</span><b :class="{ 'is-official': item.level === '官方' }">{{ item.level }}</b></div>
        </header>
        <div class="skills-card__body">
          <small>{{ item.publisher }} / {{ item.source }}</small>
          <h2>{{ item.name }}</h2>
          <p>{{ item.description }}</p>
          <ul :aria-label="`${item.name} 标签`"><li v-for="tag in item.tags" :key="tag">{{ tag }}</li></ul>
        </div>
        <div class="skills-install">
          <code v-if="item.command">{{ item.command }}</code>
          <span v-else>{{ item.installLabel }}</span>
          <button v-if="item.command" type="button" :aria-label="`复制 ${item.name} 安装命令`" @click="copyCommand(item.command)">
            {{ copiedCommand === item.command ? "已复制" : "复制" }}
          </button>
        </div>
        <footer>
          <a :href="withBase(item.guide)">使用文档与案例 →</a>
          <a :href="item.repository" target="_blank" rel="noreferrer">查看来源 ↗</a>
        </footer>
      </article>
    </div>
    <div v-else class="skills-empty">没有匹配结果。试试“设计”“文档”或“代码审查”。</div>

    <aside class="skills-governance">
      <span>INSTALLATION GATE</span>
      <h2>快装不等于盲装</h2>
      <p>默认采用项目级安装。安装前检查来源、许可、脚本、Hooks、网络与写入权限；首次运行放在可回退的测试项目里。</p>
      <a :href="withBase('/skills/getting-started/#安装前的-7-项检查')">查看 7 项检查 →</a>
    </aside>
  </section>
</template>

<style scoped>
.skills-platform { max-width: 1240px; margin: 0 auto; padding: 32px 32px 80px; color: var(--portal-ink); }
.skills-hero { display: grid; grid-template-columns: .86fr 1.14fr; min-height: 520px; overflow: hidden; border: 1px solid var(--portal-line); border-radius: 20px; background: #17324d; box-shadow: var(--portal-shadow); }
.skills-hero__copy { display: flex; flex-direction: column; justify-content: center; padding: 54px; color: #f3f8fb; }
.skills-kicker { color: #8ee0cc; font-family: var(--portal-mono); font-size: 11px; letter-spacing: .12em; }
.skills-hero h1 { margin: 18px 0 0; color: #fff; font-size: clamp(40px, 4.6vw, 62px); line-height: 1.1; letter-spacing: -.055em; }
.skills-hero p { max-width: 560px; margin: 24px 0 0; color: #b9cedc; font-size: 16px; line-height: 1.8; }
.skills-hero__actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }
.skills-hero__actions a { padding: 12px 16px; border: 1px solid rgba(255,255,255,.2); border-radius: 8px; color: #fff; font-size: 13px; font-weight: 700; text-decoration: none; }
.skills-hero__actions a:first-child { border-color: #8ee0cc; color: #092f2a; background: #8ee0cc; }
.skills-hero dl { display: flex; gap: 28px; margin: 38px 0 0; }
.skills-hero dl div { display: grid; gap: 2px; }
.skills-hero dt { color: #fff; font-family: var(--portal-mono); font-size: 20px; font-weight: 700; }
.skills-hero dd { margin: 0; color: #91aebe; font-size: 11px; }
.skills-hero img { width: 100%; height: 100%; margin: 0; border: 0; border-radius: 0; box-shadow: none; object-fit: cover; }
.skills-toolbar { display: grid; grid-template-columns: minmax(240px, .7fr) 1.3fr; gap: 18px; margin-top: 54px; padding: 18px; border: 1px solid var(--portal-line); border-radius: 12px; background: var(--portal-panel); }
.skills-toolbar label { display: block; }
.skills-toolbar input { width: 100%; height: 46px; padding: 0 15px; border: 1px solid var(--portal-line); border-radius: 8px; color: var(--portal-ink); background: var(--portal-bg); font: inherit; }
.skills-toolbar input:focus-visible, .skills-filters button:focus-visible, .skills-install button:focus-visible { outline: 3px solid color-mix(in srgb, var(--portal-teal) 35%, transparent); outline-offset: 2px; }
.skills-filters { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 8px; }
.skills-filters button { min-height: 38px; padding: 0 13px; border: 1px solid var(--portal-line); border-radius: 999px; color: var(--portal-muted); background: transparent; cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; }
.skills-filters button.is-active { border-color: var(--portal-navy); color: #fff; background: var(--portal-navy); }
.skills-results { margin: 18px 2px 12px; color: var(--portal-muted); font-size: 12px; }
.skills-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.skills-card { display: flex; min-height: 430px; flex-direction: column; padding: 24px; border: 1px solid var(--portal-line); border-radius: 14px; background: var(--portal-panel); box-shadow: 0 12px 30px rgba(23,50,77,.045); transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease; }
.skills-card:hover { border-color: var(--portal-blue); box-shadow: 0 18px 38px rgba(23,50,77,.09); transform: translateY(-3px); }
.skills-card > header { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.skills-card__index { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 9px; color: #fff; background: var(--portal-navy); font-family: var(--portal-mono); font-size: 11px; }
.skills-card > header div { display: flex; align-items: center; gap: 8px; }
.skills-card > header div > span { color: var(--portal-blue); font-family: var(--portal-mono); font-size: 10px; letter-spacing: .06em; }
.skills-card > header b { padding: 5px 8px; border-radius: 999px; color: #9b641f; background: rgba(200,132,46,.11); font-size: 10px; }
.skills-card > header b.is-official { color: var(--portal-teal); background: rgba(8,127,113,.1); }
.skills-card__body { margin-top: 32px; }
.skills-card__body small { color: var(--portal-muted); font-family: var(--portal-mono); font-size: 10px; }
.skills-card h2 { margin: 6px 0 0; padding: 0; border: 0; font-size: 26px; letter-spacing: -.035em; }
.skills-card p { margin: 12px 0 0; color: var(--portal-muted); font-size: 14px; line-height: 1.75; }
.skills-card ul { display: flex; flex-wrap: wrap; gap: 7px; margin: 20px 0 0; padding: 0; list-style: none; }
.skills-card li { padding: 5px 8px; border-radius: 6px; color: var(--portal-blue); background: var(--portal-soft); font-size: 10px; font-weight: 700; }
.skills-install { display: flex; align-items: center; gap: 10px; min-height: 54px; margin-top: auto; padding: 10px 11px; border: 1px solid var(--portal-line); border-radius: 8px; background: var(--portal-bg); }
.skills-install code, .skills-install span { min-width: 0; flex: 1; overflow: hidden; color: var(--portal-ink); background: transparent; font-family: var(--portal-mono); font-size: 10px; line-height: 1.45; text-overflow: ellipsis; white-space: nowrap; }
.skills-install button { flex: 0 0 auto; padding: 7px 10px; border: 0; border-radius: 6px; color: #fff; background: var(--portal-blue); cursor: pointer; font: inherit; font-size: 10px; font-weight: 700; }
.skills-card footer { display: flex; justify-content: space-between; gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--portal-line); }
.skills-card footer a { color: var(--portal-blue); font-size: 12px; font-weight: 700; text-decoration: none; }
.skills-card footer a:last-child { color: var(--portal-muted); font-weight: 600; }
.skills-empty { padding: 70px 24px; border: 1px dashed var(--portal-line); border-radius: 12px; color: var(--portal-muted); text-align: center; }
.skills-governance { display: grid; grid-template-columns: .45fr 1fr 1.7fr auto; align-items: center; gap: 24px; margin-top: 28px; padding: 30px; border-radius: 14px; color: #eaf3f8; background: #17324d; }
.skills-governance > span { color: #8ee0cc; font-family: var(--portal-mono); font-size: 10px; letter-spacing: .08em; }
.skills-governance h2 { margin: 0; color: #fff; font-size: 24px; }
.skills-governance p { margin: 0; color: #b7cad7; font-size: 13px; line-height: 1.7; }
.skills-governance a { color: #8ee0cc; font-size: 12px; font-weight: 700; text-decoration: none; white-space: nowrap; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
@media (max-width: 900px) { .skills-hero { grid-template-columns: 1fr; } .skills-hero img { aspect-ratio: 16/8; } .skills-toolbar { grid-template-columns: 1fr; } .skills-filters { justify-content: flex-start; } .skills-governance { grid-template-columns: 1fr; } }
@media (max-width: 680px) { .skills-platform { padding: 14px 14px 56px; } .skills-hero__copy { padding: 38px 24px; } .skills-hero h1 { font-size: 38px; } .skills-hero dl { gap: 18px; } .skills-grid { grid-template-columns: 1fr; } .skills-card { min-height: 410px; } .skills-card footer { align-items: flex-start; flex-direction: column; } }
@media (prefers-reduced-motion: reduce) { .skills-card { transition: none; } }
</style>
