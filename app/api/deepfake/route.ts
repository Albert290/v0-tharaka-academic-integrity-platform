import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    const formData = await request.formData()
    const video = formData.get("video") as File

    if (!video) {
      return NextResponse.json({ error: "Video file is required" }, { status: 400 })
    }

    // Simulate deepfake analysis with multiple behavioral indicators
    const indicators = {
      lip_sync: {
        label: "Lip Movement Synchronization",
        score: Math.round((40 + Math.random() * 60) * 10) / 10,
        description: "Analyzes whether lip movements match audio patterns",
      },
      breathing: {
        label: "Breathing Pattern Analysis",
        score: Math.round((40 + Math.random() * 60) * 10) / 10,
        description: "Detects natural breathing rhythm and chest movement",
      },
      micro_expressions: {
        label: "Facial Micro-Expressions",
        score: Math.round((40 + Math.random() * 60) * 10) / 10,
        description: "Evaluates subtle involuntary facial movements",
      },
      blinking: {
        label: "Blinking Anomaly Detection",
        score: Math.round((40 + Math.random() * 60) * 10) / 10,
        description: "Checks blink frequency and naturalness",
      },
      skin_texture: {
        label: "Skin Texture Consistency",
        score: Math.round((40 + Math.random() * 60) * 10) / 10,
        description: "Analyzes skin texture for synthetic artifacts",
      },
      head_pose: {
        label: "Head Pose Estimation",
        score: Math.round((40 + Math.random() * 60) * 10) / 10,
        description: "Evaluates head movement naturalness and 3D consistency",
      },
    }

    const scores = Object.values(indicators).map((i) => i.score)
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length
    const confidenceScore = Math.round(avgScore * 10) / 10
    const isAuthentic = confidenceScore > 65

    const result = isAuthentic ? "authentic" : "deepfake"

    // Convert video to base64 URL for storage reference
    const videoUrl = `uploaded_video_${Date.now()}.${video.name.split(".").pop()}`

    // Save to database if user is authenticated
    if (session) {
      await sql`
        INSERT INTO deepfake_checks (user_id, video_url, result, confidence_score, indicators)
        VALUES (${session.id}, ${videoUrl}, ${result}, ${confidenceScore}, ${JSON.stringify(indicators)})
      `
    }

    return NextResponse.json({
      result,
      confidence_score: confidenceScore,
      indicators,
      video_name: video.name,
      analyzed_at: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Deepfake check error:", error)
    return NextResponse.json({ error: "Deepfake analysis failed" }, { status: 500 })
  }
}
