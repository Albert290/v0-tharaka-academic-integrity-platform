"use client"

import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Submission {
  id: number
  title: string
  file_type: string
  submitted_at: string
  ai_check_result: {
    is_ai_generated: boolean
    confidence_score: number
  } | null
  reviewed: boolean
  lecturer_name: string
}

export function SubmissionHistory() {
  const { data, isLoading } = useSWR<{ submissions: Submission[] }>(
    "/api/submissions?role=student",
    fetcher,
    { refreshInterval: 10000 }
  )

  const submissions = data?.submissions || []

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
          <FileText className="h-5 w-5 text-gold" />
          Submission History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-6 w-6 text-gold" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No submissions yet</p>
              <p className="text-xs text-muted-foreground">
                Submit your first CAT using the form on the left
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Lecturer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AI Check</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium text-foreground">{sub.title}</TableCell>
                    <TableCell className="text-muted-foreground">{sub.lecturer_name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(sub.submitted_at).toLocaleDateString()}
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
                      {sub.ai_check_result ? (
                        sub.ai_check_result.is_ai_generated ? (
                          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            AI Detected
                          </Badge>
                        ) : (
                          <Badge className="border-green-200 bg-green-50 text-green-700">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Original
                          </Badge>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">Not checked</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
