import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Copy } from "lucide-react";
import type { Tweet } from "./RaidsInterfaces";

interface RaidsResponsePanelProps {
  selectedTweet: Tweet | null;
  llmResponse: string;
  editedResponse: string;
  llmLoading: boolean;
  imageLoading: boolean;
  generatedShareUrl: string;
  responseType: string;
  tone: string;
  onResponseTypeChange: (type: string) => void;
  onToneChange: (tone: string) => void;
  onEditedResponseChange: (response: string) => void;
  onGenerateImage: () => void;
  onCopyImage: (url: string) => void;
  onPostToTwitter: () => void;
}

export function RaidsResponsePanel({
  selectedTweet,
  llmResponse,
  editedResponse,
  llmLoading,
  imageLoading,
  generatedShareUrl,
  responseType,
  tone,
  onResponseTypeChange,
  onToneChange,
  onEditedResponseChange,
  onGenerateImage,
  onCopyImage,
  onPostToTwitter,
}: RaidsResponsePanelProps) {
  return (
    <Card className="bg-neutral-800 border-[#00D992] rounded-none h-full flex flex-col">
      <CardContent className="p-4 flex flex-col h-full overflow-y-auto custom-scrollbar">
        <div className="mb-2">
          <div className="text-xs text-gray-400 mb-1">AI Response:</div>
        </div>

        {/* Response Type and Tone Selection */}
        <div className="mb-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Select value={responseType} onValueChange={onResponseTypeChange}>
                <SelectTrigger className="h-8 text-xs bg-neutral-900 border-neutral-600 text-white focus:border-[#00D992] focus:ring-[#00D992] rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-600 text-white">
                  <SelectItem
                    value="supportive"
                    className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                  >
                    Supportive
                  </SelectItem>
                  <SelectItem
                    value="questioning"
                    className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                  >
                    Questioning
                  </SelectItem>
                  <SelectItem
                    value="humorous"
                    className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                  >
                    Humorous
                  </SelectItem>
                  <SelectItem
                    value="analytical"
                    className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                  >
                    Analytical
                  </SelectItem>
                  <SelectItem
                    value="bullish"
                    className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                  >
                    Bullish
                  </SelectItem>
                  <SelectItem
                    value="memeish"
                    className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                  >
                    Memeish
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={tone} onValueChange={onToneChange}>
                <SelectTrigger className="h-8 text-xs bg-neutral-900 border-neutral-600 text-white focus:border-[#00D992] focus:ring-[#00D992] rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-600 text-white">
                  <SelectItem
                    value="casual"
                    className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                  >
                    Casual
                  </SelectItem>
                  <SelectItem
                    value="professional"
                    className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                  >
                    Professional
                  </SelectItem>
                  <SelectItem
                    value="enthusiastic"
                    className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                  >
                    Enthusiastic
                  </SelectItem>
                  <SelectItem
                    value="moonish"
                    className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                  >
                    Moonish
                  </SelectItem>
                  <SelectItem
                    value="diamond"
                    className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                  >
                    Diamond Hands
                  </SelectItem>
                  <SelectItem
                    value="fomo"
                    className="text-gray-300 hover:bg-neutral-700 focus:bg-neutral-100"
                  >
                    FOMO
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex-grow">
          {llmLoading ? (
            <div className="w-full h-full bg-neutral-900 border border-neutral-600 rounded-none p-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#00D992]"></div>
                  <span className="text-xs text-gray-400">Generating...</span>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            </div>
          ) : !selectedTweet ? (
            <div className="w-full h-full bg-neutral-900 border border-neutral-600 rounded-none p-2">
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ) : (
            <textarea
              className="w-full h-full min-h-[200px] bg-neutral-900 border border-neutral-600 rounded-none p-2 text-white text-sm focus:border-[#00D992] focus:ring-[#00D992] resize-none"
              value={editedResponse}
              onChange={(e) => onEditedResponseChange(e.target.value)}
              placeholder="AI-generated response will appear here..."
              disabled={llmLoading}
            />
          )}
        </div>

        {/* Image Preview */}
        {editedResponse && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-400">Generated Image:</div>
              <div className="flex gap-2">
                {!generatedShareUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onGenerateImage}
                    disabled={imageLoading || !editedResponse}
                    className="text-[#00D992] border-[#00D992] hover:bg-[#00D992]/10 px-3 py-1"
                  >
                    {imageLoading ? (
                      <div className="flex items-center gap-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#00D992]"></div>
                        <span className="text-xs">Generating...</span>
                      </div>
                    ) : (
                      <span className="text-xs">🎨 Generate</span>
                    )}
                  </Button>
                )}
                {generatedShareUrl && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onGenerateImage}
                      disabled={imageLoading || !editedResponse}
                      className="text-[#00D992] hover:text-[#00C484] hover:bg-[#00D992]/10 px-2 py-1"
                    >
                      {imageLoading ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#00D992]"></div>
                      ) : (
                        <span className="text-xs">🔄</span>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onCopyImage(generatedShareUrl)}
                      className="text-blue-400 border-blue-400 hover:bg-blue-400/10 px-2 py-1"
                    >
                      <Copy className="w-2 h-2" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {generatedShareUrl ? (
              <div className="relative">
                <img
                  src={generatedShareUrl}
                  alt="Raid Response Preview"
                  className="w-full h-auto rounded-none border border-neutral-600"
                  style={{ maxHeight: "120px", objectFit: "cover" }}
                />
                <div className="absolute top-1 right-1 flex gap-1">
                  <Badge
                    variant="outline"
                    className="text-xs bg-[#00D992]/20 border-[#00D992] text-[#00D992]"
                  >
                    🚀
                  </Badge>
                </div>
              </div>
            ) : imageLoading ? (
              <div className="w-full h-20 bg-neutral-900 border border-neutral-600 rounded-none flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#00D992]"></div>
                  <span className="text-xs">Generating...</span>
                </div>
              </div>
            ) : (
              <div className="w-full h-20 bg-neutral-900 border border-neutral-600 rounded-none flex items-center justify-center text-gray-500 text-xs">
                Click "Generate" to create image
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-auto">
          <Button
            onClick={onPostToTwitter}
            className="bg-blue-500 hover:bg-blue-600 text-white flex-1 rounded-none"
            disabled={!editedResponse || llmLoading}
          >
            Post to Twitter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
