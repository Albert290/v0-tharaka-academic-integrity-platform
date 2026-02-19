"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, ScanFace, FileCheck, BrainCircuit } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-navy">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(200,167,78,0.4) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-1.5">
            <Shield className="h-4 w-4 text-gold" />
            <span className="text-xs font-medium tracking-wide text-gold">
              Tharaka University
            </span>
          </div>

          {/* Heading */}
          <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
            Safeguarding Academic{" "}
            <span className="text-gold">Integrity</span> with AI
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-primary-foreground/60 md:text-xl">
            TharakaGuard detects deepfakes and AI-generated content in academic submissions,
            ensuring authentic scholarship across the university.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/register?role=student">
              <Button
                size="lg"
                className="min-w-[200px] bg-gold text-navy font-semibold hover:bg-gold-light"
              >
                Student Login / Register
              </Button>
            </Link>
            <Link href="/register?role=lecturer">
              <Button
                size="lg"
                variant="outline"
                className="min-w-[200px] border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-navy-light hover:text-gold"
              >
                Lecturer Login / Register
              </Button>
            </Link>
          </div>

          {/* Feature indicators */}
          <div className="mt-16 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-2 rounded-xl border border-primary-foreground/10 bg-navy-light/50 p-5">
              <ScanFace className="h-8 w-8 text-gold" />
              <span className="text-sm font-medium text-primary-foreground">
                Deepfake Detection
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl border border-primary-foreground/10 bg-navy-light/50 p-5">
              <FileCheck className="h-8 w-8 text-gold" />
              <span className="text-sm font-medium text-primary-foreground">
                CAT Submission System
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl border border-primary-foreground/10 bg-navy-light/50 p-5">
              <BrainCircuit className="h-8 w-8 text-gold" />
              <span className="text-sm font-medium text-primary-foreground">
                AI Content Checker
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
