#!/bin/sh
set -e

# This script allows runtime environment variable injection for React apps
# Since React apps are built at compile time, we need to inject env vars at runtime
# NO DEFAULTS - All required variables must be explicitly set

# Function to check required environment variables
check_required_env() {
  local var_name=$1
  local var_value=$(eval echo \$$var_name)
  
  if [ -z "$var_value" ]; then
    echo "ERROR: Required environment variable '$var_name' is not set!" >&2
    echo "Please set this variable in your docker-compose.yml file." >&2
    exit 1
  fi
}

# Check all required environment variables
echo "Checking required environment variables..."
check_required_env "VITE_API_BASE_URL"
check_required_env "VITE_API_TIMEOUT"
check_required_env "VITE_API_RETRY_ATTEMPTS"
check_required_env "VITE_API_RETRY_DELAY"
check_required_env "VITE_ENABLE_CSV_EXPORT"
check_required_env "VITE_ENABLE_BULK_ACTIONS"

echo "✅ All required environment variables are set"

# Create a config file with environment variables
# These will override any build-time variables
cat <<EOF > /usr/share/nginx/html/env-config.js
// Environment variables injected at Docker runtime
console.log('🔧 Loading environment variables from Docker runtime...');
window._env_ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL}",
  VITE_API_TIMEOUT: "${VITE_API_TIMEOUT}",
  VITE_API_RETRY_ATTEMPTS: "${VITE_API_RETRY_ATTEMPTS}",
  VITE_API_RETRY_DELAY: "${VITE_API_RETRY_DELAY}",
  VITE_ENABLE_CSV_EXPORT: "${VITE_ENABLE_CSV_EXPORT}",
  VITE_ENABLE_BULK_ACTIONS: "${VITE_ENABLE_BULK_ACTIONS}"
};

console.log('✅ Environment variables loaded:', window._env_);

// Optional development/testing variables (only set if provided)
EOF

# Add optional variables only if they are set
if [ ! -z "$VITE_SKIP_AUTH" ]; then
  echo "window._env_.VITE_SKIP_AUTH = \"${VITE_SKIP_AUTH}\";" >> /usr/share/nginx/html/env-config.js
fi

if [ ! -z "$VITE_MOCK_USER_ID" ]; then
  echo "window._env_.VITE_MOCK_USER_ID = \"${VITE_MOCK_USER_ID}\";" >> /usr/share/nginx/html/env-config.js
fi

echo "" >> /usr/share/nginx/html/env-config.js

echo "Environment configuration written to env-config.js"

# Check if env-config.js script tag exists in index.html
if grep -q "env-config.js" /usr/share/nginx/html/index.html; then
  echo "✅ env-config.js script tag found in index.html"
else
  echo "⚠️ env-config.js script tag not found in index.html - this may cause environment variable issues"
fi

# Execute the CMD
exec "$@"