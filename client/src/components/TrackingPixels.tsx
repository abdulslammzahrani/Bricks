import { useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

type MarketingPlatform = "facebook" | "snapchat" | "tiktok" | "google" | "mailchimp";

interface EnabledMarketingSetting {
  platform: MarketingPlatform;
  pixelId: string | null;
  isEnabled: boolean;
}

type AnyWindow = Record<string, unknown>;

export function useTrackEvent() {
  const trackEvent = useCallback((eventName: string, data?: Record<string, unknown>) => {
    const w = window as unknown as AnyWindow;
    
    if (w.fbq) {
      (w.fbq as (...args: unknown[]) => void)("track", eventName, data);
    }
    if (w.snaptr) {
      (w.snaptr as (...args: unknown[]) => void)("track", eventName.toUpperCase().replace(/ /g, "_"), data);
    }
    if (w.ttq) {
      (w.ttq as { track: (e: string, d?: Record<string, unknown>) => void }).track(eventName, data);
    }
    if (w.gtag) {
      (w.gtag as (...args: unknown[]) => void)("event", eventName, data);
    }
    
    fetch("/api/marketing/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: "all",
        eventName,
        eventData: data,
        sessionId: sessionStorage.getItem("sessionId") || crypto.randomUUID(),
      }),
    }).catch(console.error);
  }, []);

  return { trackEvent };
}

export function TrackingPixels() {
  const { data: settings } = useQuery<EnabledMarketingSetting[]>({
    queryKey: ["/api/marketing/enabled"],
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!settings || settings.length === 0) return;

    if (!sessionStorage.getItem("sessionId")) {
      sessionStorage.setItem("sessionId", crypto.randomUUID());
    }

    settings.forEach((setting) => {
      if (!setting.isEnabled || !setting.pixelId) return;

      switch (setting.platform) {
        case "facebook":
          loadFacebookPixel(setting.pixelId);
          break;
        case "snapchat":
          loadSnapchatPixel(setting.pixelId);
          break;
        case "tiktok":
          loadTikTokPixel(setting.pixelId);
          break;
        case "google":
          loadGoogleTag(setting.pixelId);
          break;
      }
    });
  }, [settings]);

  return null;
}

function loadFacebookPixel(pixelId: string) {
  const w = window as unknown as AnyWindow;
  if (w.fbq) return;

  const queue: unknown[] = [];
  const fbq: { 
    (...args: unknown[]): void; 
    push: (...args: unknown[]) => void;
    loaded: boolean;
    version: string;
    queue: unknown[];
  } = Object.assign(
    function (...args: unknown[]) {
      queue.push(args);
    },
    {
      push: function (...args: unknown[]) { queue.push(args); },
      loaded: true,
      version: "2.0",
      queue: queue,
    }
  );
  
  w._fbq = fbq;
  
  const t = document.createElement("script");
  t.async = true;
  t.src = "https://connect.facebook.net/en_US/fbevents.js";
  
  const s = document.getElementsByTagName("script")[0];
  s?.parentNode?.insertBefore(t, s);
  
  w.fbq = fbq;
  fbq("init", pixelId);
  fbq("track", "PageView");
}

function loadSnapchatPixel(pixelId: string) {
  const w = window as unknown as AnyWindow;
  if (w.snaptr) return;

  const queue: unknown[] = [];
  const snaptr: { 
    (...args: unknown[]): void; 
    queue: unknown[];
  } = Object.assign(
    function (...args: unknown[]) {
      queue.push(args);
    },
    { queue: queue }
  );
  
  w.snaptr = snaptr;
  
  const r = document.createElement("script");
  r.async = true;
  r.src = "https://sc-static.net/scevent.min.js";
  
  const u = document.getElementsByTagName("script")[0];
  u?.parentNode?.insertBefore(r, u);
  
  snaptr("init", pixelId);
  snaptr("track", "PAGE_VIEW");
}

function loadTikTokPixel(pixelId: string) {
  const w = window as unknown as AnyWindow;
  if (w.ttq) return;

  const queue: unknown[] = [];
  
  const ttq = {
    _i: queue,
    load: function (e: string) {
      const n = "https://analytics.tiktok.com/i18n/pixel/events.js";
      queue.push([e]);
      
      const i = document.createElement("script");
      i.async = true;
      i.src = n + "?sdkid=" + e + "&lib=script";
      
      const s = document.getElementsByTagName("script")[0];
      s?.parentNode?.insertBefore(i, s);
    },
    page: function () {
      queue.push(["track", "PageView"]);
    },
    track: function (event: string, data?: Record<string, unknown>) {
      queue.push(["track", event, data]);
    },
  };
  
  w.ttq = ttq;
  ttq.load(pixelId);
  ttq.page();
}

function loadGoogleTag(measurementId: string) {
  const w = window as unknown as AnyWindow;
  if (w.gtag) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  const dataLayer: unknown[] = (w.dataLayer as unknown[]) || [];
  w.dataLayer = dataLayer;
  
  const gtag = function (...args: unknown[]) {
    dataLayer.push(args);
  };
  
  w.gtag = gtag;
  gtag("js", new Date());
  gtag("config", measurementId);
}
