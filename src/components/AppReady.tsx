"use client";

import { useEffect } from "react";

export function AppReady() {
  useEffect(() => {
    let shellFrame = 0;
    let contentTimer = 0;

    shellFrame = window.requestAnimationFrame(() => {
      document.documentElement.dataset.shellReady = "true";
      contentTimer = window.setTimeout(() => {
        document.documentElement.dataset.appReady = "true";
      }, 520);
    });

    return () => {
      window.cancelAnimationFrame(shellFrame);
      window.clearTimeout(contentTimer);
      delete document.documentElement.dataset.shellReady;
      delete document.documentElement.dataset.appReady;
    };
  }, []);

  return null;
}
