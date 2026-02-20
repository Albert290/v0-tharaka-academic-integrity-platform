import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get("title") as string
    const lecturerId = formData.get("lecturer_id") as string
    const file = formData.get("file") as File
    const fileType = formData.get("file_type") as string

    if (!title || !lecturerId || !file) {
      return NextResponse.json({ error: "Title, lecturer, and file are required" }, { status: 400 })
    }

    // Convert file to base64 for storage (in production, use a file storage service)
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const fileUrl = `data:${file.type};base64,${base64}`

    const result = await sql`
      INSERT INTO submissions (student_id, lecturer_id, title, file_url, file_type)
      VALUES (${session.id}, ${parseInt(lecturerId)}, ${title}, ${fileUrl}, ${fileType || file.type})
      RETURNING id, title, file_type, submitted_at, reviewed
    `

    return NextResponse.json({ submission: result[0], message: "Submission successful" })
  } catch (error) {
    console.error("Submission error:", error)
    return NextResponse.json({ error: "Submission failed" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    let submissions

    if (role === "lecturer" && session.role === "lecturer") {
      submissions = await sql`
        SELECT s.id, s.title, s.file_type, s.submitted_at, s.ai_check_result, s.reviewed, s.file_url,
               u.name as student_name, u.email as student_email, u.registration_number, u.phone_number
        FROM submissions s
        JOIN users u ON s.student_id = u.id
        WHERE s.lecturer_id = ${session.id}
        ORDER BY s.submitted_at DESC
      `
    } else if (session.role === "student") {
      submissions = await sql`
        SELECT s.id, s.title, s.file_type, s.submitted_at, s.ai_check_result, s.reviewed,
               u.name as lecturer_name
        FROM submissions s
        JOIN users u ON s.lecturer_id = u.id
        WHERE s.student_id = ${session.id}
        ORDER BY s.submitted_at DESC
      `
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("Fetch submissions error:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}
