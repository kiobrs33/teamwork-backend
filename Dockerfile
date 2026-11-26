# Imagen del backend (Easypanel la construye desde GitHub).
FROM node:22.13.0

# Chromium del sistema para los PDF (PdfRendererService usa /usr/bin/chromium
# en producción). Va primero: cambia poco y así su capa queda en caché.
RUN apt-get update && apt-get install -y \
  chromium \
  libnspr4 \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libpangocairo-1.0-0 \
  libpango-1.0-0 \
  libgtk-3-0 \
  fonts-liberation \
  ca-certificates \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
# Sin root: si alguien explotara la aplicación, no sería dueño del
# contenedor. La app no escribe en disco (los archivos van a Cloudinary).
# Se cambia antes de instalar para no duplicar node_modules en otra capa.
RUN chown node:node /app
USER node

# Puppeteer no descarga su propio Chrome (~300 MB): se usa el del sistema.
ENV PUPPETEER_SKIP_DOWNLOAD=true

# `npm ci` instala exactamente lo del package-lock.json. Las dependencias de
# desarrollo se quedan a propósito: el CLI de Prisma (`npx prisma migrate
# deploy` desde la consola del servicio) es una de ellas.
COPY --chown=node:node package*.json ./
RUN npm ci

COPY --chown=node:node . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
EXPOSE 3000

# Easypanel (Docker Swarm) reinicia el contenedor si deja de responder.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# `node` directo y no `npm run`: así recibe las señales de parada y cierra
# limpio en cada despliegue.
CMD ["node", "dist/src/main"]
