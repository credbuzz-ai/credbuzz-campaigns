"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useContract } from "@/hooks/useContract";
import apiClient from "@/lib/api";
import { CREDBUZZ_ACCOUNT, OWNER_SOLANA_ADDRESS } from "@/lib/constants";
import { CollaborateFormData } from "@/lib/types";
import { useConnectWallet, usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { Send, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

interface CollaborateDialogProps {
  influencerHandle: string;
  children: React.ReactNode;
}

const paymentTokens = [
  {
    value: "usdc",
    label: "USDC",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
  },
  {
    value: "usdt",
    label: "USDT",
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    decimals: 18,
  },
];

export default function CollaborateDialog({
  influencerHandle,
  children,
}: CollaborateDialogProps) {
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { toast } = useToast();
  const { connectWallet } = useConnectWallet({
    onSuccess: (data) => {
      console.log("Wallet connected:", data);
    },
    onError: (error) => {
      console.error("Error connecting wallet:", error);
    },
  });
  const { createNewCampaign, transferToken, contract } = useContract();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add refs for managing API calls and form data
  const apiCallInProgressRef = useRef(false);
  const formDataRef = useRef<CollaborateFormData>();

  const form = useForm<CollaborateFormData>({
    defaultValues: {
      campaignId: "",
      brandId: "",
      businessWalletAddr: "",
      businessSolanaAddress: "",
      influencerWalletAddr: CREDBUZZ_ACCOUNT,
      influencerSolanaAddress: OWNER_SOLANA_ADDRESS,
      status: "Pending",
      projectName: "",
      description: "",
      influencerHandle: influencerHandle,
      xAccount: "",
      website: "",
      offerEnds: "",
      promotionEnds: "",
      paymentToken: "",
      tokenAmount: 0.0001,
      chain: "Base",
      counter: 0,
      campaignType: "Targeted",
      tokenAddress: "",
      tokenDecimals: 0,
    },
  });

  // Get MetaMask wallet address
  const metamaskWallet = wallets.find(
    (wallet) => wallet.walletClientType === "metamask"
  );
  const walletAddress = metamaskWallet?.address;

  // Update business wallet address when MetaMask wallet is connected
  useEffect(() => {
    if (authenticated && walletAddress) {
      form.setValue("businessWalletAddr", walletAddress);
    }
  }, [authenticated, walletAddress, form]);

  // Check if wallet is connected
  const isWalletConnected = authenticated && walletAddress;

  // Watch the offerEnds value to set minimum for promotionEnds
  const offerEndsValue = form.watch("offerEnds");

  // Get current datetime in the correct format for datetime-local inputs
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Convert datetime-local string to Unix timestamp
  const convertToTimestamp = (datetimeLocal: string): number => {
    if (!datetimeLocal) return 0;
    return Math.floor(new Date(datetimeLocal).getTime() / 1000);
  };

  const onSubmit = async (data: CollaborateFormData) => {
    console.log("Form submitted:", data);

    if (
      !data.influencerWalletAddr ||
      !data.tokenAmount ||
      !data.promotionEnds ||
      !data.offerEnds ||
      !data.tokenAddress
    ) {
      toast({
        title: "Error",
        description: "All fields are required",
      });
      return;
    }

    setIsSubmitting(true);
    formDataRef.current = data; // Store form data for event handler

    try {
      // Convert datetime strings to timestamps (seconds)
      const promotionEndsTimestamp = convertToTimestamp(data.promotionEnds);
      const offerEndsTimestamp = convertToTimestamp(data.offerEnds);

      // Find selected token for decimals
      const selectedToken = paymentTokens.find(
        (token) => token.address === data.tokenAddress
      );
      const decimals = selectedToken?.decimals || 6;

      // Convert amount to wei
      const amountInWei = Number(
        ethers.parseUnits(data.tokenAmount.toString(), decimals)
      );

      console.log("Blockchain transaction data:", {
        influencerWallet: data.influencerWalletAddr,
        amountInWei,
        promotionEndsTimestamp,
        offerEndsTimestamp,
        tokenAddress: data.tokenAddress,
      });

      // 1. First transfer tokens to contract
      await transferToken(data.tokenAddress, amountInWei);

      // 2. Create campaign on blockchain
      const txHash = await createNewCampaign(
        data.influencerWalletAddr,
        amountInWei,
        promotionEndsTimestamp,
        offerEndsTimestamp,
        data.tokenAddress
      );

      console.log("Campaign creation transaction:", txHash);

      // Don't close dialog here - wait for contract event
      toast({
        title: "Transaction Submitted",
        description: "Waiting for blockchain confirmation...",
      });
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  // Handle campaign created event from contract
  const handleCampaignCreated = async (campaignId: string) => {
    try {
      if (!formDataRef.current) return;

      const data = formDataRef.current;

      // Convert timestamps back to original format for API
      const requestBody = {
        campaign_id: campaignId,
        brand_id: "",
        business_wallet_addr: data.businessWalletAddr,
        influencer_wallet_addr: data.influencerWalletAddr,
        influencer_solana_address: data.influencerSolanaAddress,
        status: "open",
        project_name: data.projectName,
        description: data.description,
        influencer_handle: data.influencerHandle,
        x_account: data.xAccount,
        website: data.website,
        offer_ends: data.offerEnds,
        promotion_ends: data.promotionEnds,
        payment_token: data.paymentToken,
        token_amount: data.tokenAmount,
        chain: data.chain,
        counter: 0,
        campaign_type: data.campaignType,
        token_address: data.tokenAddress,
        token_decimals: data.tokenDecimals,
      };

      console.log("Saving campaign to database:", requestBody);
      return;

      // Make API call to save campaign in database
      const response = await apiClient.post(
        "/campaign/create-campaign",
        requestBody
      );

      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Campaign created successfully!",
        });
        setOpen(false);
        // If you have a callback to refresh campaigns list, call it here
        // fetchCampaigns?.();
      } else {
        throw new Error("Failed to save campaign in database");
      }
    } catch (error) {
      console.error("API Error:", error);
      toast({
        title: "Error",
        description:
          "Campaign created on blockchain but failed to save in database",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      apiCallInProgressRef.current = false;
    }
  };

  // Listen for contract events
  useEffect(() => {
    if (!contract) return;

    const handleEvent = (campaignId: string, creatorAddress: string) => {
      console.log("CampaignCreated event:", { campaignId, creatorAddress });

      if (apiCallInProgressRef.current) return;
      apiCallInProgressRef.current = true;

      handleCampaignCreated(campaignId);
    };

    contract.on("CampaignCreated", handleEvent);

    return () => {
      contract.off("CampaignCreated", handleEvent);
      apiCallInProgressRef.current = false;
    };
  }, [contract]);

  // Update formDataRef when form data changes
  useEffect(() => {
    const formData = form.getValues();
    formDataRef.current = formData;
  }, [form.watch()]);

  // Handle connect wallet button click
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  // Wallet Connection UI Component
  const WalletConnectionUI = () => (
    <div className="text-center py-8 space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
          <Wallet className="w-8 h-8 text-[#00D992]" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-100">
          Connect Your Wallet
        </h3>
        <p className="text-gray-400 text-sm max-w-sm mx-auto">
          You need to connect your wallet to create a new campaign and
          collaborate with influencers.
        </p>
      </div>
      <div className="space-y-3">
        <Button
          onClick={handleConnectWallet}
          className="bg-[#00D992] hover:bg-[#00C080] text-gray-900 font-medium h-10 px-6 w-full"
        >
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(false)}
          className="border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-gray-200 h-10 w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );

  // Loading UI Component
  const LoadingUI = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D992] mx-auto mb-4"></div>
      <p className="text-gray-400">Loading...</p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-600 text-gray-100 shadow-2xl">
        <DialogHeader className="space-y-3 pb-6 border-b border-gray-700">
          <DialogTitle className="text-2xl font-bold text-gray-100">
            Create New Campaign
          </DialogTitle>
          <p className="text-sm text-gray-400 leading-relaxed">
            {!ready
              ? "Loading..."
              : !isWalletConnected
              ? "Connect your MetaMask wallet to create a new KOL promotion campaign"
              : "Fill in the details below to create a new KOL promotion campaign"}
          </p>
        </DialogHeader>

        {!ready ? (
          <LoadingUI />
        ) : !isWalletConnected ? (
          <WalletConnectionUI />
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pt-6"
            >
              {/* Project Name */}
              <FormField
                control={form.control}
                name="projectName"
                rules={{ required: "Project name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-sm font-medium">
                      Project Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter project name"
                        className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-[#00D992] focus:ring-1 focus:ring-[#00D992] h-9"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-sm font-medium">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe your collaboration opportunity..."
                        className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-[#00D992] focus:ring-1 focus:ring-[#00D992] min-h-[80px] resize-none"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Influencer Handle (Read-only) */}
              <FormField
                control={form.control}
                name="influencerHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-sm font-medium">
                      Select Influencer
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        className="bg-gray-700 border-gray-600 text-gray-300 cursor-not-allowed h-9"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* X Account and Website */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="xAccount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 text-sm font-medium">
                        X Account
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="@username"
                          className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-[#00D992] focus:ring-1 focus:ring-[#00D992] h-9"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 text-sm font-medium">
                        Website
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://example.com"
                          className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-[#00D992] focus:ring-1 focus:ring-[#00D992] h-9"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Offer and Promotion End Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="offerEnds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 text-sm font-medium">
                        Offer Ends
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="datetime-local"
                          className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-[#00D992] focus:ring-1 focus:ring-[#00D992] h-9"
                          min={getCurrentDateTime()}
                          value={field.value || getCurrentDateTime()}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="promotionEnds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 text-sm font-medium">
                        Promotion Ends
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="datetime-local"
                          className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-[#00D992] focus:ring-1 focus:ring-[#00D992] h-9"
                          min={offerEndsValue || getCurrentDateTime()}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Payment Token and Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="paymentToken"
                  rules={{ required: "Please select a payment token" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 text-sm font-medium">
                        Payment Token
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Find the selected token and set address and decimals
                          const selectedToken = paymentTokens.find(
                            (token) => token.value === value
                          );
                          if (selectedToken) {
                            form.setValue(
                              "tokenAddress",
                              selectedToken.address
                            );
                            form.setValue(
                              "tokenDecimals",
                              selectedToken.decimals
                            );
                          }
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-800 border-gray-600 text-gray-100 focus:border-[#00D992] focus:ring-1 focus:ring-[#00D992] h-9">
                            <SelectValue placeholder="Select token" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {paymentTokens.map((token) => (
                            <SelectItem
                              key={token.value}
                              value={token.value}
                              className="text-gray-100 focus:bg-gray-700 focus:text-gray-100"
                            >
                              {token.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tokenAmount"
                  rules={{ required: "Token amount is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300 text-sm font-medium">
                        Token Amount
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.0001"
                          min="0"
                          placeholder="0.0001"
                          className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-[#00D992] focus:ring-1 focus:ring-[#00D992] h-9"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-700 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-gray-200 h-9"
                >
                  Cancel
                </Button>
                {!isWalletConnected ? (
                  <Button
                    type="button"
                    onClick={handleConnectWallet}
                    className="bg-[#00D992] hover:bg-[#00C080] text-gray-900 font-medium h-9 px-6"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect MetaMask
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#00D992] hover:bg-[#00C080] text-gray-900 font-medium h-9 px-6"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Creating..." : "Create Campaign"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
