"use client";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCashtagLeaderboard } from "@/lib/cashtag";
import { TokenDataItem } from "@/lib/cashtag.types";
import { formatNumber } from "@/lib/helper";
import { ArrowUpDown, Loader2, Search } from "lucide-react";
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

  const SortableHeader = ({
    label,
    sortKey,
  }: {
    label: string;
    sortKey: SortableFields;
  }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {label}
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        {sortConfig?.key === sortKey && (
          <span className="text-xs text-muted-foreground">
            {sortConfig.direction === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Projects
            </h1>
            <p className="text-sm text-muted-foreground">
              A list of all projects with their market metrics.
            </p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card shadow-sm">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[50px] text-center">#</TableHead>
                  <SortableHeader label="Project Name" sortKey="token_name" />
                  <SortableHeader label="Market Cap" sortKey="market_cap" />
                  <SortableHeader
                    label="Mentions (24h)"
                    sortKey="mention_count_24hr"
                  />
                  <SortableHeader
                    label="Mentions Change (24h)"
                    sortKey="mentions_change_24_hr"
                  />
                  <SortableHeader label="Volume (24h)" sortKey="vol_24hr" />
                  <SortableHeader label="Liquidity" sortKey="liquidity" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProjects.map((project, index) => {
                  const displayNumber = searchTerm ? index + 1 : index + 1;
                  const twitterHandle = project.token_twitter;
                  return (
                    <TableRow
                      key={project.token_name}
                      className="hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        if (twitterHandle) {
                          router.push(`/projects/${twitterHandle}`);
                        }
                      }}
                    >
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {displayNumber}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {project.token_name}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${formatNumber(Number(project.market_cap || 0))}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatNumber(Number(project.mention_count_24hr || 0))}
                      </TableCell>
                      <TableCell className="font-medium">
                        <span
                          className={
                            (project.mentions_change_24_hr ?? 0) >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {(project.mentions_change_24_hr ?? 0) >= 0 ? "+" : ""}
                          {formatNumber(
                            Number(project.mentions_change_24_hr ?? 0)
                          )}
                          %
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        ${formatNumber(Number(project.vol_24hr || 0))}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${formatNumber(Number(project.liquidity || 0))}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {sortedProjects.length === 0 && !loadingMore && (
              <div className="text-center py-8 text-muted-foreground">
                No projects found matching your search.
              </div>
            )}
            {!searchTerm && (
              <div ref={loadingRef} className="py-4">
                {loadingMore && (
                  <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more projects...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          Showing {sortedProjects.length} projects
          {hasMore && !searchTerm && " (Scroll for more)"}
        </div>
      </div>
    </div>
  );
}
