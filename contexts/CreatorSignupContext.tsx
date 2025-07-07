"use client";
import apiClient from "@/lib/api";

import { UserType } from "@/lib/types";
import axios from "axios";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { useToast } from "../hooks/use-toast";

interface SignupContextType {
  signupData: UserType;
  updateSignupData: (data: Partial<UserType>) => void;
  fastSignup: (twitterHandle: string) => Promise<string | false>;
}

const initialSignupData: UserType = {
  x_handle: "",
  evm_wallet: "",
  solana_wallet: "",
  referral_code_used: "",
  referral_code: "",
  celo_wallet: "",
  referrals: [],
  partial_referrals: [],
};

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export const SignupProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { toast } = useToast();
  const [signupData, setSignupData] = useState<UserType>(initialSignupData);

  const updateSignupData = (data: Partial<UserType>) => {
    setSignupData((prev) => ({ ...prev, ...data }));
  };

  const fastSignup = async (x_handle: string) => {
    try {
      const referralCode =
        typeof window !== "undefined"
          ? localStorage.getItem("referral_code")
          : null;

      // Map to create-user endpoint format
      const userData = {
        x_handle: x_handle,
        evm_wallet: "", // Empty wallet address
        solana_wallet: "", // Empty wallet address
        referral_code_used: referralCode ? referralCode : "",
      };

      const response = await apiClient.post("/user/create-user", userData);

      if (response.status === 201) {
        // Generate JWT token for the created user (similar to check-twitter-handle)
        const tokenResponse = await apiClient.get(
          `/auth/check-twitter-handle?account_handle=${x_handle}`
        );

        if (tokenResponse.status === 200 && tokenResponse.data.result?.token) {
          if (typeof window !== "undefined") {
            localStorage.setItem("token", tokenResponse.data.result.token);
          }

          // Return the x_handle as the user identifier
          return x_handle;
        }
      }
      return false;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        localStorage.removeItem("referral_code");
        toast({
          title: "Please try again.",
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
