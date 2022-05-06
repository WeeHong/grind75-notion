require("dotenv").config();

const puppeteer = require("puppeteer");
const axios = require("axios");

const createNotionDatabase = async () => {
  const databaseOption = {
    method: "POST",
    url: "https://api.notion.com/v1/databases/",
    headers: {
      Accept: "application/json",
      "Notion-Version": process.env.NOTION_VERSION,
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    },
    data: {
      properties: {
        Group: {
          id: "%3A%3AWV",
          name: "Group",
          type: "rich_text",
          rich_text: {},
        },
        "Completion Date": {
          id: "oI%40O",
          name: "Completion Date",
          type: "formula",
          formula: {
            expression:
              '(prop("Completed") == true) ? now() : fromTimestamp(toNumber(""))',
          },
        },
        ID: {
          id: "u~%5BI",
          name: "ID",
          type: "number",
          number: {
            format: "number",
          },
        },
        Completed: {
          id: "z%5Cl%3B",
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
      },
      parent: {
        type: "page_id",
        page_id: process.env.NOTION_PAGE,
      },
    },
  };

  return await axios
    .request(databaseOption)
    .then(function (response) {
      return response.data.id;
    })
    .catch(function (error) {
      console.error(error);
    });
};

const createRecord = async (databaseId, week, id, title, url) => {
  const pageOptions = {
    method: "POST",
    url: "https://api.notion.com/v1/pages",
    headers: {
      Accept: "application/json",
      "Notion-Version": process.env.NOTION_VERSION,
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    },
    data: {
      properties: {
        Group: {
          type: "rich_text",
          rich_text: [
            {
              type: "text",
              text: {
                content: week,
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
              plain_text: week,
              href: null,
            },
          ],
        },
        ID: {
          type: "number",
          number: parseInt(id),
        },
        Name: {
          id: "title",
          type: "title",
          title: [
            {
              type: "text",
              text: {
                content: title,
                link: {
                  url: url,
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
              plain_text: title,
              href: url,
            },
          ],
        },
      },
      parent: {
        database_id: databaseId,
      },
    },
  };

  await axios
    .request(pageOptions)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
};

(async function scrape() {
  const browser = await puppeteer.launch({});
  const page = await browser.newPage();

  await page.goto("https://www.techinterviewhandbook.org/grind75");

  const p = await page.$$("div.bg-white > button");

  if (p.length > 0) {
    const databaseId = await createNotionDatabase();

    let id = 1;

    for (const element of p) {
      const week = await element.$eval("div:first-child", (f) => f.textContent);
      const contents = await element.$x(
        "..//div[contains(@role, 'list')]//div[contains(@role, 'listitem')]"
      );
      for (const content of contents) {
        const title = await content.$eval(
          "div:nth-child(2) a",
          (c) => c.textContent
        );
        const url = await content.$eval("div:nth-child(2) a", (c) =>
          c.getAttribute("href")
        );

        await createRecord(databaseId, week, id, title, url);

        id++;
      }
    }
  }

  browser.close();
})();
