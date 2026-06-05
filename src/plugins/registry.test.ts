import { describe, expect, test } from "vitest";
import { getEnabledPlugins, getPluginsForSlot, pluginRegistry } from "./registry";

describe("plugin registry", () => {
  test("keeps trusted plugin definitions explicit", () => {
    expect(pluginRegistry.map((plugin) => plugin.id)).toEqual(["release-downloads", "article-notes"]);
  });

  test("returns only enabled plugins", () => {
    expect(getEnabledPlugins().map((plugin) => plugin.id)).toEqual(["release-downloads"]);
  });

  test("returns enabled plugins for a slot and ignores disabled plugins", () => {
    expect(getPluginsForSlot("home.sidebar").map((plugin) => plugin.id)).toEqual(["release-downloads"]);
    expect(getPluginsForSlot("article.afterContent")).toEqual([]);
  });
});
