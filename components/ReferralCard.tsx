import { useUser } from "@/contexts/UserContext";

interface ReferralCardProps {
  referralCode: string;
}

export const ReferralCard = ({ referralCode }: ReferralCardProps) => {
  const { user } = useUser();
  return (
    <img
      src={
        user
          ? `/api/referral-card?${new URLSearchParams({
              name: user.name ?? user.x_handle,
              profileImage: user.profile_image_url || "",
            })}`
          : "/api/referral-card"
      }
      alt="Referral Card Preview"
      className="w-full h-auto rounded-lg border border-gray-600/30 shadow-lg"
      style={{ aspectRatio: "1200/628" }}
    />
  );
};
