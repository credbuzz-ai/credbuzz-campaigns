"use client";

import { PrivyProvider as PrivyProviderBase } from "@privy-io/react-auth";

interface PrivyProviderProps {
  children: React.ReactNode;
}

export default function PrivyProvider({ children }: PrivyProviderProps) {
  return (
    <PrivyProviderBase
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        // Customize Privy's appearance
        appearance: {
          theme: "dark",
          accentColor: "#00D992",
          logo: "/logo-green.svg",
          walletList: ["metamask"],
        },
        // Configure login methods
        loginMethods: ["twitter"],
        // Configure embedded wallets
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        // Configure external wallets
        externalWallets: {
          coinbaseWallet: {
            // By default, the Coinbase Wallet SDK will use your app's domain as the app name
            connectionOptions: "eoaOnly",
          },
          metamask: {
            connectionOptions: "eoaOnly",
          },
          walletConnect: {
            // Replace with your project's ID
            walletConnectProjectId:
              process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
          },
        },
      }}
    >
      {children}
    </PrivyProviderBase>
  );
}
