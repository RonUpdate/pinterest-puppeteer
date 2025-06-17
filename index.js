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

  // Скачать изображение по ссылке
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

    // Вход в Pinterest
    await page.goto("https://www.pinterest.com/login/", { waitUntil: "domcontentloaded" });
    console.log("⏳ Зайди в Pinterest вручную...");
    await page.waitForNavigation({ waitUntil: "networkidle0" });

    // Открыть форму пина
    await page.goto("https://www.pinterest.com/pin-builder/", { waitUntil: "domcontentloaded" });

    // Заголовок
    await page.waitForSelector('textarea[placeholder]');
    await page.type('textarea[placeholder]', title);

    // Описание
    await page.type('div[role="textbox"]', description);

    // Загрузка изображения
    const [fileChooser] = await Promise.all([
      page.waitForFileChooser(),
      page.click('div[data-test-id="media-upload"]')
    ]);
    await fileChooser.accept([imagePath]);

    // Ссылка
    await page.type('input[placeholder*="ссыл"]', link); // русская локализация

    // Нажать "Опубликовать"
    const [publishButton] = await page.$x("//button[contains(text(), 'Опубликовать') or contains(text(), 'Publish')]");
    if (publishButton) {
      await publishButton.click();
      console.log("✅ Пин опубликован!");
      res.json({ status: "ok", message: "Пин опубликован!" });
    } else {
      throw new Error("Не найдена кнопка 'Опубликовать'");
    }

  } catch (err) {
    console.error("❌ Ошибка:", err);
    res.status(500).json({ error: err.message || "Ошибка во время публикации" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Pinterest Publisher запущен на порту", PORT);
});
