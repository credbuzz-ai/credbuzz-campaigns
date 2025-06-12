"use client";

import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api";
import { UserType } from "@/lib/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useState } from "react";

interface UserContextType {
  user: UserType | null;
  loading: boolean;
  fetchUserData: () => Promise<UserType | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const router = useRouter();

  const fetchUserData = async (): Promise<UserType | null> => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/user/get-user`);

      if (response.status === 200) {
        const userData = response.data.result;
        setUser(userData);
        if (typeof window !== "undefined") {
          localStorage.setItem("referral_code", userData.referral_code_used);
        }
        setLoading(false);
        return userData;
      }
      return null;
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
        return null;
      } else {
        return null;
      }
    }
  };

  const value: UserContextType = {
    user,
    loading,
    fetchUserData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
