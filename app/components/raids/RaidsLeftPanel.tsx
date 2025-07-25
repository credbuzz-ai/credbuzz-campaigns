import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, Copy, Filter, Search, TrendingUp } from "lucide-react";
import { useState } from "react";
import type { LeftSectionItem } from "./RaidsInterfaces";
import { formatNumber } from "./RaidsUtils";

interface RaidsLeftPanelProps {
  isSearching: boolean;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  selectedItem: LeftSectionItem | null;
  onItemSelect: (item: LeftSectionItem) => void;
  items: LeftSectionItem[];
  loadingItems: boolean;
  selectedChains: string[];
  availableChains: string[];
  onChainsChange: (chains: string[]) => void;
  onTokenIdCopy: (tokenId: string) => void;
}

export function RaidsLeftPanel({
  isSearching,
  searchTerm,
  onSearchTermChange,
  selectedItem,
  onItemSelect,
  items,
  loadingItems,
  selectedChains,
  availableChains,
  onChainsChange,
  onTokenIdCopy,
}: RaidsLeftPanelProps) {
  const [sidebarFilter, setSidebarFilter] = useState("");

  const filteredItems = items.filter((item) => {
    // Apply chain filter
    if (selectedChains.length > 0 && !selectedChains.includes(item.chain)) {
      return false;
    }

    // Apply text filter
    if (sidebarFilter.trim()) {
      return (
        item.symbol.toLowerCase().includes(sidebarFilter.toLowerCase()) ||
        item.name.toLowerCase().includes(sidebarFilter.toLowerCase())
      );
    }

    return true;
  });

  const handleSelectAllChains = () => {
    onChainsChange(availableChains);
  };

  const handleDeselectAllChains = () => {
    onChainsChange([]);
  };

  const handleToggleChain = (chain: string, checked: boolean) => {
    if (checked) {
      onChainsChange([...selectedChains, chain]);
    } else {
      onChainsChange(selectedChains.filter((c) => c !== chain));
    }
  };

  const renderLeftSectionItem = (item: LeftSectionItem, index: number) => {
    const isSelected = selectedItem === item;

    return (
      <div
        key={`token-${item.token_id || index}`}
        className={`w-full flex items-center gap-3 p-3 rounded-none transition-all text-left hover:bg-neutral-800 border-2 cursor-pointer ${
          isSelected
            ? "bg-[#00D992]/10 border-[#00D992] shadow-lg shadow-[#00D992]/20"
            : "border-transparent hover:border-neutral-600"
        }`}
        onClick={() => onItemSelect(item)}
      >
        <img
          src={item.profile_image_url || "/placeholder.svg"}
          alt={item.symbol}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold truncate ${
                isSelected ? "text-[#00D992]" : "text-white"
              }`}
            >
              {item.symbol}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onTokenIdCopy(item.token_id);
              }}
              className="h-6 w-6 p-0 text-gray-400 hover:text-[#00D992] hover:bg-[#00D992]/10"
            >
              <Copy className="w-3 h-3" />
            </Button>
            {!isSearching && (
              <TrendingUp className="w-3 h-3 text-[#00D992] shrink-0" />
            )}
            {isSearching && (
              <Search className="w-3 h-3 text-blue-400 shrink-0" />
            )}
          </div>
          <span className="text-xs text-gray-400 truncate block">
            {item.name}
          </span>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1 min-w-0">
            <span className="truncate">
              Mentions:{" "}
              {formatNumber(
                "mention_count_24hr" in item
                  ? item.mention_count_24hr
                  : item.mention_count
              )}
            </span>
            <Badge
              variant="outline"
              className="text-xs bg-neutral-700 border-neutral-500 text-gray-300 shrink-0 ml-2"
            >
              {item.chain}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-80 shrink-0 border-r border-neutral-700 pr-4 flex flex-col h-full">
      <div className="mb-6 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold flex items-center gap-2">
            {isSearching ? (
              <>
                <Search className="w-5 h-5 text-[#00D992]" />
                Search Results
              </>
            ) : (
              <>
                <TrendingUp className="w-5 h-5 text-[#00D992]" />
                Trending Communities
              </>
            )}
          </h2>
          {filteredItems.length > 0 && (
            <span className="text-xs text-gray-400">
              {filteredItems.length} result
              {filteredItems.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search tokens or handles..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10 pr-3 py-2 text-sm bg-neutral-800 border-neutral-600 text-white placeholder-gray-400 focus:border-[#00D992] focus:ring-[#00D992] rounded-none"
          />
        </div>

        {/* Chain Filter */}
        {availableChains.length > 0 && (
          <div className="mb-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-neutral-800 border-neutral-600 text-white hover:border-[#00D992] hover:text-black rounded-none"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm">
                      {selectedChains.length === availableChains.length
                        ? "All Chains"
                        : selectedChains.length === 0
                        ? "All Chains"
                        : `${selectedChains.length} Chain${
                            selectedChains.length !== 1 ? "s" : ""
                          } Selected`}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-neutral-800 border-neutral-600 text-white">
                <DropdownMenuCheckboxItem
                  checked={selectedChains.length === availableChains.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleSelectAllChains();
                    } else {
                      handleDeselectAllChains();
                    }
                  }}
                  className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                >
                  {selectedChains.length === availableChains.length
                    ? "Deselect All"
                    : "Select All"}
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator className="bg-neutral-600" />

                {availableChains.map((chain) => (
                  <DropdownMenuCheckboxItem
                    key={chain}
                    checked={selectedChains.includes(chain)}
                    onCheckedChange={(checked) =>
                      handleToggleChain(chain, checked)
                    }
                    className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                  >
                    {chain}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        {loadingItems ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex items-center gap-3 p-2 rounded-none"
              >
                <Skeleton className="w-10 h-16 rounded-full" />
              </Skeleton>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <ul className="space-y-1">
            {filteredItems.map((item, index) =>
              renderLeftSectionItem(item, index)
            )}
          </ul>
        ) : (
          <div className="text-center text-gray-400 py-8">
            {isSearching
              ? "No search results found."
              : "No tokens found matching the current filters."}
          </div>
        )}
      </div>
    </aside>
  );
}
