import type { PluginDefinition, PluginSlotId } from "./types";

export const pluginRegistry: PluginDefinition[] = [
  {
    id: "release-downloads",
    name: "Release Downloads",
    version: "0.1.0",
    description: "Surfaces version download links in future compatible slots.",
    enabled: true,
    slots: ["home.sidebar"],
    permissions: ["read:releases"],
  },
  {
    id: "article-notes",
    name: "Article Notes",
    version: "0.1.0",
    description: "Reserved for future article footnotes and related reading.",
    enabled: false,
    slots: ["article.afterContent"],
    permissions: ["read:posts"],
  },
];

export function getEnabledPlugins() {
  return pluginRegistry.filter((plugin) => plugin.enabled);
}

export function getPluginsForSlot(slot: PluginSlotId) {
  return getEnabledPlugins().filter((plugin) => plugin.slots.includes(slot));
}
