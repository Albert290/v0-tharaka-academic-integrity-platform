/**
 * Statistical Analysis Engine (FREE)
 * Calculates risk score without using paid AI APIs
 * Based on linguistic and statistical patterns
 */

export interface StatisticalAnalysisResult {
  sentence_variation: {
    score: number
    mean_length: number
    std_deviation: number
    description: string
  }
  lexical_diversity: {
    score: number
    unique_words: number
    total_words: number
    ratio: number
    description: string
  }
  grade_level: {
    score: number
    flesch_kincaid: number
    description: string
  }
  punctuation_patterns: {
    score: number
    comma_frequency: number
    period_frequency: number
    consistency_score: number
    description: string
  }
  risk_score: number
  risk_level: 'low' | 'medium' | 'high'
  reasoning: string
}

/**
 * Calculate sentence variation (burstiness)
 * AI text tends to have uniform sentence lengths
 * Human text has more variation
 */
function calculateSentenceVariation(text: string): {
  score: number
  mean: number
  stdDev: number
} {
  // Split into sentences (basic approach)
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0)

  if (sentences.length < 2) {
    return { score: 0, mean: 0, stdDev: 0 }
  }

  const lengths = sentences.map(s => s.split(/\s+/).length)
  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length

  // Calculate standard deviation
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length
  const stdDev = Math.sqrt(variance)

  // Score: Lower std deviation = higher AI risk
  // Normalize: stdDev < 3 = high risk, stdDev > 8 = low risk
  let score = 0
  if (stdDev < 3) {
    score = 80 + (3 - stdDev) * 5 // 80-95 (very uniform = AI-like)
  } else if (stdDev < 5) {
    score = 50 + (5 - stdDev) * 15 // 50-80 (moderate variation)
  } else if (stdDev < 8) {
    score = 20 + (8 - stdDev) * 10 // 20-50 (good variation)
  } else {
    score = Math.max(0, 20 - (stdDev - 8) * 2) // 0-20 (high variation = human-like)
  }

  return { score: Math.round(score), mean: Math.round(mean * 10) / 10, stdDev: Math.round(stdDev * 10) / 10 }
}

/**
 * Calculate lexical diversity (vocabulary richness)
 * AI tends to use more diverse vocabulary than struggling students
 * But plagiarism from notes shows very specific vocabulary
 */
function calculateLexicalDiversity(text: string): {
  score: number
  uniqueWords: number
  totalWords: number
  ratio: number
} {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2) // Ignore very short words

  const totalWords = words.length
  const uniqueWords = new Set(words).size

  if (totalWords === 0) {
    return { score: 0, uniqueWords: 0, totalWords: 0, ratio: 0 }
  }

  const ratio = uniqueWords / totalWords

  // Score: Moderate diversity is normal
  // Too high (>0.7) = AI or copying
  // Too low (<0.4) = repetitive/simple
  let score = 0
  if (ratio > 0.75) {
    score = 70 + (ratio - 0.75) * 100 // 70-95 (very diverse = AI-like)
  } else if (ratio > 0.65) {
    score = 40 + (ratio - 0.65) * 300 // 40-70 (good diversity)
  } else if (ratio > 0.5) {
    score = 20 + (ratio - 0.5) * 133 // 20-40 (moderate)
  } else if (ratio > 0.35) {
    score = 30 + (ratio - 0.35) * 67 // 30-40 (low but acceptable)
  } else {
    score = 50 + (0.35 - ratio) * 100 // 50+ (very repetitive = suspicious)
  }

  return {
    score: Math.round(score),
    uniqueWords,
    totalWords,
    ratio: Math.round(ratio * 1000) / 1000
  }
}

/**
 * Calculate Flesch-Kincaid Grade Level
 * Measures text complexity
 */
function calculateGradeLevel(text: string): {
  score: number
  gradeLevel: number
} {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.split(/\s+/).filter(w => w.length > 0)
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0)

  if (sentences.length === 0 || words.length === 0) {
    return { score: 0, gradeLevel: 0 }
  }

  // Flesch-Kincaid Grade Level formula
  const gradeLevel = 0.39 * (words.length / sentences.length) + 11.8 * (syllables / words.length) - 15.59

  // Score: Grade 8-12 is typical for students
  // Too high (>14) = possibly AI or copied from academic sources
  // Too low (<6) = suspiciously simple
  let score = 0
  if (gradeLevel > 14) {
    score = 60 + (gradeLevel - 14) * 5 // 60-90+ (very complex)
  } else if (gradeLevel > 12) {
    score = 40 + (gradeLevel - 12) * 10 // 40-60 (above average)
  } else if (gradeLevel >= 8) {
    score = 10 + (gradeLevel - 8) * 7.5 // 10-40 (normal range)
  } else if (gradeLevel >= 6) {
    score = 30 + (8 - gradeLevel) * 10 // 30-50 (below average)
  } else {
    score = 50 + (6 - gradeLevel) * 8 // 50-80 (suspiciously simple)
  }

  return {
    score: Math.round(score),
    gradeLevel: Math.round(gradeLevel * 10) / 10
  }
}

/**
 * Count syllables in a word (approximation)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase()
  if (word.length <= 3) return 1
  
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
  word = word.replace(/^y/, '')
  
  const matches = word.match(/[aeiouy]{1,2}/g)
  return matches ? matches.length : 1
}

/**
 * Analyze punctuation patterns
 * AI text tends to have more consistent punctuation usage
 */
