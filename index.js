require("dotenv").config();
const WEEK = 19;

const puppeteer = require("puppeteer");
const axios = require("axios");

const headers = {
  Accept: "application/json",
  "Notion-Version": process.env.NOTION_VERSION,
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
};

const CategoryMap = new Map();
CategoryMap.set("Easy", "green");
CategoryMap.set("Medium", "orange");
CategoryMap.set("Hard", "red");

(async function scrape() {
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();

  await page.goto(
    `https://www.techinterviewhandbook.org/grind75?weeks=${WEEK}`
  );

  const questions = await page.$$("div.bg-white > button");
  const q = [];

  if (questions.length > 0) {
    let id = 1;

    for (const element of questions) {
      const week = await element.$eval("div:first-child", (f) => f.textContent);
      const contents = await element.$x(
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
        const url = await content.$eval("div:nth-child(2) a", (c) =>
          c.getAttribute("href")
        );

        let a = {
          title,
          difficulty,
          url,
          week,
        };

        q.push(a);

        id++;
      }
    }
  }

  await page.goto(
    `https://www.techinterviewhandbook.org/grind75?grouping=topics&weeks=${WEEK}`
  );

  const topics = await page.$$("div.bg-white > button");

  if (topics.length > 0) {
    let id = 1;

    for (const element of topics) {
      const category = await element.$eval(
        "div:first-child",
        (f) => f.textContent
      );
      const contents = await element.$x(
        "..//div[contains(@role, 'list')]//div[contains(@role, 'listitem')]"
      );
      for (const content of contents) {
        const title = await content.$eval(
          "div:nth-child(2) a",
          (c) => c.textContent
        );

        q.forEach((v) => {
          if (v.title == title) {
            v.tag = category;
          }
        });
      }
    }
  }

  const databaseOption = {
    method: "POST",
    url: "https://api.notion.com/v1/databases/",
    headers: headers,
    data: {
      properties: {
        Group: {
          name: "Group",
          type: "rich_text",
          rich_text: {},
        },
        "Completion Date": {
          name: "Completion Date",
          type: "formula",
          formula: {
            expression:
              '(prop("Completed") == true) ? now() : fromTimestamp(toNumber(""))',
          },
        },
        ID: {
          name: "ID",
          type: "number",
          number: {
            format: "number",
          },
        },
        Completed: {
          name: "Completed",
          type: "checkbox",
          checkbox: {},
        },
        Name: {
          id: "title",
          name: "Name",
          type: "title",
          title: {},
        },
        Difficulty: {
          id: "%3EEu%7C",
          name: "Difficulty",
          type: "select",
          select: {
            options: [
              {
                name: "Hard",
                color: "red",
              },
              {
                name: "Medium",
                color: "orange",
              },
              {
                name: "Easy",
                color: "green",
              },
            ],
          },
        },
        Category: {
          name: "Category",
          type: "select",
          select: {
            options: [],
          },
        },
      },
      parent: {
        type: "page_id",
        page_id: process.env.NOTION_PAGE,
      },
    },
  };

  const databaseId = await axios
    .request(databaseOption)
    .then(function (response) {
      return response.data.id;
    })
    .catch(function (error) {
      console.error(error);
    });

  console.log(q.length);

  const promises = [];

  for (const question of q) {
    const pageOptions = {
      method: "POST",
      url: "https://api.notion.com/v1/pages",
      headers: headers,
      data: {
        properties: {
          Group: {
            type: "rich_text",
            rich_text: [
              {
                type: "text",
                text: {
                  content: question.week,
                  link: null,
                },
                annotations: {
                  bold: true,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: "default",
                },
                plain_text: question.week,
                href: null,
              },
            ],
          },
          ID: {
            type: "number",
            number: parseInt(question.id),
          },
          Name: {
            id: "title",
            type: "title",
            title: [
              {
                type: "text",
                text: {
                  content: question.title,
                  link: {
                    url: question.url,
                  },
                },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: "default",
                },
                plain_text: question.title,
                href: question.url,
              },
            ],
          },
          Difficulty: {
            select: {
              name: question.difficulty,
            },
          },
          Category: {
            select: {
              name: question.tag,
            },
          },
        },
        parent: {
          database_id: databaseId,
        },
      },
    };

    const result = await axios.request(pageOptions);
    promises.push(result);
  }

  const results = await Promise.all(promises);

  browser.close();
})();
