"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function KOLSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = (handle: string) => {
    // Basic validation - ensure handle is not empty and remove @ if present
    const cleanHandle = handle.trim().replace(/^@/, "");
    if (!cleanHandle) return;

    // Navigate to the KOL profile
    router.push(`/kols/${cleanHandle}`);
  };

  return (
    <div className="mb-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(searchQuery);
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            placeholder="Search KOL by Twitter handle..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00D992]/50 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-[#00D992] text-gray-900 rounded-lg hover:bg-[#00C080] transition-colors font-medium"
        >
          Search
        </button>
      </form>
    </div>
  );
}
