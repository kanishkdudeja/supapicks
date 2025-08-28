import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, TrendingUp, Users, Clock, DollarSign, Github } from 'lucide-react'
import { LoginForm } from '@/components/auth/login-form'

export default async function LandingPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  // If user is logged in, redirect to contests
  if (user) {
    redirect('/contests')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-full shadow-lg">
                <Trophy className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">SupaPicks</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The ultimate stock-picking contest platform. Pick your stocks, compete with other investors, 
              and see who can build the best portfolio with $1000.
            </p>
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <LoginForm />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-24 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple rules, exciting competition. Here&apos;s how to play:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Start with $1000</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Every contest participant gets $1000 to invest in their chosen security.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg">Pick Your Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Choose one security - stocks, ETFs, or commodities. Make it count!
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto bg-purple-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Lock & Watch</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  No more trades - watch your portfolio value change with market prices.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="mx-auto bg-yellow-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle className="text-lg">Win Big</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Highest portfolio value at the end wins the contest!
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-20 w-12 h-12 bg-purple-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      <div className="absolute bottom-40 right-10 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-pulse delay-500"></div>
    </div>
  )
}