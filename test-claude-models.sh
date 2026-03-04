#!/bin/bash

API_KEY="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"

# Array of Claude models to test
models=(
  "claude-3-5-sonnet-20241022"
  "claude-3-5-sonnet-20240620"
  "claude-3-sonnet-20240229"
  "claude-3-opus-20240229"
  "claude-3-haiku-20240307"
  "claude-2.1"
  "claude-2.0"
  "claude-instant-1.2"
)

echo "Testing Anthropic API models..."
echo "================================"
echo ""

for model in "${models[@]}"; do
  echo "Testing model: $model"
  
  response=$(curl -s -X POST https://api.anthropic.com/v1/messages \
    -H "x-api-key: $API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "content-type: application/json" \
    -d "{\"model\":\"$model\",\"max_tokens\":10,\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}]}")
  
  # Check if response contains error
  if echo "$response" | grep -q '"type":"error"'; then
    error_type=$(echo "$response" | grep -o '"type":"[^"]*"' | tail -1 | cut -d'"' -f4)
    error_msg=$(echo "$response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    echo "  ❌ FAILED: $error_type - $error_msg"
  else
    echo "  ✅ SUCCESS!"
    echo "  Response: $response" | head -c 100
    echo ""
    echo ""
    echo "🎉 WORKING MODEL FOUND: $model"
    break
  fi
  echo ""
done

echo ""
echo "Test complete!"
