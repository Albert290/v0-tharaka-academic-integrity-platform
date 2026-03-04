"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Trash2, BookOpen, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import useSWR from "swr"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface ReferenceMaterial {
  id: number
  title: string
  file_type: string
  file_size: number
  uploaded_at: string
  metadata?: {
    word_count?: number
    uploaded_by?: string
  }
}

export function ReferenceMaterials() {
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File | null>(null)

  const { data, mutate, isLoading } = useSWR<{ materials: ReferenceMaterial[] }>(
    "/api/reference-materials",
    fetcher
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
      ]
      
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Invalid file type. Please upload PDF, DOCX, or TXT files.")
        return
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 10MB.")
        return
      }
      
      setFile(selectedFile)
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast.error("Please provide a title and select a file")
      return
    }

    setUploading(true)

    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const fileUrl = e.target?.result as string

        const response = await fetch("/api/reference-materials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            fileUrl,
            fileType: file.type,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Upload failed")
        }

        toast.success("Reference material uploaded successfully")
        setTitle("")
        setFile(null)
        // Clear file input
        const fileInput = document.getElementById("file-upload") as HTMLInputElement
        if (fileInput) fileInput.value = ""
        
        mutate()
      }

      reader.onerror = () => {
        throw new Error("Failed to read file")
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload file")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (materialId: number) => {
    if (!confirm("Are you sure you want to delete this reference material?")) {
      return
    }

    try {
      const response = await fetch(`/api/reference-materials?id=${materialId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Delete failed")
      }

      toast.success("Reference material deleted")
      mutate()
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete file")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const materials = data?.materials || []

  return (
    <Card className="border-gold/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-navy/5 to-gold/10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/20">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-gold-dark" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">Course Reference Materials</CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              Upload course notes, slides, or teaching materials for plagiarism detection
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Upload Section */}
        <div className="space-y-4 rounded-xl border border-gold/20 bg-gradient-to-br from-gold/5 to-navy/5 p-4 sm:p-5 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">Material Title</Label>
            <Input
              id="title"
              placeholder="e.g., Week 5 Lecture Notes, Chapter 3 Slides"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
              className="border-border/60 focus:border-gold focus:ring-gold/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-upload" className="text-sm font-semibold">File (PDF, DOCX, or TXT)</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                disabled={uploading}
                className="cursor-pointer flex-1 border-border/60 focus:border-gold focus:ring-gold/20 file:mr-4 file:rounded-md file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-navy-light file:transition-colors"
              />
              <Button
                onClick={handleUpload}
                disabled={!file || !title.trim() || uploading}
                className="shrink-0 bg-gradient-to-r from-gold to-gold-dark text-navy hover:from-gold-dark hover:to-gold shadow-md hover:shadow-lg transition-all duration-200"
              >
                {uploading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>

          <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/60 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </div>
            <AlertDescription className="text-xs sm:text-sm text-blue-900 ml-3">
              Uploaded materials will be analyzed and compared against student submissions to detect
              copying, paraphrasing, and assess originality. Max file size: 10MB.
            </AlertDescription>
          </Alert>
        </div>

        {/* Materials List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-semibold text-foreground">
              Uploaded Materials ({materials.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8 text-gold" />
            </div>
          ) : materials.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-muted/20 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <FileText className="h-7 w-7 text-muted-foreground/50" />
              </div>
              <p className="mt-3 text-sm font-medium text-muted-foreground">No reference materials uploaded yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Upload course materials to enable comparison analysis</p>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3 sm:p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:bg-muted/20"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gradient-to-br from-gold/20 to-gold/10 shrink-0">
                      <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-gold-dark" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base truncate text-foreground">{material.title}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-muted-foreground mt-1">
                        <span className="font-medium">{formatFileSize(material.file_size)}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>{formatDate(material.uploaded_at)}</span>
                        {material.metadata?.word_count && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{material.metadata.word_count.toLocaleString()} words</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(material.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
