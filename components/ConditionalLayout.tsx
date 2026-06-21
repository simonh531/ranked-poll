"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import RecentPollsNavbar from "@/components/RecentPollsNavbar";
import GuestAccountBanner from "@/components/GuestAccountBanner";
import CookieConsent from "@/components/CookieConsent";

interface ConditionalLayoutProps {
  children: React.ReactNode;
  avatarFallbackIcon: React.ReactNode;
}

export default function ConditionalLayout({ children, avatarFallbackIcon }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isEmbed = pathname?.endsWith("/embed");

  if (isEmbed) {
    return (
      <main className="flex-1 flex flex-col w-full items-center justify-center p-2 sm:p-4 min-h-screen">
        {children}
        
        {/* Dynamic viral watermark pointing back to main poll page */}
        <div className="mt-4 text-center">
          <Link
            href={pathname.replace("/embed", "")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold text-muted-foreground/60 hover:text-primary transition-colors tracking-wide uppercase"
          >
            Powered by Ranked Poll 📊
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
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
                  {avatarFallbackIcon}
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
      <footer className="w-full border-t border-indigo-100/50 dark:border-indigo-950/40 py-6 mt-auto bg-background/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground/80">
          <div>
            &copy; {new Date().getFullYear()} Ranked Poll. All rights reserved.
          </div>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/about/calculation" className="hover:text-foreground transition-colors">Calculation</Link>
            <Link href="/about/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
      <CookieConsent />
    </>
  );
}
