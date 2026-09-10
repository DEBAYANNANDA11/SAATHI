import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InteractiveHoverFX from "@/components/InteractiveHoverFX";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SAATHI — Mental Health Check-In & Distress Detection",
  description: "An AI-powered distress detection and mental health platform built for Smart India Hackathon 2026.",
  other: {
    "color-scheme": "light",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full bg-[#8FCBB0] light`}
      style={{ colorScheme: "light" }}
    >
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body 
        className="min-h-full flex flex-col font-sans text-[#142E27] bg-[#8FCBB0]"
        style={{ backgroundColor: "#8FCBB0", colorScheme: "light" }}
      >
        <AuthProvider>
          <InteractiveHoverFX />
          <Navbar />
          <main className="flex-1 flex flex-col w-full relative bg-[#8FCBB0]">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
