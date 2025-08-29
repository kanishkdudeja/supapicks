'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@/lib/types'
import { Contest, ContestWithParticipants } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Trophy } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface ContestListProps {
  user: User
}

export function ContestList({ user }: ContestListProps) {
  const [contests, setContests] = useState<ContestWithParticipants[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all')

  const supabase = createClient()

  useEffect(() => {
    fetchContests()
  }, [])

  const fetchContests = async () => {
    try {
      // Fetch contests with participant count and user's participation status
      const { data: contestsData, error: contestsError } = await supabase
        .from('contests')
        .select('*')
        .order('created_at', { ascending: false })

      if (contestsError) throw contestsError

      // Fetch user's picks for all contests
      const { data: picksData, error: picksError } = await supabase
        .from('picks')
        .select('*')
        .eq('user_id', user.id)

      if (picksError) throw picksError

      // Fetch participant counts for each contest
      const contestsWithData = await Promise.all(
        contestsData.map(async (contest) => {
          const { count: participantCount } = await supabase
            .from('picks')
            .select('*', { count: 'exact', head: true })
            .eq('contest_id', contest.id)

          const userPick = picksData.find(pick => pick.contest_id === contest.id)

          return {
            ...contest,
            participant_count: participantCount || 0,
            is_user_joined: !!userPick,
            user_pick: userPick
          }
        })
      )

      setContests(contestsWithData)
    } catch (error) {
      console.error('Error fetching contests:', error)
    } finally {
      setLoading(false)
    }
  }

  const joinContest = async (contestId: string) => {
    // Navigate to contest detail page where user can pick stocks
    window.location.href = `/contests/${contestId}`
  }

  const getContestStatus = (contest: Contest) => {
    const now = new Date()
    const startTime = new Date(contest.start_time)
    const endTime = new Date(contest.end_time)

    if (now < startTime) {
      return { status: 'upcoming', color: 'bg-blue-100 text-blue-800' }
    } else if (now >= startTime && now <= endTime) {
      return { status: 'active', color: 'bg-green-100 text-green-800' }
    } else {
      return { status: 'ended', color: 'bg-gray-100 text-gray-800' }
    }
  }

  // Filter contests based on active tab
  const filteredContests = activeTab === 'all' 
    ? contests 
    : contests.filter(contest => contest.has_user_joined)

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Tab Toggle Skeleton */}
        <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg w-fit">
          <div className="w-20 h-10 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="w-20 h-10 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (contests.length === 0) {
    return (
      <div className="space-y-6">
        {/* Tab Toggle */}
        <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Contests
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'my'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Contests
          </button>
        </div>

        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No contests yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating the first contest in Supabase!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Toggle */}
      <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Contests
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'my'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Contests
        </button>
      </div>

      {/* Contest Count */}
      <div className="text-sm text-gray-600">
        {activeTab === 'all' 
          ? `Showing ${filteredContests.length} contest${filteredContests.length !== 1 ? 's' : ''}`
          : `You've joined ${filteredContests.length} contest${filteredContests.length !== 1 ? 's' : ''}`
        }
      </div>

      {/* Contests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContests.map((contest) => {
          const status = getContestStatus(contest)
          const canJoin = !contest.has_user_joined && (status.status === 'upcoming' || status.status === 'active')

          return (
            <Card key={contest.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link href={`/contests/${contest.id}`} className="block hover:opacity-80 transition-opacity">
                      <CardTitle className="text-lg">{contest.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {contest.description || 'No description provided'}
                      </CardDescription>
                    </Link>
                  </div>
                  <Badge className={status.color}>
                    {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {format(new Date(contest.start_time), 'MMM d, yyyy')} - {format(new Date(contest.end_time), 'MMM d, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{contest.participant_count} participants</span>
                  </div>

                  {contest.has_user_joined && contest.user_pick && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <div className="text-sm font-medium text-blue-900">
                        Your Pick: {contest.user_pick.ticker}
                      </div>
                      <div className="text-xs text-blue-700">
                        {contest.user_pick.quantity} shares @ ${contest.user_pick.buy_price}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    {canJoin && (
                      <Button
                        onClick={() => joinContest(contest.id)}
                        className="w-full"
                      >
                        {status.status === 'upcoming' ? 'View & Join' : 'Join Active Contest'}
                      </Button>
                    )}
                    
                    {contest.has_user_joined && (
                      <Button variant="outline" className="w-full" disabled>
                        Already Joined
                      </Button>
                    )}
                    
                    {status.status === 'ended' && (
                      <Button variant="outline" className="w-full" disabled>
                        Contest Ended
                      </Button>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State for My Contests */}
      {activeTab === 'my' && filteredContests.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No contests joined yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Join your first contest to get started!
          </p>
          <Button 
            onClick={() => setActiveTab('all')} 
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Browse Contests
          </Button>
        </div>
      )}
    </div>
  )
}
