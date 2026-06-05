export type PluginSlotId =
  | "home.afterHero"
  | "home.sidebar"
  | "article.afterContent"
  | "search.afterResults"
  | "theme.controls";

export type PluginPermission =
  | "read:posts"
  | "read:releases"
  | "read:search"
  | "theme:extend";

export type PluginDefinition = {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  slots: PluginSlotId[];
  permissions: PluginPermission[];
};
