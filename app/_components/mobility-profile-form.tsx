"use client";

import Link from "next/link";
import { CheckOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import {
  AvoidStairsIcon,
  BedriddenIcon,
  CaneIcon,
  MobilityHeaderIcon,
  WalkerIcon,
  WalkingAssistantIcon,
  WheelchairIcon,
} from "@/app/_components/mobility-icons";
import { saveBedriddenStatus } from "@/app/_lib/mobility-profile";
import { updateMyMobilityProfile, type MobilityValues } from "@/lib/profile/mobility";

const mobilitySchema = z.object({
  walksNormally: z.boolean(),
  usesWheelchair: z.boolean(),
  usesCane: z.boolean(),
  usesWalker: z.boolean(),
  needsWalkingAssistant: z.boolean(),
  avoidsStairs: z.boolean(),
  isBedridden: z.boolean(),
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
    name: "walksNormally",
    label: "เดินได้คล่อง",
    description: "ช่วยเหลือตนเองได้ดี",
    Icon: WalkingAssistantIcon,
  },
  {
    name: "isBedridden",
    label: "ผู้ป่วยติดเตียง",
    description: "ไม่สามารถลุกหรือเดินได้ ต้องรับบริการดูแลที่บ้าน",
    Icon: BedriddenIcon,
  },
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

export function MobilityProfileForm({
  initialValues,
  recipientName,
}: {
  initialValues?: MobilityValues;
  recipientName?: string;
}) {
  const [isSaved, setIsSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<MobilityProfileValues>({
    defaultValues: {
      walksNormally: initialValues?.walksNormally ?? false,
      usesWheelchair: initialValues?.usesWheelchair ?? false,
      usesCane: initialValues?.usesCane ?? false,
      usesWalker: initialValues?.usesWalker ?? false,
      needsWalkingAssistant: initialValues?.needsWalkingAssistant ?? false,
      avoidsStairs: initialValues?.avoidsStairs ?? false,
      isBedridden: initialValues?.isBedridden ?? false,
      notes: initialValues?.notes ?? "",
    },
    resolver: zodResolver(mobilitySchema),
  });

  const selectedValues = useWatch({ control });
  const otherMobilityOptions = options.filter((option) => option.name !== "walksNormally");

  const handleMobilityChange = (
    name: Exclude<keyof MobilityProfileValues, "notes">,
    checked: boolean,
  ) => {
    if (name === "walksNormally" && checked) {
      otherMobilityOptions.forEach((option) => setValue(option.name, false));
    }
    if (name !== "walksNormally" && checked) {
      setValue("walksNormally", false);
    }
  };

  const handleSave = (values: MobilityProfileValues) => {
    setServerError(null);
    setIsSaved(false);

    startTransition(async () => {
      const result = await updateMyMobilityProfile({
        ...values,
        notes: values.notes ?? "",
      });
      if (!result.success) {
        setServerError(result.error);
        return;
      }

      // Sync local cache
      saveBedriddenStatus(values.isBedridden);
      setIsSaved(true);
    });
  };

  return (
    <form
      className="max-w-3xl rounded-3xl border-2 border-teal-100 bg-white p-5 shadow-sm sm:p-8"
      noValidate
      onSubmit={handleSubmit(handleSave)}
    >
      {/* ส่วนหัวเรื่องพร้อมไอคอนสำหรับผู้สูงอายุและผู้ดูแล */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6 sm:gap-5">
        <span
          aria-hidden="true"
          className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-900 shadow-inner sm:size-20"
        >
          <MobilityHeaderIcon className="text-4xl sm:text-5xl" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">
            การเดิน{recipientName ? `ของคุณ ${recipientName}` : "ของคุณ"}
          </h1>
          <p className="mt-1 text-lg leading-7 text-slate-700 sm:text-xl">
            ข้อมูลนี้ช่วยให้ผู้ดูแลทราบและเตรียมอุปกรณ์มาช่วยคุณได้ถูกต้อง
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
            const isDisabled = option.name !== "walksNormally" && selectedValues.walksNormally;
            const inputId = `mobility-${option.name}`;
            const { Icon } = option;

            return (
              <label
                className={`group flex min-h-24 items-center gap-4 rounded-2xl border-2 p-4 text-left transition sm:gap-5 sm:p-5 ${isDisabled ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-60" : "cursor-pointer"} ${
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
                  disabled={isDisabled}
                  {...register(option.name, {
                    onChange: (event) => handleMobilityChange(option.name, event.target.checked),
                  })}
                />

                {/* รูปไอคอนสื่อความหมายชัดเจนสำหรับผู้สูงอายุและผู้ดูแล */}
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
          placeholder="พิมพ์ข้อความที่ต้องการแจ้งผู้ดูแลที่นี่..."
          {...register("notes")}
        />
        {errors.notes ? (
          <p className="mt-2 text-lg font-semibold text-red-700" id="mobility-notes-error" role="alert">
            {errors.notes.message}
          </p>
        ) : null}
      </div>

      {serverError && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 font-bold text-red-800" role="alert">
          {serverError}
        </p>
      )}

      {isSaved ? (
        <div
          className="mt-6 flex items-center gap-3 rounded-2xl border-2 border-teal-400 bg-teal-50 p-5 text-xl font-bold text-teal-900 shadow-sm"
          role="status"
        >
          <CheckOutlined className="text-2xl text-teal-700" />
          <span>บันทึกข้อมูลการเดินลงฐานข้อมูลเรียบร้อยแล้ว</span>
        </div>
      ) : null}

      <div className="mt-9 flex flex-col gap-4 sm:flex-row-reverse sm:justify-end">
        <button
          disabled={isPending}
          className="min-h-16 cursor-pointer rounded-2xl bg-teal-700 px-8 text-2xl font-bold text-white shadow-md transition hover:bg-teal-800 active:scale-[0.99] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-teal-700 disabled:opacity-50"
          type="submit"
        >
          {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
        </button>
        {isSaved ? (
          <Link
            className="inline-flex min-h-16 items-center justify-center rounded-2xl border-2 border-teal-700 bg-white px-8 text-2xl font-bold text-teal-800 transition hover:bg-teal-50 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
            href="/booking"
          >
            ไปรับบริการ
          </Link>
        ) : (
          <Link
            className="inline-flex min-h-16 items-center justify-center rounded-2xl border-2 border-slate-300 bg-white px-8 text-xl font-bold text-slate-700 hover:bg-slate-50"
            href="/booking"
          >
            ไปรับบริการ
          </Link>
        )}
      </div>
    </form>
  );
}
