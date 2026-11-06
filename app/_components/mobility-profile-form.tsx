"use client";

import Link from "next/link";
import { CheckOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  AvoidStairsIcon,
  CaneIcon,
  MobilityHeaderIcon,
  WalkerIcon,
  WalkingAssistantIcon,
  WheelchairIcon,
} from "@/app/_components/mobility-icons";

const mobilitySchema = z.object({
  usesWheelchair: z.boolean(),
  usesCane: z.boolean(),
  usesWalker: z.boolean(),
  needsWalkingAssistant: z.boolean(),
  avoidsStairs: z.boolean(),
  notes: z.string().trim().optional(),
});

type MobilityProfileValues = z.infer<typeof mobilitySchema>;

const options: {
  name: Exclude<keyof MobilityProfileValues, "notes">;
  label: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    name: "usesWheelchair",
    label: "ใช้รถเข็น",
    description: "ต้องใช้วีลแชร์ / มีรถเข็นประจำตัว",
    Icon: WheelchairIcon,
  },
  {
    name: "usesCane",
    label: "ใช้ไม้เท้าช่วยเดิน",
    description: "มีไม้เท้า 1 ขา หรือ 3-4 ขา ช่วยพยุง",
    Icon: CaneIcon,
  },
  {
    name: "usesWalker",
    label: "ใช้เครื่องช่วยเดิน",
    description: "วอล์กเกอร์ 4 ขา หรือคอกช่วยเดิน",
    Icon: WalkerIcon,
  },
  {
    name: "needsWalkingAssistant",
    label: "อยากให้มีคนช่วยเดิน",
    description: "ต้องการคนช่วยประคองแขน หรือพยุงเดิน",
    Icon: WalkingAssistantIcon,
  },
  {
    name: "avoidsStairs",
    label: "ขึ้น-ลงบันไดไม่สะดวก",
    description: "ขึ้นบันไดลำบาก / ขอใช้ทางลาดหรือลิฟต์",
    Icon: AvoidStairsIcon,
  },
];

