import type { Metadata } from "next";
import { JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";
import { LabStatusFooter } from "@/components/layout/LabStatusFooter";
import { Navbar } from "@/components/layout/Navbar";
import { VectorBot } from "@/components/ui/VectorBot";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VectorWeb Labs | Student-Run Web Agency",
  description: "We build fast. You grow faster. AI-powered web development at student-led prices.",
  keywords: ["web agency", "web development", "student", "AI", "fast", "affordable"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${jetbrainsMono.variable} ${syne.variable} antialiased bg-void text-bone min-h-screen`}
      >
        {/* Noise Overlay */}
        <div className="noise-overlay" />

        {/* Navigation Bar */}
        <Navbar />

        {/* Main Content */}
        <main className="pt-16 pb-12">
          {children}
        </main>

        {/* Persistent Lab Status Footer */}
        <LabStatusFooter />

        {/* Floating AI Assistant */}
        <VectorBot />
      </body>
    </html>
  );
}
