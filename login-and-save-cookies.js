const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto("https://www.pinterest.com/login/", { waitUntil: "domcontentloaded" });

  console.log("🟡 ВОЙДИ ВРУЧНУЮ В PINTREST...");
  console.log("⏳ Жду 1 минуту...");

  await new Promise(resolve => setTimeout(resolve, 60000));

  const cookies = await page.cookies();
  fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));

  console.log("✅ Куки сохранены в cookies.json");
  await browser.close();
})();
