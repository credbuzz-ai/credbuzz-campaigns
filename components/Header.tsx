"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Zap, Sun, Moon } from "lucide-react"
import { useTheme } from "./ThemeProvider"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-pastel-lavender dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-gray-800 dark:text-gray-200" />
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-gray-200">CredBuzz</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/buzz-board"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
            >
              Buzz Board
            </Link>
            <Link
              href="/kols"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
            >
              KOLs
            </Link>
            <Link
              href="/projects"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
            >
              Projects
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>
            <button className="btn-primary">Connect Wallet</button>
          </nav>

          <button className="md:hidden text-gray-700 dark:text-gray-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col space-y-4">
              <Link href="/buzz-board" className="text-gray-700 dark:text-gray-300">
                Buzz Board
              </Link>
              <Link href="/kols" className="text-gray-700 dark:text-gray-300">
                KOLs
              </Link>
              <Link href="/projects" className="text-gray-700 dark:text-gray-300">
                Projects
              </Link>
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === "light" ? (
                    <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  ) : (
                    <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  )}
                </button>
              </div>
              <button className="btn-primary w-full">Connect Wallet</button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
