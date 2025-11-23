import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenIO",
  description: "Privacy computation platform for sealed logic, ZK circuits, FHE engines, and iO coprocessors",
  icons: {
    icon: "/io_logo2.svg",
    shortcut: "/io_logo2.svg",
    apple: "/io_logo2.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
