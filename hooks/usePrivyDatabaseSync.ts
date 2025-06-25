"use client";

import { useSignup } from "@/contexts/CreatorSignupContext";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export const usePrivyDatabaseSync = () => {
  const { ready, authenticated, user: privyUser, login, logout } = usePrivy();
  const { user, refreshUser } = useUser();
  const { fastSignup } = useSignup();
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Add a ref to prevent infinite loops
  const syncAttemptedRef = useRef(false);
  const syncSuccessRef = useRef(false);
  const lastUsernameRef = useRef<string | null>(null);

  // Handle database sync when Privy user is authenticated
  const syncWithDatabase = useCallback(async () => {
    if (
      !ready ||
      !authenticated ||
      !privyUser?.twitter?.username ||
      isProcessing ||
      syncSuccessRef.current
    ) {
      return;
    }

    const twitterUsername = privyUser.twitter.username.toLowerCase(); // Make lowercase for consistency

    // Check if we've already attempted sync for this username
    if (
      syncAttemptedRef.current &&
      lastUsernameRef.current === twitterUsername
    ) {
      return;
    }

    syncAttemptedRef.current = true;
    lastUsernameRef.current = twitterUsername;
    setIsProcessing(true);

    try {
      // Check if user exists in database - use lowercase handle
      const response = await apiClient.get(
        `/auth/check-twitter-handle?account_handle=${twitterUsername}`
      );

      if (response.status === 200) {
        // User exists - get token and set user
        if (response.data.result?.token) {
          if (typeof window !== "undefined") {
            localStorage.setItem("token", response.data.result.token);
          }
          await refreshUser();
          syncSuccessRef.current = true; // Mark as successful
          return;
        }

        // New user - handle signup with lowercase handle
        const user_id = await fastSignup(twitterUsername);
        if (user_id) {
          await refreshUser();
          syncSuccessRef.current = true; // Mark as successful
          return;
        }
      }
    } catch (error) {
      console.error("Error syncing with database:", error);
      // Reset the attempt flag on error so it can be retried
      syncAttemptedRef.current = false;
      lastUsernameRef.current = null;
      toast({
        title: "Failed to sync account",
        description: "Please try again later",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [
    ready,
    authenticated,
    privyUser?.twitter?.username,
    isProcessing,
    refreshUser,
    fastSignup,
    toast,
  ]);

  // Effect with minimal dependencies
  useEffect(() => {
    syncWithDatabase();
  }, [ready, authenticated, privyUser?.twitter?.username]);

  // Reset refs when user logs out or changes
  useEffect(() => {
    if (!authenticated || !privyUser?.twitter?.username) {
      syncAttemptedRef.current = false;
      syncSuccessRef.current = false;
      lastUsernameRef.current = null;
    }
  }, [authenticated, privyUser?.twitter?.username]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      // Reset sync refs on logout
      syncAttemptedRef.current = false;
      syncSuccessRef.current = false;
      lastUsernameRef.current = null;
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
    if (user?.x_handle) return user.x_handle;
    if (privyUser?.twitter?.name) return privyUser.twitter.name;
    if (privyUser?.twitter?.username) return `@${privyUser.twitter.username}`;
    return "User";
  };

  // Get twitter handle - return lowercase for consistency
  const getTwitterHandle = () => {
    if (user?.x_handle) return user.x_handle.toLowerCase();
    if (privyUser?.twitter?.username)
      return privyUser.twitter.username.toLowerCase();
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
