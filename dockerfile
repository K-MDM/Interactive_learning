# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20-alpine

# ============================================
# Stage 1: Base image
# ============================================
FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ============================================
# Stage 2: Dependencies
# ============================================
FROM base AS dependencies
RUN apk add --no-libc6-compat libc6-compat
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

RUN --mount=type=cache,target=/root/.npm \
    if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    elif [ -f yarn.lock ]; then \
      yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then \
      corepack enable && pnpm install --frozen-lockfile; \
    else \
      npm install; \
    fi

# ============================================
# Stage 3: Builder
# ============================================
FROM base AS builder

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_OUTPUT=standalone

# Next.js embeds NEXT_PUBLIC_ variables into static JS during build time
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_KEY
ARG SUPABASE_EDGE_EMAIL_URL
ARG RAZORPAY_KEY_ID
ARG RAZORPAY_KEY_SECRET
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ARG OLD_APP_SHARED_SECRET
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
ENV SUPABASE_EDGE_EMAIL_URL=${SUPABASE_EDGE_EMAIL_URL}
ENV RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
ENV RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=${NEXT_PUBLIC_RAZORPAY_KEY_ID}
ENV OLD_APP_SHARED_SECRET=${OLD_APP_SHARED_SECRET}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

# Build Next.js application
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# ============================================
# Stage 4: Production Runner
# ============================================
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy runtime assets
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
