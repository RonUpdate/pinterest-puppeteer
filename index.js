const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const https = require("https");

const app = express();
app.use(express.json());

app.post("/publish", async (req, res) => {
  const { title, description, link, imageUrl } = req.body;

  if (!title || !description || !link || !imageUrl) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const imagePath = path.join(__dirname, "temp.jpg");

  // Загрузка изображения по URL
  const downloadImage = () =>
    new Promise((resolve, reject) => {
      const file = fs.createWriteStream(imagePath);
      https.get(imageUrl, (response) => {
        response.pipe(file);
        file.on("finish", () => file.close(resolve));
      }).on("error", reject);
    });

  try {
    await downloadImage();

    const browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });
    const page = await browser.newPage();

    // Pinterest login
    await page.goto("https://www.pinterest.com/login/", { waitUntil: "domcontentloaded" });
    console.log("🔐 Войди вручную в Pinterest. Ждём...");
    await page.waitForNavigation({ waitUntil: "networkidle0" });

    // Переход к Pin Builder
    await page.goto("https://www.pinterest.com/pin-builder/", { waitUntil: "domcontentloaded" });

    // Заголовок
    await page.waitForSelector('textarea[placeholder="Добавьте заголовок"]');
    await page.type('textarea[placeholder="Добавьте заголовок"]', title);

    // Описание (div[role="textbox"])
    await page.type('div[role="textbox"]', description);

    // Загрузка картинки
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('div[data-test-id="media-upload"]')
    ]);
    await fileChooser.accept([imagePath]);

    // Ссылка
    await page.type('input[placeholder="Добавьте ссылку"]', link);

    console.log("✅ Всё вставлено. Нажми 'Опубликовать' вручную в браузере.");
    res.json({ status: "ready", message: "Ожидает ручной публикации" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при запуске браузера" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Pinterest Launcher on port", PORT);
});
