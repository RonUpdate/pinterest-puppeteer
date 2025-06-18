FROM node:20-slim

# Устанавливаем зависимости для Puppeteer
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libnspr4 \
  libnss3 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  wget \
  --no-install-recommends && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Установка Puppeteer отдельно, избегая ошибок
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm install puppeteer@21.11.0 --legacy-peer-deps

# Копируем остальные файлы
COPY . .

# Установка всех зависимостей проекта
RUN npm install --legacy-peer-deps

EXPOSE 3000

CMD ["node", "index.js"]
