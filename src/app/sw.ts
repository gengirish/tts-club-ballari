/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          if (request.destination !== "document") return false;
          const path = new URL(request.url).pathname;
          // Auth routes must hit the network — never serve the offline shell on /login.
          if (path === "/login" || path.startsWith("/login/")) return false;
          if (path.startsWith("/api/auth")) return false;
          return true;
        },
      },
    ],
  },
});

serwist.addEventListeners();
