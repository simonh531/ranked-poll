import type { Metadata } from "next";

import { Inter, Merriweather, Open_Sans } from "next/font/google";
import Link from "next/link";

import "./globals.css";
import { ReactNode } from "react";

import Logo from "@/components/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

import RecentPollsNavbar from "@/components/RecentPollsNavbar";

import AvatarFallbackIcon from "./AvatarFallbackIcon";
import { cn } from "@/lib/utils";
import GuestAccountBanner from "@/components/GuestAccountBanner";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});


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



          <nav className="sticky top-0 z-50 w-full border-b border-indigo-200/80 dark:border-indigo-900/50 bg-background/80 backdrop-blur-md shadow-sm">
            <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-6">
              <Link href="/" className="hover:opacity-90 transition-opacity">
                <Logo className="text-2xl mr-4" />
              </Link>
              <div className="grow flex justify-start items-center">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuLink
                        render={
                          <Link className="text-sm font-semibold hover:text-primary transition-colors px-3 py-2 rounded-md" href="/about">
                            About
                          </Link>
                        }
                      />
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
              <div className="flex items-center gap-3">
                <RecentPollsNavbar />
                <Link href="/login">
                  <Avatar className="hover:bg-muted border shadow-sm">
                    <AvatarFallback className="bg-transparent">
                      <AvatarFallbackIcon />
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
            </div>
          </nav>
          <GuestAccountBanner />
          <main className="flex-1 flex flex-col w-full items-center py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>

    </html>
  );
}
