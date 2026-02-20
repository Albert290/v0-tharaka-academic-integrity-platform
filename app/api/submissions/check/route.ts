import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import Anthropic from "@anthropic-ai/sdk"

export const runtime = 'nodejs'
export const maxDuration = 60

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function analyzeTextWithClaude(text: string) {
  const prompt = `You are an expert AI text detector. Analyze the following text for AI-generated content indicators.

DETECTION CRITERIA (Score each 0-100, where higher = more AI-like):

1. REPETITIVE_PATTERNS (0-100):
- Repetitive phrases or ideas rephrased without new insight
- Uniform sentence lengths with little burstiness or variation
- Rule-of-three patterns in examples or lists
- Frequent present participles (e.g., "analyzing data, revealing insights")

2. STATISTICAL_ANOMALIES (0-100):
- Statistical averaging of styles, lacking unique voice
- Predictable templates, such as "From X to Y" constructions
- Overuse of transitional phrases like "it's important to note" or "generally speaking"
- Heavy reliance on hedging words like "to some extent" or "arguably"

3. VOCABULARY_CONSISTENCY (0-100):
- Formal vocabulary like "delve," "underscore," or "harness" in casual contexts
- Formal or overly neutral tone lacking casual personality
- Impersonal voice resembling corporate memos or manuals
- Excessive em-dashes (—) as a catch-all for emphasis or clauses

4. STRUCTURAL_ANALYSIS (0-100):
- Overly structured lists or bullet points in prose
- Abrupt topic shifts without smooth narrative flow
- Perfect grammar but shallow depth or generic insights
- Leftover prompt-like phrasing or unnatural specificity

5. PERPLEXITY_SCORE (0-100):
- Absence of typos, quirks, or idiosyncratic phrasing humans use
- Lack of genuine emotion, humor, sarcasm, or personal anecdotes
- No drafting artifacts like revisions or crossed-out ideas
- Factual hallucinations, like invented sources or incorrect details

Text to analyze:
"""
${text.substring(0, 5000)}
"""

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "repetitive_patterns": <number>,
  "statistical_anomalies": <number>,
  "vocabulary_consistency": <number>,
  "structural_analysis": <number>,
  "perplexity_score": <number>,
  "reasoning": "<brief 1-sentence explanation>"
}`

  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  })

  const content = message.content[0]
  if (content.type === "text") {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  }
  throw new Error("Invalid response from Claude")
}

function extractTextFromBase64(fileUrl: string, fileType: string): string {
  try {
    if (fileType.includes('text') || fileType.includes('plain')) {
      const base64Data = fileUrl.split(',')[1]
      return Buffer.from(base64Data, 'base64').toString('utf-8')
    }
    return ""
  } catch {
    return ""
  }
}

async function extractTextFromFile(fileUrl: string, fileType: string): Promise<string> {
  try {
    // For plain text files
    if (fileType.includes('text') || fileType.includes('plain')) {
      const base64Data = fileUrl.split(',')[1]
      return Buffer.from(base64Data, 'base64').toString('utf-8')
    }
    
    // For PDF files
    if (fileType.includes('pdf')) {
      const pdfParse = (await import('pdf-parse')).default
      const base64Data = fileUrl.split(',')[1]
      const buffer = Buffer.from(base64Data, 'base64')
      const data = await pdfParse(buffer)
      return data.text
    }
    
    // For Word documents (.docx)
    if (fileType.includes('word') || fileType.includes('document') || fileType.includes('officedocument')) {
      const mammoth = await import('mammoth')
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

    const sub = await sql`
      SELECT id, file_url, file_type FROM submissions
      WHERE id = ${submissionId} AND lecturer_id = ${session.id}
    `
    if (sub.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    const submission = sub[0]
    let indicators
    let reasoning = ""

    if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_claude_api_key_here') {
      const text = await extractTextFromFile(submission.file_url as string, submission.file_type as string)
      
      if (text && text.length > 50) {
        const result = await analyzeTextWithClaude(text)
        indicators = result
        reasoning = result.reasoning || ""
      } else {
        indicators = {
          repetitive_patterns: Math.random() * 100,
          statistical_anomalies: Math.random() * 100,
          vocabulary_consistency: Math.random() * 100,
          structural_analysis: Math.random() * 100,
          perplexity_score: Math.random() * 100,
        }
        reasoning = "Simulated analysis (no API key or insufficient text)"
      }
    } else {
      indicators = {
        repetitive_patterns: Math.random() * 100,
        statistical_anomalies: Math.random() * 100,
        vocabulary_consistency: Math.random() * 100,
        structural_analysis: Math.random() * 100,
        perplexity_score: Math.random() * 100,
      }
      reasoning = "Simulated analysis (no API key configured)"
    }

    const avgScore =
      Object.values(indicators).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0) / 5

    const isAiGenerated = avgScore > 60
    const confidenceScore = Math.round(avgScore * 10) / 10

    const aiCheckResult = {
      is_ai_generated: isAiGenerated,
      confidence_score: confidenceScore,
      indicators: {
        repetitive_patterns: Math.round((indicators.repetitive_patterns || 0) * 10) / 10,
        statistical_anomalies: Math.round((indicators.statistical_anomalies || 0) * 10) / 10,
        vocabulary_consistency: Math.round((indicators.vocabulary_consistency || 0) * 10) / 10,
        structural_analysis: Math.round((indicators.structural_analysis || 0) * 10) / 10,
        perplexity_score: Math.round((indicators.perplexity_score || 0) * 10) / 10,
      },
      reasoning,
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
