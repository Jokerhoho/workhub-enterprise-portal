<script setup lang="ts">
import { onMounted, ref } from "vue";

interface TrafficMetrics {
  todayVisits: number;
  todayPageViews: number;
  totalVisits: number;
  totalPageViews: number;
  totalSince: string;
}

const traffic = ref<TrafficMetrics | null>(null);
const trafficState = ref<"loading" | "ready" | "error">("loading");
const numberFormatter = new Intl.NumberFormat("zh-CN");
const withBase = (path: string) =>
  `${import.meta.env.BASE_URL || "/"}${path.replace(/^\//, "")}`;
const formatMetric = (value?: number) =>
  typeof value === "number" ? numberFormatter.format(value) : "—";
const formatTotalMetric = (value?: number) => {
  if (typeof value !== "number") return "—";
  if (value < 1000) return numberFormatter.format(value);
  return `${numberFormatter.format(Number((value / 1000).toFixed(1)))}K`;
};
const totalMetricTitle = () =>
  traffic.value?.totalSince
    ? `自 ${traffic.value.totalSince} 起累计；完整日历史数据由 D1 永久保存`
    : "完整日历史数据由 D1 永久保存";

const openSearch = () => {
  document
    .querySelector<HTMLButtonElement>(".VPNavBarSearch button, .DocSearch-Button")
    ?.click();
};

