# Based on: https://nextjs.org/docs/deployment#docker-image

# Build image with dependencies only
FROM node:erbium-alpine3.12 AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build app
FROM node:erbium-alpine3.12 AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build

# Build image runner
FROM node:erbium-alpine3.12 AS runner
LABEL maintainer="hello@vizzuality.com"
WORKDIR /app

ARG UID
ARG GID

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

RUN addgroup -g 1001 -S nodejs
RUN adduser -S -D -u 1001 nextjs
RUN chown -R nextjs:nodejs /app/.next
USER nextjs

EXPOSE 3000

RUN npx next telemetry disable

CMD ["yarn", "start"]
