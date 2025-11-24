"use client";

import { useEffect, useRef, useState } from "react";
import Router from "next/router";

export default function RouteLoadingBar() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    const handleStart = () => {
      clearTimers();
      setVisible(true);
      setProgress(0);

      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 80) return prev;
          const next = prev + Math.random() * 15 + 5;
          return Math.min(next, 90);
        });
      }, 200);
    };

    const handleDone = () => {
      clearTimers();
      setProgress(100);
      hideTimeoutRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);
    };

    Router.events.on("routeChangeStart", handleStart);
    Router.events.on("routeChangeComplete", handleDone);
    Router.events.on("routeChangeError", handleDone);

    return () => {
      clearTimers();
      Router.events.off("routeChangeStart", handleStart);
      Router.events.off("routeChangeComplete", handleDone);
      Router.events.off("routeChangeError", handleDone);
    };
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] pointer-events-none transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      <div
        className="h-0.5 sm:h-1 bg-gradient-to-r from-primary via-yellow-300 to-orange-400"
        style={{
          transform: `scaleX(${progress / 100})`,
          transformOrigin: "left",
        }}
      />
    </div>
  );
}