onMounted(async () => {
  try {
    const response = await fetch("/api/traffic", { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Traffic API returned ${response.status}`);
    traffic.value = (await response.json()) as TrafficMetrics;
    trafficState.value = "ready";
  } catch {
    trafficState.value = "error";
  }
});
</script>

<template>
  <main class="portal-home">
    <section class="portal-hero" aria-labelledby="portal-hero-title">
      <div class="portal-hero__main">
        <div class="portal-eyebrow"><span aria-hidden="true"></span>企业 AI 能力中心</div>
        <h1 id="portal-hero-title">让知识、工具与流程，<br />在一个入口协同</h1>
        <p class="portal-hero__summary">
          面向内部团队的企业 AI 门户。统一学习 WorkBuddy、千问办公与 Codex，快速找到可信指南、经过验证的工作流和可安装 Skills。
        </p>
        <button class="portal-search" type="button" aria-label="打开全站搜索" @click="openSearch">
          <span class="portal-search__icon" aria-hidden="true"></span>
          <span class="portal-search__placeholder">搜索知识、案例、Skill 或工作流</span>
          <kbd>⌘ K</kbd>
        </button>
        <div class="portal-hero__actions">
          <a class="portal-button portal-button--primary" :href="withBase('/tools/')">进入 AI 工具库 <span aria-hidden="true">→</span></a>
          <a class="portal-button portal-button--secondary" :href="withBase('/skills/')">浏览 Skills 平台</a>
          <a class="portal-button portal-button--secondary" :href="withBase('/bluebook/')">进入知识中心</a>
          <a class="portal-button portal-button--secondary" :href="withBase('/reading-guide')">查看上手路径</a>
        </div>
      </div>

      <aside class="portal-overview" aria-label="门户概览">
        <div class="portal-overview__head">
          <div><span>WORKSPACE / 01</span><h2>今日工作台</h2></div>
          <span class="portal-status"><i></i> 服务正常</span>
        </div>
        <div class="portal-overview__feature">
          <span class="portal-index">01</span>
          <div>
            <small>推荐从这里开始</small>
            <strong>完成第一个可验收的 AI 任务</strong>
            <a :href="withBase('/bluebook/第一篇%20使用手册：先把%20WorkBuddy%20用起来/第%204%20章%20快速完成第一个%20WorkBuddy%20任务/')">查看操作指南 →</a>
          </div>
        </div>
        <div class="portal-overview__grid" aria-label="内容概览">
          <div><strong>27</strong><span>知识章节</span></div>
          <div><strong>04</strong><span>能力路径</span></div>
          <div><strong>11</strong><span>核心案例</span></div>
          <div><strong>∞</strong><span>可复用流程</span></div>
        </div>
        <div class="portal-overview__footer"><span>内容治理</span><strong>结构化 · 可复现 · 可追踪</strong></div>
      </aside>
    </section>

    <section class="portal-section portal-quick" aria-labelledby="portal-quick-title">
      <div class="portal-section__heading">
        <div><span>QUICK ACCESS</span><h2 id="portal-quick-title">按工作场景快速进入</h2></div>
        <p>从目标出发，无需按章节顺序阅读。</p>
      </div>
      <div class="portal-quick__grid">
        <a :href="withBase('/bluebook/第二篇%20案例篇：从一项任务到一支%20AI%20团队/第%2011%20章%20办公三件套：Word、Excel、PPT/')"><span class="portal-quick__code">DOC</span><strong>办公文档</strong><small>Word · Excel · PPT</small><i>→</i></a>
        <a :href="withBase('/bluebook/第二篇%20案例篇：从一项任务到一支%20AI%20团队/第%2012%20章%20从整理桌面文件这些小事做起/')"><span class="portal-quick__code">OPS</span><strong>文件与远程</strong><small>整理 · 查找 · 执行</small><i>→</i></a>
        <a :href="withBase('/bluebook/第二篇%20案例篇：从一项任务到一支%20AI%20团队/第%2015%20章%20资讯整合：把信息流变成每日通知/')"><span class="portal-quick__code">KMS</span><strong>资讯与知识</strong><small>收集 · 筛选 · 复用</small><i>→</i></a>
        <a :href="withBase('/bluebook/第二篇%20案例篇：从一项任务到一支%20AI%20团队/第%2018%20章%20把投资分析变成你的日常/')"><span class="portal-quick__code">LAB</span><strong>专业分析</strong><small>研究 · 诊断 · 决策</small><i>→</i></a>
        <a :href="withBase('/bluebook/第二篇%20案例篇：从一项任务到一支%20AI%20团队/第%2019%20章%20一句话召唤%20AI%20视频团队/')"><span class="portal-quick__code">MKT</span><strong>内容生产</strong><small>视频 · 自媒体 · GEO</small><i>→</i></a>
        <a :href="withBase('/bluebook/第三篇%20进阶篇：把案例变成自己的工作系统/第%2024%20章%20如何进行多%20Agent%20系统设计/')"><span class="portal-quick__code">AUT</span><strong>AI 工作系统</strong><small>Skill · Agent · 自动化</small><i>→</i></a>
      </div>
    </section>

    <section class="portal-section portal-tools" aria-labelledby="portal-tools-title">
      <div class="portal-section__heading">
        <div><span>AI TOOL LIBRARY</span><h2 id="portal-tools-title">三个核心工具，各司其职</h2></div>
        <p>按任务类型选工具，教程统一覆盖上手方法、可复制模板与安全边界。</p>
      </div>
      <div class="portal-tools__grid">
        <a class="portal-tool-card portal-tool-card--workbuddy" :href="withBase('/tools/workbuddy/')">
          <header><span class="portal-tool-card__code">WB</span><span class="portal-tool-card__status">通用工作</span></header>
          <div><small>WORKBUDDY</small><h3>WorkBuddy</h3><p>面向本地文件、知识处理和跨工具工作流，把 Skill、Agent、连接器与自动化组织在一起。</p></div>
          <ul aria-label="WorkBuddy 适用场景"><li>文件</li><li>知识</li><li>Skill</li><li>自动化</li></ul>
          <footer><span>业务与流程团队</span><strong>查看教程 →</strong></footer>
        </a>
        <a class="portal-tool-card portal-tool-card--qwen" :href="withBase('/tools/qwen-office/')">
          <header><span class="portal-tool-card__code">QW</span><span class="portal-tool-card__status">办公生产</span></header>
          <div><small>QWENWORK</small><h3>千问办公</h3><p>面向文档、表格、演示和日常协作，从一句任务描述到可继续编辑的办公成果。</p></div>
          <ul aria-label="千问办公适用场景"><li>文档</li><li>表格</li><li>PPT</li><li>资料整理</li></ul>
          <footer><span>办公团队优先</span><strong>查看教程 →</strong></footer>
        </a>
        <a class="portal-tool-card portal-tool-card--codex" :href="withBase('/tools/codex/')">
          <header><span class="portal-tool-card__code">CX</span><span class="portal-tool-card__status">研发协作</span></header>
          <div><small>OPENAI CODEX</small><h3>Codex</h3><p>面向代码仓库的理解、修改、测试和审查，把明确需求推进为可验证的代码变更。</p></div>
          <ul aria-label="Codex 适用场景"><li>读代码</li><li>修问题</li><li>做功能</li><li>跑验证</li></ul>
          <footer><span>研发团队优先</span><strong>查看教程 →</strong></footer>
        </a>
      </div>
    </section>

    <section class="portal-section portal-skills" aria-labelledby="portal-skills-title">
      <div class="portal-skills__visual">
        <img :src="withBase('/images/skills/ai-tools-and-skills-hero.webp')" alt="三个 AI 工具通过可安装 Skills 协同工作的系统插画" width="1600" height="900" />
      </div>
      <div class="portal-skills__copy">
        <span>SKILLS PLATFORM</span>
        <h2 id="portal-skills-title">从会用工具，到拥有专业能力库</h2>
        <p>精选主流 Skill、Agent、Plugin 与 MCP。每个条目都附快速安装、使用文档、实战案例和企业安全检查。</p>
        <ul>
          <li><b>01</b><span><strong>精选来源</strong><small>官方与高质量社区项目</small></span></li>
          <li><b>02</b><span><strong>快速安装</strong><small>命令可复制，步骤可复现</small></span></li>
          <li><b>03</b><span><strong>实战验收</strong><small>案例、权限与回退一起说明</small></span></li>
        </ul>
        <a :href="withBase('/skills/')">进入 Skills 平台 →</a>
      </div>
    </section>

    <section class="portal-section portal-paths" aria-labelledby="portal-paths-title">
      <div class="portal-section__heading">
        <div><span>CAPABILITY PATHS</span><h2 id="portal-paths-title">四条能力路径</h2></div>
        <p>按角色与成熟度选择，不让信息架构成为使用门槛。</p>
      </div>
      <div class="portal-paths__grid">
        <a class="portal-path-card portal-path-card--featured" :href="withBase('/bluebook/第一篇%20使用手册：先把%20WorkBuddy%20用起来/')"><div><span>01 / 基础能力</span><b>适合所有成员</b></div><h3>快速上手与安全使用</h3><p>安装、界面、首个任务、Skill、连接器、API 与自动化。</p><footer><span>10 个章节</span><strong>开始学习 →</strong></footer></a>
        <a class="portal-path-card" :href="withBase('/bluebook/第二篇%20案例篇：从一项任务到一支%20AI%20团队/')"><div><span>02 / 场景实践</span><b>业务团队</b></div><h3>把真实任务跑通</h3><p>覆盖办公、文件、知识、会议、分析与内容增长的实践。</p><footer><span>11 个案例</span><strong>查看案例 →</strong></footer></a>
        <a class="portal-path-card" :href="withBase('/bluebook/第三篇%20进阶篇：把案例变成自己的工作系统/')"><div><span>03 / 系统沉淀</span><b>流程负责人</b></div><h3>建立可复用工作流</h3><p>打造 Skill、多 Agent 协作与可靠的自动化工作流。</p><footer><span>4 个章节</span><strong>进入进阶 →</strong></footer></a>
        <a class="portal-path-card" :href="withBase('/bluebook/第四篇%20岗位与行业落地/')"><div><span>04 / 组织落地</span><b>管理者</b></div><h3>从岗位到团队能力</h3><p>围绕岗位、行业、权限边界与验收标准设计落地路线。</p><footer><span>2 个路线图</span><strong>规划落地 →</strong></footer></a>
      </div>
    </section>

    <section class="portal-operating" aria-labelledby="portal-operating-title">
      <div class="portal-operating__copy">
        <span>OPERATING MODEL</span><h2 id="portal-operating-title">把个人经验，转化为组织资产</h2>
        <p>每一个工作流都应有清晰输入、权限边界、验收标准和失败回退。门户不仅提供答案，也帮助团队建立可靠的 AI 工作方式。</p>
        <a :href="withBase('/bluebook/第三篇%20进阶篇：把案例变成自己的工作系统/')">查看系统化方法 →</a>
      </div>
      <ol class="portal-operating__steps">
        <li><b>01</b><div><strong>完成任务</strong><span>先获得可验收结果</span></div></li>
        <li><b>02</b><div><strong>复盘案例</strong><span>记录输入、过程与边界</span></div></li>
        <li><b>03</b><div><strong>沉淀流程</strong><span>形成 Skill 与自动化</span></div></li>
        <li><b>04</b><div><strong>团队复用</strong><span>治理、追踪并持续改进</span></div></li>
      </ol>
    </section>

    <section class="portal-meta" aria-label="门户运行信息">
      <div class="portal-meta__notice"><span class="portal-meta__badge">GOV</span><div><strong>安全与治理提示</strong><p>处理内部资料前，请确认数据分级、可用连接器和对外发送边界。</p></div><a :href="withBase('/reading-guide')">查看使用规范 →</a></div>
      <div class="wb-traffic" :class="`wb-traffic--${trafficState}`" aria-live="polite">
        <span class="wb-traffic__state"><i></i>{{ trafficState === "error" ? "统计离线" : "门户运行中" }}</span>
        <div><small>今日访问</small><strong>{{ formatMetric(traffic?.todayVisits) }}</strong></div>
        <div><small>今日浏览</small><strong>{{ formatMetric(traffic?.todayPageViews) }}</strong></div>
        <div :title="totalMetricTitle()"><small>累计访问</small><strong>{{ formatTotalMetric(traffic?.totalVisits) }}</strong></div>
        <div :title="totalMetricTitle()"><small>累计浏览</small><strong>{{ formatTotalMetric(traffic?.totalPageViews) }}</strong></div>
      </div>
    </section>
  </main>
</template>
