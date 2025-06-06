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
import { useSignup } from "@/contexts/CreatorSignupContext";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useContract } from "@/hooks/useContract";
import { usePrivyDatabaseSync } from "@/hooks/usePrivyDatabaseSync";
import apiClient from "@/lib/api";
import { CREDBUZZ_ACCOUNT, OWNER_SOLANA_ADDRESS } from "@/lib/constants";
import { CollaborateFormData, Influencer, paymentTokens } from "@/lib/types";
import { useConnectWallet, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { Loader2, Send, Wallet } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

interface CollaborateDialogProps {
  influencerHandle: string;
  children: React.ReactNode;
}

export default function CollaborateDialog({
  influencerHandle,
  children,
}: CollaborateDialogProps) {
  // Use the new Privy database sync hook
  const {
    ready,
    authenticated,
    user: privyUser,
    login,
    isProcessing,
    getDisplayName,
    getTwitterHandle,
  } = usePrivyDatabaseSync();

  // Get user data from UserContext
  const { user, fetchUserData } = useUser();

  // Add signup context for creator temp signup
  const { fastSignup } = useSignup();

  const { wallets } = useWallets();
  const { toast } = useToast();
  const { connectWallet } = useConnectWallet({
    onSuccess: (data) => {},
    onError: (error) => {
      console.error("Error connecting wallet:", error);
    },
  });
  const { createNewCampaign, transferToken, contract } = useContract();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add state for influencer data
  const [influencerData, setInfluencerData] = useState<Influencer | null>(null);
  const [isLoadingInfluencer, setIsLoadingInfluencer] = useState(false);

  // Add refs for managing API calls and form data
  const apiCallInProgressRef = useRef(false);
  const formDataRef = useRef<CollaborateFormData | null>(null);

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

  // Function to handle creator temp signup (similar to CreateCampaignForm)
  const handleCreatorTempSignup = useCallback(
    async (username: string) => {
      try {
        setIsLoadingInfluencer(true);
        const userId = await fastSignup(username, "creator");

        if (userId) {
          // Fetch the newly created influencer data
          const response = await apiClient.get("/user/list-influencers");
          const influencers = response.data.result;

          const newInfluencer = influencers.find(
            (inf: Influencer) =>
              inf.twitter_handle === username.replace("@", "")
          );

          if (newInfluencer) {
            setInfluencerData(newInfluencer);
            toast({
              title: "Influencer Added",
              description: `@${username} has been added to the platform`,
            });
          }
        }
      } catch (error) {
        console.error("Error signing up creator:", error);
        toast({
          title: "Error",
          description: "Failed to add influencer to platform",
          variant: "destructive",
        });
      } finally {
        setIsLoadingInfluencer(false);
      }
    },
    [fastSignup, toast]
  );

  // Function to fetch or create influencer
  const fetchOrCreateInfluencer = useCallback(async () => {
    if (!influencerHandle) return;

    setIsLoadingInfluencer(true);
    try {
      // First, try to fetch existing influencers
      const response = await apiClient.get("/user/list-influencers");
      const influencers = response.data.result;

      const cleanHandle = influencerHandle.replace("@", "");
      const existingInfluencer = influencers.find(
        (inf: Influencer) => inf.twitter_handle === cleanHandle
      );

      if (existingInfluencer) {
        setInfluencerData(existingInfluencer);
      } else {
        // Influencer doesn't exist, create them
        await handleCreatorTempSignup(cleanHandle);
      }
    } catch (error) {
      console.error("Error fetching influencers:", error);
      toast({
        title: "Error",
        description: "Failed to load influencer data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInfluencer(false);
    }
  }, [influencerHandle, handleCreatorTempSignup, toast]);

  // Fetch influencer data when dialog opens and user is authenticated
  useEffect(() => {
    if (open && authenticated && !isProcessing) {
      fetchOrCreateInfluencer();
    }
  }, [open, authenticated, isProcessing, fetchOrCreateInfluencer]);

  // Update business wallet address when MetaMask wallet is connected
  useEffect(() => {
    if (authenticated && walletAddress) {
      form.setValue("businessWalletAddr", walletAddress);
    }
  }, [authenticated, walletAddress, form]);

  // Update X account when user is authenticated
  useEffect(() => {
    const twitterHandle = getTwitterHandle();
    if (twitterHandle) {
      form.setValue("xAccount", `@${twitterHandle}`);
    }
  }, [user, getTwitterHandle, form]);

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
    console.log("Form submission data:", data);
    console.log("Influencer data:", influencerData);

    // Set influencer wallet address if not already set
    const influencerWalletAddr =
      influencerData?.wallet_addr ||
      data.influencerWalletAddr ||
      CREDBUZZ_ACCOUNT;

    // Validate required fields with specific error messages
    const missingFields = [];

    if (!influencerWalletAddr) {
      missingFields.push("Influencer wallet address");
    }
    if (!data.tokenAmount || data.tokenAmount <= 0) {
      missingFields.push("Token amount");
    }
    if (!data.promotionEnds) {
      missingFields.push("Promotion end date");
    }
    if (!data.offerEnds) {
      missingFields.push("Offer end date");
    }
    if (!data.tokenAddress) {
      missingFields.push("Payment token");
    }
    if (!data.projectName) {
      missingFields.push("Project name");
    }

    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (!influencerData) {
      toast({
        title: "Error",
        description: "Influencer data not loaded. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Update form data with correct influencer wallet address
    const updatedData = {
      ...data,
      influencerWalletAddr,
    };

    formDataRef.current = updatedData; // Store updated form data for event handler

    try {
      // Convert datetime strings to timestamps (seconds)
      const promotionEndsTimestamp = convertToTimestamp(
        data.promotionEnds || ""
      );
      const offerEndsTimestamp = convertToTimestamp(data.offerEnds || "");

      // Find selected token for decimals
      const selectedToken = paymentTokens.find(
        (token) => token.address === data.tokenAddress
      );
      const decimals = selectedToken?.decimals || 6;

      // Convert amount to wei
      const amountInWei = Number(
        ethers.parseUnits(data.tokenAmount?.toString() || "0", decimals)
      );

      // 1. First transfer tokens to contract
      await transferToken(data.tokenAddress || "", amountInWei);

      // 2. Create campaign on blockchain
      const txHash = await createNewCampaign(
        influencerWalletAddr,
        amountInWei,
        promotionEndsTimestamp,
        offerEndsTimestamp,
        data.tokenAddress || ""
      );

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
      if (!formDataRef.current || !influencerData) return;

      const data = formDataRef.current;

      // Convert datetime strings to timestamps for API
      const offerEndTimestamp = convertToTimestamp(data.offerEnds || "");
      const promotionEndTimestamp = convertToTimestamp(
        data.promotionEnds || ""
      );

      // Build request body to match API schema exactly
      const requestBody = {
        campaign_id: campaignId,
        brand_id: user?.brand_id || 0,
        influencer_user_id: influencerData.user_id, // Use the actual influencer user_id
        influencer_wallet_addr:
          influencerData.wallet_addr || data.influencerWalletAddr,
        influencer_solana_address:
          influencerData.solana_address || data.influencerSolanaAddress,
        business_solana_address: data.businessSolanaAddress || "",
        project_name: data.projectName,
        description: data.description,
        x_author_handle: getTwitterHandle(),
        website: data.website,
        amount: data.tokenAmount,
        status: "open",
        offer_end_date: offerEndTimestamp,
        promotion_end_date: promotionEndTimestamp,
        chain: data.chain,
        counter: 0,
        token_address: data.tokenAddress,
        token_decimals: data.tokenDecimals,
      };

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
        toast({
          title: "Error",
          description: "Failed to save campaign in database",
          variant: "destructive",
        });
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
    const subscription = form.watch((data) => {
      formDataRef.current = data as CollaborateFormData;
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    fetchUserData();
  }, []);

  // Handle connect wallet button click
  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  // Authentication Connection UI Component
  const AuthConnectionUI = () => (
    <div className="text-center py-8 space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-[#00D992]"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-100">
          Connect Your X Account
        </h3>
        <p className="text-gray-400 text-sm max-w-sm mx-auto">
          You need to connect your X account to create campaigns and collaborate
          with influencers.
        </p>
      </div>
      <div className="space-y-3">
        <Button
          onClick={login}
          disabled={isProcessing}
          className="bg-[#00D992] hover:bg-[#00C080] text-gray-900 font-medium h-10 px-6 w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Setting up account...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Connect X Account
            </>
          )}
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
          Welcome, {getDisplayName()}! Now connect your MetaMask wallet to
          create campaigns.
        </p>
      </div>
      <div className="space-y-3">
        <Button
          onClick={handleConnectWallet}
          className="bg-[#00D992] hover:bg-[#00C080] text-gray-900 font-medium h-10 px-6 w-full"
        >
          <Wallet className="h-4 w-4 mr-2" />
          Connect MetaMask
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
      <p className="text-gray-400">
        {isLoadingInfluencer ? "Setting up influencer..." : "Loading..."}
      </p>
    </div>
  );

  // Also update the form to ensure default values are set properly
  useEffect(() => {
    if (influencerData) {
      // Set influencer wallet address when influencer data is loaded
      form.setValue(
        "influencerWalletAddr",
        influencerData.wallet_addr || CREDBUZZ_ACCOUNT
      );
      form.setValue(
        "influencerSolanaAddress",
        influencerData.solana_address || OWNER_SOLANA_ADDRESS
      );
    }
  }, [influencerData, form]);

  // Set default dates when form loads
  useEffect(() => {
    const currentTime = getCurrentDateTime();
    if (!form.getValues("offerEnds")) {
      form.setValue("offerEnds", currentTime);
    }
  }, [form]);

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
              : !authenticated
              ? "Connect your X account to create campaigns"
              : !isWalletConnected
              ? "Connect your MetaMask wallet to proceed"
              : isLoadingInfluencer
              ? "Setting up influencer account..."
              : "Fill in the details below to create a new KOL promotion campaign"}
          </p>
        </DialogHeader>

        {!ready || isLoadingInfluencer ? (
          <LoadingUI />
        ) : !authenticated ? (
          <AuthConnectionUI />
        ) : !isWalletConnected ? (
          <WalletConnectionUI />
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 pt-6"
            >
              {/* Influencer Handle (Read-only) - Show actual influencer info */}
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
                        value={
                          influencerData
                            ? `@${influencerData.twitter_handle}`
                            : field.value
                        }
                        disabled
                        className="bg-gray-700 border-gray-600 text-gray-300 cursor-not-allowed h-9"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

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
                  rules={{ required: "Offer end date is required" }}
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
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="promotionEnds"
                  rules={{ required: "Promotion end date is required" }}
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
                            console.log(
                              "Setting token address:",
                              selectedToken.address
                            );
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
                        value={field.value}
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
                  rules={{
                    required: "Token amount is required",
                    min: { value: 0.0001, message: "Minimum amount is 0.0001" },
                  }}
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
                          min="0.0001"
                          placeholder="0.0001"
                          className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-[#00D992] focus:ring-1 focus:ring-[#00D992] h-9"
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            field.onChange(value || 0.0001);
                          }}
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
                <Button
                  type="submit"
                  disabled={isSubmitting || !influencerData}
                  className="bg-[#00D992] hover:bg-[#00C080] text-gray-900 font-medium h-9 px-6"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Creating..." : "Create Campaign"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
