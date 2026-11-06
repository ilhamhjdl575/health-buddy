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
        className={`relative flex items-center justify-center rounded-3xl bg-linear-to-br from-teal-500 via-teal-600 to-emerald-700 p-3 shadow-lg shadow-teal-700/20 text-white ${className}`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full"
          aria-hidden="true"
        >
          {/* Heart shaped background outline */}
          <path
            d="M24 40S7 28.5 7 17.5C7 11.5 11.5 7 17.5 7C20.5 7 23 8.5 24 10.5C25 8.5 27.5 7 30.5 7C36.5 7 41 11.5 41 17.5C41 28.5 24 40 24 40Z"
            fill="currentColor"
            fillOpacity="0.18"
          />
          {/* Caring hands embracing */}
          <path
            d="M16 22C16 19 18.5 16.5 21.5 16.5H26.5C29.5 16.5 32 19 32 22V23C32 24.5 31 25.5 29.5 25.5H18.5C17 25.5 16 24.5 16 23V22Z"
            fill="white"
          />
          {/* Health Cross in Center */}
          <rect x="22" y="11" width="4" height="12" rx="2" fill="white" />
          <rect x="18" y="15" width="12" height="4" rx="2" fill="white" />
          {/* Community Smile / Arc */}
          <path
            d="M17 29C17 29 20 33 24 33C28 33 31 29 31 29"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
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

