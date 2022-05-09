require("dotenv").config();
const puppeteer = require("puppeteer");

module.exports = class Scrape {
  constructor(url) {
    this.url = url;
  }

  async getQuestions() {
    const questions = [];

    const browser = await puppeteer.launch(
      {
        headless: true,
        args: ['--no-sandbox']
      }
    );
    const page = await browser.newPage();

    await page.goto(this.url);

    const topics = await page.$$("div.bg-white > button");

    if (topics.length > 0) {
      let id = 1;

      for (const topic of topics) {
        const week = await topic.$eval("div:first-child", (f) => f.textContent);
        const contents = await topic.$x(
          "..//div[contains(@role, 'list')]//div[contains(@role, 'listitem')]"
        );
        for (const content of contents) {
          const title = await content.$eval(
            "div:nth-child(2) a",
            (c) => c.textContent
          );
          const difficulty = await content.$eval(
            "div:nth-child(2) div:last-child > span:first-child",
            (c) => c.textContent
          );
          let url = await content.$eval("div:nth-child(2) a", (c) =>
            c.getAttribute("href")
          );

          if (process.env.LEETCODE_CHINESE === "1") {
            const urls = url.split("/");
            urls[2] = "leetcode-cn.com";
            url = urls.join("/");
          }

          questions.push({
            id,
            title,
            difficulty,
            url,
            week,
          });

          id++;
        }
      }
    }
    browser.close();
    return questions;
  }

  async getCategories(questions) {
    const browser = await puppeteer.launch(
      {
        headless: true,
        args: ['--no-sandbox']
      }
    );
    const page = await browser.newPage();

    await page.goto(this.url);

    const categories = await page.$$("div.bg-white > button");

    if (categories.length > 0) {
      for (const category of categories) {
        const tag = await category.$eval(
          "div:first-child",
          (f) => f.textContent
        );

        const contents = await category.$x(
          "..//div[contains(@role, 'list')]//div[contains(@role, 'listitem')]"
        );

        for (const content of contents) {
          const title = await content.$eval(
            "div:nth-child(2) a",
            (c) => c.textContent
          );

          questions.forEach((q) => {
            if (q.title == title) {
              q.tag = tag;
            }
          });
        }
      }
    }
    browser.close();
    return questions;
  }
};
