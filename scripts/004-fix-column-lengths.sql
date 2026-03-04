-- Fix file_type column length issue
-- The DOCX mime type is 73 characters but column was only 50

ALTER TABLE submissions 
ALTER COLUMN file_type TYPE VARCHAR(255);

ALTER TABLE reference_materials 
ALTER COLUMN file_type TYPE VARCHAR(255);

-- Also increase title length for safety
ALTER TABLE submissions 
ALTER COLUMN title TYPE VARCHAR(1000);

ALTER TABLE reference_materials 
ALTER COLUMN title TYPE VARCHAR(1000);

COMMENT ON COLUMN submissions.file_type IS 'MIME type of the uploaded file (e.g., application/vnd.openxmlformats-officedocument.wordprocessingml.document)';
COMMENT ON COLUMN reference_materials.file_type IS 'MIME type of the uploaded file';
