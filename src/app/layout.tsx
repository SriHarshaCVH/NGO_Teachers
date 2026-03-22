import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NGO Teachers",
  description: "NGO and volunteer teaching matching",
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
