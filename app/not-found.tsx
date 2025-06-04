import Link from "next/link"
import { ArrowLeft, Users } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="card-pastel !bg-slate-300 p-8">
          <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-gray-700" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-4">Profile Not Found</h1>
          <p className="text-gray-600 mb-8">The profile you're looking for doesn't exist or may have been removed.</p>

          <div className="space-y-4">
            <Link href="/kols/eliz883" className="btn-primary w-full inline-flex items-center justify-center">
              View Sample Profile
            </Link>

            <Link href="/buzz-board" className="btn-secondary w-full inline-flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Campaigns
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
