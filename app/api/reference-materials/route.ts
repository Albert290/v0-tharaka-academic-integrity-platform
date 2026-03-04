import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import mammoth from "mammoth"

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * Extract text from uploaded file based on type
 */
async function extractTextFromFile(fileUrl: string, fileType: string): Promise<string> {
  try {
    // For plain text files
    if (fileType.includes('text') || fileType.includes('plain')) {
      const base64Data = fileUrl.split(',')[1]
      return Buffer.from(base64Data, 'base64').toString('utf-8')
    }
    
    // For PDF files
    if (fileType.includes('pdf')) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse')
      const base64Data = fileUrl.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')
      const data = await pdfParse(buffer)
      return data.text
    }
    
    // For Word documents (.docx)
    if (fileType.includes('word') || fileType.includes('document') || fileType.includes('officedocument')) {
      const base64Data = fileUrl.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')
      const result = await mammoth.extractRawText({ buffer })
      return result.value
    }
    
    return ""
  } catch (error) {
    console.error('Text extraction error:', error)
    return ""
  }
}

/**
 * GET /api/reference-materials
 * Get all reference materials for the logged-in lecturer
 */
export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "lecturer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const materials = await sql`
      SELECT 
        id,
        title,
        file_type,
        file_size,
        uploaded_at,
        metadata
      FROM reference_materials
      WHERE lecturer_id = ${session.id}
      ORDER BY uploaded_at DESC
    `

    return NextResponse.json({ materials })
  } catch (error) {
    console.error("Error fetching reference materials:", error)
    return NextResponse.json({ error: "Failed to fetch reference materials" }, { status: 500 })
  }
}

/**
 * POST /api/reference-materials
 * Upload a new reference material (course notes/PDF)
 */
export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "lecturer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, fileUrl, fileType } = await request.json()

    if (!title || !fileUrl || !fileType) {
      return NextResponse.json(
        { error: "Title, file URL, and file type are required" },
        { status: 400 }
      )
    }

    // Calculate file size from base64
    const base64Data = fileUrl.split(',')[1] || fileUrl
    const fileSize = Math.round((base64Data.length * 3) / 4)

    // Extract text from the file for later comparison
    console.log('Extracting text from reference material...')
    const extractedText = await extractTextFromFile(fileUrl, fileType)
    console.log(`Extracted ${extractedText.length} characters`)

    // Store in database
    const result = await sql`
      INSERT INTO reference_materials (
        lecturer_id,
        title,
        file_url,
        file_type,
        file_size,
        extracted_text,
        metadata
      )
      VALUES (
        ${session.id},
        ${title},
        ${fileUrl},
        ${fileType},
        ${fileSize},
        ${extractedText},
        ${JSON.stringify({
          word_count: extractedText.split(/\s+/).length,
          uploaded_by: session.name
        })}
      )
      RETURNING id, title, file_type, file_size, uploaded_at
    `

    return NextResponse.json({
      message: "Reference material uploaded successfully",
      material: result[0]
    })
  } catch (error) {
    console.error("Error uploading reference material:", error)
    return NextResponse.json(
      { error: "Failed to upload reference material" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/reference-materials
 * Delete a reference material
 */
export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "lecturer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const materialId = searchParams.get('id')

    if (!materialId) {
      return NextResponse.json({ error: "Material ID is required" }, { status: 400 })
    }

    // Delete only if owned by this lecturer
    const result = await sql`
      DELETE FROM reference_materials
      WHERE id = ${materialId} AND lecturer_id = ${session.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Reference material not found or unauthorized" },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "Reference material deleted successfully" })
  } catch (error) {
    console.error("Error deleting reference material:", error)
    return NextResponse.json(
      { error: "Failed to delete reference material" },
      { status: 500 }
    )
  }
}
