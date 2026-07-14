#!/usr/bin/env node
// 키워드로 마이리얼트립 인기 투어/티켓 상품을 찾아 제휴링크 발급 + 상품 상세
// 스크래핑까지 마친 JSON을 출력한다 (글은 쓰지 않음).
//
// Usage: node scripts/auto/fetch-myrealtrip.mjs "<키워드>" [count]

import { loadEnvLocal } from "./lib/env.mjs";
import { searchPopularTna, createAffiliateLink } from "./lib/myrealtripApi.mjs";
import { scrapeMyRealTrip } from "./lib/scrapeMyRealTrip.mjs";

async function main() {
  const keyword = process.argv[2];
  const count = Number(process.argv[3]) || 5;
  if (!keyword) {
    console.error('Usage: node scripts/auto/fetch-myrealtrip.mjs "<키워드>" [count]');
    process.exit(1);
  }

  loadEnvLocal();

  const items = await searchPopularTna(keyword, count);
  const results = [];
  for (const item of items) {
    try {
      const linkUrl = await createAffiliateLink(item.productUrl);
      const offer = await scrapeMyRealTrip(item.productUrl);
      results.push({ linkUrl, offer });
    } catch (err) {
      console.error(`   - ${item.productUrl} 처리 실패: ${err.message}`);
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error("오류:", err.message);
  process.exit(1);
});
