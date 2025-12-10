# Build Stage
FROM node:20.15.1-alpine AS build

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Build arguments for environment variables
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_ENABLE_AI_SEO

# Set environment variables for build
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_ENABLE_AI_SEO=${NEXT_PUBLIC_ENABLE_AI_SEO}
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=true
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps --verbose || npm ci

# Copy source code
COPY . .

# Build the application
RUN echo "=== Starting Next.js Build ===" && \
    echo "Node version: $(node --version)" && \
    echo "NPM version: $(npm --version)" && \
    echo "Current directory: $(pwd)" && \
    echo "Files in /app:" && \
    ls -la /app/ | head -20 && \
    echo "" && \
    echo "=== Running npm run build ===" && \
    npm run build > /tmp/build.log 2>&1; \
    BUILD_EXIT_CODE=$?; \
    if [ $BUILD_EXIT_CODE -ne 0 ]; then \
        echo ""; \
        echo "❌ Build failed with exit code: $BUILD_EXIT_CODE"; \
        echo "=== Full Build Log ==="; \
        cat /tmp/build.log; \
        echo ""; \
        echo "=== Checking for errors ==="; \
        grep -i "error" /tmp/build.log | head -50 || echo "No 'error' keyword found"; \
        exit $BUILD_EXIT_CODE; \
    fi && \
    echo "" && \
    echo "✅ Build command completed successfully" && \
    echo "=== Verifying build output ===" && \
    echo "Checking .next directory:" && \
    if [ ! -d ".next" ]; then \
        echo "❌ ERROR: .next directory not found!"; \
        echo "Build log summary:"; \
        tail -50 /tmp/build.log; \
        exit 1; \
    fi && \
    ls -la .next/ && \
    echo "" && \
    echo "Checking for standalone output:" && \
    if [ -d ".next/standalone" ]; then \
        echo "✅ Standalone directory found"; \
        echo "Standalone directory structure:"; \
        ls -la .next/standalone/; \
        echo ""; \
        if [ -f ".next/standalone/server.js" ]; then \
            echo "✅ server.js found"; \
            echo "File size: $(ls -lh .next/standalone/server.js | awk '{print $5}')"; \
        else \
            echo "❌ ERROR: server.js not found in standalone!"; \
            echo "Contents of standalone directory:"; \
            find .next/standalone -type f | head -30; \
            echo ""; \
            echo "Looking for server files:"; \
            find .next/standalone -name "server.*" -o -name "*.js" | head -20; \
            exit 1; \
        fi; \
    else \
        echo "❌ ERROR: .next/standalone directory not found!"; \
        echo ""; \
        echo "=== Diagnostics ==="; \
        echo "1. Checking next.config.js:"; \
        cat next.config.js | grep -i "output" || echo "   ⚠️ No output config found"; \
        echo ""; \
        echo "2. Checking Next.js version:"; \
        npm list next 2>&1 | head -5 || echo "   ⚠️ Could not check version"; \
        echo ""; \
        echo "3. .next directory contents:"; \
        ls -la .next/ || echo "   ⚠️ Cannot list .next directory"; \
        echo ""; \
        echo "4. Looking for any build artifacts:"; \
        find .next -type f -name "*.js" 2>/dev/null | head -20 || echo "   ⚠️ No JS files found"; \
        echo ""; \
        echo "5. Build log summary:"; \
        tail -50 /tmp/build.log; \
        exit 1; \
    fi && \
    echo "" && \
    echo "✅ Build verification completed successfully"

# Production Stage
FROM node:20.15.1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from build stage
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy standalone output - Next.js 14+ with output: "standalone" generates this
# The standalone folder structure is:
#   standalone/
#     server.js
#     node_modules/
#     package.json
#     .next/
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./

# Permissions are set via --chown in COPY commands above

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

