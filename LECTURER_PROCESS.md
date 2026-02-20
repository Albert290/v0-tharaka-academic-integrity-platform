# Lecturer AI Checker Process Flow

## Complete Process Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    STUDENT SUBMITS DOCUMENT                      │
│  (PDF, DOCX, TXT) → Converted to Base64 → Stored in Database   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   LECTURER DASHBOARD VIEW                        │
│  • Sees list of all student submissions                         │
│  • Each submission has "Check AI" button                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              LECTURER CLICKS "CHECK AI" BUTTON                   │
│  API Call: POST /api/submissions/check                          │
│  Body: { submissionId: 123 }                                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  STEP 1: RETRIEVE DOCUMENT                       │
│  • Fetch submission from database                               │
│  • Get file_url (base64) and file_type                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  STEP 2: EXTRACT TEXT                            │
│                                                                  │
│  IF file_type = "text/plain":                                   │
│    → Decode base64 directly to text                             │
│                                                                  │
│  IF file_type = "application/pdf":                              │
│    → Decode base64 to buffer                                    │
│    → Use pdf-parse library                                      │
│    → Extract all text from PDF                                  │
│                                                                  │
│  IF file_type = "application/vnd.openxmlformats..." (DOCX):     │
│    → Decode base64 to buffer                                    │
│    → Use mammoth library                                        │
│    → Extract text from Word document                            │
│                                                                  │
│  Result: Plain text string (first 5000 chars)                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  STEP 3: SEND TO CLAUDE AI                       │
│                                                                  │
│  Prompt includes:                                               │
│  • 20 detection rules across 5 categories                       │
│  • The extracted text                                           │
│  • Request for JSON scores (0-100 per indicator)                │
│                                                                  │
│  Claude analyzes:                                               │
│  ✓ Repetitive patterns                                          │
│  ✓ Statistical anomalies                                        │
│  ✓ Vocabulary consistency                                       │
│  ✓ Structural analysis                                          │
│  ✓ Perplexity score                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  STEP 4: CLAUDE RESPONDS                         │
│                                                                  │
│  Returns JSON:                                                  │
│  {                                                              │
│    "repetitive_patterns": 75.3,                                 │
│    "statistical_anomalies": 82.1,                               │
│    "vocabulary_consistency": 68.9,                              │
│    "structural_analysis": 71.2,                                 │
│    "perplexity_score": 79.5,                                    │
│    "reasoning": "Text shows high AI indicators..."              │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  STEP 5: CALCULATE FINAL SCORE                   │
│                                                                  │
│  Average = (75.3 + 82.1 + 68.9 + 71.2 + 79.5) / 5              │
│  Average = 75.4%                                                │
│                                                                  │
│  Decision:                                                      │
│  IF Average > 60% → AI-GENERATED ✗                             │
│  IF Average ≤ 60% → HUMAN-WRITTEN ✓                            │
│                                                                  │
│  Result: 75.4% → AI-GENERATED ✗                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  STEP 6: SAVE TO DATABASE                        │
│                                                                  │
│  UPDATE submissions                                             │
│  SET ai_check_result = {                                        │
│    "is_ai_generated": true,                                     │
│    "confidence_score": 75.4,                                    │
│    "indicators": { ... },                                       │
│    "reasoning": "...",                                          │
│    "checked_at": "2026-02-20T00:30:00Z"                         │
│  }                                                              │
│  WHERE id = 123                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  STEP 7: DISPLAY RESULTS                         │
│                                                                  │
│  Lecturer sees:                                                 │
│  • Overall verdict: AI-GENERATED (75.4%)                        │
│  • Breakdown of 5 indicators with scores                        │
│  • Reasoning explanation                                        │
│  • Timestamp of check                                           │
└─────────────────────────────────────────────────────────────────┘
```

## Supported File Types

✅ **Plain Text (.txt)** - Direct extraction
✅ **PDF (.pdf)** - Parsed with pdf-parse
✅ **Word Documents (.docx)** - Parsed with mammoth
❌ **Old Word (.doc)** - Not supported (need different parser)
❌ **Images** - Not supported (need OCR)
❌ **Videos** - Handled by separate deepfake checker

## Example API Response

```json
{
  "result": {
    "is_ai_generated": true,
    "confidence_score": 75.4,
    "indicators": {
      "repetitive_patterns": 75.3,
      "statistical_anomalies": 82.1,
      "vocabulary_consistency": 68.9,
      "structural_analysis": 71.2,
      "perplexity_score": 79.5
    },
    "reasoning": "Text exhibits high repetitive patterns and statistical anomalies typical of AI generation",
    "checked_at": "2026-02-20T00:30:00.000Z"
  }
}
```

## Cost Per Check

- Text extraction: FREE (local processing)
- Claude API call: ~$0.004 per submission
- Database storage: Negligible

**Total: Less than half a cent per submission!**
