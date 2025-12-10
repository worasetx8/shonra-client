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
    npm run build && \
    echo "✅ Build command completed" && \
    echo "=== Verifying build output ===" && \
    echo "Checking .next directory:" && \
    ls -la .next/ 2>/dev/null || (echo "❌ ERROR: .next directory not found!" && exit 1) && \
    echo "" && \
    echo "Checking for standalone output:" && \
    if [ -d ".next/standalone" ]; then \
        echo "✅ Standalone directory found"; \
        ls -la .next/standalone/; \
        echo ""; \
        if [ -f ".next/standalone/server.js" ]; then \
            echo "✅ server.js found"; \
        else \
            echo "❌ ERROR: server.js not found in standalone!"; \
            echo "Contents of standalone directory:"; \
            find .next/standalone -type f | head -20; \
            exit 1; \
        fi; \
    else \
        echo "❌ ERROR: .next/standalone directory not found!"; \
        echo ""; \
        echo "Diagnostics:"; \
        echo "1. Checking next.config.js:"; \
        cat next.config.js | grep -i "output" || echo "   ⚠️ No output config found"; \
        echo ""; \
        echo "2. Checking Next.js version:"; \
        npm list next || echo "   ⚠️ Could not check version"; \
        echo ""; \
        echo "3. .next directory contents:"; \
        ls -la .next/ || echo "   ⚠️ Cannot list .next directory"; \
        echo ""; \
        echo "4. Looking for any build artifacts:"; \
        find .next -type f -name "*.js" 2>/dev/null | head -10 || echo "   ⚠️ No JS files found"; \
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

