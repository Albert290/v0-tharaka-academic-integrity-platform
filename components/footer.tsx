import Link from "next/link"
import { Shield, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-navy text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold">
                <Shield className="h-5 w-5 text-navy" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-wide text-gold">TharakaGuard</span>
                <span className="text-[10px] text-primary-foreground/60">Academic Integrity</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-primary-foreground/60">
              Tharaka University&apos;s comprehensive platform for maintaining academic integrity
              through advanced AI and deepfake detection technology.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gold">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-sm text-primary-foreground/60 transition-colors hover:text-gold"
              >
                Home
              </Link>
              <Link
                href="/deepfake"
                className="text-sm text-primary-foreground/60 transition-colors hover:text-gold"
              >
                Deepfake Detection
              </Link>
              <Link
                href="/about"
                className="text-sm text-primary-foreground/60 transition-colors hover:text-gold"
              >
                About
              </Link>
              <Link
                href="/login"
                className="text-sm text-primary-foreground/60 transition-colors hover:text-gold"
              >
                Login
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gold">Platform</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/register"
                className="text-sm text-primary-foreground/60 transition-colors hover:text-gold"
              >
                Student Registration
              </Link>
              <Link
                href="/register"
                className="text-sm text-primary-foreground/60 transition-colors hover:text-gold"
              >
                Lecturer Registration
              </Link>
              <Link
                href="/deepfake"
                className="text-sm text-primary-foreground/60 transition-colors hover:text-gold"
              >
                AI Content Checker
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gold">Contact</h3>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold/70" />
                <span className="text-sm text-primary-foreground/60">
                  info@tharaka-university.ac.ke
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gold/70" />
                <span className="text-sm text-primary-foreground/60">+254 700 000 000</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold/70" />
                <span className="text-sm text-primary-foreground/60">
                  Tharaka University, Tharaka Nithi County, Kenya
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-8 md:flex-row">
          <p className="text-xs text-primary-foreground/40">
            &copy; {new Date().getFullYear()} Tharaka University. All rights reserved.
          </p>
          <p className="text-xs text-primary-foreground/40">
            TharakaGuard &mdash; Academic Integrity Platform
          </p>
        </div>
      </div>
    </footer>
  )
}
