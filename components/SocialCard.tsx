import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import html2canvas from "html2canvas";
import { useRef } from "react";

export const SocialCard = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const captureCard = async () => {
    if (!cardRef.current) return null;

    try {
      const canvas = await html2canvas(cardRef.current);
      console.log("Copied card to clipboard");
      return canvas;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const copyToClipboard = async () => {
    const canvas = await captureCard();
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);
          toast({
            title: "Success",
            description: "Card copied to clipboard!",
            duration: 3000,
          });
        } catch (err) {
          toast({
            title: "Error",
            description: "Failed to copy to clipboard. Try again.",
            variant: "destructive",
            duration: 3000,
          });
        }
      }
    }, "image/png");
  };

  return (
    <div className="max-w-[600px] w-full mx-auto">
      <div
        ref={cardRef}
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
                src="https://pbs.twimg.com/profile_images/1861075135392002048/Vm3TFUmN_400x400.jpg"
                className="w-12 h-12 rounded-full"
                alt="Profile"
              />
              <div>
                <h2 className="text-xl font-semibold">Jon Snow</h2>
                <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                  <span>@maintargaryen</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-12">
              <div>
                <h3 className="text-gray-400 mb-1 text-sm">Mindshare</h3>
                <p className="text-xl font-semibold">2.2K</p>
              </div>
              <div>
                <h3 className="text-gray-400 mb-1 text-sm">Rewards</h3>
                <p className="text-xl font-semibold">200 SAGE</p>
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
            <p className="text-lg text-gray-400">Use my referral URL</p>
            <div className="flex gap-2">
              <Button
                onClick={copyToClipboard}
                className="bg-green-500 hover:bg-green-600 text-black text-sm px-4 py-2 font-semibold"
              >
                Earn 10 SAGE Now →
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
