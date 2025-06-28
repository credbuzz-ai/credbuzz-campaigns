import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { forwardRef } from "react";

export const SocialCard = forwardRef<HTMLDivElement>((props, ref) => {
  const { user } = useUser();
  return (
    <div className="max-w-[600px] w-full mx-auto select-none">
      <div
        ref={ref}
        className="relative w-full overflow-hidden rounded-xl bg-black"
        style={{ aspectRatio: "1200/628" }}
      >
        {/* Background Image with Blur */}
        <div className="absolute inset-0">
          <img
            src="/blur.png"
            alt="Background"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Content */}
        <div className="relative px-6 text-white h-full flex flex-col justify-evenly">
          {/* First Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={user?.profile_image_url ?? "/logo-green.svg"}
                className="w-12 h-12 rounded-full"
                alt="Profile"
              />
              <div>
                <h2 className="text-xl font-semibold">
                  {user?.name ?? "TrendSage"}
                </h2>
                <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                  <span>@{user?.x_handle ?? "0xtrendsage"}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-12">
              <div>
                <h3 className="text-gray-400 mb-1 text-sm">Followers</h3>
                <p className="text-xl font-semibold">{user?.followers ?? 0}</p>
              </div>
              <div>
                <h3 className="text-gray-400 mb-1 text-sm">Rewards</h3>
                <p className="text-xl font-semibold">
                  {user?.total_points ?? 0} SAGE
                </p>
              </div>
            </div>
          </div>

          {/* Second Row - with dashed borders */}
          <div className="py-4 border-y border-dashed border-gray-700">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold">
                Turn your Popularity on X into
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <h2 className="text-2xl font-semibold">Exciting Rewards with</h2>
              <img
                src="/logo-green.svg"
                alt="TrendSage Logo"
                className="w-6 h-6"
              />
              <span className="text-lg">TrendSage</span>
            </div>
          </div>

          {/* Third Row */}
          <div className="flex items-center justify-between">
            <p className="text-lg text-gray-400">Use my referral URL now!</p>
            <div className="flex gap-2">
              <Button className="bg-green-500 text-black text-sm px-4 py-2 font-semibold">
                Earn 10 SAGE Now →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
