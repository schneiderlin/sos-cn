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

# Build static site FIRST (so Tailwind can scan generated HTML)
echo "Building static site..."
clojure -X:build

# Build CSS AFTER HTML exists (so Tailwind detects all used classes)
echo "Building CSS..."
npx @tailwindcss/cli -i ./src/main.css -o ./resources/public/styles.css --verbose

# Copy the freshly built CSS to output directory (Clojure export already copied the old one)
echo "Copying CSS to output..."
cp ./resources/public/styles.css ./target/powerpack/styles.css

echo "Build complete! Output in target/powerpack/ directory"

