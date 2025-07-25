"use client";

import { PrivyProvider as PrivyProviderBase } from "@privy-io/react-auth";
import { useEffect } from "react";

interface PrivyProviderProps {
  children: React.ReactNode;
}

export default function PrivyProvider({ children }: PrivyProviderProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  
  // Debug logging for both development and production
  useEffect(() => {
    console.log('Runtime Privy App ID check:', {
      appId: appId ? 'Set' : 'Not set',
      appIdLength: appId?.length || 0,
      appIdValue: appId?.substring(0, 10) + '...' || 'undefined',
      nodeEnv: process.env.NODE_ENV
    });
  }, [appId]);
  
  // During static generation or if app ID is missing/invalid, render children without Privy
  if (!appId || appId.trim() === '' || typeof window === 'undefined') {
    console.warn('NEXT_PUBLIC_PRIVY_APP_ID is not set or invalid, skipping Privy initialization');
    return <>{children}</>;
  }

  return (
    <PrivyProviderBase
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#00D992",
          logo: "/logo-green.svg",
          loginMessage: "Login to TrendSage",
          // walletList: ["metamask"],
        },
        loginMethods: ["twitter"],
      }}
    >
      {children}
    </PrivyProviderBase>
  );
}
