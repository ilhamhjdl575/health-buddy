"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  readAllNotifications,
  readNotification,
  type NotificationItem,
} from "@/lib/notifications/actions";

export function NotificationBell({
  profileId,
  initial,
}: {
  profileId: string;
  initial: NotificationItem[];
}) {
  const pathname = usePathname();
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const s = createClient();
    const c = s
      .channel(`notifications:${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `recipient_profile_id=eq.${profileId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const n = payload.new as {
            id: string;
            type: string;
            title: string;
            message: string;
            service_request_id: string | null;
            is_read: boolean;
            created_at: string;
          };
          setItems((old) => [
            {
              id: n.id,
              type: n.type,
              title: n.title,
              message: n.message,
              serviceRequestId: n.service_request_id,
              isRead: n.is_read,
              createdAt: n.created_at,
            },
            ...old,
          ]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `recipient_profile_id=eq.${profileId}`,
        },
        (payload: { new: Record<string, unknown> }) => {
          const n = payload.new as { id: string; is_read: boolean };
          setItems((old) =>
            old.map((x) => (x.id === n.id ? { ...x, isRead: n.is_read } : x))
          );
        }
      )
      .subscribe();

    return () => {
      void s.removeChannel(c);
    };
  }, [profileId]);

  const unread = items.filter((x) => !x.isRead).length;

  const markOne = (id: string) =>
    startTransition(async () => {
      const r = await readNotification(id);
      if (r.success) {
        setItems((old) =>
          old.map((x) => (x.id === id ? { ...x, isRead: true } : x))
        );
      }
    });

  const markAll = () =>
    startTransition(async () => {
      const r = await readAllNotifications();
      if (r.success) {
        setItems((old) => old.map((x) => ({ ...x, isRead: true })));
      }
    });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={`การแจ้งเตือน ${unread} รายการที่ยังไม่ได้อ่าน`}
        className="relative flex min-h-11 items-center rounded-xl border border-slate-300 bg-white px-3 font-bold text-slate-800"
      >
        <svg
          className="size-5 text-slate-700"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="ml-1 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">การแจ้งเตือน</h2>
            {unread > 0 && (
              <button
                disabled={isPending}
                onClick={markAll}
                className="text-sm font-semibold text-blue-700"
              >
                อ่านทั้งหมด
              </button>
            )}
          </div>
          <div className="mt-2 max-h-80 space-y-2 overflow-y-auto">
            {items.length === 0 ? (
              <p className="p-4 text-center text-sm text-slate-500">
                ไม่มีการแจ้งเตือนใหม่
              </p>
            ) : (
              items.map((n) => (
                <article
                  key={n.id}
                  className={`rounded-xl p-3 ${
                    n.isRead ? "bg-slate-50" : "bg-blue-50"
                  }`}
                >
                  <button
                    disabled={isPending}
                    onClick={() => markOne(n.id)}
                    className="w-full text-left"
                  >
                    <p className="font-bold text-slate-900">{n.title}</p>
                    <p className="text-sm text-slate-700">{n.message}</p>
                    <time className="mt-1 block text-xs text-slate-500">
                      {new Intl.DateTimeFormat("th-TH", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(n.createdAt))}
                    </time>
                  </button>
                  {n.serviceRequestId && (
                    <Link
                      onClick={() => setOpen(false)}
                      href={
                        pathname.startsWith("/buddy")
                          ? n.type === "ASSIGNMENT_PENDING"
                            ? "/buddy/open-jobs"
                            : "/buddy/my-jobs"
                          : "/my-bookings"
                      }
                      className="mt-1 inline-block text-xs font-bold text-blue-700"
                    >
                      ดูรายการที่เกี่ยวข้อง
                    </Link>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
