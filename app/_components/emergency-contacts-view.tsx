"use client";

import { useState, useTransition } from "react";
import type { EmergencyInfo, EmergencyContactItem } from "@/lib/emergency/actions";
import { saveEmergencyContact } from "@/lib/emergency/actions";

export function EmergencyContactsView({ info }: { info: EmergencyInfo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [contacts, setContacts] = useState<EmergencyContactItem[]>(info.contacts);
  const [formName, setFormName] = useState(info.contacts[0]?.name ?? "");
  const [formRelationship, setFormRelationship] = useState(info.contacts[0]?.relationship ?? "");
  const [formPhone, setFormPhone] = useState(info.contacts[0]?.phone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const res = await saveEmergencyContact({
        id: contacts[0]?.id,
        name: formName,
        relationship: formRelationship,
        phone: formPhone,
      });

      if (!res.success) {
        setError(res.error);
        return;
      }

      setContacts([
        {
          id: contacts[0]?.id ?? "new",
          name: formName,
          relationship: formRelationship,
          phone: formPhone,
          isPrimary: true,
        },
      ]);
      setIsEditing(false);
      setMessage("บันทึกข้อมูลผู้ติดต่อฉุกเฉินแล้ว");
    });
  };

  const primaryContact = contacts[0];

  return (
    <section
      aria-labelledby="contact-title"
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl font-bold text-slate-950" id="contact-title">
          ผู้ติดต่อฉุกเฉิน
        </h2>
        {info.isAuthenticated && !isEditing && (
          <button
            type="button"
            onClick={() => {
              setFormName(primaryContact?.name ?? "");
              setFormRelationship(primaryContact?.relationship ?? "");
              setFormPhone(primaryContact?.phone ?? "");
              setIsEditing(true);
            }}
            className="text-base font-bold text-teal-800 hover:text-teal-950 underline"
          >
            {primaryContact ? "แก้ไข" : "+ เพิ่มผู้ติดต่อฉุกเฉิน"}
          </button>
        )}
      </div>

      {message && (
        <p className="mt-3 rounded-xl bg-teal-50 p-3 text-base font-semibold text-teal-900 border border-teal-200">
          {message}
        </p>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-base font-bold text-slate-800" htmlFor="contact-name">
              ชื่อ-นามสกุล ผู้ติดต่อ
            </label>
            <input
              id="contact-name"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="เช่น คุณสมศักดิ์"
              className="mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 text-lg outline-none focus:border-teal-700"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-slate-800" htmlFor="contact-relation">
              ความสัมพันธ์
            </label>
            <input
              id="contact-relation"
              required
              value={formRelationship}
              onChange={(e) => setFormRelationship(e.target.value)}
              placeholder="เช่น ลูกชาย, ญาติ, เพื่อนบ้าน"
              className="mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 text-lg outline-none focus:border-teal-700"
            />
          </div>

          <div>
            <label className="block text-base font-bold text-slate-800" htmlFor="contact-phone">
              เบอร์โทรศัพท์
            </label>
            <input
              id="contact-phone"
              type="tel"
              required
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="0812345678"
              className="mt-1 min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 text-lg outline-none focus:border-teal-700"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-base font-bold text-red-800 border border-red-200">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              disabled={isPending}
              type="submit"
              className="min-h-12 rounded-xl bg-teal-700 px-6 font-bold text-white hover:bg-teal-800 disabled:opacity-50"
            >
              {isPending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setIsEditing(false)}
              className="min-h-12 rounded-xl border-2 border-slate-300 px-5 font-bold text-slate-700 hover:bg-slate-100"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      ) : primaryContact ? (
        <div className="mt-4 space-y-4">
          <dl className="space-y-2 text-lg text-slate-800">
            <div>
              <dt className="text-sm font-semibold text-slate-500">ชื่อ</dt>
              <dd className="text-xl font-bold">{primaryContact.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-500">ความสัมพันธ์</dt>
              <dd className="text-xl font-bold">{primaryContact.relationship}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-500">เบอร์โทร</dt>
              <dd className="text-xl font-bold">{primaryContact.phone}</dd>
            </div>
          </dl>

          <a
            className="flex min-h-16 w-full items-center justify-center rounded-2xl border-2 border-teal-700 bg-teal-50 px-5 text-xl font-bold text-teal-900 hover:bg-teal-100 focus-visible:outline-3 focus-visible:outline-teal-700"
            href={`tel:${primaryContact.phone.replace(/[^0-9+]/g, "")}`}
          >
            โทรหาผู้ติดต่อฉุกเฉิน ({primaryContact.phone})
          </a>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-600">
          <p className="text-lg">ยังไม่มีข้อมูลผู้ติดต่อฉุกเฉินในระบบ</p>
          {info.isAuthenticated ? (
            <p className="mt-1 text-sm text-slate-500">
              กด &quot;+ เพิ่มผู้ติดต่อฉุกเฉิน&quot; ด้านบน เพื่อบันทึกข้อมูลญาติหรือผู้ติดต่อที่ไว้ใจได้
            </p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">
              เข้าสู่ระบบเพื่อดูหรือเพิ่มผู้ติดต่อฉุกเฉินประจำตัวคุณ
            </p>
          )}
        </div>
      )}
    </section>
  );
}
