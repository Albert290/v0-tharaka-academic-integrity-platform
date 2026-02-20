#!/bin/bash

# Load environment variables
source .env.local

# Run the SQL schema
psql "$DATABASE_URL" -f scripts/001-create-tables.sql

echo "Database schema created successfully!"
