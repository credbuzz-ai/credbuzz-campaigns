"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface CollaborateFormData {
  projectName: string;
  description: string;
  influencerHandle: string;
  xAccount: string;
  website: string;
  offerEnds: string;
  promotionEnds: string;
  paymentToken: string;
  tokenAmount: string;
}

interface CollaborateDialogProps {
  influencerHandle: string;
  children: React.ReactNode;
}

const paymentTokens = [
  { value: "usdc", label: "USDC" },
  { value: "usdt", label: "USDT" },
  { value: "eth", label: "ETH" },
  { value: "btc", label: "BTC" },
  { value: "matic", label: "MATIC" },
];

export default function CollaborateDialog({ influencerHandle, children }: CollaborateDialogProps) {
  const [open, setOpen] = useState(false);
  
  const form = useForm<CollaborateFormData>({
    defaultValues: {
      projectName: "",
      description: "",
      influencerHandle: influencerHandle,
      xAccount: "",
      website: "https://example.com",
      offerEnds: "",
      promotionEnds: "",
      paymentToken: "",
      tokenAmount: "0.0001",
    },
  });

  const onSubmit = (data: CollaborateFormData) => {
    console.log("Form submitted:", data);
    // TODO: Add API call to submit collaboration request
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-600 text-gray-100 shadow-2xl">
        <DialogHeader className="space-y-3 pb-6 border-b border-gray-700">
          <DialogTitle className="text-2xl font-bold text-gray-100">
            Create New Campaign
          </DialogTitle>
          <p className="text-sm text-gray-400 leading-relaxed">
            Fill in the details below to create a new KOL promotion campaign
          </p>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-6">
            {/* Project Name */}
            <FormField
              control={form.control}
              name="projectName"
              rules={{ required: "Project name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300 text-sm font-medium">Project Name</FormLabel>
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
                  <FormLabel className="text-gray-300 text-sm font-medium">Description</FormLabel>
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
                  <FormLabel className="text-gray-300 text-sm font-medium">Select Influencer</FormLabel>
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
                    <FormLabel className="text-gray-300 text-sm font-medium">X Account</FormLabel>
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
                    <FormLabel className="text-gray-300 text-sm font-medium">Website</FormLabel>
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
                    <FormLabel className="text-gray-300 text-sm font-medium">Offer Ends</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="datetime-local"
                        className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-[#00D992] focus:ring-1 focus:ring-[#00D992] h-9"
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
                    <FormLabel className="text-gray-300 text-sm font-medium">Promotion Ends</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="datetime-local"
                        className="bg-gray-800 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-[#00D992] focus:ring-1 focus:ring-[#00D992] h-9"
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
                    <FormLabel className="text-gray-300 text-sm font-medium">Payment Token</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    <FormLabel className="text-gray-300 text-sm font-medium">Token Amount</FormLabel>
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
              <Button
                type="submit"
                className="bg-[#00D992] hover:bg-[#00C080] text-gray-900 font-medium h-9 px-6"
              >
                <Send className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 