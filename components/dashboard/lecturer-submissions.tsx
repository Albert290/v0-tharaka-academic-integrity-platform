"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  FileText,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Eye,
  Inbox,
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface AICheckResult {
  is_ai_generated: boolean
  confidence_score: number
  indicators: Record<string, number>
  checked_at: string
}

interface Submission {
  id: number
  title: string
  file_type: string
  file_url: string
  submitted_at: string
  ai_check_result: AICheckResult | null
  reviewed: boolean
  student_name: string
  student_email: string
}

export function LecturerSubmissions() {
  const { data, isLoading, mutate } = useSWR<{ submissions: Submission[] }>(
    "/api/submissions?role=lecturer",
    fetcher,
    { refreshInterval: 10000 }
  )

  const [checkingId, setCheckingId] = useState<number | null>(null)
  const [reviewingId, setReviewingId] = useState<number | null>(null)
  const [selectedResult, setSelectedResult] = useState<AICheckResult | null>(null)

  const submissions = data?.submissions || []

  const handleAICheck = async (submissionId: number) => {
    setCheckingId(submissionId)

    try {
      const res = await fetch("/api/submissions/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "AI check failed")
      }

      toast.success("AI check completed")
      mutate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI check failed")
    } finally {
      setCheckingId(null)
    }
  }

  const handleMarkReviewed = async (submissionId: number) => {
    setReviewingId(submissionId)

    try {
      const res = await fetch("/api/submissions/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      })

      if (!res.ok) {
        throw new Error("Failed to mark as reviewed")
      }

      toast.success("Submission marked as reviewed")
      mutate()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mark reviewed")
    } finally {
      setReviewingId(null)
    }
  }

  const indicatorLabels: Record<string, string> = {
    repetitive_patterns: "Repetitive Patterns",
    statistical_anomalies: "Statistical Anomalies",
    vocabulary_consistency: "Vocabulary Consistency",
    structural_analysis: "Structural Analysis",
    perplexity_score: "Perplexity Score",
  }

  return (
    <>
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
              <Inbox className="h-5 w-5 text-gold" />
              Student Submissions
            </CardTitle>
            <Badge variant="secondary" className="text-muted-foreground">
              {submissions.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-6 w-6 text-gold" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">No submissions yet</p>
                <p className="text-xs text-muted-foreground">
                  Student submissions directed to you will appear here
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>AI Check</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {sub.student_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{sub.student_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{sub.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs text-muted-foreground">
                          <FileText className="mr-1 h-3 w-3" />
                          {sub.file_type?.split("/").pop()?.toUpperCase() || "FILE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {sub.ai_check_result ? (
                          <button
                            onClick={() => setSelectedResult(sub.ai_check_result)}
                            className="cursor-pointer"
                          >
                            {sub.ai_check_result.is_ai_generated ? (
                              <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                                <AlertCircle className="mr-1 h-3 w-3" />
                                AI Detected ({sub.ai_check_result.confidence_score}%)
                              </Badge>
                            ) : (
                              <Badge className="border-green-200 bg-green-50 text-green-700">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Original ({sub.ai_check_result.confidence_score}%)
                              </Badge>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not checked</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {sub.reviewed ? (
                          <Badge className="border-green-200 bg-green-50 text-green-700">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Reviewed
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {!sub.ai_check_result && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAICheck(sub.id)}
                              disabled={checkingId === sub.id}
                              className="h-8 gap-1.5 border-border text-foreground hover:border-gold/40 hover:text-gold"
                            >
                              {checkingId === sub.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <BrainCircuit className="h-3.5 w-3.5" />
                              )}
                              AI Check
                            </Button>
                          )}
                          {sub.ai_check_result && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedResult(sub.ai_check_result)}
                              className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Details
                            </Button>
                          )}
                          {!sub.reviewed && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkReviewed(sub.id)}
                              disabled={reviewingId === sub.id}
                              className="h-8 gap-1.5 bg-navy text-primary-foreground hover:bg-navy-light"
                            >
                              {reviewingId === sub.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              Review
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Check Result Detail Dialog */}
      <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-gold" />
              AI Content Analysis
            </DialogTitle>
          </DialogHeader>
          {selectedResult && (
            <div className="flex flex-col gap-5">
              {/* Verdict */}
              <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/50 p-6">
                {selectedResult.is_ai_generated ? (
                  <>
                    <AlertCircle className="h-10 w-10 text-amber-500" />
                    <span className="text-lg font-bold text-amber-600">
                      AI-Generated Content Detected
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                    <span className="text-lg font-bold text-green-600">
                      Original Content
                    </span>
                  </>
                )}
                <span className="text-3xl font-bold text-foreground">
                  {selectedResult.confidence_score}%
                </span>
                <span className="text-xs text-muted-foreground">Confidence Score</span>
              </div>

              {/* Indicators */}
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-semibold text-foreground">Detection Indicators</h4>
                {Object.entries(selectedResult.indicators).map(([key, value]) => (
                  <div key={key} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">
                        {indicatorLabels[key] || key}
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          (value as number) > 60
                            ? "text-amber-600"
                            : "text-green-600"
                        }`}
                      >
                        {value as number}%
                      </span>
                    </div>
                    <Progress value={value as number} className="h-1.5" />
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Checked: {new Date(selectedResult.checked_at).toLocaleString()}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
