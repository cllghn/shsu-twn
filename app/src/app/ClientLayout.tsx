"use client";
import { Analytics } from "@vercel/analytics/react";
import Footer from "@/components/Footer/Footer";
import FadeMenu from "@/components/Menu/Menu";
import BackToTop from "@/components/Buttons/BackToTop";
import Feedback from "@/components/Buttons/FeedbackButton";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FadeMenu />
      <div className="flex flex-col min-h-screen mt-10">
        <main className="flex-grow">{children}</main>
        <Footer />
        <BackToTop />
        <Feedback />
        <Analytics />
      </div>
    </>
  );
}