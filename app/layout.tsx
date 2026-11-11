import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { InstallPrompt } from "@/app/_components/install-prompt";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Health Buddy",
  description: "พื้นที่ช่วยเหลือผู้รับบริการและอาสาสมัครสาธารณสุข",
  icons: {
    icon: "/f26343ed-eec8-4610-83c2-e64d14190847.jpg",
    apple: "/f26343ed-eec8-4610-83c2-e64d14190847.jpg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
