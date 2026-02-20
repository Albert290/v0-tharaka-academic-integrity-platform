# AI Detection System - Scoring Guide

## How the Percentage is Calculated

### 5 Main Indicators (Each scored 0-100%)

#### 1. REPETITIVE PATTERNS (0-100%)
**What it detects:**
- Repetitive phrases or ideas rephrased without new insight
- Uniform sentence lengths with little burstiness or variation
- Rule-of-three patterns in examples or lists
- Frequent present participles (e.g., "analyzing data, revealing insights")

**Scoring:**
- 0-30%: Natural human variation, diverse sentence structures
- 31-60%: Some repetition, moderate patterns
- 61-100%: High repetition, predictable AI patterns

---

#### 2. STATISTICAL ANOMALIES (0-100%)
**What it detects:**
- Statistical averaging of styles, lacking unique voice
- Predictable templates, such as "From X to Y" constructions
- Overuse of transitional phrases like "it's important to note" or "generally speaking"
- Heavy reliance on hedging words like "to some extent" or "arguably"

**Scoring:**
- 0-30%: Natural language flow, unique voice
- 31-60%: Some formulaic patterns
- 61-100%: Highly predictable, template-based writing

---

#### 3. VOCABULARY CONSISTENCY (0-100%)
**What it detects:**
- Formal vocabulary like "delve," "underscore," or "harness" in casual contexts
- Formal or overly neutral tone lacking casual personality
- Impersonal voice resembling corporate memos or manuals
- Excessive em-dashes (—) as a catch-all for emphasis or clauses

**Scoring:**
- 0-30%: Natural vocabulary variation, appropriate tone
- 31-60%: Somewhat formal or consistent
- 61-100%: Overly formal, AI-typical vocabulary

---

#### 4. STRUCTURAL ANALYSIS (0-100%)
**What it detects:**
- Overly structured lists or bullet points in prose
- Abrupt topic shifts without smooth narrative flow
- Perfect grammar but shallow depth or generic insights
- Leftover prompt-like phrasing or unnatural specificity

**Scoring:**
- 0-30%: Natural flow, organic structure
- 31-60%: Some structural rigidity
- 61-100%: Highly formulaic, template-driven structure

---

#### 5. PERPLEXITY SCORE (0-100%)
**What it detects:**
- Absence of typos, quirks, or idiosyncratic phrasing humans use
- Lack of genuine emotion, humor, sarcasm, or personal anecdotes
- No drafting artifacts like revisions or crossed-out ideas
- Factual hallucinations, like invented sources or incorrect details

**Scoring:**
- 0-30%: Human-like imperfections, personality, emotion
- 31-60%: Somewhat polished, limited personality
- 61-100%: Too perfect, lacks human touch

---

## Final Confidence Score Calculation

**Formula:**
```
Confidence Score = (Sum of all 5 indicators) / 5
```

**Example:**
```
Repetitive Patterns:      75.3%
Statistical Anomalies:    82.1%
Vocabulary Consistency:   68.9%
Structural Analysis:      71.2%
Perplexity Score:         79.5%

Total: 377.0%
Average: 377.0 / 5 = 75.4%

Result: 75.4% confidence → AI-GENERATED ✗
```

---

## Decision Threshold

**Threshold: 60%**

- **0-60%**: Likely HUMAN-WRITTEN ✓
  - Natural variation and human characteristics present
  - May have some AI-like patterns but overall authentic

- **61-100%**: Likely AI-GENERATED ✗
  - Multiple AI indicators detected
  - Lacks human writing characteristics
  - High confidence of AI generation

---

## How to Get Claude API Key

1. Go to https://console.anthropic.com
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Add to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
   ```

**Pricing:**
- Claude 3.5 Sonnet: $3 per million input tokens
- ~750 words = 1,000 tokens
- Cost per analysis: ~$0.004 (less than half a cent)
- 1,000 submissions = ~$4

---

## Alternative: Use OpenAI GPT-4

If you prefer OpenAI, you can also use GPT-4:

1. Get API key from https://platform.openai.com
2. Install: `pnpm add openai`
3. Add to `.env.local`: `OPENAI_API_KEY=sk-xxxxx`
4. Update the code to use OpenAI SDK instead

**Pricing:**
- GPT-4o: $2.50 per million input tokens
- Slightly cheaper than Claude
