import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import ConditionalLayout from "@/components/ConditionalLayout";
import AvatarFallbackIcon from "@/app/AvatarFallbackIcon";
import AdSense from "@/components/AdSense";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["900"],
  variable: "--font-merriweather",
  display: "swap",
});

const description =
  "Instantly create and share ranked choice polls! Learn about Condorcet voting and the Ranked Pairs method. Free, open source, and no sign-up required.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://rankedpoll.com"),
  title: {
    default: "Ranked Poll - Create and Share Ranked Choice Polls",
    template: "%s | Ranked Poll",
  },
  description,
  keywords: [
    "ranked choice voting",
    "ranked poll",
    "condorcet voting",
    "ranked pairs",
    "tideman method",
    "voting system",
    "online poll maker",
    "free online polls",
    "instant run-off voting",
    "ballot creator",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rankedpoll.com",
    siteName: "Ranked Poll",
    title: "Ranked Poll - Create and Share Ranked Choice Polls",
    description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ranked Poll - Create and Share Ranked Choice Polls",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ranked Poll - Create and Share Ranked Choice Polls",
    description,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html className={cn("font-sans", inter.variable)} lang="en">
      <body
        className={`${merriweather.variable} antialiased min-h-screen flex flex-col relative bg-background bg-gradient-to-tr from-primary/10 via-background to-secondary/10 dark:from-slate-950 dark:via-background dark:to-secondary/5 text-foreground overflow-x-hidden`}
      >
        <ThemeProvider>
          <AdSense />
          {/* Ambient background decoration */}
          <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#c7d2fe_1px,transparent_1px)] dark:bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-50" />
          <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-secondary/15 dark:bg-secondary/20 blur-[130px] pointer-events-none" />
          <div className="absolute top-[200px] left-0 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 dark:bg-primary/15 blur-[130px] pointer-events-none" />



          <ConditionalLayout avatarFallbackIcon={<AvatarFallbackIcon />}>
            {children}
          </ConditionalLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
