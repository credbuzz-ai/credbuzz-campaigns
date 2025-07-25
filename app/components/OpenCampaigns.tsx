"use client";

import CampaignCard from "@/components/CampaignCard";
import apiClient from "@/lib/api";
import { Campaign } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function OpenCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await apiClient.post("/campaign/get-campaigns", {
          campaign_type: "Public",
          is_visible: true,
        });
        // Sort campaigns by offer_end_date in descending order
        const sortedCampaigns = (res.data.result || []).sort(
          (a: Campaign, b: Campaign) =>
            new Date(b.offer_end_date).getTime() -
            new Date(a.offer_end_date).getTime()
        );
        setCampaigns(sortedCampaigns);
      } catch (err) {
        console.error("Failed to fetch campaigns", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const visibleCampaigns = campaigns.filter((c) => c.is_visible).slice(0, 3);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-neutral-700/60 border-dashed">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-semibold text-neutral-100 mb-2">
          Open Campaigns
        </h2>
        <p className="text-neutral-300 max-w-2xl mx-auto mb-12 text-sm md:text-base">
          Discover and join active Web3 marketing campaigns
        </p>

        {loading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-neutral-300">
            <Loader2 className="animate-spin w-6 h-6" />
            Loading campaigns...
          </div>
        ) : (
          <div className="flex w-full justify-center items-center gap-6 flex-wrap">
            {visibleCampaigns.map((campaign) => (
              <CampaignCard key={campaign.campaign_id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
