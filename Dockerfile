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

# Copy package files and install dependencies (including devDependencies)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --include=dev --loglevel=error

# Copy source code
COPY . .

# Clean any build artifacts
RUN rm -rf .next node_modules/.cache

# Build the application
RUN echo "=== Starting Next.js build ===" && \
    NODE_OPTIONS="--max-old-space-size=4096" npm run build || { \
        echo ""; \
        echo "❌ Build failed!"; \
        echo "Check the output above for error messages."; \
        exit 1; \
    }

# Verify build output
RUN echo "=== Verifying build output ===" && \
    test -d /app/.next/standalone || (echo "❌ ERROR: .next/standalone not found!" && exit 1) && \
    test -d /app/.next/static || (echo "❌ ERROR: .next/static not found!" && exit 1) && \
    test -f /app/.next/standalone/server.js || (echo "❌ ERROR: server.js not found!" && exit 1) && \
    echo "✅ Build verification passed" && \
    echo "Standalone folder contents:" && \
    ls -la /app/.next/standalone/ | head -10 && \
    echo "Static folder exists: $(ls -la /app/.next/static/ | wc -l) files"

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
COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

# Permissions are set via --chown in COPY commands above

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

