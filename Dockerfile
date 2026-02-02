FROM node:20-slim

WORKDIR /app

# Install dependencies needed for some node modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY packages/web-app/package.json ./packages/web-app/
COPY packages/core-ui/package.json ./packages/core-ui/
COPY packages/mod-expedientes/package.json ./packages/mod-expedientes/
COPY packages/mod-validacion/package.json ./packages/mod-validacion/
COPY packages/mod-citas/package.json ./packages/mod-citas/
COPY packages/mod-clinicas/package.json ./packages/mod-clinicas/
COPY packages/mod-empresas/package.json ./packages/mod-empresas/
COPY packages/mod-servicios/package.json ./packages/mod-servicios/

# Install dependencies (using npm since lock file is package-lock.json)
RUN npm install

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
