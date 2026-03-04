import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: Request) {
  try {
    console.log('📤 [SUBMISSION] Starting submission process...')
    
    const session = await getSession()
    console.log('👤 [SUBMISSION] Session:', session ? `${session.name} (${session.role})` : 'None')
    
    if (!session || session.role !== "student") {
      console.error('❌ [SUBMISSION] Unauthorized - Not a student')
      return NextResponse.json({ error: "Unauthorized - Students only" }, { status: 401 })
    }

    console.log('📋 [SUBMISSION] Parsing form data...')
    const formData = await request.formData()
    const title = formData.get("title") as string
    const lecturerId = formData.get("lecturer_id") as string
    const file = formData.get("file") as File
    const fileType = formData.get("file_type") as string

    console.log('📝 [SUBMISSION] Form data:', {
      title,
      lecturerId,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type || fileType
    })

    if (!title || !lecturerId || !file) {
      console.error('❌ [SUBMISSION] Missing required fields')
      return NextResponse.json({ 
        error: "Missing required fields",
        details: {
          title: !!title,
          lecturerId: !!lecturerId,
          file: !!file
        }
      }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      console.error(`❌ [SUBMISSION] File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`)
      return NextResponse.json({ 
        error: `File too large. Maximum size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB` 
      }, { status: 400 })
    }

    console.log('💾 [SUBMISSION] Converting file to base64...')
    // Convert file to base64 for storage (in production, use a file storage service)
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const fileUrl = `data:${file.type};base64,${base64}`

    console.log('💿 [SUBMISSION] Saving to database...')
    const result = await sql`
      INSERT INTO submissions (student_id, lecturer_id, title, file_url, file_type)
      VALUES (${session.id}, ${parseInt(lecturerId)}, ${title}, ${fileUrl}, ${fileType || file.type})
      RETURNING id, title, file_type, submitted_at, reviewed
    `

    console.log('✅ [SUBMISSION] Success! Submission ID:', result[0].id)
    return NextResponse.json({ submission: result[0], message: "Submission successful" })
  } catch (error) {
    console.error("❌ [SUBMISSION] Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    })
    
    return NextResponse.json({ 
      error: "Submission failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
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
        SELECT s.id, s.title, s.file_type, s.submitted_at, s.ai_check_result, s.statistical_analysis, s.reviewed, s.file_url,
               u.name as student_name, u.email as student_email, u.registration_number, u.phone_number
        FROM submissions s
        JOIN users u ON s.student_id = u.id
        WHERE s.lecturer_id = ${session.id}
        ORDER BY s.submitted_at DESC
      `
    } else if (session.role === "student") {
      submissions = await sql`
        SELECT s.id, s.title, s.file_type, s.submitted_at, s.ai_check_result, s.statistical_analysis, s.reviewed,
               u.name as lecturer_name
        FROM submissions s
        JOIN users u ON s.lecturer_id = u.id
        WHERE s.student_id = ${session.id}
        ORDER BY s.submitted_at DESC
      `
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse JSONB fields if they're strings (postgres library returns them as strings)
    const parsedSubmissions = submissions.map((sub: any) => ({
      ...sub,
      ai_check_result: typeof sub.ai_check_result === 'string' 
        ? JSON.parse(sub.ai_check_result) 
        : sub.ai_check_result,
      statistical_analysis: typeof sub.statistical_analysis === 'string'
        ? JSON.parse(sub.statistical_analysis)
        : sub.statistical_analysis
    }))

    console.log(`📊 Fetching submissions for ${session.role}:`, {
      count: parsedSubmissions.length,
      firstSubmission: parsedSubmissions[0] ? {
        id: parsedSubmissions[0].id,
        title: parsedSubmissions[0].title,
        hasAiCheck: !!parsedSubmissions[0].ai_check_result,
        hasStats: !!parsedSubmissions[0].statistical_analysis,
        aiConfidence: parsedSubmissions[0].ai_check_result?.ai_confidence,
        humanConfidence: parsedSubmissions[0].ai_check_result?.human_confidence
      } : null
    })

    return NextResponse.json({ submissions: parsedSubmissions })
  } catch (error) {
    console.error("Fetch submissions error:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}
