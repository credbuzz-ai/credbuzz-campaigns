import { useUser } from "@/contexts/UserContext";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ReferralCardProps {
  referralCode: string;
}

export const ReferralCard = ({ referralCode }: ReferralCardProps) => {
  const { user } = useUser();
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    // Construct the image URL
    const url = user
      ? `/api/og?${new URLSearchParams({
          name: user.name ?? user.x_handle,
          profile_image_url: user.profile_image_url || "",
        })}`
      : "/api/og";

    setImageUrl(url);
  }, [user]);

  return (
    <div
      className="relative w-full rounded-lg overflow-hidden"
      style={{ aspectRatio: "1200/628" }}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt="Referral Card Preview"
          fill
          priority
          className="object-cover rounded-lg border border-gray-600/30 shadow-lg"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}
    </div>
  );
};
