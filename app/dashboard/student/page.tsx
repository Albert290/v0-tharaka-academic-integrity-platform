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
      <main className="flex-1 bg-gradient-to-b from-navy/5 via-background to-background">
        {/* Dashboard Header */}
        <div className="border-b border-gold/20 bg-gradient-to-r from-navy to-navy-light shadow-lg">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-8 sm:gap-4 sm:px-6 lg:px-8">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gold shadow-lg shadow-gold/20">
              <GraduationCap className="h-7 w-7 sm:h-8 sm:w-8 text-navy" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-primary-foreground">Student Dashboard</h1>
              <p className="text-xs sm:text-sm text-primary-foreground/80">
                Welcome, {user.name}. Submit your CATs and track their status.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-5">
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
