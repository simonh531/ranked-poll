import type { Metadata } from "next";
import { Inter, Merriweather, Open_Sans } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import ConditionalLayout from "@/components/ConditionalLayout";
import AvatarFallbackIcon from "@/app/AvatarFallbackIcon";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });


const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-merriweather",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

const description =
  "Instantly create and share ranked vote polls! Learn about ranked voting and its uses. Free and no sign up needed! Open Source!";

export const metadata: Metadata = {
  description,
  title: "Ranked Poll",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html className={cn("font-sans", inter.variable)} lang="en">
      <body
        className={`${merriweather.variable} ${openSans.variable} antialiased min-h-screen flex flex-col relative bg-background bg-gradient-to-tr from-primary/10 via-background to-secondary/10 dark:from-slate-950 dark:via-background dark:to-secondary/5 text-foreground overflow-x-hidden`}
      >
        <ThemeProvider>
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
