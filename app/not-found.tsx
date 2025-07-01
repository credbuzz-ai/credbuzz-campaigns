import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-gray-300" />
          </div>

          <h1 className="text-2xl font-bold text-gray-100 mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-400 mb-8">
            The Page you're looking for doesn't exist or may have been removed.
          </p>

          <div className="space-y-4">
            <Link
              href="/sage-campaigns"
              className="btn-secondary w-full inline-flex items-center justify-center bg-[#00D992] text-gray-900 hover:bg-[#00D992]/90"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Campaigns
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
