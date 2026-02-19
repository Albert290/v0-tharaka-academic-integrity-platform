"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { LecturerSubmissions } from "@/components/dashboard/lecturer-submissions"
import { BookOpen } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

export default function LecturerDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        {/* Dashboard Header */}
        <div className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-6 lg:px-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy">
              <BookOpen className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Lecturer Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {user.name}. Review student submissions and run AI checks.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <LecturerSubmissions />
        </div>
      </main>
      <Footer />
    </div>
  )
}
