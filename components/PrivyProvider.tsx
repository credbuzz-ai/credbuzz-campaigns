"use client";

import { PrivyProvider as PrivyProviderBase } from "@privy-io/react-auth";

interface PrivyProviderProps {
  children: React.ReactNode;
}

export default function PrivyProvider({ children }: PrivyProviderProps) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  
  // During static generation, render children without Privy
  if (!appId || typeof window === 'undefined') {
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
