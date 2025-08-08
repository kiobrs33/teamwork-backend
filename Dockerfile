# Usa Node.js 22.13.0
FROM node:22.13.0-alpine

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

# Expone el puerto (cambia si usas otro)
EXPOSE 3000

# Comando para ejecutar la app
CMD ["npm", "run", "start:prod"]