export function MobilityProfileForm() {
  const [isSaved, setIsSaved] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MobilityProfileValues>({
    defaultValues: {
      usesWheelchair: false,
      usesCane: false,
      usesWalker: false,
      needsWalkingAssistant: false,
      avoidsStairs: false,
      notes: "",
    },
    resolver: zodResolver(mobilitySchema),
  });
  const selectedValues = useWatch({ control });

  return (
    <form
      className="max-w-3xl rounded-3xl border-2 border-teal-100 bg-white p-5 shadow-sm sm:p-8"
      noValidate
      onSubmit={handleSubmit(() => setIsSaved(true))}
    >
      {/* ส่วนหัวเรื่องพร้อมไอคอนสำหรับผู้สูงอายุและ อสม. */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6 sm:gap-5">
        <span
          aria-hidden="true"
          className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-900 shadow-inner sm:size-20"
        >
          <MobilityHeaderIcon className="text-4xl sm:text-5xl" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">การเดินของคุณ</h1>
          <p className="mt-1 text-lg leading-7 text-slate-700 sm:text-xl">
            ข้อมูลนี้ช่วยให้ อสม. ทราบและเตรียมอุปกรณ์มาช่วยคุณได้ถูกต้อง
          </p>
        </div>
      </div>

      <fieldset className="mt-8">
        <legend className="text-2xl font-bold text-slate-950">
          แตะเลือกข้อที่ตรงกับคุณ <span className="text-base font-normal text-slate-600">(เลือกได้หลายข้อ)</span>
        </legend>

        <div className="mt-5 space-y-4">
          {options.map((option) => {
            const isSelected = selectedValues[option.name];
            const inputId = `mobility-${option.name}`;
            const { Icon } = option;

            return (
              <label
                className={`group flex min-h-24 cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 text-left transition sm:gap-5 sm:p-5 ${
                  isSelected
                    ? "border-teal-700 bg-teal-50/70 shadow-md ring-2 ring-teal-300"
                    : "border-slate-300 bg-white hover:border-teal-400 hover:bg-slate-50"
                }`}
                htmlFor={inputId}
                key={option.name}
              >
                {/* Checkbox input (ขนาดใหญ่ แตะง่าย) */}
                <input
                  className="size-8 shrink-0 accent-teal-700"
                  id={inputId}
                  type="checkbox"
                  {...register(option.name)}
                />

                {/* รูปไอคอนสื่อความหมายชัดเจนสำหรับผู้สูงอายุและ อสม. */}
                <span
                  aria-hidden="true"
                  className={`flex size-16 shrink-0 items-center justify-center rounded-2xl transition sm:size-20 ${
                    isSelected
                      ? "bg-teal-700 text-white shadow-sm"
                      : "bg-teal-100/80 text-teal-900 group-hover:bg-teal-200"
                  }`}
                >
                  <Icon className="text-4xl sm:text-5xl" />
                </span>

                {/* ข้อความและคำอธิบาย */}
                <div className="min-w-0 flex-1">
                  <span className="block text-xl font-bold text-slate-950 sm:text-2xl">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-base text-slate-600 sm:text-lg">
                    {option.description}
                  </span>
                </div>

                {/* ป้ายบอกสถานะการเลือก */}
                <span
                  className={`hidden shrink-0 rounded-full px-4 py-2 text-base font-bold sm:inline-flex sm:items-center sm:gap-1.5 ${
                    isSelected
                      ? "bg-teal-700 text-white shadow-sm"
                      : "border-2 border-slate-300 bg-slate-100 text-slate-600"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckOutlined className="text-sm" /> เลือกแล้ว
                    </>
                  ) : (
                    "ยังไม่ได้เลือก"
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-9">
        <label className="text-2xl font-bold text-slate-950" htmlFor="mobility-notes">
          อยากบอกอะไรเพิ่มไหม? <span className="text-lg font-normal text-slate-600">(ถ้ามี)</span>
        </label>
        <p className="mt-1 text-lg text-slate-600">เช่น เดินได้ระยะสั้น หรือต้องมีคนช่วยพยุงขึ้นรถ</p>
        <textarea
          aria-describedby={errors.notes ? "mobility-notes-error" : undefined}
          className="mt-3 min-h-32 w-full rounded-2xl border-2 border-slate-300 bg-white p-4 text-xl text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
          id="mobility-notes"
          placeholder="พิมพ์ข้อความที่ต้องการแจ้ง อสม. ที่นี่..."
          {...register("notes")}
        />
        {errors.notes ? (
          <p className="mt-2 text-lg font-semibold text-red-700" id="mobility-notes-error" role="alert">
            {errors.notes.message}
          </p>
        ) : null}
      </div>

      {isSaved ? (
        <div
          className="mt-6 flex items-center gap-3 rounded-2xl border-2 border-teal-400 bg-teal-50 p-5 text-xl font-bold text-teal-900 shadow-sm"
          role="status"
        >
          <CheckOutlined className="text-2xl text-teal-700" />
          <span>บันทึกข้อมูลการเดินเรียบร้อยแล้ว</span>
        </div>
      ) : null}

      <div className="mt-9 flex flex-col gap-4 sm:flex-row-reverse sm:justify-end">
        <button
          className="min-h-16 cursor-pointer rounded-2xl bg-teal-700 px-8 text-2xl font-bold text-white shadow-md transition hover:bg-teal-800 active:scale-[0.99] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          type="submit"
        >
          บันทึกข้อมูล
        </button>
        <Link
          className="inline-flex min-h-16 items-center justify-center rounded-2xl border-2 border-teal-700 bg-white px-8 text-2xl font-bold text-teal-800 transition hover:bg-teal-50 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
          href="/booking"
        >
          ไปขอความช่วยเหลือ
        </Link>
      </div>
    </form>
  );
}
