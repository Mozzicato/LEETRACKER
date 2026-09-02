/* Pulls the whole LeetCode problem set into data/problems.json.
   Run with `npm run problems:fetch`. Re-run whenever you want the newer
   problems; the file is committed so a deploy never depends on LeetCode. */

import { writeFile, mkdir } from 'node:fs/promises';

const ENDPOINT = 'https://leetcode.com/graphql';
const PAGE = 100;

const QUERY = `query list($categorySlug: String!, $skip: Int!, $limit: Int!, $filters: QuestionListFilterInput) {
  problemsetQuestionList: questionList(
    categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters
  ) {
    total: totalNum
    questions: data {
      frontendQuestionId: questionFrontendId
      title
      titleSlug
      difficulty
      isPaidOnly
      topicTags { name }
    }
  }
}`;

async function page(skip) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (lit-sheet problem importer)',
      Referer: 'https://leetcode.com'
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { categorySlug: '', skip, limit: PAGE, filters: {} }
    })
  });

  if (!response.ok) throw new Error(`LeetCode returned ${response.status} at skip=${skip}`);
  const body = await response.json();
  if (body.errors) throw new Error(JSON.stringify(body.errors).slice(0, 200));
  return body.data.problemsetQuestionList;
}

const problems = [];
let total = Infinity;

for (let skip = 0; skip < total; skip += PAGE) {
  const chunk = await page(skip);
  total = chunk.total;

  for (const question of chunk.questions) {
    const number = Number(question.frontendQuestionId);
    /* A few entries are lettered rather than numbered; they are not real
       problems people practise, so skip anything without a clean number. */
    if (!Number.isInteger(number)) continue;

    problems.push({
      number,
      title: question.title,
      slug: question.titleSlug,
      difficulty: question.difficulty,
      /* First tag is the closest thing LeetCode has to a primary category. */
      topic: question.topicTags[0]?.name || 'General',
      tags: question.topicTags.map(tag => tag.name),
      ...(question.isPaidOnly ? { paid: true } : {})
    });
  }

  process.stdout.write(`\r  fetched ${problems.length} / ${total}`);
  await new Promise(resolve => setTimeout(resolve, 250)); // be polite
}

problems.sort((a, b) => a.number - b.number);

await mkdir('data', { recursive: true });
await writeFile('data/problems.json', JSON.stringify(problems));

const free = problems.filter(problem => !problem.paid).length;
console.log(`\n  wrote data/problems.json — ${problems.length} problems (${free} free, ${problems.length - free} premium)`);
