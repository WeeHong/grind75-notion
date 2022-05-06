const Notion = require("./core/notion");
const Scraper = require("./core/scrape");

const getQuestions = async () => {
  const scrapeQuestion = new Scraper(
    "https://www.techinterviewhandbook.org/grind75?weeks=19"
  );
  return await scrapeQuestion.getQuestions();
};

const getCategories = async (questions) => {
  const scrapeCategory = new Scraper(
    "https://www.techinterviewhandbook.org/grind75?grouping=topics&weeks=19"
  );
  return await scrapeCategory.getCategories(questions);
};

(async function () {
  const questions = await getQuestions();
  const questionsWithCategory = await getCategories(questions);

  const notion = new Notion();
  const { status, data } = await notion.createDatabase();
  if (status === 200) {
    await notion.createQuestion(data.id, questionsWithCategory);
  }
})();
