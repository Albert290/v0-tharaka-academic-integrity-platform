"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Shield, Menu, X, LogOut, LayoutDashboard } from "lucide-react"

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const dashboardLink = user?.role === "lecturer" ? "/dashboard/lecturer" : "/dashboard/student"

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-navy text-primary-foreground backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold">
            <Shield className="h-5 w-5 text-navy" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight tracking-wide text-gold">
              TharakaGuard
            </span>
            <span className="text-[10px] leading-tight text-primary-foreground/60">
              Academic Integrity
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-navy-light hover:text-gold"
          >
            Home
          </Link>
          <Link
            href="/deepfake"
            className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-navy-light hover:text-gold"
          >
            Deepfake Detection
          </Link>
          <Link
            href="/about"
            className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-navy-light hover:text-gold"
          >
            About
          </Link>
          {user ? (
            <>
              <Link
                href={dashboardLink}
                className="rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/80 transition-colors hover:bg-navy-light hover:text-gold"
              >
                <span className="flex items-center gap-1.5">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </span>
              </Link>
              <div className="ml-2 flex items-center gap-2 border-l border-primary-foreground/20 pl-3">
                <span className="text-xs text-primary-foreground/60">
                  {user.name} ({user.role})
                </span>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-primary-foreground/80 hover:bg-navy-light hover:text-gold"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <div className="ml-2 flex items-center gap-2 border-l border-primary-foreground/20 pl-3">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-primary-foreground/80 hover:bg-navy-light hover:text-gold"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="h-8 bg-gold text-navy hover:bg-gold-light"
                >
                  Register
                </Button>
              </Link>
            </div>
          )}
        </nav>

        <button
          className="rounded-md p-2 text-primary-foreground/80 transition-colors hover:bg-navy-light md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-primary-foreground/10 bg-navy md:hidden">
          <nav className="flex flex-col px-4 py-3 gap-1">
            <Link
              href="/"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-primary-foreground/80 hover:bg-navy-light hover:text-gold"
              onClick={() => setMobileOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/deepfake"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-primary-foreground/80 hover:bg-navy-light hover:text-gold"
              onClick={() => setMobileOpen(false)}
            >
              Deepfake Detection
            </Link>
            <Link
              href="/about"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-primary-foreground/80 hover:bg-navy-light hover:text-gold"
              onClick={() => setMobileOpen(false)}
            >
              About
            </Link>
            {user ? (
              <>
                <Link
                  href={dashboardLink}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-primary-foreground/80 hover:bg-navy-light hover:text-gold"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileOpen(false)
                  }}
                  className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-primary-foreground/80 hover:bg-navy-light hover:text-gold"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-primary-foreground/10">
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-primary-foreground/80 hover:bg-navy-light hover:text-gold"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-gold text-navy hover:bg-gold-light">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
