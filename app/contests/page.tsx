import { Navigation } from '@/components/navigation'
import { ContestList } from '@/components/contests/contest-list'
import { requireAuth } from '@/lib/supabase/server'

export default async function ContestsPage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contests</h1>
          <p className="mt-2 text-gray-600">
            Join contests, pick your stocks, and compete with other investors!
          </p>
        </div>
        <ContestList user={user} />
      </main>
    </div>
  )
}