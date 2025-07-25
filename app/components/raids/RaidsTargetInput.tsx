import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { SearchToken } from "./RaidsInterfaces";
import { formatNumber } from "./RaidsUtils";

interface RaidsTargetInputProps {
  raidTarget: string;
  isRaidTargetLocked: boolean;
  selectedSymbol?: string;
  onRaidTargetChange: (target: string) => void;
  onRaidTargetLockChange: (locked: boolean) => void;
  onRaidTargetSelect: (item: SearchToken) => void;
  onSearchTermChange: (term: string) => void;
  searchResults: SearchToken[];
  isSearching: boolean;
}

export function RaidsTargetInput({
  raidTarget,
  isRaidTargetLocked,
  selectedSymbol,
  onRaidTargetChange,
  onRaidTargetLockChange,
  onRaidTargetSelect,
  onSearchTermChange,
  searchResults,
  isSearching,
}: RaidsTargetInputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setSearchTerm(raidTarget);
  }, [raidTarget]);

  const handleInputChange = (value: string) => {
    setSearchTerm(value);
    onSearchTermChange(value);
    // Only update raid target when selecting from dropdown, not during search
    if (value.startsWith("@") || value.startsWith("$")) {
      onRaidTargetChange(value);
    }
    setShowDropdown(value.length >= 2);
  };

  const handleInputFocus = () => {
    if (searchTerm.length >= 2) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-sm">
        {raidTarget && (
          <div className="text-[#00D992] whitespace-nowrap">
            Raiding: <span className="font-medium">{raidTarget}</span>
          </div>
        )}
        {!raidTarget && selectedSymbol && (
          <div className="text-gray-500 whitespace-nowrap">
            Raiding: <span className="font-medium">${selectedSymbol}</span>
          </div>
        )}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Search tokens or handles..."
          value={searchTerm}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="w-64 pl-10 pr-3 py-2 text-sm bg-neutral-800 border-neutral-600 text-white placeholder-gray-400 focus:border-[#00D992] focus:ring-[#00D992] rounded-none h-9"
        />
        {raidTarget && (
          <button
            onClick={() => {
              onRaidTargetChange("");
              setSearchTerm("");
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400"
            title="Clear raid target"
          >
            ×
          </button>
        )}
        {showDropdown && (searchResults.length > 0 || isSearching) && (
          <div className="absolute top-full left-0 bg-neutral-800 border border-neutral-600 border-t-0 max-h-64 overflow-y-auto z-50 w-[350px]">
            {isSearching ? (
              <div className="p-3 text-sm text-gray-400 text-center">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00D992]"></div>
                  Searching...
                </div>
              </div>
            ) : (
              searchResults.map((item, index) => (
                <div
                  key={`raid-target-${item.token_id || index}`}
                  className="flex items-center gap-3 p-3 hover:bg-neutral-700 cursor-pointer border-b border-neutral-600 last:border-b-0"
                  onClick={() => {
                    const target = item.twitter_final
                      ? `@${item.twitter_final}`
                      : `$${item.symbol}`;
                    onRaidTargetSelect(item);
                    setSearchTerm(target);
                    setShowDropdown(false);
                  }}
                >
                  <img
                    src={item.profile_image_url || "/placeholder.svg"}
                    alt={item.symbol}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        ${item.symbol}
                      </span>
                      {item.twitter_final && (
                        <span className="text-sm text-blue-400">
                          @{item.twitter_final}
                        </span>
                      )}
                      <Badge
                        variant="outline"
                        className="text-xs bg-neutral-700 border-neutral-500 text-gray-300"
                      >
                        {item.chain}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-400 truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Mentions:{" "}
                      {formatNumber(
                        "mention_count_24hr" in item
                          ? item.mention_count_24hr
                          : item.mention_count
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRaidTargetLockChange(!isRaidTargetLocked)}
        className={`px-3 py-2 h-9 ${
          isRaidTargetLocked
            ? "text-[#00D992] bg-[#00D992]/10"
            : "text-gray-400 hover:text-[#00D992]"
        }`}
        title={isRaidTargetLocked ? "Unlock raid target" : "Lock raid target"}
      >
        {isRaidTargetLocked ? "🔒" : "🔓"}
      </Button>
    </div>
  );
}
