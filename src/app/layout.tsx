import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
      className={`${inter.variable} ${poppins.variable} h-full bg-white light`}
      style={{ colorScheme: "light" }}
    >
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body 
        className="min-h-full flex flex-col font-sans text-gray-800 bg-white"
        style={{ backgroundColor: "#ffffff", colorScheme: "light" }}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col w-full relative bg-white">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
