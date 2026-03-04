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
import { Upload, Loader2, FileText, Info } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
      console.log('📤 Submitting file:', {
        title,
        lecturerId,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(2)} KB`,
        fileType: file.type
      })

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
        console.error('❌ Submission failed:', data)
        throw new Error(data.details || data.error || "Submission failed")
      }

      console.log('✅ Submission successful:', data)
      toast.success("CAT submitted successfully! Lecturer can now review it.")
      setTitle("")
      setLecturerId("")
      setFile(null)

      // Reset file input
      const fileInput = document.getElementById("file") as HTMLInputElement
      if (fileInput) fileInput.value = ""

      // Refresh submission history
      mutate("/api/submissions?role=student")
    } catch (error) {
      console.error('❌ Submission error:', error)
      toast.error(error instanceof Error ? error.message : "Submission failed")
    } finally {
      setLoading(false)
    }
  }

  const lecturers = lecturerData?.lecturers || []

  return (
    <Card className="border-border/60 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-navy/5 to-gold/5">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-card-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/20">
            <Upload className="h-5 w-5 text-gold-dark" />
          </div>
          Submit CAT
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">Upload your Continuous Assessment Test</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title" className="text-sm font-semibold">Submission Title</Label>
            <Input
              id="title"
              placeholder="e.g., CAT 1 - Data Structures"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border-border/60 focus:border-gold focus:ring-gold/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="lecturer" className="text-sm font-semibold">Select Lecturer</Label>
            <Select value={lecturerId} onValueChange={setLecturerId}>
              <SelectTrigger id="lecturer" className="border-border/60 focus:border-gold focus:ring-gold/20">
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
            <Label htmlFor="file" className="text-sm font-semibold">Upload File</Label>
            {file ? (
              <div className="flex items-center gap-3 rounded-lg border border-gold/30 bg-gradient-to-r from-gold/5 to-navy/5 p-3 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/20 shrink-0">
                  <FileText className="h-5 w-5 text-gold-dark" />
                </div>
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
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
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
                className="border-border/60 focus:border-gold focus:ring-gold/20 file:mr-4 file:rounded-md file:border-0 file:bg-navy file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-navy-light file:transition-colors"
              />
            )}
            <p className="text-xs text-muted-foreground">
              Accepted: PDF, DOC, DOCX, TXT, MP4, MOV (Max 10MB)
            </p>
          </div>

          <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/60 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <Info className="h-4 w-4 text-blue-600" />
            </div>
            <AlertDescription className="text-xs sm:text-sm text-blue-900 ml-3">
              <strong className="font-semibold">Note:</strong> AI checking is NOT done during submission. After you submit, your lecturer will manually click "AI Check" to analyze your work.
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            disabled={loading}
            className="mt-2 bg-gradient-to-r from-navy to-navy-light text-primary-foreground hover:from-navy-light hover:to-navy shadow-md hover:shadow-lg transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Submit CAT
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
