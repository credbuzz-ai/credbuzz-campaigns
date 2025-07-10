import { Metadata } from "next";
import SubCampaignDetails from "./SubCampaignDetails";

// Server-side metadata generation
export async function generateMetadata({
  params,
}: {
  params: { campaignId: string; subCampaignId: string };
}): Promise<Metadata> {
  const { campaignId, subCampaignId } = params;
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

    // Find the specific sub-campaign
    const subCampaign =
      campaign.sub_campaigns?.find(
        (sub: any) => sub.campaign_id === subCampaignId
      ) || campaign;

    // Create an optimized title (30-60 characters)
    const baseTitle = subCampaign.campaign_name;
    const titleSuffix = " | TrendSage Campaign";
    const title =
      baseTitle.length > 40
        ? `${baseTitle.substring(0, 37)}...${titleSuffix}`
        : `${baseTitle}${titleSuffix}`;

    const description =
      subCampaign.description.length > 150
        ? `${subCampaign.description.slice(0, 150)}...`
        : subCampaign.description;

    // Ensure absolute URLs for images
    const domain = process.env.NEXT_PUBLIC_APP_URL || "https://trendsage.xyz";
    const ogImageUrl = `${domain}/api/og/campaign/${subCampaignId}`;
    const pageUrl = `${domain}/sage-campaigns/${campaignId}/${subCampaignId}`;

    // Create a more descriptive Twitter title
    const twitterTitle = subCampaign.target_x_handle
      ? `${baseTitle} with ${subCampaign.target_x_handle}`
      : baseTitle;

    return {
      title,
      description,
      keywords: `Web3, KOL, Influencer Marketing, Crypto, ${subCampaign.campaign_name}`,
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
            alt: `${subCampaign.campaign_name} - Community Mindshare`,
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
          alt: `${subCampaign.campaign_name} - Community Mindshare Campaign`,
          width: 1200,
          height: 630,
        },
        creator: "@TrendSageApp",
        site: "@TrendSageApp",
      },
      other: {
        "twitter:image": ogImageUrl,
        "twitter:image:alt": `${subCampaign.campaign_name} - Community Mindshare Campaign`,
        "twitter:label1": "Reward",
        "twitter:data1": `${subCampaign.amount} ${subCampaign.payment_token}`,
        "twitter:label2": "Target",
        "twitter:data2": subCampaign.target_x_handle || "Community",
      },
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
    };
  }
}

// Server Component that renders the client component
export default function SubCampaignDetailsPage({
  params,
}: {
  params: { campaignId: string; subCampaignId: string };
}) {
  return (
    <SubCampaignDetails
      campaignId={params.campaignId}
      subCampaignId={params.subCampaignId}
    />
  );
}
