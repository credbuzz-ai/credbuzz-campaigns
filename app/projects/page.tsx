"use client";

import { Input } from "@/components/ui/input";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { getCashtagLeaderboard } from "@/lib/cashtag";
import { TokenDataItem } from "@/lib/cashtag.types";
import { formatNumber } from "@/lib/helper";
import { ArrowUpDown, Loader2, Search, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type SortableFields = keyof TokenDataItem;

const INITIAL_PAGE_SIZE = 20;
const LOAD_MORE_SIZE = 10;

export default function ProjectsPage() {
  const router = useRouter();
  const [allProjects, setAllProjects] = useState<TokenDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const loadingRef = useRef<HTMLDivElement>(null);
  const initialLoadDone = useRef(false);
  const [sortConfig, setSortConfig] = useState<{
    key: SortableFields;
    direction: "asc" | "desc";
  }>({ key: "mindshare_change_24_hr", direction: "desc" });

  const fetchProjects = async (pageNumber: number, isLoadingMore = false) => {
    try {
      if (isLoadingMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const pageSize = isLoadingMore ? LOAD_MORE_SIZE : INITIAL_PAGE_SIZE;
      const start = isLoadingMore
        ? INITIAL_PAGE_SIZE + (pageNumber - 1) * LOAD_MORE_SIZE
        : 0;

      const response = await getCashtagLeaderboard({
        requestedData: {
          chain: ["base"],
        },
        start,
        limit: pageSize,
        sort: {
          field: "mindshare_change_24_hr",
          direction: "desc",
        },
      });

      // Always append new data, whether it's initial load or loading more
      setAllProjects((prev) => {
        // For initial load, if we already have data, don't replace it
        if (!isLoadingMore && initialLoadDone.current) {
          return prev;
        }

        // Remove duplicates when appending new data
        const newProjects = response.result.filter(
          (newProject) =>
            !prev.some(
              (existingProject) =>
                existingProject.token_name === newProject.token_name
            )
        );

        return [...prev, ...newProjects];
      });

      if (!isLoadingMore) {
        initialLoadDone.current = true;
      }

      setHasMore(response.result.length === pageSize);
    } catch (error) {
      setError(error as string);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    setError(null);
    fetchProjects(0, false);
  }, []);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loadingMore &&
          !loading &&
          searchTerm === ""
        ) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchProjects(nextPage, true);
            return nextPage;
          });
        }
      },
      { threshold: 0.5 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, searchTerm]);

  const handleSort = (key: SortableFields) => {
    setSortConfig((currentSort) => {
      if (currentSort?.key === key) {
        return {
          key,
          direction: currentSort.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const filteredProjects = allProjects.filter((project) =>
    project.token_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  if (loading && !initialLoadDone.current) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-[#00D992]" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-100">
              Projects
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-400">
            A list of all projects with their market metrics.
          </p>

          <div className="relative">
            <div className="absolute right-0 -top-12">
              <div className="flex gap-2 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-64 px-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#00D992] transition-colors"
                />
              </div>
            </div>

            <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider text-center">
                    #
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort("token_name")}
                  >
                    <div className="flex items-center gap-2">
                      Project Name
                      <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      {sortConfig?.key === "token_name" && (
                        <span className="text-xs text-gray-400">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort("market_cap")}
                  >
                    <div className="flex items-center gap-2">
                      Market Cap
                      <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      {sortConfig?.key === "market_cap" && (
                        <span className="text-xs text-gray-400">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort("mention_count_24hr")}
                  >
                    <div className="flex items-center gap-2">
                      Mentions (24h)
                      <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      {sortConfig?.key === "mention_count_24hr" && (
                        <span className="text-xs text-gray-400">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort("mentions_change_24_hr")}
                  >
                    <div className="flex items-center gap-2">
                      Mentions Change (24h)
                      <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      {sortConfig?.key === "mentions_change_24_hr" && (
                        <span className="text-xs text-gray-400">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort("vol_24hr")}
                  >
                    <div className="flex items-center gap-2">
                      Volume (24h)
                      <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      {sortConfig?.key === "vol_24hr" && (
                        <span className="text-xs text-gray-400">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-600 transition-colors"
                    onClick={() => handleSort("liquidity")}
                  >
                    <div className="flex items-center gap-2">
                      Liquidity
                      <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      {sortConfig?.key === "liquidity" && (
                        <span className="text-xs text-gray-400">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {sortedProjects.map((project, index) => {
                  const displayNumber = searchTerm ? index + 1 : index + 1;
                  const twitterHandle = project.token_twitter;
                  return (
                    <TableRow
                      key={project.token_name}
                      className="hover:bg-gray-700 transition-colors cursor-pointer group"
                      onClick={() => {
                        if (twitterHandle) {
                          router.push(`/projects/${twitterHandle}`);
                        }
                      }}
                    >
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200 text-center">
                        #{displayNumber}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                        {project.token_name}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        ${formatNumber(Number(project.market_cap || 0))}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        {formatNumber(Number(project.mention_count_24hr || 0))}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={
                            (project.mentions_change_24_hr ?? 0) >= 0
                              ? "text-[#00D992]"
                              : "text-red-400"
                          }
                        >
                          {(project.mentions_change_24_hr ?? 0) >= 0 ? "+" : ""}
                          {formatNumber(
                            Number(project.mentions_change_24_hr ?? 0)
                          )}
                          %
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        ${formatNumber(Number(project.vol_24hr || 0))}
                      </TableCell>
                      <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                        ${formatNumber(Number(project.liquidity || 0))}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </table>
            {sortedProjects.length === 0 && !loadingMore && (
              <div className="text-center py-8 text-gray-400 bg-gray-800">
                No projects found matching your search.
              </div>
            )}
            {!searchTerm && hasMore && (
              <div ref={loadingRef} className="h-20 bg-gray-800">
                {loadingMore && (
                  <div className="flex justify-center items-center gap-2 text-sm text-gray-400 py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more projects...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
