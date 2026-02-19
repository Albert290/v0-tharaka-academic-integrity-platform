import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const lecturers = await sql`
      SELECT id, name, email FROM users WHERE role = 'lecturer' ORDER BY name
    `

    return NextResponse.json({ lecturers })
  } catch (error) {
    console.error("Fetch lecturers error:", error)
    return NextResponse.json({ error: "Failed to fetch lecturers" }, { status: 500 })
  }
}
