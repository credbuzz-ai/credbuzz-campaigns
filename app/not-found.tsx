"use client";

import { CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [countdown, setCountdown] = useState(10);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    window.location.href = "https://trendsage.xyz";
  }, []);

  // During static generation, return null
  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-8">
          <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <CircleAlert className="w-8 h-8 text-neutral-300" />
          </div>

          <h1 className="text-2xl font-bold text-neutral-100 mb-4">
            Page Not Found
          </h1>
          <p className="text-neutral-400 mb-4">
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved.
          </p>
          <p className="text-sm text-neutral-500">
            You are being redirected to{" "}
            <a
              href="https://trendsage.xyz"
              className="text-primary-400 font-semibold"
            >
              trendsage.xyz
            </a>{" "}
            in {countdown} second{countdown !== 1 ? "s" : ""}...
          </p>
        </div>
      </div>
    </div>
  );
}
