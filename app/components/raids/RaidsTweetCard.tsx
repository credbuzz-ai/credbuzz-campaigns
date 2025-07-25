import {
  LikeIcon,
  ReplyIcon,
  RetweetIcon,
  ViewIcon,
} from "@/components/icons/twitter-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Sparkles } from "lucide-react";
import type { Tweet } from "./RaidsInterfaces";

interface RaidsTweetCardProps {
  tweet: Tweet;
  isSelected: boolean;
  tweetFeedType: "both" | "original" | "mentions";
  originalTweets: Tweet[];
  onGenerateResponse: (tweet: Tweet) => void;
  onLikeIntent: (tweet: Tweet) => void;
  onRetweetIntent: (tweet: Tweet) => void;
}

export function RaidsTweetCard({
  tweet,
  isSelected,
  tweetFeedType,
  originalTweets,
  onGenerateResponse,
  onLikeIntent,
  onRetweetIntent,
}: RaidsTweetCardProps) {
  return (
    <Card
      className={`bg-neutral-800 border-neutral-600 transition-all hover:bg-neutral-750 hover:border-neutral-500 cursor-pointer rounded-none ${
        isSelected ? "border-[#00D992]" : ""
      }`}
      onClick={() => onGenerateResponse(tweet)}
    >
      <CardContent className="p-4 max-w-full">
        <div className="flex items-start gap-3 mb-2">
          <img
            src={tweet.profile_image_url || "/placeholder.svg"}
            alt={`@${tweet.author_handle}`}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-100 text-sm truncate">
                  {tweet.author_handle}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `https://twitter.com/i/status/${tweet.tweet_id}`,
                      "_blank"
                    );
                  }}
                  className="text-gray-400 hover:text-[#00D992] p-1"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateResponse(tweet);
                }}
                className="text-white hover:text-[#00C484] bg-transparent hover:bg-[#00D992]/10 px-3 py-2 flex items-center gap-2 animate-pulse relative z-10 border border-transparent"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-medium">Raid the Tweet</span>
              </Button>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="text-xs text-gray-400">
                {new Date(tweet.tweet_create_time + "Z").toLocaleString()}
              </div>
              {tweetFeedType === "both" && (
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    originalTweets.some((t) => t.tweet_id === tweet.tweet_id)
                      ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                      : "bg-green-500/20 border-green-500/50 text-green-400"
                  }`}
                >
                  {originalTweets.some((t) => t.tweet_id === tweet.tweet_id)
                    ? "Author"
                    : "Mention"}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-300 mb-3 break-words whitespace-pre-wrap">
              {tweet.body}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <ReplyIcon className="w-3 h-3" />
                  <span>{tweet.reply_count}</span>
                </div>
                <div
                  className="flex items-center gap-1 hover:text-green-400 cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetweetIntent(tweet);
                  }}
                >
                  <RetweetIcon className="w-3 h-3" />
                  <span>{tweet.retweet_count}</span>
                </div>
                <div
                  className="flex items-center gap-1 hover:text-pink-400 cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLikeIntent(tweet);
                  }}
                >
                  <LikeIcon className="w-3 h-3" />
                  <span>{tweet.like_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ViewIcon className="w-3 h-3" />
                  <span>{tweet.view_count}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
