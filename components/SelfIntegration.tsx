import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { SelfAppBuilder, SelfQRcodeWrapper } from "@selfxyz/qrcode";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

// Generate a unique user ID
const userId = uuidv4();

// Create a SelfApp instance using the builder pattern
const selfApp = new SelfAppBuilder({
  appName: "TrendSage",
  scope: "trendsage-application",
  endpoint: "https://api.cred.buzz/node/verify",
  endpointType: "https",
  logoBase64: "/logo-green.svg", // Optional, accepts also PNG url
  userId,
  disclosures: {
    minimumAge: 18,
    ofac: true,
  },
}).build();

const SelfIntegration = () => {
  const { user } = useUser();
  const { toast } = useToast();

  const [verificationData, setVerificationData] = useState<{
    credentialSubject: {
      name?: string;
      nationality?: string;
      date_of_birth?: string;
      issuing_state?: string;
      passport_number?: string;
      gender?: string;
      expiry_date?: string;
    };
    verificationOptions: {
      minimumAge?: number;
      ofac?: boolean;
      nationality?: boolean;
    };
    verifiedAt: string;
    status: string;
  } | null>(null);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col gap-2 mb-8">
          <h2 className="text-2xl font-semibold text-neutral-100">
            Identity Verification
          </h2>
          <p className="text-neutral-400">
            Scan the QR code below to verify your identity
          </p>
        </div>

        {!verificationData ? (
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex justify-center">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                size={200}
                onSuccess={(response?: {
                  status?: string;
                  credentialSubject?: Record<string, unknown>;
                  verificationOptions?: Record<string, unknown>;
                }) => {
                  if (response?.status === "success") {
                    setVerificationData({
                      credentialSubject: response.credentialSubject as {
                        name?: string;
                        nationality?: string;
                        date_of_birth?: string;
                        issuing_state?: string;
                        passport_number?: string;
                        gender?: string;
                        expiry_date?: string;
                      },
                      verificationOptions: response.verificationOptions as {
                        minimumAge?: number;
                        ofac?: boolean;
                        nationality?: boolean;
                      },
                      verifiedAt: new Date().toISOString(),
                      status: response.status,
                    });
                    toast({
                      title: "Verification Successful",
                      description:
                        "Your identity has been verified successfully",
                    });
                  }
                }}
                onError={() => {
                  toast({
                    title: "Verification Failed",
                    description: "Please try again",
                  });
                }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-medium text-ai-dark">
                  Identity Verified
                </h3>
                <p className="text-gray-500">
                  Verified on{" "}
                  {new Date(verificationData.verifiedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-medium text-green-800">Age Verified</p>
                  <p className="text-sm text-green-700">
                    Over {verificationData.verificationOptions.minimumAge || 18}{" "}
                    years
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-medium text-blue-800">OFAC Clear</p>
                  <p className="text-sm text-blue-700">Not on sanctions list</p>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="font-medium text-purple-800">Nationality</p>
                  <p className="text-sm text-purple-700">
                    {verificationData.credentialSubject.nationality !==
                    "Not disclosed"
                      ? verificationData.credentialSubject.nationality
                      : "Verified"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setVerificationData(null)}
                className="w-full mt-4 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Re-verify Identity
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelfIntegration;
