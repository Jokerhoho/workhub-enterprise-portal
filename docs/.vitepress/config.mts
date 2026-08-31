import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vitepress";

import { siteSidebar } from "./sidebar";
import { configureMermaidMarkdown } from "./mermaid-markdown";
import { createPageDescription, createSeoHead } from "./seo";

const siteUrl = process.env.VITEPRESS_SITE_URL || "https://portal.example.com";
const publicMode = process.env.VITEPRESS_PUBLIC_MODE === "true";
const base = process.env.VITEPRESS_BASE || "/";

export default defineConfig({
    lang: "zh-CN",
    base,
    title: "WorkHub 企业 AI 工作台",
    titleTemplate: ":title · WorkHub 企业 AI 工作台",
    description: "统一承载 WorkBuddy 知识、工具、案例与团队工作流的企业 AI 门户。",
    cleanUrls: true,
    lastUpdated: true,
    srcExclude: ["**/source.md", "plans/**"],
    sitemap: publicMode
      ? {
          hostname: new URL(siteUrl).origin,
          transformItems: (items) =>
            items.map((item) => ({
              ...item,
              url: new URL(
                item.url.replace(/^\/+/, ""),
                `${siteUrl.replace(/\/$/, "")}/`,
              ).href,
            })),
        }
      : undefined,
    buildEnd: (siteConfig) => {
      const robots = publicMode
        ? `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`
        : "User-agent: *\nDisallow: /\n";
      writeFileSync(resolve(siteConfig.outDir, "robots.txt"), robots, "utf8");
    },
    transformPageData: (pageData, { siteConfig }) => {
      if (pageData.relativePath.startsWith("cases/")) {
        pageData.frontmatter.aside = false;
        pageData.frontmatter.outline = false;
      }

      return {
        description: createPageDescription(siteConfig.srcDir, pageData),
      };
    },
    transformHead: (context) => createSeoHead(siteUrl, context, publicMode),
    head: [
      ["meta", { name: "theme-color", content: "#17324d" }],
      ["meta", { name: "author", content: "企业 AI 能力中心" }],
      [
        "meta",
        {
          name: "keywords",
          content:
            "企业 AI,WorkBuddy,知识门户,AI Agent,AI 工作系统,Skills,MCP,自动化,多智能体",
        },
      ],
    ],
    markdown: {
      config: configureMermaidMarkdown,
      image: {
        lazyLoading: true,
      },
      theme: {
        light: "github-light",
        dark: "github-dark",
      },
    },
    themeConfig: {
      siteTitle: "WorkHub 企业 AI 工作台",
      nav: [
        { text: "首页", link: "/" },
        { text: "AI 工具库", link: "/tools/" },
        { text: "知识中心", link: "/bluebook/" },
        { text: "场景案例", link: "/cases/" },
        { text: "使用支持", link: "/help/" },
        { text: "上手指南", link: "/reading-guide" },
      ],
      sidebar: siteSidebar,
      search: {
        provider: "local",
      },
      outline: {
        level: [2, 3],
        label: "本页目录",
      },
      docFooter: {
        prev: "上一篇",
        next: "下一篇",
      },
      lastUpdated: {
        text: "最后更新",
        formatOptions: {
          dateStyle: "medium",
          timeStyle: "short",
        },
      },
      footer: {
        message: "企业 AI 知识、工具与流程的统一入口",
        copyright: "WorkHub 企业 AI 工作台",
      },
    },
  });
