export interface CollaborateFormData {
  campaignId: string;
  influencerUserId?: string;
  brandId?: string;
  businessWalletAddr?: string;
  businessSolanaAddress?: string;
  influencerWalletAddr?: string;
  influencerSolanaAddress?: string;
  status?: string;
  projectName?: string;
  description?: string;
  influencerHandle?: string;
  xAccount?: string;
  website?: string;
  offerEnds?: string;
  promotionEnds?: string;
  paymentToken?: string;
  tokenAmount?: number;
  poolAmount?: number;
  tweetUrl?: string;
  chain?: "Base" | "Solana";
  counter?: number;
  campaignType?: "Public" | "Targeted";
  tokenAddress?: string;
  tokenDecimals?: number;
}
