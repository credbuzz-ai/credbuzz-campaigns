import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface ReferralCardProps {
  referralCode: string;
  referralUrl: string;
}

export const ReferralCard = ({
  referralCode,
  referralUrl,
}: ReferralCardProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyReferralCode = () => {
    const shareUrl = `https://trendsage.xyz?referral_code=${referralCode}`;
    const shareText = `TrendSage is doing great by helping you turn your Web3 Influence into $$$$.\n\nJoin me on @0xtrendsage and earn 10 SAGE upon joining with my referral URL:\n\n${shareUrl}`;
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center gap-6 w-full max-w-full bg-gray-800/30 rounded-2xl border border-[#00D992]/30 p-10 shadow-xl backdrop-blur-lg relative overflow-hidden"
    >
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#00D992]/20 opacity-20 blur-[40px] rounded-full animate-pulse" />

      <div className="flex items-center justify-center gap-3 z-10 font-bold text-2xl text-gray-100">
        <span className="text-[#00D992]">🎁</span>
        Your Exclusive Invite Code
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="p-6 px-12 bg-gradient-to-br from-[#00D992]/15 to-[#00F5A8]/10 rounded-xl border-2 border-[#00D992]/40 shadow-[0_8px_32px_rgba(0,217,146,0.15)] flex items-center justify-center relative z-10 backdrop-blur-lg"
      >
        <span className="text-4xl font-extrabold tracking-wider bg-gradient-to-r from-[#00D992] to-[#00F5A8] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,217,146,0.2)]">
          {referralCode}
        </span>
      </motion.div>

      <Button
        onClick={copyReferralCode}
        className="z-10 bg-gray-700/30 hover:bg-gray-600/30 text-gray-100 border border-gray-600/30"
        size="lg"
      >
        {isCopied ? (
          <>
            <Check className="h-4 w-4 mr-2" /> Copied!
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-2" /> Copy Referral Link
          </>
        )}
      </Button>
    </motion.div>
  );
};
