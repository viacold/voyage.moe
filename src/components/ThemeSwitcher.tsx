"use client";

import type { ThemeId } from "@/content/site";
import { themeOptions } from "@/content/site";

type ThemeSwitcherProps = {
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
};

export function ThemeSwitcher({ theme, onThemeChange }: ThemeSwitcherProps) {
  return (
    <div className="theme-switcher" role="group" aria-label="Theme">
      {themeOptions.map((option) => (
        <button
          className="theme-button"
          data-active={theme === option.id}
          key={option.id}
          onClick={() => onThemeChange(option.id)}
          type="button"
          aria-pressed={theme === option.id}
          title={option.description}
        >
          <span className={`theme-swatch theme-swatch-${option.id}`} aria-hidden="true" />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
