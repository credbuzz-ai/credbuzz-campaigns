"use client";

import CollaborateDialog from "@/components/CollaborateDialog";
import { Button } from "@/components/ui/button";
import { usePrivyDatabaseSync } from "@/hooks/usePrivyDatabaseSync";
import { Loader2 } from "lucide-react";
import Link from "next/link";

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
          className="bg-[#00D992] hover:bg-[#00C080] text-gray-900 font-medium"
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
          Setting up account...
        </Button>
      );
    }

    // User is authenticated and account is set up
    return (
      <CollaborateDialog influencerHandle={profile.author_handle}>
        <Button className="bg-[#00D992] hover:bg-[#00C080] text-gray-900 font-medium">
          Collaborate
        </Button>
      </CollaborateDialog>
    );
  };

  return (
    <div className="card-trendsage group mb-8">
      <div className="flex flex-col sm:flex-row items-start gap-6 relative">
        {/* Collaborate Button - Right top corner, with enhanced logic */}
        <div className="absolute top-0 right-0">
          {renderCollaborateButton()}
        </div>

        <Link
          href={`https://twitter.com/${profile.author_handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img
            src={
              profile.profile_image_url ||
              "/placeholder.svg?height=200&width=200"
            }
            alt={profile.name}
            className="w-24 h-24 rounded-2xl object-cover ring-2 ring-transparent group-hover:ring-[#00D992]/50 transition-all"
          />
        </Link>
        <div className="flex-1 pr-32 sm:pr-36">
          {" "}
          {/* Add right padding to avoid button overlap */}
          <h1 className="text-2xl font-bold text-gray-100 mb-1 group-hover:text-[#00D992] transition-colors">
            {profile.name}
          </h1>
          <p className="text-lg text-gray-400 mb-1">@{profile.author_handle}</p>
          {accountCreatedText && (
            <p className="text-xs text-gray-500 mb-3">{accountCreatedText}</p>
          )}
          {profile.bio && (
            <p className="text-sm text-gray-300 leading-snug">{profile.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}
