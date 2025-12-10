# =========================
# Base image
# =========================
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat

WORKDIR /app

# =========================
# Install dependencies
# =========================
FROM base AS deps

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* .npmrc* ./

# Ensure correct React version
RUN npm install react@18.2.0 react-dom@18.2.0

# Install other dependencies
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# =========================
# Build Next.js
# =========================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# =========================
# Production image
# =========================
FROM base AS runner

WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public, standalone build, and static files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./ 
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy database folder
COPY --from=builder --chown=nextjs:nodejs /app/src/db ./src/db

# Copy generated drizzle folder if exists
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle

# Copy entrypoint script
COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run entrypoint script which handles migrations and starts server
CMD ["./entrypoint.sh"]