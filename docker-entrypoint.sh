#!/bin/sh
set -e

# This script allows runtime environment variable injection for React apps
# Since React apps are built at compile time, we need to inject env vars at runtime

# Create a config file with environment variables
cat <<EOF > /usr/share/nginx/html/env-config.js
window._env_ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-https://recruiter-copilot-apis.quesscorp.com/api/v1}",
  VITE_API_TIMEOUT: "${VITE_API_TIMEOUT:-30000}",
  VITE_API_RETRY_ATTEMPTS: "${VITE_API_RETRY_ATTEMPTS:-3}",
  VITE_API_RETRY_DELAY: "${VITE_API_RETRY_DELAY:-1000}",
  VITE_ENABLE_CSV_EXPORT: "${VITE_ENABLE_CSV_EXPORT:-true}",
  VITE_ENABLE_BULK_ACTIONS: "${VITE_ENABLE_BULK_ACTIONS:-true}",
  VITE_SKIP_AUTH: "${VITE_SKIP_AUTH:-false}",
  VITE_MOCK_USER_ID: "${VITE_MOCK_USER_ID:-test-user-123}"
};
EOF

# Inject the script tag into index.html if not already present
if ! grep -q "env-config.js" /usr/share/nginx/html/index.html; then
  sed -i 's|</head>|<script src="/env-config.js"></script></head>|' /usr/share/nginx/html/index.html
fi

# Execute the CMD
exec "$@"