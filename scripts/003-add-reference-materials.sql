-- Migration: Add reference materials table and update submissions
-- Date: 2026-03-03
-- Purpose: Support course notes upload and statistical analysis

-- Create reference_materials table for lecturer's course notes/PDFs
CREATE TABLE IF NOT EXISTS reference_materials (
  id SERIAL PRIMARY KEY,
  lecturer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INTEGER,
  extracted_text TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Add statistical_analysis field to submissions
ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS statistical_analysis JSONB;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_reference_materials_lecturer_id ON reference_materials(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_submissions_statistical_analysis ON submissions USING GIN (statistical_analysis);

-- Add comment for documentation
COMMENT ON TABLE reference_materials IS 'Stores course notes and teaching materials uploaded by lecturers for comparison against student submissions';
COMMENT ON COLUMN submissions.statistical_analysis IS 'Contains free statistical analysis results: sentence_variation, lexical_diversity, grade_level, punctuation_patterns, risk_score';
COMMENT ON COLUMN submissions.ai_check_result IS 'Contains Claude AI analysis results including note_comparison when reference materials are available';
