const axios = require("axios");

require("dotenv").config();

module.exports = class Notion {
  constructor() {
    this.headers = {
      Accept: "application/json",
      "Notion-Version": process.env.NOTION_VERSION,
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
    };
  }

  getHeaders() {
    return this.headers;
  }

  getDatabaseRequest() {
    return {
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
    };
  }

  getQuestionsRequest(id, question) {
    console.log(question);
    return {
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
        database_id: id,
      },
    };
  }

  async createDatabase() {
    return await axios
      .post("https://api.notion.com/v1/databases/", this.getDatabaseRequest(), {
        headers: this.getHeaders(),
      })
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        return error;
      });
  }

  async createQuestion(id, questions) {
    const promises = [];
    for (const question of questions) {
      const response = await axios.post(
        "https://api.notion.com/v1/pages",
        this.getQuestionsRequest(id, question),
        {
          headers: this.getHeaders(),
        }
      );
      promises.push(response);
    }
    await Promise.all(promises);
  }
};
