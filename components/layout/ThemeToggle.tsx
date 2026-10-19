"use client";

import React, { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

const emptySubscribe = () => () => {};

function subscribeClassChange(callback: () => void) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName === "class") {
        callback();
      }
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getIsDarkSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getIsDarkServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isDark = useSyncExternalStore(
    subscribeClassChange,
    getIsDarkSnapshot,
    getIsDarkServerSnapshot
  );

  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    if (isCurrentlyDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("imagefit-theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("imagefit-theme", "dark");
    }
  };

  // During SSR or before hydration, render an accessible placeholder with exact dimensions to prevent layout shifts
  if (!isMounted) {
    return (
      <button
        type="button"
        className="p-2 rounded-lg text-slate border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
        aria-label="Toggle visual theme"
        disabled
      >
        <div className="w-5 h-5 opacity-0" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-lg text-slate hover:text-ink hover:bg-cloud/80 dark:hover:bg-cloud/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-lime transition-transform hover:rotate-45 duration-200" />
      ) : (
        <Moon className="w-5 h-5 text-slate hover:text-ink transition-transform hover:-rotate-12 duration-200" />
      )}
    </button>
  );
}
