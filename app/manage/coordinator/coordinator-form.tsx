"use client";

import { useActionState } from "react";
import type { LocalCoordinator } from "@/lib/coordinator/data";
import { saveCoordinatorAction, type CoordinatorFormState } from "./actions";

const initialState: CoordinatorFormState = { success: false, message: "" };

export function CoordinatorForm({ initialData }: { initialData: LocalCoordinator | null }) {
  const [state, formAction, pending] = useActionState(saveCoordinatorAction, initialState);
  const fields = [
    { name: "healthCenterName", label: "ชื่อ รพ.สต.", value: initialData?.healthCenterName ?? "", type: "text" },
    { name: "coordinatorName", label: "ชื่อ - นามสกุล ผู้ประสานงาน", value: initialData?.coordinatorName ?? "", type: "text" },
    { name: "phone", label: "เบอร์โทร", value: initialData?.phone ?? "", type: "tel" },
    { name: "lineId", label: "ID LINE", value: initialData?.lineId ?? "", type: "text" },
  ];

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-base font-bold text-slate-800" htmlFor={field.name}>{field.label}</label>
          <input
            className="mt-2 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
            defaultValue={field.value}
            id={field.name}
            maxLength={field.name === "phone" ? 30 : field.name === "lineId" ? 100 : 200}
            name={field.name}
            required
            type={field.type}
          />
        </div>
      ))}

      {state.message ? (
        <p className={`rounded-2xl border p-4 font-bold ${state.success ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-red-300 bg-red-50 text-red-900"}`} role={state.success ? "status" : "alert"}>
          {state.message}
        </p>
      ) : null}

      <button className="min-h-14 w-full rounded-2xl bg-teal-700 px-6 text-xl font-bold text-white hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">
        {pending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
      </button>
    </form>
  );
}

