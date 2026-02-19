import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Shield, GraduationCap, Eye, Lock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-navy py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-1.5">
              <Shield className="h-4 w-4 text-gold" />
              <span className="text-xs font-medium tracking-wide text-gold">About Us</span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl">
              About <span className="text-gold">TharakaGuard</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-primary-foreground/60">
              TharakaGuard is Tharaka University&apos;s dedicated platform for preserving the
              sanctity of academic work through advanced technology.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-background py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Our Mission
              </h2>
              <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                In an era where AI-generated content and deepfake technology are becoming
                increasingly sophisticated, maintaining academic integrity is more important
                than ever. TharakaGuard was built to address these challenges head-on, providing
                Tharaka University with the tools needed to verify the authenticity of academic
                submissions.
              </p>
              <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                Our platform combines cutting-edge detection algorithms with an intuitive
                submission management system, creating a seamless workflow for both students and
                lecturers. Every submission is treated with the utmost care, ensuring fair and
                transparent evaluation processes.
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-border/60">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy text-gold">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">Transparency</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Every analysis provides detailed breakdowns with confidence scores so users
                    understand exactly how results were determined.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/60">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy text-gold">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">Education First</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    We believe technology should support education, not hinder it. Our tools help
                    maintain fair standards that benefit all scholars.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/60 md:col-span-2 lg:col-span-1">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy text-gold">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground">Security</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    All submissions and analyses are handled with strict privacy protocols.
                    User data is encrypted and access is role-based.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
