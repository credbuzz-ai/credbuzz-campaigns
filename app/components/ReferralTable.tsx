import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReferralEntry } from "@/lib/types";
import { format, isValid } from "date-fns";
import { ArrowUpDown, Check, ExternalLink, HelpCircle } from "lucide-react";
import { useMemo, useState } from "react";

interface ReferralTableProps {
  referrals: ReferralEntry[];
  partialReferrals: ReferralEntry[];
}

type SortConfig = {
  key: keyof (ReferralEntry & { status: string });
  direction: "asc" | "desc";
};

export function ReferralTable({
  referrals,
  partialReferrals,
}: ReferralTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "used_time",
    direction: "desc",
  });

  // Combine completed and partial referrals
  const allReferrals = useMemo(() => {
    const combined = [
      ...referrals.map((ref) => ({ ...ref, status: "Completed" as const })),
      ...partialReferrals.map((ref) => ({
        ...ref,
        status: "Pending" as const,
      })),
    ];

    // Sort the referrals
    return [...combined].sort((a, b) => {
      if (sortConfig.key === "used_time") {
        const dateA = new Date(a.used_time).getTime();
        const dateB = new Date(b.used_time).getTime();
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [referrals, partialReferrals, sortConfig]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (!isValid(date)) return "Invalid date";
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  const handleSort = (key: SortConfig["key"]) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  if (allReferrals.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-700 bg-neutral-800/30 p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-gray-700/30 flex items-center justify-center mb-4">
          <ExternalLink className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-200 mb-2">
          No Referrals Yet
        </h3>
        <p className="text-sm text-gray-400">
          Share your referral link to start earning rewards
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-700 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-gray-800/50 border-neutral-700">
              <TableHead
                className="cursor-pointer hover:text-gray-200 transition-colors"
                onClick={() => handleSort("x_handle")}
              >
                <div className="flex items-center gap-2">
                  X Handle
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-gray-200 transition-colors"
                onClick={() => handleSort("used_time")}
              >
                <div className="flex items-center gap-2">
                  Used Time
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-gray-200 transition-colors"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-2">
                  Status
                  <ArrowUpDown className="h-4 w-4 text-gray-400" />
                </div>
              </TableHead>
              <TableHead>Remaining Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allReferrals.map((referral, index) => (
              <TableRow
                key={referral.x_handle + index}
                className="hover:bg-gray-800/50 border-neutral-700"
              >
                <TableCell className="font-medium">
                  <a
                    href={`https://x.com/${referral.x_handle?.replace(
                      "@",
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#00D992] hover:text-[#00D992]/80 transition-colors"
                  >
                    {referral.x_handle}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell className="text-gray-300">
                  {formatDate(referral.used_time)}
                </TableCell>
                <TableCell>
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      referral.status === "Completed"
                        ? "bg-green-400/10 text-green-400"
                        : "bg-yellow-400/10 text-yellow-400"
                    }`}
                  >
                    <span
                      className={`mr-1 h-1.5 w-1.5 rounded-full ${
                        referral.status === "Completed"
                          ? "bg-green-400"
                          : "bg-yellow-400"
                      }`}
                    />
                    {referral.status}
                  </div>
                </TableCell>
                <TableCell>
                  {referral.remaining_action === "NONE" ? (
                    <div className="flex items-center gap-1.5 text-green-400">
                      <Check className="h-4 w-4" />
                      <span className="text-sm">All Complete</span>
                    </div>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-600 px-2.5 py-0.5 text-xs font-semibold text-gray-300">
                            {referral.remaining_action === "X_FOLLOW" &&
                              "Follow on X"}
                            <HelpCircle className="h-3 w-3 text-gray-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            Great progress! Your rewards will be ready when your
                            friend completes the X follow task 🎉
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
