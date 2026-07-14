#!/usr/bin/env node
// 네이버 뉴스검색 API로 헤드라인만 JSON으로 출력한다 (글은 쓰지 않음).
// Claude가 이 출력을 보고 직접 주제를 고르고 글을 쓴다.
//
// Usage: node scripts/auto/fetch-news.mjs "<검색어>" [count]

import { loadEnvLocal } from "./lib/env.mjs";
import { searchNews } from "./lib/naverNewsSearch.mjs";

async function main() {
  const query = process.argv[2];
  const count = Number(process.argv[3]) || 20;
  if (!query) {
    console.error('Usage: node scripts/auto/fetch-news.mjs "<검색어>" [count]');
    process.exit(1);
  }

  loadEnvLocal();
  const items = await searchNews(query, count);
  console.log(JSON.stringify(items, null, 2));
}

main().catch((err) => {
  console.error("오류:", err.message);
  process.exit(1);
});
