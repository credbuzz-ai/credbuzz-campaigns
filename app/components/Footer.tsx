"use client";

import { XLogo } from "@/components/icons/x-logo";
import { TgIcon } from "@/public/icons/TgIcon";

const Footer = () => {
  return (
    <footer className="bg-neutral-800">
      <div className="border-t border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center">
            <p className="text-sm text-neutral-300">
              © {new Date().getFullYear()} TrendSage. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
              {/* <div className="flex gap-6">
                <a
                  href="#"
                  className="text-sm text-neutral-300 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-sm text-neutral-300 hover:text-white transition-colors"
                >
                  Terms & Conditions
                </a>
              </div> */}
              <div className="flex items-center gap-4">
                <a
                  href="https://t.me/Trendsage_Portal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-300 hover:text-white transition-colors p-2 hover:bg-neutral-700/50 rounded-full"
                >
                  <TgIcon width={22} height={22} />
                </a>
                <a
                  href="https://x.com/0xTrendsage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-300 hover:text-white transition-colors p-2 hover:bg-neutral-700/50 rounded-full"
                >
                  <XLogo width={22} height={22} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
