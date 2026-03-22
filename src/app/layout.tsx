import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-inter",
  display: "swap",
});

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
    <html lang="en" className={inter.variable}>
      <body className="relative min-h-screen bg-background font-sans antialiased text-foreground">
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <div id="main-content" tabIndex={-1} className="outline-none">
          {children}
        </div>
      </body>
    </html>
  );
}
