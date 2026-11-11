"use client";

import { useEffect, useRef, useState } from "react";
import { HealthBuddyLogo } from "@/app/_components/health-buddy-logo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const SHOW_DELAY_MS = 5000;

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const dismissedForThisPage = useRef(false);
  const showTimer = useRef<number | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true);
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

    const showAfterDelay = () => {
      if (showTimer.current !== null) window.clearTimeout(showTimer.current);
      showTimer.current = window.setTimeout(() => {
        if (!dismissedForThisPage.current) setIsVisible(true);
      }, SHOW_DELAY_MS);
    };

    if (!isStandalone && isIos) {
      setTimeout(() => setShowIosGuide(true), 0);
      showAfterDelay();
    }

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      showAfterDelay();
    };

    const handleInstalled = () => {
      setInstallEvent(null);
      setIsVisible(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      if (showTimer.current !== null) window.clearTimeout(showTimer.current);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const dismiss = () => {
    dismissedForThisPage.current = true;
    setIsVisible(false);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setIsVisible(false);
    setInstallEvent(null);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="ติดตั้งแอป Health Buddy"
      className="fixed bottom-3 left-3 right-3 z-50 rounded-2xl border border-teal-200 bg-white/95 p-3 shadow-xl shadow-slate-950/15 backdrop-blur-md sm:bottom-5 sm:left-auto sm:right-5 sm:w-80"
    >
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-slate-100 text-base font-bold text-slate-600 hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-teal-700"
        aria-label="ปิดคำแนะนำการติดตั้ง"
      >
        ×
      </button>

      <div className="flex items-start gap-2.5 pr-7">
        <HealthBuddyLogo className="size-11 shrink-0 rounded-xl" />
        <div className="min-w-0">
          <h2 className="[overflow-wrap:anywhere] text-base font-black text-teal-950">ติดตั้ง Health Buddy</h2>
          <p className="mt-0.5 [overflow-wrap:anywhere] text-xs leading-relaxed text-slate-600">
            เปิดใช้งานสะดวกจากหน้าจอหลัก
          </p>
        </div>
      </div>

      {showIosGuide && !installEvent ? (
        <div className="mt-2.5 rounded-xl bg-teal-50 px-3 py-2 text-xs font-semibold leading-relaxed text-teal-950">
          แตะปุ่มแชร์ <span aria-hidden="true">⎋</span> ใน Safari แล้วเลือก “เพิ่มไปยังหน้าจอโฮม”
        </div>
      ) : (
        <button
          type="button"
          onClick={install}
          className="mt-2.5 flex min-h-10 w-full items-center justify-center rounded-xl bg-teal-700 px-4 text-sm font-black text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-[0.99]"
        >
          ติดตั้งแอป
        </button>
      )}
    </aside>
  );
}