function analyzePunctuationPatterns(text: string): {
  score: number
  commaFreq: number
  periodFreq: number
  consistency: number
} {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  
  if (sentences.length === 0) {
    return { score: 0, commaFreq: 0, periodFreq: 0, consistency: 0 }
  }

  // Count commas per sentence
  const commasPerSentence = sentences.map(s => (s.match(/,/g) || []).length)
  const avgCommas = commasPerSentence.reduce((a, b) => a + b, 0) / sentences.length
  
  // Calculate variance in comma usage
  const commaVariance = commasPerSentence.reduce(
    (sum, count) => sum + Math.pow(count - avgCommas, 2),
    0
  ) / sentences.length
  const commaStdDev = Math.sqrt(commaVariance)

  // AI text has more consistent punctuation (lower std dev)
  const consistency = commaStdDev < 1.5 ? 85 : commaStdDev < 2.5 ? 50 : 20

  const words = text.split(/\s+/).length
  const commaFreq = Math.round((text.match(/,/g) || []).length / words * 1000) / 10
  const periodFreq = Math.round(sentences.length / words * 1000) / 10

  // Score based on consistency (low variance = AI-like)
  const score = consistency

  return {
    score: Math.round(score),
    commaFreq,
    periodFreq,
    consistency: Math.round(consistency)
  }
}

/**
 * Calculate overall risk score with weighted formula
 */
function calculateRiskScore(
  sentenceVar: number,
  lexicalDiv: number,
  gradeLevel: number,
  punctuation: number
): { score: number; level: 'low' | 'medium' | 'high' } {
  // Weighted average (customizable weights)
  const weights = {
    sentenceVariation: 0.30,    // 30% - Most important for AI detection
    lexicalDiversity: 0.25,     // 25% - Important for vocab analysis
    gradeLevel: 0.20,           // 20% - Complexity indicator
    punctuation: 0.25           // 25% - Consistency indicator
  }

  const riskScore = Math.round(
    sentenceVar * weights.sentenceVariation +
    lexicalDiv * weights.lexicalDiversity +
    gradeLevel * weights.gradeLevel +
    punctuation * weights.punctuation
  )

  let level: 'low' | 'medium' | 'high'
  if (riskScore < 25) {
    level = 'low'
  } else if (riskScore < 75) {
    level = 'medium'
  } else {
    level = 'high'
  }

  return { score: riskScore, level }
}

/**
 * Main analysis function
 */
export function analyzeText(text: string): StatisticalAnalysisResult {
  if (!text || text.trim().length < 100) {
    throw new Error('Text too short for analysis (minimum 100 characters)')
  }

  // Run all analyses
  const sentenceVar = calculateSentenceVariation(text)
  const lexicalDiv = calculateLexicalDiversity(text)
  const gradeLevel = calculateGradeLevel(text)
  const punctuation = analyzePunctuationPatterns(text)

  // Calculate risk
  const risk = calculateRiskScore(
    sentenceVar.score,
    lexicalDiv.score,
    gradeLevel.score,
    punctuation.score
  )

  // Generate reasoning
  let reasoning = ''
  if (risk.level === 'low') {
    reasoning = 'Text shows natural human variation with diverse sentence structures and appropriate complexity. Low risk of AI generation.'
  } else if (risk.level === 'medium') {
    reasoning = 'Text shows some patterns that warrant deeper analysis. Moderate variation in structure and vocabulary. Requires paid AI analysis.'
  } else {
    reasoning = 'Text shows high consistency and patterns typically associated with AI generation or copied content. High risk detected.'
  }

  return {
    sentence_variation: {
      score: sentenceVar.score,
      mean_length: sentenceVar.mean,
      std_deviation: sentenceVar.stdDev,
      description: sentenceVar.stdDev < 3 
        ? 'Very uniform sentence lengths (AI-like)' 
        : sentenceVar.stdDev > 8 
        ? 'Highly varied sentence lengths (human-like)' 
        : 'Moderate sentence variation'
    },
    lexical_diversity: {
      score: lexicalDiv.score,
      unique_words: lexicalDiv.uniqueWords,
      total_words: lexicalDiv.totalWords,
      ratio: lexicalDiv.ratio,
      description: lexicalDiv.ratio > 0.7 
        ? 'Very diverse vocabulary (AI-like or copied)' 
        : lexicalDiv.ratio < 0.4 
        ? 'Low vocabulary diversity (repetitive)' 
        : 'Normal vocabulary range'
    },
    grade_level: {
      score: gradeLevel.score,
      flesch_kincaid: gradeLevel.gradeLevel,
      description: gradeLevel.gradeLevel > 14 
        ? 'Very high complexity (advanced/AI)' 
        : gradeLevel.gradeLevel < 6 
        ? 'Very low complexity (suspiciously simple)' 
        : `Grade ${Math.round(gradeLevel.gradeLevel)} level (appropriate)`
    },
    punctuation_patterns: {
      score: punctuation.score,
      comma_frequency: punctuation.commaFreq,
      period_frequency: punctuation.periodFreq,
      consistency_score: punctuation.consistency,
      description: punctuation.consistency > 70 
        ? 'Highly consistent punctuation (AI-like)' 
        : 'Natural punctuation variation'
    },
    risk_score: risk.score,
    risk_level: risk.level,
    reasoning
  }
}
