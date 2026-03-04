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
    <Card className="border-border/60 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-navy/5 to-gold/5">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-card-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/20">
            <FileText className="h-5 w-5 text-gold-dark" />
          </div>
          Submission History
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="h-8 w-8 text-gold" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-navy/10 to-gold/10">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">No submissions yet</p>
              <p className="text-xs  sm:text-sm text-muted-foreground mt-1">
                Submit your first CAT using the form on the left
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 sm:-mx-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/60">
                  <TableHead className="font-semibold text-foreground">Title</TableHead>
                  <TableHead className="font-semibold text-foreground">Lecturer</TableHead>
                  <TableHead className="font-semibold text-foreground">Date</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground">AI Check</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub) => (
                  <TableRow key={sub.id} className="border-border/40 hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium text-foreground">{sub.title}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{sub.lecturer_name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(sub.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {sub.reviewed ? (
                        <Badge className="border-green-200/60 bg-green-50 text-green-700 shadow-sm">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Reviewed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-muted-foreground shadow-sm">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {sub.ai_check_result ? (
                        sub.ai_check_result.is_ai_generated ? (
                          <Badge className="border-amber-200/60 bg-amber-50 text-amber-700 shadow-sm">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            AI Detected
                          </Badge>
                        ) : (
                          <Badge className="border-green-200/60 bg-green-50 text-green-700 shadow-sm">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Original
                          </Badge>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Not checked</span>
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
