"use client";

import { usePrivyDatabaseSync } from "@/hooks/usePrivyDatabaseSync";
import { Briefcase, EllipsisVertical, Menu, Power, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navItems = [
  {
    label: "Explore Campaigns",
    href: "/sage-campaigns",
  },
  {
    label: "Find KOLs",
    href: "/kols",
  },
  // {
  //   label: "Projects",
  //   href: "/projects",
  // },
];

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileProfileDropdownOpen, setIsMobileProfileDropdownOpen] =
    useState(false);
  const [scrolled, setScrolled] = useState(false);

  const {
    ready,
    authenticated,
    user,
    login,
    logout,
    isProcessing,
    getProfileImage,
    getDisplayName,
  } = usePrivyDatabaseSync();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMobileProfileDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header
      className={` w-full z-50 transition-all duration-300  ${
        scrolled
          ? "bg-gray-900/70 backdrop-blur-lg shadow-lg border-b border-gray-800/60"
          : "bg-transparent backdrop-blur-xl border-b border-gray-700/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/logo-green.svg"
              alt="TrendSage"
              className="w-8 h-8 transition-transform group-hover:scale-105"
            />
            <span className="text-xl font-bold text-gray-100 group-hover:text-[#00D992] transition-colors">
              TrendSage
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative font-medium transition-colors duration-300 after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-0 after:bg-[#00D992] after:transition-all after:duration-300 hover:text-[#00D992] hover:after:w-full ${
                  pathname?.startsWith(item.href)
                    ? "text-[#00D992] after:w-full"
                    : "text-gray-300"
                }`}
              >
                {item.label}
              </Link>
            ))}

            {ready && !authenticated && (
              <button
                className="btn-primarynew inline-flex items-center justify-center min-w-[160px]"
                onClick={login}
                disabled={isProcessing}
              >
                {isProcessing ? "Connecting..." : "Login with X"}
              </button>
            )}
            {ready && authenticated && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="w-8 h-8 rounded-full border-2 border-transparent hover:border-[#00D992]/50 transition-all"
                >
                  <img
                    src={getProfileImage()}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder.svg?height=32&width=32";
                    }}
                  />
                </button>
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
                      {getDisplayName()}
                    </div>
                    <Link
                      href="/my-campaigns"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-[#00D992] transition-colors flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      Profile & Campaigns
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-[#00D992] transition-colors flex items-center gap-2"
                    >
                      <Power className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Mobile controls */}
          <div className="flex items-center gap-3 md:hidden">
            {ready && !authenticated && (
              <button
                className="btn-primarynew inline-flex items-center justify-center min-w-[160px]"
                onClick={login}
                disabled={isProcessing}
              >
                {isProcessing ? "Connecting..." : "Login with X"}
              </button>
            )}
            {/* Mobile Avatar */}
            {ready && authenticated && (
              <div className="relative" ref={mobileDropdownRef}>
                <button
                  onClick={() =>
                    setIsMobileProfileDropdownOpen(!isMobileProfileDropdownOpen)
                  }
                  className="w-8 h-8 rounded-full border-2 border-transparent hover:border-[#00D992]/50 transition-all"
                >
                  <img
                    src={getProfileImage()}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder.svg?height=32&width=32";
                    }}
                  />
                </button>
                {isMobileProfileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700 truncate">
                      {getDisplayName()}
                    </div>
                    <Link
                      href="/my-campaigns"
                      onClick={() => {
                        setIsMobileProfileDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-[#00D992] transition-colors flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      Profile & Campaigns
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileProfileDropdownOpen(false);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-[#00D992] transition-colors flex items-center gap-2"
                    >
                      <Power className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Hamburger */}
            {authenticated && (
              <button
                className="text-gray-300 hover:text-[#00D992] transition-colors duration-300 focus:outline-none"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <EllipsisVertical className="w-6 h-6" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile slide-down menu */}
        <div
          className={`md:hidden overflow-hidden absolute top-16 left-0 bg-black/90 backdrop-blur-xl w-full border-t  border-gray-700/50 transition-all duration-300 ease-in-out z-[100] ${
            isMenuOpen ? "h-screen" : "max-h-0"
          }`}
          style={{ transitionProperty: "max-height" }}
        >
          {isMenuOpen && (
            <div className="py-4 flex flex-col  animate-fade-in">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-gray-300 hover:text-[#00D992] transition-colors font-medium text-2xl mt-0 py-6 px-4 border-b border-neutral-600 ${
                    pathname?.startsWith(item.href) ? "!text-[#00D992]" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {ready && !authenticated && (
                <button
                  className="btn-primary w-full"
                  onClick={login}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Connecting..." : "Login with X"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
