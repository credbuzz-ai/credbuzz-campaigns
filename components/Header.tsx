"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { ready, authenticated, user, login, logout } = usePrivy();
  const router = useRouter();

  // Redirect to profile page after authentication
  useEffect(() => {
    if (ready && authenticated && user?.twitter) {
      // Small delay to ensure the authentication state is fully updated
      const timer = setTimeout(() => {
        router.push("/profile");
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [ready, authenticated, user?.twitter, router]);

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
            <button className="btn-primary">Connect Wallet</button>
            {ready && !authenticated && (
              <button className="btn-primary" onClick={login}>
                Connect X
              </button>
            )}
            {ready && authenticated && (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="text-sm text-gray-300 hover:text-[#00D992] transition-colors"
                >
                  Welcome, @{user?.twitter?.username || "User"}
                </Link>
                <button
                  className="btn-secondary text-sm px-3 py-1"
                  onClick={logout}
                >
                  Disconnect
                </button>
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
              <button className="btn-primary w-full">Connect Wallet</button>
              {ready && !authenticated && (
                <button className="btn-primary w-full" onClick={login}>
                  Connect X
                </button>
              )}
              {ready && authenticated && (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/profile"
                    className="text-sm text-gray-300 hover:text-[#00D992] transition-colors text-center py-2"
                  >
                    Welcome, @{user?.twitter?.username || "User"}
                  </Link>
                  <button className="btn-secondary w-full" onClick={logout}>
                    Disconnect X
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
