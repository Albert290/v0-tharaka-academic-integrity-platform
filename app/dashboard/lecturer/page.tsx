"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { LecturerSubmissions } from "@/components/dashboard/lecturer-submissions"
import { BookOpen, Users, FileCheck, AlertTriangle, TrendingUp } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent } from "@/components/ui/card"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function LecturerDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Always call useSWR before any conditional returns (Rules of Hooks)
  const { data } = useSWR("/api/submissions?role=lecturer", fetcher, {
    refreshInterval: 10000,
  })

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "lecturer")) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center">
          <Spinner className="h-8 w-8 text-gold" />
        </main>
      </div>
    )
  }

  if (!user || user.role !== "lecturer") {
    return null
  }

  const submissions = data?.submissions || []
  const totalSubmissions = submissions.length
  const reviewedCount = submissions.filter((s: any) => s.reviewed).length
  const aiCheckedCount = submissions.filter((s: any) => s.ai_check_result).length
  const aiDetectedCount = submissions.filter(
    (s: any) => s.ai_check_result?.is_ai_generated
  ).length

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-navy/5 to-background">
        {/* Dashboard Header */}
        <div className="border-b border-gold/20 bg-gradient-to-r from-navy to-navy-light">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-8 lg:px-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold shadow-lg shadow-gold/20">
              <BookOpen className="h-8 w-8 text-navy" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-primary-foreground">Lecturer Dashboard</h1>
              <p className="text-sm text-primary-foreground/80">
                Welcome, {user.name}. Review student submissions and run AI checks.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/60 bg-gradient-to-br from-card to-card/80 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/10">
                  <Users className="h-6 w-6 text-navy" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold text-foreground">{totalSubmissions}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-gradient-to-br from-card to-card/80 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                  <FileCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reviewed</p>
                  <p className="text-2xl font-bold text-foreground">{reviewedCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-gradient-to-br from-card to-card/80 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
                  <TrendingUp className="h-6 w-6 text-gold-dark" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AI Checked</p>
                  <p className="text-2xl font-bold text-foreground">{aiCheckedCount}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-gradient-to-br from-card to-card/80 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AI Detected</p>
                  <p className="text-2xl font-bold text-foreground">{aiDetectedCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <LecturerSubmissions />
        </div>
      </main>
      <Footer />
    </div>
  )
}
