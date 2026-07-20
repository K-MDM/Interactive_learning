# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24.13.0-slim

FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ============================================
# Stage 1: Dependencies
# ============================================
FROM base AS dependencies

# Copy package-related files first to maximize layer cache reuse.
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

# Install dependencies with lockfile enforcement.
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/usr/local/share/.cache/yarn \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    corepack enable && \
    if [ -f package-lock.json ]; then \
      npm ci --no-audit --no-fund; \
    elif [ -f yarn.lock ]; then \
      yarn install --frozen-lockfile --production=false; \
    elif [ -f pnpm-lock.yaml ]; then \
      pnpm install --frozen-lockfile; \
    else \
      echo "No lockfile found." && exit 1; \
    fi

# ============================================
# Stage 2: Build
# ============================================
FROM base AS builder

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
# Enable Next.js standalone output mode for Docker.
ENV NEXT_OUTPUT=standalone

# Next.js requires NEXT_PUBLIC_ variables at build time to embed them
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL

ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID

# Build with Next.js cache mount for faster repeat Docker builds.
RUN --mount=type=cache,target=/app/.next/cache \
    if [ -f package-lock.json ]; then \
      npm run build; \
    elif [ -f yarn.lock ]; then \
      yarn build; \
    elif [ -f pnpm-lock.yaml ]; then \
      pnpm build; \
    else \
      echo "No lockfile found." && exit 1; \
    fi && \
    echo "=== .next/ contents ===" && ls -la .next/ && \
    test -d .next/standalone || (echo "FATAL: Missing .next/standalone" && exit 1)

# ============================================
# Stage 3: Runtime
# ============================================
FROM node:${NODE_VERSION} AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Create runtime cache dir in one layer and assign ownership to non-root user.
RUN mkdir -p .next && chown -R node:node /app

# Copy runtime artifacts from Next.js standalone output.
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./.next/standalone/public

USER node

EXPOSE 3000

CMD ["node", "server.js"]
