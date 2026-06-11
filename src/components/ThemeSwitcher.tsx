"use client";

import { useEffect, useRef, useState } from "react";
import type { ThemeId } from "@/content/site";
import { themeOptions } from "@/content/site";

type ThemeSwitcherProps = {
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  compact?: boolean;
};

export function ThemeSwitcher({ theme, onThemeChange, compact = false }: ThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="theme-picker" ref={rootRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="选择主题"
        className={`theme-trigger${compact ? " theme-trigger-compact" : ""}`}
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        <span className={`theme-swatch theme-swatch-${theme}`} aria-hidden="true" />
        <span className={`theme-trigger-label${compact ? " theme-trigger-label-compact" : ""}`}>主题</span>
      </button>
      {isOpen ? (
        <div className="theme-panel" role="dialog" aria-label="主题选项">
          {themeOptions.map((option) => (
            <button
              className="theme-button"
              data-active={theme === option.id}
              key={option.id}
              onClick={() => {
                onThemeChange(option.id);
                setIsOpen(false);
              }}
              type="button"
              aria-pressed={theme === option.id}
              title={option.description}
            >
              <span className={`theme-swatch theme-swatch-${option.id}`} aria-hidden="true" />
              <span className="theme-button-copy">
                <span>{option.label}</span>
                <span className="theme-button-note">{option.description}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
