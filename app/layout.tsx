import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const LOGO = "/future%20focus.jpeg";

export const metadata: Metadata = {
  title: "Future Focus Academy — Discover Your Future",
  description:
    "Future Focus Academy empowers youth with the skills, knowledge, and confidence to build a brighter future through education, technology, and innovation.",
  keywords: ["education", "youth", "technology", "skills", "innovation", "Future Focus Academy"],
  icons: {
    icon: LOGO,
    apple: LOGO,
  },
  openGraph: {
    title: "Future Focus Academy",
    description: "Empowering youth through education, technology, and innovation.",
    type: "website",
    siteName: "Future Focus Academy",
    images: [
      {
        url: LOGO,
        width: 510,
        height: 510,
        alt: "Future Focus Academy logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Future Focus Academy",
    description: "Empowering youth through education, technology, and innovation.",
    images: [LOGO],
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
      className={`${plusJakartaSans.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
