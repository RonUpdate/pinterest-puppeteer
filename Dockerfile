FROM node:20-slim

# Устанавливаем зависимости Chromium
RUN apt-get update && apt-get install -y \
  wget \
  ca-certificates \
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
  libxfixes3 \
  libxext6 \
  libx11-xcb1 \
  libxkbcommon0 \
  xdg-utils \
  --no-install-recommends && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*


# Создаём рабочую директорию
WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install puppeteer@21.11.0 --legacy-peer-deps

# Копируем остальное
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
