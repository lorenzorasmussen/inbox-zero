#!/bin/bash
# scripts/install-mcp-dependencies.sh

set -e

echo "Installing MCP dependencies..."

# Install core MCP server globally (using available package)
npm install -g @modelcontextprotocol/server@1.0.0

# Install MCP server packages globally
npm install -g \
  @modelcontextprotocol/server-filesystem@1.0.0 \
  @modelcontextprotocol/server-git@1.0.0 \
  @modelcontextprotocol/server-websearch@1.0.0

# Install LSP servers as devDependencies
pnpm add -D \
  typescript-language-server@3.4.0 \
  dockerfile-language-server-nodejs@1.0.0 \
  marksman@2025.1

echo "Configuring Docker permissions..."
sudo usermod -aG docker $USER 2>/dev/null || true
sudo chmod 666 /var/run/docker.sock 2>/dev/null || true

echo "Setting up AWS profile..."
mkdir -p ~/.aws
if [ ! -f ~/.aws/config ]; then
  cat << EOF > ~/.aws/config
[profile inbox-zero]
region=us-west-2
output=json
EOF
fi

echo "MCP dependencies installed successfully!"
echo "Please run 'newgrp docker' or log out/in to apply Docker group changes."