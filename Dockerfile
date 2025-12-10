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

# Build the application with error handling
RUN echo "=== Starting Next.js Build ===" && \
    npm run build 2>&1 | tee /tmp/build.log || { \
        echo ""; \
        echo "❌ Build failed!"; \
        echo "=== Last 100 lines of build log ==="; \
        tail -100 /tmp/build.log || cat /tmp/build.log; \
        echo ""; \
        echo "=== Checking for common errors ==="; \
        grep -i "error" /tmp/build.log | tail -20 || echo "No 'error' found in log"; \
        exit 1; \
    } && \
    echo "✅ Build completed successfully" && \
    echo "=== Checking build output ===" && \
    if [ ! -d ".next" ]; then \
        echo "❌ ERROR: .next directory not found after build!"; \
        exit 1; \
    fi && \
    ls -la .next/ && \
    echo "" && \
    echo "=== Checking for standalone output ===" && \
    if [ -d ".next/standalone" ]; then \
        echo "✅ Standalone output found"; \
        echo "Standalone directory contents:"; \
        ls -la .next/standalone/; \
        echo ""; \
        if [ -f ".next/standalone/server.js" ]; then \
            echo "✅ server.js found in standalone"; \
        else \
            echo "❌ ERROR: server.js not found in standalone!"; \
            exit 1; \
        fi; \
    else \
        echo "❌ ERROR: Standalone output not found!"; \
        echo ""; \
        echo "This usually means:"; \
        echo "1. next.config.js is missing 'output: standalone'"; \
        echo "2. Next.js version doesn't support standalone output"; \
        echo "3. Build failed silently"; \
        echo ""; \
        echo "Checking next.config.js:"; \
        grep -i "output" next.config.js 2>/dev/null || echo "⚠️ next.config.js not found or no output config"; \
        echo ""; \
        echo "Checking Next.js version:"; \
        npm list next 2>/dev/null | grep next || echo "⚠️ Could not determine Next.js version"; \
        echo ""; \
        echo "Checking .next directory structure:"; \
        find .next -type f -name "*.js" | head -10 || echo "No JS files found"; \
        exit 1; \
    fi

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

