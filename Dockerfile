FROM node:20-slim

# Устанавливаем зависимости для Puppeteer + Chromium
RUN apt-get update && apt-get install -y \
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

# Копируем package.json до установки
COPY package*.json ./

# Устанавливаем Puppeteer (он сам скачает Chromium)
RUN npm install puppeteer@21.11.0 --legacy-peer-deps

# Копируем остальные файлы проекта
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
