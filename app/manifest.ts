import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Health Buddy",
    short_name: "Health Buddy",
    description: "พื้นที่ช่วยเหลือผู้รับบริการและอาสาสมัครสาธารณสุข",
    start_url: "/",
    display: "standalone",
    background_color: "#f0fdfa",
    theme_color: "#0f766e",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/health-buddy-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/health-buddy-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/pwa-screenshot-desktop.png",
        sizes: "1440x900",
        type: "image/png",
        form_factor: "wide",
        label: "หน้าต้อนรับ Health Buddy บนคอมพิวเตอร์",
      },
      {
        src: "/pwa-screenshot-mobile.png",
        sizes: "540x960",
        type: "image/png",
        label: "หน้าต้อนรับ Health Buddy บนมือถือ",
      },
    ],
  };
}
