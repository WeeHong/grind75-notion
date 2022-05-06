# Grind 75 Notion

<img src="https://res.cloudinary.com/dyniiffju/image/upload/v1651801665/Grind75_Notion_pp4r27.png" alt="Grind75 Notion Screenshot">

Notion URL: https://www.notion.so/weehong/354f33f2bdc24d16afd24b126c96f5c9?v=18da5612222e48d395082f1d554cf239

**Thank you [Tech Interview Handbook](https://www.techinterviewhandbook.org/) to consoliate the list of LeetCode questions**

This is the script that scrapes all the questions from https://www.techinterviewhandbook.org/grind75 and populate into the Notion Database.

By utilizing Notion's database, it allows to us to achieve three things:

- Save the progress when switching to different devices or browser
- Track the completion time _(Useful for space reptition or applying the forgetting curve)_
- Writing your note to revise later

## How to use?

- Clone this repository to your machine
- Run `npm install` to install all the dependency
- Copy the `.env.example` and provide the Notion's `NOTION_TOKEN`, `NOTION_VERSION` and `NOTION_DATABASE`
- Run `node index.js`
