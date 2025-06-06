"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Menu, X, Power } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileProfileDropdownOpen, setIsMobileProfileDropdownOpen] = useState(false);
  const { ready, authenticated, user, login, logout } = usePrivy();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // Helper function to get high quality profile image
  const getHighQualityProfileImage = (url: string | null | undefined) => {
    if (!url) return "/placeholder.svg?height=32&width=32";
    return url.replace("_normal", "_400x400");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target as Node)) {
        setIsMobileProfileDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-gray-800/90 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
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

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/buzz-board"
              className="text-gray-300 hover:text-[#00D992] transition-colors font-medium"
            >
              Buzz Board
            </Link>
            <Link
              href="/kols"
              className="text-gray-300 hover:text-[#00D992] transition-colors font-medium"
            >
              KOLs
            </Link>
            <Link
              href="/projects"
              className="text-gray-300 hover:text-[#00D992] transition-colors font-medium"
            >
              Projects
            </Link>
            {ready && !authenticated && (
              <button className="btn-primary" onClick={login}>
                Connect X
              </button>
            )}
            {ready && authenticated && (
              <div className="flex items-center gap-3">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="w-8 h-8 rounded-full border-2 border-transparent hover:border-[#00D992]/50 transition-all"
                  >
                    <img
                      src={getHighQualityProfileImage(user?.twitter?.profilePictureUrl)}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=32&width=32"
                      }}
                    />
                  </button>
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-50">
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
              </div>
            )}
          </nav>

          <button
            className="md:hidden text-gray-300 hover:text-[#00D992] transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700/50">
            <div className="flex flex-col space-y-4">
              <Link
                href="/buzz-board"
                className="text-gray-300 hover:text-[#00D992] transition-colors font-medium"
              >
                Buzz Board
              </Link>
              <Link
                href="/kols"
                className="text-gray-300 hover:text-[#00D992] transition-colors font-medium"
              >
                KOLs
              </Link>
              <Link
                href="/projects"
                className="text-gray-300 hover:text-[#00D992] transition-colors font-medium"
              >
                Projects
              </Link>
              {ready && !authenticated && (
                <button className="btn-primary w-full" onClick={login}>
                  Connect X
                </button>
              )}
              {ready && authenticated && (
                <div className="flex justify-center py-2">
                  <div className="relative" ref={mobileDropdownRef}>
                    <button
                      onClick={() => setIsMobileProfileDropdownOpen(!isMobileProfileDropdownOpen)}
                      className="w-8 h-8 rounded-full border-2 border-transparent hover:border-[#00D992]/50 transition-all"
                    >
                      <img
                        src={getHighQualityProfileImage(user?.twitter?.profilePictureUrl)}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=32&width=32"
                        }}
                      />
                    </button>
                    {isMobileProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-50">
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
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
