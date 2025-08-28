import { notFound } from 'next/navigation'
import { Navigation } from '@/components/navigation'
import { ContestDetail } from '@/components/contests/contest-detail'
import { createClient, requireAuth } from '@/lib/supabase/server'

interface ContestPageProps {
  params: {
    id: string
  }
}

export default async function ContestPage({ params }: ContestPageProps) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: contest, error } = await supabase
    .from('contests')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !contest) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContestDetail contest={contest} user={user} />
      </main>
    </div>
  )
}
