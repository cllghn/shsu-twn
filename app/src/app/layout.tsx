"use client";

import type { Metadata } from "next";
import { useState } from "react";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/react"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer/Footer";
import FadeMenu from "@/components/Menu/Menu";
import BackToTop from "@/components/Buttons/BackToTop";
import Feedback from "@/components/Buttons/FeedbackButton";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

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

  const [open, setOpen] = useState(true);

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
      <>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>TWNet Data Disclaimer</DialogTitle>
          <DialogContent>
            The TWNet makes use of data provided by the TWDB Water Use Survey on Public Water System (PWS) intakes, sales, and retail water information. The tool leverages relational data to depict interdependencies and flows, while pairing this with contextual data. The Water Use Survey relies on self-reported data, which may be subject to biases such as estimation errors, underreporting, or inconsistencies in reporting methodologies.
            <br /><br />
            <b>Users should interpret the data with caution and consider supplementing it with additional sources or validation methods where precision is critical.</b> TWNet will be systematically revised and updated as data becomes available from the TWDB Water Use Survey. Therefore, the information presented is “as is” and “as available”. The TWDB, TWF, and SHSU IHS do not assume any legal liability or responsibility or makes any guarantees or warranties as to the accuracy, completeness of the information. 
          </DialogContent>
          <div className="flex justify-center mr-4 mb-4">
            <DialogActions>
              <Button  
                onClick={() => setOpen(false)}
                variant="contained"
                sx={{
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  backgroundColor: '#124559',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: '#0a0a0a',
                    border: '1px solid #0a0a0a',
                  },
                }}>
                    Got it
                </Button>
            </DialogActions>
          </div>
        </Dialog>
      </>
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
