"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Video,
  X,
} from "lucide-react"
import { toast } from "sonner"

interface Indicator {
  label: string
  score: number
  description: string
}

interface AnalysisResult {
  result: "authentic" | "deepfake"
  confidence_score: number
  indicators: Record<string, Indicator>
  video_name: string
  analyzed_at: string
}

export function DeepfakeAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (!selected.type.startsWith("video/")) {
        toast.error("Please select a video file")
        return
      }
      setFile(selected)
      setResult(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) {
      if (!dropped.type.startsWith("video/")) {
        toast.error("Please drop a video file")
        return
      }
      setFile(dropped)
      setResult(null)
    }
  }

  const handleAnalyze = async () => {
    if (!file) return

    setAnalyzing(true)
    setProgress(0)
    setResult(null)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + Math.random() * 15
      })
    }, 300)

    try {
      const formData = new FormData()
      formData.append("video", file)

      const res = await fetch("/api/deepfake", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed")
      }

      setProgress(100)
      setTimeout(() => {
        setResult(data)
        setAnalyzing(false)
      }, 500)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Analysis failed")
      setAnalyzing(false)
    } finally {
      clearInterval(progressInterval)
    }
  }

  const clearFile = () => {
    setFile(null)
    setResult(null)
    setProgress(0)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Upload Card */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground">Upload Video</CardTitle>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed border-border p-10 transition-colors hover:border-gold/40 hover:bg-muted/50"
              onClick={() => inputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload video file"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
              }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy/10">
                <Upload className="h-7 w-7 text-navy" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Drop your video here or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supports MP4, MOV, AVI, WebM formats
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-navy/10">
                <Video className="h-6 w-6 text-navy" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Select video file"
          />

          {analyzing && (
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Analyzing video...</span>
                <span className="font-medium text-foreground">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Running deepfake detection algorithms across multiple behavioral indicators
              </p>
            </div>
          )}

          {file && !analyzing && !result && (
            <Button
              onClick={handleAnalyze}
              className="mt-6 w-full bg-navy text-primary-foreground hover:bg-navy-light"
            >
              Analyze for Deepfake
            </Button>
          )}

          {analyzing && (
            <Button disabled className="mt-4 w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results Card */}
      {result && (
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-card-foreground">Analysis Result</CardTitle>
              <Badge
                className={
                  result.result === "authentic"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }
              >
                {result.result === "authentic" ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Authentic
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Deepfake Detected
                  </span>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Confidence Score */}
            <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/50 p-6">
              <span className="text-sm font-medium text-muted-foreground">Confidence Score</span>
              <span
                className={`text-5xl font-bold ${
                  result.result === "authentic" ? "text-green-600" : "text-amber-600"
                }`}
              >
                {result.confidence_score}%
              </span>
              <p className="text-center text-xs text-muted-foreground">
                {result.result === "authentic"
                  ? "This video appears to be authentic based on our analysis."
                  : "This video shows signs of manipulation. Review the indicators below."}
              </p>
            </div>

            {/* Indicator Breakdown */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground">Indicator Breakdown</h3>
              {Object.entries(result.indicators).map(([key, indicator]) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{indicator.label}</span>
                    <span
                      className={`text-sm font-semibold ${
                        indicator.score > 65
                          ? "text-green-600"
                          : indicator.score > 40
                          ? "text-amber-600"
                          : "text-red-600"
                      }`}
                    >
                      {indicator.score}%
                    </span>
                  </div>
                  <Progress
                    value={indicator.score}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">{indicator.description}</p>
                </div>
              ))}
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              <span>File: {result.video_name}</span>
              <span>Analyzed: {new Date(result.analyzed_at).toLocaleString()}</span>
            </div>

            <Button
              onClick={clearFile}
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
            >
              Analyze Another Video
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
