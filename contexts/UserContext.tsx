"use client";

import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api";
import { MockCampaign, UserType } from "@/lib/types";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  user: UserType | null;
  campaigns: MockCampaign[];
  loading: boolean;
  fetchUserData: () => Promise<UserType | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const mockCampaigns: MockCampaign[] = [
  {
    id: "1",
    name: "Summer Collection",
    status: "active",
    budget: 5000,
    spent: 2340,
    startDate: "2023-06-01",
    endDate: "2023-08-31",
    engagement: 78,
    reach: 24500,
  },
  {
    id: "2",
    name: "Holiday Special",
    status: "paused",
    budget: 3500,
    spent: 1200,
    startDate: "2023-11-15",
    endDate: "2023-12-25",
    engagement: 65,
    reach: 18200,
  },
  {
    id: "3",
    name: "Product Launch",
    status: "completed",
    budget: 7500,
    spent: 7500,
    startDate: "2023-03-01",
    endDate: "2023-04-15",
    engagement: 92,
    reach: 45600,
  },
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [campaigns, setCampaigns] = useState<MockCampaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const router = useRouter();

  // Simulate fetching user data on mount
  useEffect(() => {
    // Simulate API call delay
    setTimeout(() => {
      if (user) {
        setCampaigns(mockCampaigns);
      }
      setLoading(false);
    }, 1000);
  }, [user]);

  const fetchUserData = async (): Promise<UserType | null> => {
    try {
      const response = await apiClient.get(`/user/get-user`);

      if (response.status === 200) {
        const userData = response.data.result;
        setUser(userData);
        if (typeof window !== "undefined") {
          localStorage.setItem("referral_code", userData.referral_code_used);
        }
        return userData;
      }
      return null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        router.push("/creator");
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
    campaigns,
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
