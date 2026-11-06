import Link from "next/link";
import { HomeIcon, type HomeIconName } from "@/app/_components/home-icon";

type LargeMenuButtonProps = {
  href: string;
  title: string;
  description?: string;
  icon: HomeIconName;
};

export function LargeMenuButton({
  href,
  title,
  description,
  icon,
}: LargeMenuButtonProps) {
  return (
    <Link
      className="group flex min-h-36 flex-col items-center justify-center rounded-2xl border-2 border-teal-200 bg-white px-4 py-5 text-center shadow-sm transition hover:border-teal-500 hover:bg-teal-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      href={href}
    >
      <HomeIcon className="text-4xl leading-none text-teal-800" name={icon} />
      <span className="mt-3 text-xl font-bold text-slate-900 group-hover:text-teal-900">
        {title}
      </span>
      {description ? <span className="mt-1 text-base leading-6 text-slate-600">{description}</span> : null}
    </Link>
  );
}
