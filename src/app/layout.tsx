import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "GroIntel | The Operating System for Company Intelligence",
  description: "Analyze any company. Discover opportunities. Predict risks. Make better growth decisions with AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white antialiased">
        <Header />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}

