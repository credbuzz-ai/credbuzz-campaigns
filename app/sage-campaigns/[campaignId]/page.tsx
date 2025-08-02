import { Metadata } from "next";
import CampaignDetailsClient from "./CampaignDetailsClient";

// Server-side metadata generation
export async function generateMetadata({
  params,
}: {
  params: { campaignId: string };
}): Promise<Metadata> {
  const { campaignId } = params;
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_TRENDSAGE_API_URL ||
    process.env.NEXT_PUBLIC_CREDBUZZ_API_URL ||
    "https://api.cred.buzz";

  try {
    // Fetch campaign data for metadata
    const response = await fetch(`${API_BASE_URL}/campaign/get-campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        campaign_id: campaignId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch campaign");
    }

    const data = await response.json();
    const campaign = data?.result?.[0];

    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Create an optimized title (30-60 characters)
    const baseTitle = campaign.campaign_name;
    const titleSuffix = " | TrendSage Campaign";
    const title =
      baseTitle.length > 40
        ? `${baseTitle.substring(0, 37)}...${titleSuffix}`
        : `${baseTitle}${titleSuffix}`;

    const description =
      campaign.description.length > 150
        ? `${campaign.description.slice(0, 150)}...`
        : campaign.description;

    // Ensure absolute URLs for images
    const domain = process.env.NEXT_PUBLIC_APP_URL || "https://trendsage.xyz";
    const ogImageUrl = `${domain}/api/og/campaign/${campaignId}`;
    const pageUrl = `${domain}/sage-campaigns/${campaignId}`;

    // Create a more descriptive Twitter title
    const twitterTitle = campaign.target_x_handle
      ? `${baseTitle} with ${campaign.target_x_handle}`
      : baseTitle;

    return {
      title,
      description,
      keywords: `Web3, KOL, Influencer Marketing, Crypto, ${
        campaign.campaign_name
      }, ${campaign.campaign_type}, ${
        campaign.project_categories || ""
      }, Community Mindshare, ${
        campaign.target_token_symbol || ""
      }, Web3 Marketing${
        campaign.seo_keywords ? `, ${campaign.seo_keywords}` : ""
      }`,
      openGraph: {
        title,
        description,
        url: pageUrl,
        siteName: "TrendSage - Web3 KOL Marketplace",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${campaign.campaign_name} - Community Mindshare`,
          },
        ],
        locale: "en_US",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: twitterTitle,
        description,
        images: {
          url: ogImageUrl,
          alt: `${campaign.campaign_name} - Community Mindshare Campaign`,
          width: 1200,
          height: 630,
        },
        creator: "@TrendSageApp",
        site: "@TrendSageApp",
      },
      other: {
        "twitter:image": ogImageUrl,
        "twitter:image:alt": `${campaign.campaign_name} - Community Mindshare Campaign`,
        "twitter:label1": "Reward",
        "twitter:data1": `${campaign.amount} ${campaign.payment_token}`,
        "twitter:label2": "Target",
        "twitter:data2": campaign.target_x_handle || "Community",
      },
      alternates: {
        canonical: pageUrl,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
      applicationName: "TrendSage",
      referrer: "origin-when-cross-origin",
      authors: [{ name: campaign.owner_x_handle }],
      creator: campaign.owner_x_handle,
      publisher: "TrendSage",
      formatDetection: {
        email: false,
        telephone: false,
      },
      verification: {
        google: "YOUR_GOOGLE_SITE_VERIFICATION", // Add your Google verification code
      },
      category: campaign.campaign_type,
    };
  } catch (error) {
    console.error("Error generating metadata:", error);

    // Fallback metadata with absolute URLs
    const domain = process.env.NEXT_PUBLIC_APP_URL || "https://trendsage.xyz";
    const fallbackImageUrl = `${domain}/api/og/campaign/default`;

    return {
      title: "TrendSage Campaign - Web3 KOL Marketplace",
      description:
        "Discover and participate in Web3 KOL campaigns on TrendSage",
      keywords: "Web3, KOL, Influencer Marketing, Crypto",
      openGraph: {
        title: "TrendSage Campaign",
        description:
          "Discover and participate in Web3 KOL campaigns on TrendSage",
        siteName: "TrendSage - Web3 KOL Marketplace",
        images: [
          {
            url: fallbackImageUrl,
            width: 1200,
            height: 630,
            alt: "TrendSage - Web3 KOL Marketplace",
          },
        ],
        locale: "en_US",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "TrendSage - Web3 KOL Marketplace",
        description:
          "Discover and participate in Web3 KOL campaigns on TrendSage",
        images: {
          url: fallbackImageUrl,
          alt: "TrendSage - Web3 KOL Marketplace",
          width: 1200,
          height: 630,
        },
        creator: "@TrendSageApp",
        site: "@TrendSageApp",
      },
      other: {
        "twitter:image": fallbackImageUrl,
        "twitter:image:alt": "TrendSage - Web3 KOL Marketplace",
      },
      alternates: {
        canonical: `${domain}/sage-campaigns/${campaignId}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
      applicationName: "TrendSage",
      referrer: "origin-when-cross-origin",
      authors: [{ name: "TrendSage" }],
      creator: "TrendSage",
      publisher: "TrendSage",
      formatDetection: {
        email: false,
        telephone: false,
      },
      verification: {
        google: "YOUR_GOOGLE_SITE_VERIFICATION", // Add your Google verification code
      },
      category: "Web3 Marketing",
    };
  }
}

// Server Component that renders the client component
export default function CampaignDetailsPage({
  params,
}: {
  params: { campaignId: string };
}) {
  return <CampaignDetailsClient campaignId={params.campaignId} />;
}
