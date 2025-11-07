import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIC Ushindi Seme Prize Draw",
  description: "Honest • Transparent • Ticket Raffle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}