"use client";

import { useSignup } from "@/contexts/CreatorSignupContext";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const usePrivyDatabaseSync = () => {
  const { ready, authenticated, user: privyUser, login, logout } = usePrivy();
  const { user, fetchUserData } = useUser();
  const { fastSignup } = useSignup();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle database sync when Privy user is authenticated
  useEffect(() => {
    const syncWithDatabase = async () => {
      if (
        !ready ||
        !authenticated ||
        !privyUser?.twitter?.username ||
        isProcessing
      ) {
        return;
      }

      setIsProcessing(true);
      const twitterUsername = privyUser.twitter.username;

      try {
        // Check if user exists in database
        const response = await apiClient.get(
          `/auth/check-twitter-handle?account_handle=${twitterUsername}&user_type=brand`
        );

        if (response.status === 200) {
          // User exists - get token and set user
          if (response.data.result?.token) {
            if (typeof window !== "undefined") {
              localStorage.setItem("token", response.data.result.token);
            }
            await fetchUserData();
            toast({
              title: "Welcome back!",
              description: "Successfully connected to your account",
            });
            return;
          }

          // New user - handle signup
          const user_id = await fastSignup(twitterUsername, "brand");
          if (user_id) {
            await fetchUserData();
            toast({
              title: "Account created!",
              description: "Your brand account has been set up successfully",
            });
            return;
          }
        }
      } catch (error) {
        console.error("Error syncing with database:", error);
        toast({
          title: "Failed to sync account",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    syncWithDatabase();
  }, [ready, authenticated, privyUser?.twitter?.username]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Get profile image from either database user or Privy user
  const getProfileImage = () => {
    if (user?.profile_image_url && typeof user.profile_image_url === "string") {
      return user.profile_image_url.replace("_normal", "_400x400");
    }
    if (
      privyUser?.twitter?.profilePictureUrl &&
      typeof privyUser.twitter.profilePictureUrl === "string"
    ) {
      return privyUser.twitter.profilePictureUrl.replace("_normal", "_400x400");
    }
    return "/placeholder.svg?height=32&width=32";
  };

  // Get display name
  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (privyUser?.twitter?.name) return privyUser.twitter.name;
    if (privyUser?.twitter?.username) return `@${privyUser.twitter.username}`;
    return "User";
  };

  // Get twitter handle
  const getTwitterHandle = () => {
    if (user?.twitter_handle) return user.twitter_handle;
    if (privyUser?.twitter?.username) return privyUser.twitter.username;
    return null;
  };

  return {
    // Privy states
    ready,
    authenticated,
    privyUser,

    // Database user
    user,

    // Actions
    login,
    logout: handleLogout,

    // Processing state
    isProcessing,

    // Helper functions
    getProfileImage,
    getDisplayName,
    getTwitterHandle,
  };
};
