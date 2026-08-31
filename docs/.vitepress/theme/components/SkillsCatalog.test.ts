import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import SkillsCatalog from "./SkillsCatalog.vue";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SkillsCatalog", () => {
  it("filters entries by category and keyword", async () => {
    const wrapper = mount(SkillsCatalog);

    expect(wrapper.findAll(".skills-card")).toHaveLength(6);

    await wrapper.get("button:nth-child(4)").trigger("click");
    expect(wrapper.findAll(".skills-card")).toHaveLength(1);
    expect(wrapper.text()).toContain("Code Review & Quality");

    await wrapper.get('input[type="search"]').setValue("不存在的技能");
    expect(wrapper.findAll(".skills-card")).toHaveLength(0);
    expect(wrapper.text()).toContain("没有匹配结果");
  });

  it("copies an install command and reports the state", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const wrapper = mount(SkillsCatalog);

    const copyButton = wrapper.get('button[aria-label="复制 Skills CLI 安装命令"]');
    await copyButton.trigger("click");
    await Promise.resolve();

    expect(writeText).toHaveBeenCalledWith("npx skills find");
    expect(copyButton.text()).toBe("已复制");
  });
});
