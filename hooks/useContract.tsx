import { useToast } from "@/hooks/use-toast";
import { useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import IERC20Abi from "../abis/IERC20.json";
import MarketplaceAbi from "../abis/Marketplace.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const GAS_LIMIT = 6666660;

export const useContract = () => {
  const { toast } = useToast();
  const { ready, wallets } = useWallets();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [walletProvider, setWalletProvider] =
    useState<ethers.BrowserProvider | null>(null);

  const initContract = async () => {
    try {
      if (!walletProvider) {
        console.warn("Provider not found for base chain.");
        return;
      }
      setIsInitializing(true);

      const contractSigner = await walletProvider?.getSigner();

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        MarketplaceAbi,
        contractSigner
      );
      setContract(contractInstance);

      setIsConnected(true);
    } catch (error) {
      console.error("Error initializing contract:", error);
      setIsConnected(false);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    const getProvider = async () => {
      if (wallets.length > 0) {
        const provider = await wallets[0].getEthereumProvider();
        setWalletProvider(new ethers.BrowserProvider(provider));
      }
    };
    getProvider();
  }, [ready, wallets]);

  useEffect(() => {
    if (walletProvider && ready) {
      initContract();
    }
  }, [walletProvider]);

  // Campaign Functions
  const createNewCampaign = async (
    selectedInfluencer: string,
    offeringAmount: number,
    promotionEndsIn: number,
    offerEndsIn: number,
    tokenAddress: string
  ) => {
    if (
      !selectedInfluencer ||
      !offeringAmount ||
      !promotionEndsIn ||
      !offerEndsIn ||
      !tokenAddress
    ) {
      toast({
        title: "All fields are required",
        description: "Please fill all the fields to create a campaign",
      });
      return;
    }

    try {
      if (!contract) throw new Error("Contract not initialized");
      const tx = await contract.createNewCampaign(
        selectedInfluencer,
        offeringAmount,
        promotionEndsIn,
        offerEndsIn,
        tokenAddress,
        { gasLimit: GAS_LIMIT }
      );
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error creating campaign:", error);
      throw error;
    }
  };

  const createOpenCampaign = async (
    promotionEndsIn: number,
    poolAmount: number,
    tokenAddress: string
  ) => {
    if (!promotionEndsIn || !poolAmount || !tokenAddress) {
      toast({
        title: "All fields are required",
        description: "Please fill all the fields to create an open campaign",
      });
      return;
    }

    try {
      if (!contract) throw new Error("Contract not initialized");
      const tx = await contract.createOpenCampaign(
        promotionEndsIn,
        poolAmount,
        tokenAddress,
        { gasLimit: GAS_LIMIT }
      );
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error creating open campaign:", error);
      throw error;
    }
  };

  const updateCampaign = async (
    campaignId: string,
    selectedInfluencer: string,
    promotionEndsIn: number,
    offerEndsIn: number,
    newAmount: number
  ) => {
    if (
      !campaignId ||
      !selectedInfluencer ||
      !newAmount ||
      !promotionEndsIn ||
      !offerEndsIn
    ) {
      toast({
        title: "All fields are required",
        description: "Please fill all the fields to update a campaign",
      });
      return;
    }
    try {
      if (!contract) throw new Error("Contract not initialized");
      const tx = await contract.updateCampaign(
        campaignId,
        selectedInfluencer,
        promotionEndsIn,
        offerEndsIn,
        newAmount,
        { gasLimit: GAS_LIMIT }
      );
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error updating campaign:", error);
      throw error;
    }
  };

  const updateOpenCampaign = async (
    campaignId: string,
    promotionEndsIn: number,
    poolAmount: number,
    status: number // 1 for FULFILLED, 2 for DISCARDED
  ) => {
    if (!campaignId || !promotionEndsIn || !poolAmount) {
      toast({
        title: "All fields are required",
        description: "Please fill all the fields to update an open campaign",
      });
      return;
    }
    try {
      if (!contract) throw new Error("Contract not initialized");
      const tx = await contract.updateOpenCampaign(
        campaignId,
        promotionEndsIn,
        poolAmount,
        status,
        { gasLimit: GAS_LIMIT }
      );
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Error updating open campaign:", error);
      throw error;
    }
  };

  // Owner Functions
  const acceptProjectCampaign = async (campaignId: string) => {
    if (!campaignId) {
      toast({
        title: "Campaign ID is required",
        description: "Please fill all the fields to accept a campaign",
      });
      return;
    }

    try {
      if (!contract) throw new Error("Contract not initialized");
      const tx = await contract.acceptProjectCampaign(campaignId, {
        gasLimit: GAS_LIMIT,
      });
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Error accepting campaign:", error);
      throw error;
    }
  };

  const fulfilProjectCampaign = async (campaignId: string) => {
    if (!campaignId) {
      toast({
        title: "Campaign ID is required",
        description: "Please fill all the fields to fulfil a campaign",
      });
      return;
    }

    try {
      if (!contract) throw new Error("Contract not initialized");
      const tx = await contract.fulfilProjectCampaign(campaignId, {
        gasLimit: GAS_LIMIT,
      });
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Error fulfilling campaign:", error);
      throw error;
    }
  };

  const discardCampaign = async (campaignId: string) => {
    if (!campaignId) {
      toast({
        title: "Campaign ID is required",
        description: "Please fill all the fields to discard a campaign",
      });
      return;
    }

    try {
      if (!contract) throw new Error("Contract not initialized");
      const tx = await contract.discardCampaign(campaignId, {
        gasLimit: GAS_LIMIT,
      });
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Error discarding campaign:", error);
      throw error;
    }
  };
  // Modify transfer function to handle different tokens
  const transferToken = async (tokenAddress: string, amount: number) => {
    if (!amount || !tokenAddress) {
      toast({
        title: "Amount and token address are required",
        description: "Please provide all required fields for token transfer",
      });
      return;
    }
    try {
      if (!contract) throw new Error("Contract not initialized");
      const contractSigner = await walletProvider?.getSigner();
      const tokenContract = new ethers.Contract(
        tokenAddress,
        IERC20Abi,
        contractSigner
      );
      const tx = await tokenContract.transfer(CONTRACT_ADDRESS, amount);
      await tx.wait();
      return tx;
    } catch (error) {
      console.error("Error transferring tokens:", error);
      throw error;
    }
  };

  return {
    contract,
    isConnected,
    isInitializing,
    walletProvider,
    // contract functions
    initContract,
    // Campaign Functions
    createNewCampaign,
    createOpenCampaign,
    updateCampaign,
    updateOpenCampaign,
    // Owner Functions
    acceptProjectCampaign,
    fulfilProjectCampaign,
    discardCampaign,
    transferToken,
  };
};
