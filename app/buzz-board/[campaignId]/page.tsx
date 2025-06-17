import FollowersOverview from "@/app/components/FollowersOverview";
import MindshareVisualization from "@/app/components/MindshareVisualization";
import SmartFeed from "@/app/components/SmartFeed";
import { MindshareResponse, UserProfileResponse } from "@/app/types";
import { XLogo } from "@/components/icons/x-logo";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/lib/api";
import { Campaign } from "@/lib/types";
import { truncateAddress } from "@/lib/utils";
import { formatDistanceToNow, differenceInDays, differenceInHours } from "date-fns";
import { Clock, Coins } from "lucide-react";
import { Metadata } from "next";
import CampaignDetailsClient from "./CampaignDetailsClient";
import { BASE_URL } from "@/lib/constants";

// Server-side metadata generation
export async function generateMetadata({ 
  params 
}: { 
  params: { campaignId: string } 
}): Promise<Metadata> {
  const { campaignId } = params;
  const API_BASE_URL = process.env.NEXT_PUBLIC_TRENDSAGE_API_URL || process.env.NEXT_PUBLIC_CREDBUZZ_API_URL || 'https://api.cred.buzz';
  
  try {
    // Fetch campaign data for metadata
    const response = await fetch(`${API_BASE_URL}/campaign/get-campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaign_id: campaignId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch campaign');
    }

    const data = await response.json();
    const campaign = data?.result?.[0];

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const title = `${campaign.campaign_name} - TrendSage Campaign`;
    const description = campaign.description.length > 150 
      ? `${campaign.description.slice(0, 150)}...`
      : campaign.description;
    
    const ogImageUrl = `${BASE_URL}/api/og/campaign/${campaignId}`;
    const pageUrl = `${BASE_URL}/buzz-board/${campaignId}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: pageUrl,
        siteName: 'TrendSage - Web3 KOL Marketplace',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${campaign.campaign_name} - Community Mindshare`,
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
        creator: '@TrendSageApp',
        site: '@TrendSageApp',
      },
      other: {
        'twitter:label1': 'Reward',
        'twitter:data1': `${campaign.amount} ${campaign.payment_token}`,
        'twitter:label2': 'Target',
        'twitter:data2': campaign.target_x_handle || 'Community',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    
    // Fallback metadata
    return {
      title: 'TrendSage Campaign - Web3 KOL Marketplace',
      description: 'Discover and participate in Web3 KOL campaigns on TrendSage',
      openGraph: {
        title: 'TrendSage Campaign',
        description: 'Discover and participate in Web3 KOL campaigns on TrendSage',
        siteName: 'TrendSage - Web3 KOL Marketplace',
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: 'TrendSage Campaign',
        description: 'Discover and participate in Web3 KOL campaigns on TrendSage',
        creator: '@TrendSageApp',
        site: '@TrendSageApp',
      },
    };
  }
}

// Server Component that renders the client component
export default function CampaignDetailsPage({ 
  params 
}: { 
  params: { campaignId: string } 
}) {
  return <CampaignDetailsClient campaignId={params.campaignId} />;
}
