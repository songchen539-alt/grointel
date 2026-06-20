import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "GroIntel | Company and KOL Growth Matching Intelligence",
  description: "Understand companies and KOLs from one identity signal, complete missing context, and match both sides for growth.",
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

 

