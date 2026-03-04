#!/bin/bash

echo "==================================="
echo "Applying Database Migration"
echo "==================================="
echo ""

# Run the migration
echo "Running migration script..."
sudo -u postgres psql -d tharaka_academic -f scripts/003-add-reference-materials.sql

echo ""
echo "==================================="
echo "Verifying Changes"
echo "==================================="
echo ""

# Check if statistical_analysis column exists
echo "Checking for statistical_analysis column..."
sudo -u postgres psql -d tharaka_academic -t -c "SELECT column_name FROM information_schema.columns WHERE table_name='submissions' AND column_name='statistical_analysis';"

echo ""
echo "Checking for reference_materials table..."
sudo -u postgres psql -d tharaka_academic -t -c "SELECT table_name FROM information_schema.tables WHERE table_name='reference_materials';"

echo ""
echo "==================================="
echo "Migration Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Restart your dev server: pnpm dev"
echo "2. Try uploading and checking a document"
echo ""
