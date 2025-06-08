"use client";
import apiClient from "@/lib/api";
import {
  BrandCategory,
  BrandPlatform,
  Budget,
  Category,
  ContentVolume,
  Industry,
  PackageData,
  Platform,
  Specialities,
} from "@/lib/types";
import axios from "axios";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { useToast } from "../hooks/use-toast";

export interface SignupData {
  // user type
  userType: "creator" | "brand";

  // Step 0: Username
  username: string;
  walletAddress: string;

  // Step 1: Basic Info
  name: string;
  email: string;
  password: string;

  // Step 2: Verify OTP
  isVerified: boolean;

  // Step 3: Content Categories
  contentCategories?: Category[];

  // Step 4: Specialities
  specialities?: Specialities[];

  // Step 5: Platforms
  platforms?: Platform[];

  // Step 6: Personalized Profile
  title: string;
  bio: string;
  about: string;
  socialSignup: boolean;
  hasPassword: boolean;
  twitter_handle?: string;
  youtube_channel?: string;

  // Step 7: Packages
  packages?: PackageData[];

  // for brand signup
  industry?: Industry;
  brandCategories?: BrandCategory[];
  budget?: Budget;
  contentVolume?: ContentVolume;
  brandPlatforms?: BrandPlatform[];
}

interface SignupContextType {
  // data
  signupData: SignupData;
  updateSignupData: (data: Partial<SignupData>) => void;
  fastSignup: (twitterHandle: string) => Promise<string | false>;
}

const initialSignupData: SignupData = {
  userType: "creator",
  // Step 0
  username: "",
  walletAddress: "",
  // Step 1
  name: "",
  email: "",
  password: "",

  // Step 2
  isVerified: false,

  // Step 3
  contentCategories: [],

  // Step 4
  specialities: [],

  // Step 5
  platforms: [],

  // Step 6
  title: "",
  bio: "",
  about: "",
  socialSignup: false,
  hasPassword: false,
  twitter_handle: "",
  youtube_channel: "",

  // Step 7
  packages: [],
};

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export const SignupProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { toast } = useToast();
  const [signupData, setSignupData] = useState<SignupData>(initialSignupData);

  const updateSignupData = (data: Partial<SignupData>) => {
    setSignupData((prev) => ({ ...prev, ...data }));
  };

  const fastSignup = async (twitterHandle: string) => {
    try {
      const referralCode =
        typeof window !== "undefined"
          ? localStorage.getItem("referral_code")
          : null;

      // Map to create-user endpoint format
      const userData = {
        x_handle: twitterHandle,
        evm_wallet: "", // Empty wallet address
        solana_wallet: "", // Empty wallet address
        referral_code_used: referralCode ? referralCode : "",
      };

      const response = await apiClient.post("/user/create-user", userData);

      if (response.status === 201) {
        // Generate JWT token for the created user (similar to check-twitter-handle)
        const tokenResponse = await apiClient.get(
          `/auth/check-twitter-handle?account_handle=${twitterHandle}`
        );

        if (tokenResponse.status === 200 && tokenResponse.data.result?.token) {
          if (typeof window !== "undefined") {
            localStorage.setItem("token", tokenResponse.data.result.token);
          }

          // Return the x_handle as the user identifier
          return twitterHandle;
        }
      }
      return false;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error Creating Account",
          description:
            error.response?.data.message || "Failed to create account",
        });
      }
      return false;
    }
  };

  return (
    <SignupContext.Provider
      value={{
        signupData,
        updateSignupData,
        fastSignup,
      }}
    >
      {children}
    </SignupContext.Provider>
  );
};

export const useSignup = () => {
  const context = useContext(SignupContext);
  if (context === undefined) {
    throw new Error("useSignup must be used within a SignupProvider");
  }
  return context;
};
