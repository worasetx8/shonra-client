# Build Stage
FROM node:20.15.1-alpine AS build

WORKDIR /app

# Build arguments for environment variables
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_ENABLE_AI_SEO

# Set environment variables for build
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_ENABLE_AI_SEO=${NEXT_PUBLIC_ENABLE_AI_SEO}
ENV NODE_ENV=production

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps || npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application with error handling
RUN echo "=== Starting Next.js build ===" && \
    npm run build 2>&1 | tee /tmp/build.log || { \
        echo ""; \
        echo "❌ Build failed! Exit code: $?"; \
        echo ""; \
        echo "=== Last 100 lines of build log ==="; \
        tail -100 /tmp/build.log; \
        echo ""; \
        echo "=== Checking for common errors ==="; \
        grep -i "error" /tmp/build.log | tail -30 || echo "No 'error' keyword found"; \
        echo ""; \
        exit 1; \
    } && \
    echo "✅ Build completed successfully" && \
    echo "=== Build output summary ===" && \
    tail -20 /tmp/build.log && \
    echo "" && \
    echo "=== Verifying build output ===" && \
    (test -d /app/.next/standalone && echo "✅ standalone folder exists" || (echo "❌ standalone folder not found!" && exit 1)) && \
    (test -d /app/.next/static && echo "✅ static folder exists" || (echo "❌ static folder not found!" && exit 1)) && \
    (test -f /app/.next/standalone/server.js && echo "✅ server.js exists" || (echo "❌ server.js not found!" && exit 1)) && \
    echo "" && \
    echo "=== Build verification complete ===" && \
    echo "Contents of .next:" && \
    ls -la /app/.next/ && \
    echo "" && \
    echo "Contents of .next/standalone:" && \
    ls -la /app/.next/standalone/ | head -20 && \
    echo "" && \
    echo "Contents of .next/static:" && \
    ls -la /app/.next/static/ | head -20

# Production Stage
FROM node:20.15.1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from build stage
# Next.js standalone output includes only necessary files
# The standalone folder contains server.js and node_modules

# Copy public folder
COPY --from=build --chown=nextjs:nodejs /app/public ./public

# Copy standalone output (required)
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static files (required for Next.js)
# Note: .next/static must exist after build, if not the build failed
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# Permissions are set via --chown in COPY commands above

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

