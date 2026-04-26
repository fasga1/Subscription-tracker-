"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister()))
        )
        .catch((error) => {
          console.error("Service worker cleanup failed in dev:", error);
        });
      return;
    }

    void navigator.serviceWorker
      .register("/sw.js")
      .catch((error) => {
        console.error("PWA service worker registration failed:", error);
      });
  }, []);

  return null;
}
