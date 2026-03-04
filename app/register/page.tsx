"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Loader2, GraduationCap, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [role, setRole] = useState<"student" | "lecturer">("student")
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const roleParam = searchParams.get("role")
    if (roleParam === "lecturer" || roleParam === "student") {
      setRole(roleParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    if (role === "student") {
      if (!registrationNumber) {
        toast.error("Registration number is required for students")
        return
      }
      if (!phoneNumber) {
        toast.error("Phone number is required for students")
        return
      }
    }

    setLoading(true)

    const result = await register(name, email, password, role, registrationNumber, phoneNumber)

    if (result.success && result.user) {
      toast.success("Registration successful!")
      // Redirect to role-specific dashboard
      const dashboardPath = result.user.role === "lecturer" ? "/dashboard/lecturer" : "/dashboard/student"
      setTimeout(() => {
        router.push(dashboardPath)
        router.refresh()
      }, 100)
    } else {
      toast.error(result.error || "Registration failed")
    }

    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md border-border/60">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-navy">
          <Shield className="h-7 w-7 text-gold" />
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">Create Account</CardTitle>
        <CardDescription>Register for a TharakaGuard account</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Role selector */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
              role === "student"
                ? "border-gold bg-gold/10 text-foreground"
                : "border-border text-muted-foreground hover:border-gold/30"
            }`}
          >
            <GraduationCap className={`h-6 w-6 ${role === "student" ? "text-gold" : ""}`} />
            <span className="text-sm font-medium">Student</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("lecturer")}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
              role === "lecturer"
                ? "border-gold bg-gold/10 text-foreground"
                : "border-border text-muted-foreground hover:border-gold/30"
            }`}
          >
            <BookOpen className={`h-6 w-6 ${role === "lecturer" ? "text-gold" : ""}`} />
            <span className="text-sm font-medium">Lecturer</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@tharaka.ac.ke"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {role === "student" && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  type="text"
                  placeholder="e.g., TU/2024/001"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="e.g., +254 700 000 000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="mt-2 bg-navy text-primary-foreground hover:bg-navy-light"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              `Register as ${role === "student" ? "Student" : "Lecturer"}`
            )}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-gold hover:text-gold-dark">
            Sign in here
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex flex-1 items-center justify-center bg-background px-4 py-16">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8 text-gold" />
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
