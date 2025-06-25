"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface ReferralHandlerProps {
  code?: string;
}

export default function ReferralHandler({ code }: ReferralHandlerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check both prop and URL param for referral code
    const referralCode = code || searchParams.get("referral_code");
    if (referralCode && typeof window !== "undefined") {
      localStorage.setItem("referral_code", referralCode);
    }
  }, [searchParams, code]);

  return null;
}
