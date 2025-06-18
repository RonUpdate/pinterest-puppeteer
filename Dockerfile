# Используем официальный Node.js образ
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

# Устанавливаем Puppeteer вручную (включает Chromium)
RUN npm install puppeteer@21.11.0

# Создаём рабочую директорию
WORKDIR /app

# Копируем файлы проекта
COPY . .

# Устанавливаем зависимости из package.json
RUN npm install

# Открываем порт (по умолчанию Express использует 3000)
EXPOSE 3000

# Запускаем приложение
CMD ["node", "index.js"]
