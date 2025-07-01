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
        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-[#00D992]/20 shadow-xl overflow-hidden transform-gpu"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", damping: 15 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Glow Effect */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#00D992]/10 opacity-20 blur-[60px] rounded-full"
          animate={{
            scale: isHovered ? 1.1 : 1,
            opacity: isHovered ? 0.3 : 0.2,
          }}
          transition={{ duration: 0.6 }}
        />

        {/* Card Content */}
        <div className="relative z-10 p-6">
          {/* Card Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative">
              <motion.div
                className="p-2 rounded-full bg-gradient-to-br from-[#00D992]/20 to-[#00F5A8]/10"
                whileHover={{ rotate: 180 }}
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
            className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-lg border border-[#00D992]/30 p-4 mb-4"
            whileHover={{ borderColor: "rgba(0, 217, 146, 0.5)" }}
          >
            <motion.div className="flex items-center justify-center">
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
