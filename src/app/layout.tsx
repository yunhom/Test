import type { Metadata } from "next";
import { ToastProvider } from '@/context/ToastContext';
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s - 迷你商城",
    default: "迷你商城 - 发现好物",
  },
  description: "迷你商城，精选好物，便捷购物体验",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
