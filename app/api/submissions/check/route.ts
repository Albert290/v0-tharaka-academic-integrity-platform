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

    if (!submissionId) {
      return NextResponse.json({ error: "Submission ID is required" }, { status: 400 })
    }

    // Verify the submission belongs to this lecturer
    const sub = await sql`
      SELECT id, file_url, file_type FROM submissions
      WHERE id = ${submissionId} AND lecturer_id = ${session.id}
    `
    if (sub.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Simulate AI content analysis with realistic indicators
    const indicators = {
      repetitive_patterns: Math.random() * 100,
      statistical_anomalies: Math.random() * 100,
      vocabulary_consistency: Math.random() * 100,
      structural_analysis: Math.random() * 100,
      perplexity_score: Math.random() * 100,
    }

    const avgScore =
      Object.values(indicators).reduce((a, b) => a + b, 0) / Object.values(indicators).length

    const isAiGenerated = avgScore > 60
    const confidenceScore = Math.round(avgScore * 10) / 10

    const aiCheckResult = {
      is_ai_generated: isAiGenerated,
      confidence_score: confidenceScore,
      indicators: {
        repetitive_patterns: Math.round(indicators.repetitive_patterns * 10) / 10,
        statistical_anomalies: Math.round(indicators.statistical_anomalies * 10) / 10,
        vocabulary_consistency: Math.round(indicators.vocabulary_consistency * 10) / 10,
        structural_analysis: Math.round(indicators.structural_analysis * 10) / 10,
        perplexity_score: Math.round(indicators.perplexity_score * 10) / 10,
      },
      checked_at: new Date().toISOString(),
    }

    await sql`
      UPDATE submissions
      SET ai_check_result = ${JSON.stringify(aiCheckResult)}
      WHERE id = ${submissionId}
    `

    return NextResponse.json({ result: aiCheckResult })
  } catch (error) {
    console.error("AI check error:", error)
    return NextResponse.json({ error: "AI check failed" }, { status: 500 })
  }
}
