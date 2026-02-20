# Student Details Feature - Setup Guide

## Changes Summary

✅ Added `registration_number` and `phone_number` fields for students
✅ Updated database schema
✅ Updated registration form (students only)
✅ Updated lecturer dashboard to display student details
✅ Updated document viewer and student details dialogs

## Database Setup

### For New Installations
The main schema file has been updated:
```bash
psql -U postgres -d tharaka_academic -f scripts/001-create-tables.sql
```

### For Existing Databases (Migration)
Run the migration script to add new columns:
```bash
psql -U postgres -d tharaka_academic -f scripts/002-add-student-details.sql
```

Or manually via psql:
```sql
ALTER TABLE users ADD COLUMN registration_number VARCHAR(50);
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_users_registration_number ON users(registration_number);
```

## Features Added

### 1. Student Registration
When registering as a student, two additional required fields appear:
- **Registration Number**: Student ID (e.g., TU/2024/001)
- **Phone Number**: Contact number (e.g., +254 700 000 000)

Lecturers don't see these fields - they're student-only.

### 2. Lecturer Dashboard Display

**In Submissions Table:**
- Student info shows name, email, and submission count badge
- Click student name to see full details

**In Student Details Dialog:**
- Displays registration number (with ID card icon)
- Displays phone number (with phone icon)
- Shows submission statistics
- Complete submission history

**In Document Viewer:**
- Shows registration number and phone number
- Organized metadata grid with icons

## How to Test

### 1. Register a New Student
```
1. Go to /register
2. Select "Student" role
3. Fill in:
   - Full Name: John Doe
   - Email: john.doe@tharaka.ac.ke
   - Registration Number: TU/2024/001
   - Phone Number: +254 712 345 678
   - Password: test123
4. Register
```

### 2. Submit a Document
```
1. Login as student
2. Go to student dashboard
3. Upload a test document to any lecturer
```

### 3. View as Lecturer
```
1. Login as lecturer
2. Go to lecturer dashboard
3. You'll see the submission with student info
4. Click student name → see registration number & phone
5. Click "View" → see all details in document viewer
```

## UI Features

### Icons Used
- 📧 **Mail**: Email address
- 🆔 **IdCard**: Registration number
- 📞 **Phone**: Phone number
- 👤 **User**: Student profile
- 📅 **Calendar**: Submission date
- 📄 **FileText**: File type
- #️⃣ **Hash**: Submission count

### Color Scheme
- Navy (#1a1f3a) - Primary brand color
- Gold (#d4af37) - Accent color
- Green - Positive status (reviewed, human content)
- Amber - Warning status (AI detected, pending)

## Validation

### Student Registration
- Registration number: Required for students
- Phone number: Required for students
- Both fields: Optional for lecturers

### Display Logic
- Fields only shown if they exist (conditional rendering)
- Graceful fallback if data is missing
- Responsive grid layout adjusts based on available data

## Database Fields

```sql
users table:
├── registration_number VARCHAR(50) NULL
└── phone_number VARCHAR(20) NULL
```

**Note**: Fields are nullable because:
1. Lecturers don't need them
2. Backward compatibility with existing users
3. Migration doesn't break existing records

## Next Steps (Optional)

Consider adding:
1. **Student profile page**: Let students view/edit their details
2. **Bulk export**: Export student list with contact details
3. **Phone validation**: Format checking (e.g., must start with +254)
4. **Registration format**: Enforce specific format (e.g., TU/YYYY/NNN)
5. **Student search**: Filter by registration number in lecturer view
