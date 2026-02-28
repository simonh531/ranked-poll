import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Righteous } from "next/font/google";
import "./globals.css";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import Logo from "@/components/Logo";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const righteous = Righteous({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-righteous",
});

const description =
  "Instantly create and share ranked vote polls! Learn about ranked voting and its uses. Free and no sign up needed! Open Source!";

export const metadata: Metadata = {
  title: "Ranked Poll",
  description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <nav className="h-10 flex justify-center items-center">
          <div className="max-w-250 w-full flex items-center">
            <Logo className="text-2xl mr-4" />
            <div className="grow">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      render={
                        <Link href="/about" className="text-lg">
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
                  <User />
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
