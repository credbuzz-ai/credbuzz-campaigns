import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const UpdateWalletDialog = ({ onClose }: { onClose: () => void }) => {
  const { user, refreshUser } = useUser();
  const { toast } = useToast();
  const [evmWallet, setEvmWallet] = useState(user?.evm_wallet || "");
  const [solanaWallet, setSolanaWallet] = useState(user?.solana_wallet || "");
  const [celoWallet, setCeloWallet] = useState(user?.celo_wallet || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create payload with only non-empty wallet addresses
      const payload: {
        evm_wallet?: string;
        solana_wallet?: string;
        celo_wallet?: string;
      } = {};
      if (evmWallet.trim()) {
        payload.evm_wallet = evmWallet;
      }
      if (solanaWallet.trim()) {
        payload.solana_wallet = solanaWallet;
      }
      if (celoWallet.trim()) {
        payload.celo_wallet = celoWallet;
      }

      const response = await apiClient.put("/user/update-user", payload);

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Wallet addresses updated successfully",
        });
        await refreshUser();
        onClose();
      }
    } catch (error: any) {
      // Reset input fields on error
      setEvmWallet(user?.evm_wallet || "");
      setSolanaWallet(user?.solana_wallet || "");
      setCeloWallet(user?.celo_wallet || "");
      toast({
        title: "Failed to update wallet addresses",
        description: error.response.data.detail,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="bg-neutral-900 border-neutral-700">
      <DialogHeader>
        <DialogTitle className="text-neutral-100">
          Update Wallet Addresses
        </DialogTitle>
        <DialogDescription className="text-neutral-400">
          Enter your EVM, Solana and Celo wallet addresses below.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="evmWallet"
            className="text-sm text-neutral-300 block mb-2"
          >
            EVM Wallet Address
          </label>
          <Input
            id="evmWallet"
            value={evmWallet}
            onChange={(e) => setEvmWallet(e.target.value)}
            placeholder="0x..."
            className="bg-neutral-800 border-neutral-700 text-neutral-100"
          />
        </div>
        <div>
          <label
            htmlFor="solanaWallet"
            className="text-sm text-neutral-300 block mb-2"
          >
            Solana Wallet Address
          </label>
          <Input
            id="solanaWallet"
            value={solanaWallet}
            onChange={(e) => setSolanaWallet(e.target.value)}
            placeholder="Solana address..."
            className="bg-neutral-800 border-neutral-700 text-neutral-100"
          />
        </div>
        {/* <div>
          <label
            htmlFor="celoWallet"
            className="text-sm text-neutral-300 block mb-2"
          >
            Celo Wallet Address
          </label>
          <Input
            id="celoWallet"
            value={celoWallet}
            onChange={(e) => setCeloWallet(e.target.value)}
            placeholder="Celo address..."
            className="bg-neutral-800 border-neutral-700 text-neutral-100"
          />
        </div> */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-[#00D992] text-neutral-900 hover:bg-[#00D992]/90"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Save Changes
          </Button>
        </div>
      </form>
    </DialogContent>
  );
};

export default UpdateWalletDialog;
