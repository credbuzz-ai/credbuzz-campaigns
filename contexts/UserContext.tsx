"use client";

import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api";
import { usePrivy } from "@privy-io/react-auth";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  x_handle: string;
  evm_wallet: string;
  solana_wallet: string;
  referral_code: string;
  referral_code_used: string;
  x_follow_claimed: boolean;
  total_points?: number;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { ready, authenticated } = usePrivy();
  const { toast } = useToast();
  const router = useRouter();

  const fetchUser = async () => {
    try {
      const response = await apiClient.get("/user/get-user");
      if (response.status === 200 && response.data.result) {
        setUser(response.data.result);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "referral_code",
            response.data.result.referral_code_used
          );
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        router.push("/");
        toast({
          title: "User not registered!",
          description: "Please sign up to access your account.",
          duration: 1000,
        });
      }
    }
  };

  const refreshUser = async () => {
    if (ready && authenticated) {
      await fetchUser();
    }
  };

  useEffect(() => {
    if (ready && authenticated) {
      fetchUser();
    }
  }, [ready, authenticated]);

  const value: UserContextType = {
    user,
    setUser,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
