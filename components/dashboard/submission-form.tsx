"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, Loader2, FileText } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Lecturer {
  id: number
  name: string
  email: string
}

export function SubmissionForm() {
  const { data: lecturerData } = useSWR<{ lecturers: Lecturer[] }>("/api/lecturers", fetcher)

  const [title, setTitle] = useState("")
  const [lecturerId, setLecturerId] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !lecturerId || !file) {
      toast.error("Please fill all fields and select a file")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("lecturer_id", lecturerId)
      formData.append("file", file)
      formData.append("file_type", file.type)

      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Submission failed")
      }

      toast.success("CAT submitted successfully!")
      setTitle("")
      setLecturerId("")
      setFile(null)

      // Refresh submission history
      mutate("/api/submissions?role=student")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Submission failed")
    } finally {
      setLoading(false)
    }
  }

  const lecturers = lecturerData?.lecturers || []

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
          <Upload className="h-5 w-5 text-gold" />
          Submit CAT
        </CardTitle>
        <CardDescription>Upload your Continuous Assessment Test</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Submission Title</Label>
            <Input
              id="title"
              placeholder="e.g., CAT 1 - Data Structures"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="lecturer">Select Lecturer</Label>
            <Select value={lecturerId} onValueChange={setLecturerId}>
              <SelectTrigger id="lecturer">
                <SelectValue placeholder="Choose a lecturer" />
              </SelectTrigger>
              <SelectContent>
                {lecturers.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No lecturers available
                  </SelectItem>
                ) : (
                  lecturers.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="file">Upload File</Label>
            {file ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <FileText className="h-5 w-5 text-gold" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="h-7 text-xs text-muted-foreground"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.mp4,.mov"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            )}
            <p className="text-xs text-muted-foreground">
              Accepted: PDF, DOC, DOCX, TXT, MP4, MOV
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 bg-navy text-primary-foreground hover:bg-navy-light"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit CAT"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
