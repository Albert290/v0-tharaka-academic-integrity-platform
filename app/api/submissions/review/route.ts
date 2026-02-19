import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "lecturer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { submissionId } = await request.json()

    const result = await sql`
      UPDATE submissions
      SET reviewed = TRUE
      WHERE id = ${submissionId} AND lecturer_id = ${session.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Submission marked as reviewed" })
  } catch (error) {
    console.error("Review error:", error)
    return NextResponse.json({ error: "Failed to mark as reviewed" }, { status: 500 })
  }
}
