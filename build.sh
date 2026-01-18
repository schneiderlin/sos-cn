#!/bin/bash
set -e

# Install Clojure CLI tools to user directory (no sudo needed)
if ! command -v clojure &> /dev/null; then
  echo "Installing Clojure CLI tools..."
  curl -O https://download.clojure.org/install/linux-install-1.11.1.1347.sh
  chmod +x linux-install-1.11.1.1347.sh
  # Install to user directory
  export PREFIX="$HOME/.local"
  mkdir -p "$PREFIX"
  ./linux-install-1.11.1.1347.sh --prefix "$PREFIX"
  rm linux-install-1.11.1.1347.sh
  export PATH="$PREFIX/bin:$PATH"
fi

# Build CSS first (Tailwind auto-scans source files)
echo "Building CSS..."
npx @tailwindcss/cli -i ./src/main.css -o ./resources/public/styles.css --verbose

# Build static site (optimus expects CSS to exist)
echo "Building static site..."
clojure -X:build

echo "Build complete! Output in target/powerpack/ directory"

