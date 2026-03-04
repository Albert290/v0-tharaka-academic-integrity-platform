"use client"

import { useState, useMemo } from "react"
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
  Download,
  FileDown,
  User,
  Mail,
  Calendar,
  Hash,
  Phone,
  IdCard,
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
  registration_number?: string
  phone_number?: string
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
  const [viewingDocument, setViewingDocument] = useState<Submission | null>(null)
  const [viewingStudent, setViewingStudent] = useState<string | null>(null)

  const submissions = data?.submissions || []

  // Calculate submission count per student
  const studentSubmissionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    submissions.forEach((sub) => {
      counts[sub.student_email] = (counts[sub.student_email] || 0) + 1
    })
    return counts
  }, [submissions])

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

  const handleDownloadDocument = (submission: Submission) => {
    try {
      // Create a download link from the base64 data
      const link = document.createElement("a")
      link.href = submission.file_url
      link.download = `${submission.title.replace(/[^a-z0-9]/gi, "_")}.${
        submission.file_type?.split("/").pop() || "file"
      }`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Document downloaded")
    } catch (error) {
      toast.error("Failed to download document")
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
      <Card className="border-gold/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-navy/5 to-gold/5 border-b border-gold/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
              <Inbox className="h-5 w-5 text-gold" />
              Student Submissions
            </CardTitle>
            <Badge variant="secondary" className="bg-navy/10 text-navy border-navy/20">
              {submissions.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-6 w-6 text-gold" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy/10">
                <Inbox className="h-6 w-6 text-navy" />
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
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="font-semibold">Student</TableHead>
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">AI Check</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow key={sub.id} className="hover:bg-navy/5 transition-colors">
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy/10 mt-0.5">
                            <User className="h-4 w-4 text-navy" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => setViewingStudent(sub.student_email)}
                              className="text-sm font-medium text-foreground hover:text-gold transition-colors truncate block w-full text-left"
                            >
                              {sub.student_name}
                            </button>
                            <p className="text-xs text-muted-foreground truncate">{sub.student_email}</p>
                            <Badge variant="outline" className="mt-1 text-xs border-navy/20">
                              <Hash className="h-3 w-3 mr-1" />
                              {studentSubmissionCounts[sub.student_email]} submission(s)
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground max-w-xs">
                        <div className="truncate" title={sub.title}>
                          {sub.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs bg-gold/10 text-gold-dark border-gold/20">
                          <FileText className="mr-1 h-3 w-3" />
                          {sub.file_type?.split("/").pop()?.toUpperCase() || "FILE"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(sub.submitted_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {sub.ai_check_result ? (
                          <button
                            onClick={() => setSelectedResult(sub.ai_check_result)}
                            className="cursor-pointer transition-all hover:scale-105"
                          >
                            {sub.ai_check_result.is_ai_generated ? (
                              <Badge className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100">
                                <AlertCircle className="mr-1 h-3 w-3" />
                                AI {sub.ai_check_result.confidence_score}%
                              </Badge>
                            ) : (
                              <Badge className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Human {sub.ai_check_result.confidence_score}%
                              </Badge>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Not checked</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {sub.reviewed ? (
                          <Badge className="border-green-200 bg-green-50 text-green-700">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Reviewed
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewingDocument(sub)}
                            className="h-8 gap-1.5 border-navy/20 text-navy hover:bg-navy hover:text-primary-foreground"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadDocument(sub)}
                            className="h-8 gap-1.5 border-gold/30 text-gold-dark hover:bg-gold hover:text-navy"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
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
                          {!sub.reviewed && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkReviewed(sub.id)}
                              disabled={reviewingId === sub.id}
                              className="h-8 gap-1.5 bg-navy text-primary-foreground hover:bg-navy-light shadow-sm"
                            >
                              {reviewingId === sub.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              Mark Reviewed
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
              <div className="flex flex-col items-center gap-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 p-6 border border-border/50">
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

      {/* Document Viewer Dialog */}
      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gold" />
              {viewingDocument?.title}
            </DialogTitle>
          </DialogHeader>
          {viewingDocument && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-navy" />
                  <div>
                    <p className="text-xs text-muted-foreground">Student</p>
                    <p className="text-sm font-medium text-foreground">{viewingDocument.student_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-navy" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground truncate">{viewingDocument.student_email}</p>
                  </div>
                </div>
                {viewingDocument.registration_number && (
                  <div className="flex items-center gap-2">
                    <IdCard className="h-4 w-4 text-navy" />
                    <div>
                      <p className="text-xs text-muted-foreground">Registration Number</p>
                      <p className="text-sm font-medium text-foreground">{viewingDocument.registration_number}</p>
                    </div>
                  </div>
                )}
                {viewingDocument.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-navy" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone Number</p>
                      <p className="text-sm font-medium text-foreground">{viewingDocument.phone_number}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-navy" />
                  <div>
                    <p className="text-xs text-muted-foreground">Submitted</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(viewingDocument.submitted_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-navy" />
                  <div>
                    <p className="text-xs text-muted-foreground">File Type</p>
                    <p className="text-sm font-medium text-foreground">
                      {viewingDocument.file_type?.split("/").pop()?.toUpperCase() || "FILE"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border border-border/60 bg-muted/20 p-4 max-h-96 overflow-auto">
                {viewingDocument.file_type?.includes("text") ? (
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                    {atob(viewingDocument.file_url.split(",")[1] || "")}
                  </pre>
                ) : (
                  <div className="text-center py-8">
                    <FileDown className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Preview not available for this file type
                    </p>
                    <Button
                      onClick={() => handleDownloadDocument(viewingDocument)}
                      className="bg-navy text-primary-foreground hover:bg-navy-light"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Document
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadDocument(viewingDocument)}
                  className="border-gold/30 text-gold-dark hover:bg-gold hover:text-navy"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => setViewingDocument(null)}
                  className="bg-navy text-primary-foreground hover:bg-navy-light"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Student Details Dialog */}
      <Dialog open={!!viewingStudent} onOpenChange={() => setViewingStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-gold" />
              Student Details
            </DialogTitle>
          </DialogHeader>
          {viewingStudent && (
            <div className="flex flex-col gap-4">
              {/* Student Info */}
              {(() => {
                const studentSubs = submissions.filter(
                  (s) => s.student_email === viewingStudent
                )
                const student = studentSubs[0]
                const totalSubs = studentSubs.length
                const reviewedSubs = studentSubs.filter((s) => s.reviewed).length
                const aiCheckedSubs = studentSubs.filter((s) => s.ai_check_result).length
                const aiDetectedSubs = studentSubs.filter(
                  (s) => s.ai_check_result?.is_ai_generated
                ).length

                return (
                  <>
                    <div className="rounded-lg bg-gradient-to-br from-navy/10 to-gold/10 p-6 border border-navy/20">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy text-primary-foreground text-2xl font-bold">
                          {student.student_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground">{student.student_name}</h3>
                          <div className="space-y-1 mt-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" />
                              {student.student_email}
                            </p>
                            {student.registration_number && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <IdCard className="h-3.5 w-3.5" />
                                {student.registration_number}
                              </p>
                            )}
                            {student.phone_number && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" />
                                {student.phone_number}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-card p-3 border border-border/50">
                          <p className="text-xs text-muted-foreground">Total Submissions</p>
                          <p className="text-2xl font-bold text-navy">{totalSubs}</p>
                        </div>
                        <div className="rounded-lg bg-card p-3 border border-border/50">
                          <p className="text-xs text-muted-foreground">Reviewed</p>
                          <p className="text-2xl font-bold text-green-600">{reviewedSubs}</p>
                        </div>
                        <div className="rounded-lg bg-card p-3 border border-border/50">
                          <p className="text-xs text-muted-foreground">AI Checked</p>
                          <p className="text-2xl font-bold text-gold-dark">{aiCheckedSubs}</p>
                        </div>
                        <div className="rounded-lg bg-card p-3 border border-border/50">
                          <p className="text-xs text-muted-foreground">AI Detected</p>
                          <p className="text-2xl font-bold text-amber-600">{aiDetectedSubs}</p>
                        </div>
                      </div>
                    </div>

                    {/* Submission History */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">Submission History</h4>
                      <div className="space-y-2 max-h-64 overflow-auto">
                        {studentSubs.map((sub) => (
                          <div
                            key={sub.id}
                            className="rounded-lg border border-border/60 bg-card/50 p-3 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{sub.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(sub.submitted_at).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {sub.ai_check_result && (
                                  <Badge
                                    variant={sub.ai_check_result.is_ai_generated ? "default" : "secondary"}
                                    className={
                                      sub.ai_check_result.is_ai_generated
                                        ? "bg-amber-100 text-amber-700 border-amber-200"
                                        : "bg-green-100 text-green-700 border-green-200"
                                    }
                                  >
                                    {sub.ai_check_result.is_ai_generated ? "AI" : "Human"}
                                  </Badge>
                                )}
                                {sub.reviewed && (
                                  <Badge className="bg-green-100 text-green-700 border-green-200">
                                    Reviewed
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
