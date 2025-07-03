"use client";

import CollaborateDialog from "@/components/CollaborateDialog";
import { Button } from "@/components/ui/button";
import { usePrivyDatabaseSync } from "@/hooks/usePrivyDatabaseSync";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Card } from "./ui/card";

interface ProfileData {
  name: string;
  author_handle: string;
  bio: string;
  profile_image_url: string;
  followers_count: number;
  smart_followers_count: number;
  mindshare: number;
  account_created_at?: string;
}

interface KOLProfileHeaderProps {
  profile: ProfileData;
  accountCreatedText: string;
}

export default function KOLProfileHeader({
  profile,
  accountCreatedText,
}: KOLProfileHeaderProps) {
  // Use the enhanced Privy database sync hook instead of basic usePrivy
  const { ready, authenticated, user, isProcessing, login } =
    usePrivyDatabaseSync();

  // Render collaborate button based on authentication and user state
  const renderCollaborateButton = () => {
    if (!ready) {
      return (
        <Button
          disabled
          className="bg-gray-600 text-gray-300 cursor-not-allowed"
        >
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading...
        </Button>
      );
    }

    if (!authenticated) {
      return (
        <Button
          onClick={login}
          disabled={isProcessing}
          className="bg-[#00D992] hover:bg-[#00C080] text-gray-900 font-medium max-w-48"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            "Connect X to Collaborate"
          )}
        </Button>
      );
    }

    if (isProcessing) {
      return (
        <Button
          disabled
          className="bg-gray-600 text-gray-300 cursor-not-allowed"
        >
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Loading...
        </Button>
      );
    }

    // User is authenticated and account is set up
    return (
      <CollaborateDialog influencerHandle={profile.author_handle}>
        <Button className="bg-[#00D992] hover:bg-[#00C080] text-gray-900 font-medium w-48">
          Collaborate with KOL
        </Button>
      </CollaborateDialog>
    );
  };

  return (
    <Card className="bg-neutral-900 border-none mb-2">
      <div className="p-6">
        <div className="flex flex-col gap-6">
          {/* Top section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left – logo & basic info */}
            <div className="flex items-start gap-4 flex-1">
              <div className="relative shrink-0">
                <Image
                  src={profile?.profile_image_url || "/placeholder-logo.png"}
                  alt={profile?.name}
                  width={56}
                  height={56}
                  className="rounded-lg object-cover"
                />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full ring-2 ring-neutral-900" />
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-2xl font-bold text-gray-100">
                    {profile?.name}
                  </h1>
                  {profile?.name && (
                    <span className="text-sm font-medium text-gray-400">
                      @{profile?.author_handle}
                    </span>
                  )}
                </div>
                {accountCreatedText && (
                  <p className="text-xs text-gray-500 mb-3">
                    {accountCreatedText}
                  </p>
                )}
                {/* Categories */}
                {/* <div className="flex flex-wrap items-center gap-2">
                          <span className="text-support-sand text-xs font-semibold">
                            {campaign?.campaign_type}
                          </span>
                          {campaign?.project_categories
                            ?.split(",")
                            .map((category) => (
                              <CategoryTag key={category} label={category} />
                            ))}
                        </div> */}
              </div>
            </div>

            {/* Metrics */}
            <div className="flex flex-col sm:flex-row gap-12">
              <div className="flex flex-col gap-2">
                <span className="text-sm text-neutral-200">
                  Smart Followers
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-[20px] font-semibold text-neutral-100">
                    {profile.smart_followers_count}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-neutral-200">Mindshare</span>
                <span className="text-[20px]">{profile.mindshare}%</span>
              </div>
            </div>
          </div>
          {renderCollaborateButton()}
        </div>
      </div>
    </Card>
  );
}
