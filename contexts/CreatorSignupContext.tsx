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
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
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
  // steps
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  setCurrentStep: (step: number) => void;
  setTotalSteps: (steps: number) => void;
  skipCurrentStep: () => void;
  markStepComplete: (step: number) => void;
  skipToCompletion: () => void;
  isStepComplete: (step: number) => boolean;

  // data
  signupData: SignupData;
  updateSignupData: (data: Partial<SignupData>) => void;
  resetSignup: () => void;
  fastSignup: (
    twitterHandle: string,
    userType: "creator" | "brand"
  ) => Promise<boolean>;
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

// Helper function to safely access localStorage
const safeLocalStorageGet = (key: string, defaultValue: any) => {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const safeLocalStorageGetString = (key: string, defaultValue: string) => {
  if (typeof window === "undefined") {
    return defaultValue;
  }
  try {
    const saved = localStorage.getItem(key);
    return saved ? saved : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const SignupProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { toast } = useToast();
  const [totalSteps, setTotalSteps] = useState(9);
  const [currentStep, setCurrentStep] = useState(0);
  const [signupData, setSignupData] = useState<SignupData>(initialSignupData);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Initialize state from localStorage after component mounts (client-side only)
  useEffect(() => {
    setCurrentStep(parseInt(safeLocalStorageGetString("signupStep", "0")));
    setSignupData(safeLocalStorageGet("signupData", initialSignupData));
    setCompletedSteps(safeLocalStorageGet("completedSteps", []));
  }, []);

  // // Save to localStorage whenever state changes
  // useEffect(() => {
  //   localStorage.setItem("signupStep", currentStep.toString());
  //   localStorage.setItem("signupData", JSON.stringify(signupData));
  //   localStorage.setItem("completedSteps", JSON.stringify(completedSteps));
  // }, [currentStep, signupData, completedSteps]);

  const updateSignupData = (data: Partial<SignupData>) => {
    setSignupData((prev) => ({ ...prev, ...data }));
  };

  const resetSignup = () => {
    setCurrentStep(0);
    setSignupData(initialSignupData);
    setCompletedSteps([]);
    // Clear localStorage (only on client side)
    if (typeof window !== "undefined") {
      localStorage.removeItem("signupStep");
      localStorage.removeItem("signupData");
      localStorage.removeItem("completedSteps");
    }
  };

  const skipCurrentStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const markStepComplete = (step: number) => {
    setCompletedSteps((prev) => {
      if (!prev.includes(step)) {
        return [...prev, step].sort((a, b) => a - b);
      }
      return prev;
    });
  };

  const isStepComplete = (step: number) => {
    return completedSteps.includes(step);
  };

  const skipToCompletion = () => {
    const allSteps = Array.from({ length: totalSteps }, (_, i) => i);
    setCompletedSteps(allSteps);
    setCurrentStep(totalSteps - 1);
  };

  const fastSignup = async (
    twitterHandle: string,
    userType: "creator" | "brand" = "creator"
  ) => {
    try {
      const profileDataResponse = await apiClient.get(
        `/tweet/generate-profile-data?author_handle=${twitterHandle}`
      );
      if (profileDataResponse.status !== 200) {
        throw new Error("Failed to fetch profile data");
      }

      const referralCode =
        typeof window !== "undefined"
          ? localStorage.getItem("referral_code")
          : null;

      const requestData = {
        username: "",
        wallet_addr: "",
        name: "",
        email: "",
        password: "",
        specialities: ["tweets", "threads", "spaces", "polls"],
        content_categories: ["tech", "crypto", "finance"],
        youtube_channel: "",
        twitter_handle: twitterHandle,
        title: profileDataResponse.data.result.generated_title,
        about: profileDataResponse.data.result.generated_about,
        bio: profileDataResponse.data.result.generated_bio,
        social_signup: true,
        has_password: false,
        referral_code_used: referralCode ? referralCode : "",
        packages: [],
        user_type: userType,
      };

      let userData;
      if (userType === "brand") {
        userData = {
          ...requestData,
          industry: "",
          budget: "",
          content_volume: "",
          brand_categories: [],
          brand_platforms: [],
        };
      } else {
        userData = requestData;
      }
      const response = await apiClient.post("/auth/register", userData);
      const token = response.data.result.token;

      let return_user_id;
      if (response.status === 201 && token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
        }
        if (userType === "creator") {
          return_user_id = response.data.result.user_id;
        } else {
          return_user_id = response.data.result.brand_id;
        }

        return return_user_id;
      }
      return false;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Error Calculating Cred Score",
          description: error.response?.data.message,
        });
      }
    }
  };

  return (
    <SignupContext.Provider
      value={{
        currentStep,
        totalSteps,
        setTotalSteps,
        signupData,
        completedSteps,
        setCurrentStep,
        updateSignupData,
        resetSignup,
        skipCurrentStep,
        markStepComplete,
        skipToCompletion,
        isStepComplete,
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
