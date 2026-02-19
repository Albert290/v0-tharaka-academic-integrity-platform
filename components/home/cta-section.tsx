import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="bg-navy py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <p className="text-sm font-semibold tracking-wide text-gold uppercase">
            Join us
          </p>
          <h2 className="max-w-2xl text-balance text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
            Ready to uphold academic integrity?
          </h2>
          <p className="max-w-xl text-pretty text-primary-foreground/60">
            Whether you are a student submitting coursework or a lecturer reviewing submissions,
            TharakaGuard provides the tools you need to ensure academic honesty.
          </p>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="gap-2 bg-gold text-navy font-semibold hover:bg-gold-light">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/deepfake">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-navy-light hover:text-gold"
              >
                Try Deepfake Detection
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
