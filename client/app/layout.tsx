import React from "react";
import type { Metadata } from "next";
import { Inter, Hahmlet, Space_Grotesk, Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import DraggableAIChat from "@/components/DraggableAIChat";

const InterSans = Inter({
  variable:"--font-inter",
  subsets:["latin"],
})

const hahmlet = Hahmlet({
  variable:"--font-hahmlet",
  weight:["400","700"],
  subsets:["latin"]
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Choose weights as needed
  variable: '--font-space-grotesk',
})

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-roboto',
})

export const metadata: Metadata = {
  title: "Bima",
  description: "Water Monitoring Dashboard - Visualize anomalous water flow, sensor locations, and consumption data in real-time",
  icons: {
    icon: '/icon.ico',
    shortcut: '/icon.ico',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${InterSans.variable} ${hahmlet.variable} ${spaceGrotesk.variable} ${roboto.variable} antialiased`}
      >
        <main className="min-h-screen">
          {children}
        </main>
        <DraggableAIChat />
        <Toaster />
      </body>
    </html>
  );
}
