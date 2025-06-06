import Header from "@/components/Header";
import PrivyProvider from "@/components/PrivyProvider";
import { Toaster } from "@/components/ui/toaster";
import { SignupProvider } from "@/contexts/CreatorSignupContext";
import { UserProvider } from "@/contexts/UserContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TrendSage - Web3 KOL Marketplace",
  description: "Connecting brands with influential crypto voices",
  generator: "v0.dev",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo-green.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo-green.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo-green.svg" />
      </head>
      <body className={`${inter.className} bg-gray-900 min-h-screen`}>
        <PrivyProvider>
          <UserProvider>
            <SignupProvider>
              <Header />
              <main>{children}</main>
              <Toaster />
            </SignupProvider>
          </UserProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
