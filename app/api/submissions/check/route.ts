import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import Anthropic from "@anthropic-ai/sdk"
import { analyzeText } from "@/lib/statistical-analysis"
import mammoth from "mammoth"

export const runtime = 'nodejs'
export const maxDuration = 60

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

async function analyzeTextWithClaude(text: string, referenceMaterials?: string[]) {
  // Build reference materials context if available
  let referenceMaterialsContext = ""
  if (referenceMaterials && referenceMaterials.length > 0) {
    referenceMaterialsContext = `

REFERENCE MATERIALS (Course Notes):
The lecturer has provided the following course materials for comparison:

${referenceMaterials.map((material, idx) => `
--- Reference Material ${idx + 1} ---
${material.substring(0, 3000)}
---
`).join('\n')}

When analyzing, also check:
- DIRECT_COPYING: Exact or near-exact phrases from reference materials (0-100, higher = more copying)
- PARAPHRASING: Closely paraphrased content from notes without proper understanding (0-100, higher = more paraphrasing)
- ORIGINAL_THOUGHT: Evidence of student's own analysis and examples beyond the notes (0-100, higher = more original)
`
  }

  const prompt = `You are an expert AI text detector and academic integrity analyzer. Analyze the following student submission.

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
${referenceMaterialsContext}

STUDENT SUBMISSION:
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
  "reasoning": "<brief 1-2 sentence explanation>"${referenceMaterials && referenceMaterials.length > 0 ? `,
  "note_comparison": {
    "direct_copying": <number>,
    "paraphrasing": <number>,
    "original_thought": <number>,
    "comparison_notes": "<brief assessment of how student used the reference materials>"
  }` : ''}
}`

  const message = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
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

export async function POST(request: Request) {
  try {
    console.log('🤖 [AI CHECK] Starting AI check process...')
    const session = await getSession()
    if (!session || session.role !== "lecturer") {
      console.error('❌ [AI CHECK] Unauthorized')
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { submissionId } = await request.json()
    console.log('🎯 [AI CHECK] Checking submission ID:', submissionId)

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
    
    // Step 1: Extract text from submission
    console.log('Extracting text from submission...')
    const text = await extractTextFromFile(submission.file_url as string, submission.file_type as string)
    
    if (!text || text.length < 100) {
      return NextResponse.json({ 
        error: "Could not extract enough text from the file (minimum 100 characters required)" 
      }, { status: 400 })
    }

    console.log(`Extracted ${text.length} characters`)

    // Step 2: Run statistical analysis for reference
    console.log('Running statistical analysis...')
    const statisticalAnalysis = analyzeText(text)
    console.log(`Statistical Risk Level: ${statisticalAnalysis.risk_level} (${statisticalAnalysis.risk_score})`)

    // Step 3: Always use Claude API for detailed AI detection
    let aiCheckResult: any
    console.log('🤖 Sending to Claude API for AI detection...')
      
      if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'your_claude_api_key_here') {
        // Fetch reference materials for comparison
        const referenceMaterialsResult = await sql`
          SELECT extracted_text 
          FROM reference_materials
          WHERE lecturer_id = ${session.id}
          ORDER BY uploaded_at DESC
          LIMIT 5
        `
        
        const referenceMaterials = referenceMaterialsResult
          .map(rm => rm.extracted_text as string)
          .filter(text => text && text.length > 100)

        console.log(`Found ${referenceMaterials.length} reference materials for comparison`)

      try {
        const result = await analyzeTextWithClaude(text, referenceMaterials)
        
        // Calculate average of Claude's 5 indicators for AI confidence
        const indicators = [
          result.repetitive_patterns || 0,
          result.statistical_anomalies || 0,
          result.vocabulary_consistency || 0,
          result.structural_analysis || 0,
          result.perplexity_score || 0
        ]
        
        const aiConfidence = Math.round((indicators.reduce((a, b) => a + b, 0) / 5) * 10) / 10
        const humanConfidence = Math.round((100 - aiConfidence) * 10) / 10
        const isAiGenerated = aiConfidence > 60

        console.log(`✅ Claude Analysis Complete - AI: ${aiConfidence}%, Human: ${humanConfidence}%`)

        aiCheckResult = {
          is_ai_generated: isAiGenerated,
          ai_confidence: aiConfidence,
          human_confidence: humanConfidence,
          confidence_score: aiConfidence, // backwards compatibility
          indicators: {
            repetitive_patterns: Math.round((result.repetitive_patterns || 0) * 10) / 10,
            statistical_anomalies: Math.round((result.statistical_anomalies || 0) * 10) / 10,
            vocabulary_consistency: Math.round((result.vocabulary_consistency || 0) * 10) / 10,
            structural_analysis: Math.round((result.structural_analysis || 0) * 10) / 10,
          perplexity_score: Math.round((result.perplexity_score || 0) * 10) / 10,
        },
        note_comparison: result.note_comparison || null,
        reasoning: result.reasoning || "",
        checked_at: new Date().toISOString(),
      }
    } catch (error) {
      console.error('❌ Claude API error:', error)
      return NextResponse.json({ 
        error: "Claude API call failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }
  } else {
    // No API key configured
    console.error('❌ Claude API key not configured')
    return NextResponse.json({ 
      error: "Claude API key not configured. Please set ANTHROPIC_API_KEY in your environment variables."
    }, { status: 500 })
  }

  // Step 4: Save both statistical analysis and AI check result to database
  console.log('💾 Saving to database:', {
    submissionId,
    statisticalAnalysisRiskScore: statisticalAnalysis.risk_score,
    aiConfidence: aiCheckResult.ai_confidence,
    humanConfidence: aiCheckResult.human_confidence,
    hasAiConfidence: aiCheckResult.ai_confidence !== undefined,
    hasHumanConfidence: aiCheckResult.human_confidence !== undefined,
    aiCheckResultKeys: Object.keys(aiCheckResult)
  })
  
  // Validate data before saving
  if (!aiCheckResult.ai_confidence || !aiCheckResult.human_confidence) {
    console.error('❌ ERROR: Missing confidence scores!', aiCheckResult)
    return NextResponse.json({ 
      error: "AI analysis failed to generate confidence scores",
      details: aiCheckResult
    }, { status: 500 })
  }
    
  const updateResult = await sql`
    UPDATE submissions
    SET 
      statistical_analysis = ${JSON.stringify(statisticalAnalysis)},
      ai_check_result = ${JSON.stringify(aiCheckResult)}
    WHERE id = ${submissionId}
    RETURNING id, statistical_analysis, ai_check_result
  `

  // Parse JSONB fields if returned as strings
  const savedData = updateResult[0];
  if (savedData) {
    savedData.ai_check_result = typeof savedData.ai_check_result === 'string'
      ? JSON.parse(savedData.ai_check_result)
      : savedData.ai_check_result;
    savedData.statistical_analysis = typeof savedData.statistical_analysis === 'string'
      ? JSON.parse(savedData.statistical_analysis)
      : savedData.statistical_analysis;
  }

  console.log('✅ Database update result:', {
    rowsAffected: updateResult.length,
    savedData: savedData ? {
      id: savedData.id,
      hasStatisticalAnalysis: !!savedData.statistical_analysis,
      hasAiCheckResult: !!savedData.ai_check_result,
      savedAiConfidence: savedData.ai_check_result?.ai_confidence,
      savedHumanConfidence: savedData.ai_check_result?.human_confidence
    } : 'No rows returned'
  })
    
  console.log('✨ Analysis complete and saved to database')

    return NextResponse.json({ 
      result: aiCheckResult,
      statistical_analysis: statisticalAnalysis,
      message: 'AI detection completed successfully'
    })
  } catch (error) {
    console.error("AI check error:", error)
    return NextResponse.json({ 
      error: "AI check failed", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}