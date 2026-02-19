import {
  ScanFace,
  Upload,
  BrainCircuit,
  ShieldCheck,
  Users,
  BarChart3,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: ScanFace,
    title: "Deepfake Detection",
    description:
      "Advanced analysis of lip sync, breathing patterns, facial micro-expressions, and blinking anomalies to identify manipulated video content.",
  },
  {
    icon: Upload,
    title: "CAT Submission System",
    description:
      "Students upload their Continuous Assessment Tests directly to their assigned lecturers through a streamlined, secure submission flow.",
  },
  {
    icon: BrainCircuit,
    title: "AI Content Checker",
    description:
      "Detects AI-generated text using advanced statistical analysis, vocabulary consistency checks, and perplexity scoring algorithms.",
  },
  {
    icon: ShieldCheck,
    title: "Integrity Assurance",
    description:
      "Comprehensive reporting with confidence scores, indicator breakdowns, and clear result verdicts for every submission analyzed.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description:
      "Separate dashboards for students and lecturers with tailored workflows, ensuring each user sees only what is relevant to their role.",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description:
      "Track submission history, review statuses, and AI check results with a complete audit trail of all academic integrity checks.",
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-14 text-center">
          <p className="mb-2 text-sm font-semibold tracking-wide text-gold uppercase">
            What we do
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Comprehensive Academic Integrity Tools
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Our platform combines cutting-edge AI detection technology with a streamlined
            submission workflow to protect the value of every academic achievement.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group border-border/60 bg-card transition-all hover:border-gold/30 hover:shadow-lg"
            >
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy text-gold">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
