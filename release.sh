#!/bin/bash
# Simple release script to eliminate NPM friction

echo "🚀 Starting release process..."

# 1. Ensure we are on the Mac Mini latest main branch
git pull origin main

# 2. Bump version (patch = 0.0.1 update)
npm version patch -m "Upgrade to %s - automated release"

# 3. Build the TypeScript files
npm run build

# 4. Push to GitHub
git push origin main --tags

# 5. The final "stumble" point: Publishing
npm publish

echo "✅ Published successfully to NPM!"