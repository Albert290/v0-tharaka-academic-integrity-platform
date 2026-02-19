"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SubmissionForm } from "@/components/dashboard/submission-form"
import { SubmissionHistory } from "@/components/dashboard/submission-history"
import { GraduationCap } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export default function StudentDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "student")) {
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

  if (!user || user.role !== "student") {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        {/* Dashboard Header */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-6 lg:px-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy">
              <GraduationCap className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Student Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {user.name}. Submit your CATs and track their status.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-5">
            {/* Submission Form */}
            <div className="lg:col-span-2">
              <SubmissionForm />
            </div>
            {/* Submission History */}
            <div className="lg:col-span-3">
              <SubmissionHistory />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
