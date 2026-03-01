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

import AvatarFallbackIcon from "./AvatarFallbackIcon";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
    <html className={inter.variable} lang="en">
      <body
        className={`${merriweather.variable} ${openSans.variable} antialiased min-h-screen flex flex-col bg-blue-400`}
      >
        <nav className="h-10 flex justify-center items-center bg-white">
          <div className="max-w-250 w-full flex items-center">
            <Link href="/">
              <Logo className="text-2xl mr-4" />
            </Link>
            <div className="grow">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      render={
                        <Link className="text-xl" href="/about">
                          About
                        </Link>
                      }
                    />
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            <Link href="/login">
              <Avatar className="hover:bg-muted">
                <AvatarFallback className="bg-transparent">
                  <AvatarFallbackIcon />
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
