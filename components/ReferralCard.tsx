import { motion } from "framer-motion";
import { Gift } from "lucide-react";
import { useState } from "react";

interface ReferralCardProps {
  referralCode: string;
}

export const ReferralCard = ({ referralCode }: ReferralCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full mx-auto"
    >
      <motion.div
        className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-xl border border-[#00D992]/20 shadow-xl overflow-hidden transform-gpu"
        whileHover={{ scale: 1.02, borderColor: "rgba(0, 217, 146, 0.4)" }}
        transition={{ type: "spring", damping: 15 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Multiple Glow Effects */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#00D992]/10 opacity-20 blur-[60px] rounded-full"
          animate={{
            scale: isHovered ? 1.2 : 1,
            opacity: isHovered ? 0.4 : 0.2,
          }}
          transition={{ duration: 0.8 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-[#00F5A8]/10 opacity-20 blur-[40px] rounded-full"
          animate={{
            scale: isHovered ? 1.1 : 0.9,
            opacity: isHovered ? 0.3 : 0.15,
          }}
          transition={{ duration: 0.6, delay: 0.1 }}
        />

        {/* Card Content */}
        <div className="relative z-10 p-6 backdrop-blur-sm">
          {/* Card Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative">
              <motion.div
                className="p-2 rounded-full bg-gradient-to-br from-[#00D992]/30 to-[#00F5A8]/20"
                whileHover={{ rotate: 180, scale: 1.1 }}
                animate={{
                  boxShadow: isHovered
                    ? "0 0 20px rgba(0, 217, 146, 0.3)"
                    : "0 0 10px rgba(0, 217, 146, 0.1)",
                }}
                transition={{ duration: 0.6 }}
              >
                <Gift className="w-5 h-5 text-[#00D992]" />
              </motion.div>
            </div>
            <h2 className="text-lg font-semibold text-gray-100">
              Your Exclusive Invite Code
            </h2>
          </div>

          {/* Code Display */}
          <motion.div
            className="bg-gradient-to-br from-neutral-800/90 to-neutral-900/90 rounded-lg border border-[#00D992]/30 p-4 mb-4 relative overflow-hidden"
            whileHover={{ borderColor: "rgba(0, 217, 146, 0.5)" }}
            animate={{
              boxShadow: isHovered
                ? "0 0 30px rgba(0, 217, 146, 0.2)"
                : "0 0 15px rgba(0, 217, 146, 0.1)",
            }}
          >
            {/* Inner glow for code display */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#00D992]/5 to-[#00F5A8]/5 blur-md"
              animate={{
                opacity: isHovered ? 0.7 : 0.3,
              }}
              transition={{ duration: 0.4 }}
            />
            <motion.div
              className="flex items-center justify-center relative"
              animate={{
                textShadow: isHovered
                  ? "0 0 15px rgba(0, 217, 146, 0.5)"
                  : "0 0 8px rgba(0, 217, 146, 0.3)",
              }}
            >
              <span className="text-2xl font-bold tracking-wider bg-gradient-to-r from-[#00D992] to-[#00F5A8] bg-clip-text text-transparent">
                {referralCode}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};
