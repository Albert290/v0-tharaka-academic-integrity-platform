#!/bin/bash

# Create database
sudo -u postgres psql -c "CREATE DATABASE tharaka_academic;"

# Create user (optional, if you want a dedicated user)
# sudo -u postgres psql -c "CREATE USER tharaka_user WITH PASSWORD 'your_password';"
# sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE tharaka_academic TO tharaka_user;"

# Run schema
sudo -u postgres psql -d tharaka_academic -f scripts/001-create-tables.sql

echo "PostgreSQL database setup complete!"
