"use client";

import {
  CalendarOutlined,
  CarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { HandshakeIcon } from "@/app/_components/handshake-icon";

export type HomeIconName = "help" | "calendar" | "mobility" | "follow-up" | "phone" | "travel";

const icons = {
  help: HandshakeIcon,
  calendar: CalendarOutlined,
  mobility: CarOutlined,
  "follow-up": CheckCircleOutlined,
  phone: PhoneOutlined,
  travel: EnvironmentOutlined,
};

export function HomeIcon({ name, className }: { name: HomeIconName; className?: string }) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" className={className} />;
}
