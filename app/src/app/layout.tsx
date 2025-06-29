"use client";

import type { Metadata } from "next";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/react"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer/Footer";
import FadeMenu from "@/components/Menu/Menu";
import BackToTop from "@/components/Buttons/BackToTop";
import Feedback from "@/components/Buttons/FeedbackButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <title>Texas Water Network Visualizer</title>
        <meta 
          name="description" 
          content="The Texas Water Network Explorer (TWNet) is a publicly accessible tool designed to enhance how policymakers, decision-makers, and the public analyze water data. It maps the interactions among water entities across Texas, illustrating how water is acquired, sold, and redistributed. Using data from the Texas Water Development Board's (TWDB) Water Use Survey, TWNet leverages network analysis methods and visualization techniques to transform a complex web of thousands of water users into clear, intuitive graphs and insights. These insights help policymakers quickly understand water distribution patterns, identify key stakeholders, and make informed decisions to improve water management." 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <FadeMenu />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen mt-10`}
      >
        {/* {children} */}
        <main className="flex-grow">{children}</main>
        <Footer />
        <BackToTop />
        <Feedback />
        <Analytics />
      </body>


    </html>
  );
}
