import type { ReactNode } from "react";
import { getPluginsForSlot } from "./registry";
import type { PluginSlotId } from "./types";

export function PluginSlot({
  slot,
  children,
}: Readonly<{
  slot: PluginSlotId;
  children?: ReactNode;
}>) {
  const plugins = getPluginsForSlot(slot);

  if (!plugins.length || !children) {
    return null;
  }

  return (
    <div className="plugin-slot" data-plugin-slot={slot}>
      {children}
    </div>
  );
}
