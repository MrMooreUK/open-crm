# open-crm multi-stage image
# Build:  docker build -t open-crm .
# Run:    prefer docker compose (handles DB + migrate)

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Build-time placeholders only; runtime env comes from compose/k8s
ENV DATABASE_URL=postgresql://opencrm:opencrm@db:5432/opencrm
ENV BETTER_AUTH_SECRET=build-time-placeholder-secret-32ch
ENV BETTER_AUTH_URL=http://localhost:3000
ENV APP_URL=http://localhost:3000

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/public ./public
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

USER nextjs
EXPOSE 3000

# Migrate then serve
CMD ["sh", "-c", "npx tsx scripts/migrate.ts && exec npx next start -H 0.0.0.0 -p 3000"]
