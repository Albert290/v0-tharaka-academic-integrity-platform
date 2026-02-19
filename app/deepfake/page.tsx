import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DeepfakeAnalyzer } from "@/components/deepfake/deepfake-analyzer"
import { Shield, ScanFace } from "lucide-react"

export default function DeepfakePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-navy py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-1.5">
              <ScanFace className="h-4 w-4 text-gold" />
              <span className="text-xs font-medium tracking-wide text-gold">
                Detection Tool
              </span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl">
              Deepfake <span className="text-gold">Detection</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-primary-foreground/60">
              Upload a video to analyze for deepfake indicators including lip sync,
              breathing patterns, facial micro-expressions, and more.
            </p>
          </div>
        </section>

        {/* Analyzer */}
        <section className="bg-background py-12 lg:py-16">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <DeepfakeAnalyzer />
          </div>
        </section>

        {/* Indicators info */}
        <section className="bg-muted/50 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <h2 className="mb-10 text-center text-2xl font-bold text-foreground">
              What We Analyze
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Lip Sync Analysis",
                  desc: "Compares audio waveforms with lip movement patterns to detect mismatches common in face-swap deepfakes.",
                },
                {
                  title: "Breathing Patterns",
                  desc: "Monitors chest and shoulder micro-movements for natural breathing rhythm that deepfakes often fail to replicate.",
                },
                {
                  title: "Micro-Expressions",
                  desc: "Detects subtle involuntary facial movements that last fractions of a second, a key authenticity signal.",
                },
                {
                  title: "Blinking Anomalies",
                  desc: "Analyzes blink frequency and duration against natural baselines, as early deepfakes rarely blink.",
                },
                {
                  title: "Skin Texture",
                  desc: "Examines skin texture consistency for synthetic smoothing artifacts and unnatural boundary transitions.",
                },
                {
                  title: "Head Pose Estimation",
                  desc: "Evaluates 3D head rotation consistency, checking for impossible or unnatural head orientations.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-border/60 bg-card p-5"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gold" />
                    <h3 className="text-sm font-semibold text-card-foreground">{item.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
