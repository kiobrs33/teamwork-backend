# Usa Node.js 22.13.0
# FROM node:22.13.0-alpine
FROM node:22.13.0

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala dependencias
RUN npm install 

# Copia el resto del proyecto
COPY . .

# Genera Prisma Client (si usas Prisma)
RUN npx prisma generate

# ⚠️ IMPORTANTE: compila NestJS
RUN npm run build

# instalar chromium y dependencias
RUN apt-get update && apt-get install -y \
  chromium \
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

# Expone el puerto (cambia si usas otro)
EXPOSE 3000

# Comando para ejecutar la app
CMD ["npm", "run", "start:prod"]
