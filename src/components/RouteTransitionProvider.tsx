"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

type RouteTransitionContextValue = {
  beginTransition: () => void;
  isTransitioning: boolean;
};

const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null);

export function RouteTransitionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const beginTransition = useCallback(() => {
    clearTimer();
    setIsTransitioning(true);
    hideTimerRef.current = window.setTimeout(() => {
      setIsTransitioning(false);
      hideTimerRef.current = null;
    }, 460);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (isTransitioning) {
      document.documentElement.dataset.routeTransition = "true";
      document.body.dataset.routeTransition = "true";
      return;
    }

    delete document.documentElement.dataset.routeTransition;
    delete document.body.dataset.routeTransition;
  }, [isTransitioning]);

  const contextValue = useMemo(
    () => ({
      beginTransition,
      isTransitioning,
    }),
    [beginTransition, isTransitioning],
  );

  return (
    <RouteTransitionContext.Provider value={contextValue}>
      {children}
    </RouteTransitionContext.Provider>
  );
}

export function useRouteTransition() {
  const context = useContext(RouteTransitionContext);

  if (!context) {
    return {
      beginTransition: () => undefined,
      isTransitioning: false,
    };
  }

  return context;
}
