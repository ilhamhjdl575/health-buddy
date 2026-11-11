import Image from "next/image";

export function HealthBuddyLogo({
  className = "size-20",
  showText = false,
  textSize = "text-3xl",
}: {
  className?: string;
  showText?: boolean;
  textSize?: string;
}) {
  return (
    <div className="inline-flex flex-col items-center gap-3">
      <div
        className={`relative overflow-hidden rounded-3xl bg-white shadow-lg shadow-teal-700/20 ${className}`}
      >
        <Image
          src="/f26343ed-eec8-4610-83c2-e64d14190847.jpg"
          alt="โลโก้ Health Buddy"
          fill
          sizes="(max-width: 640px) 9rem, 9rem"
          className="object-cover"
        />
      </div>

      {showText ? (
        <div className="text-center">
          <p className={`font-extrabold tracking-tight text-teal-950 ${textSize}`}>
            Health Buddy
          </p>
          <p className="text-sm font-semibold text-teal-700">
            เพื่อนสุขภาพและอาสาสมัครชุมชน
          </p>
        </div>
      ) : null}
    </div>
  );
}

