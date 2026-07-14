#!/usr/bin/env node
// 기사 URL의 og:image를 출력한다. 없으면 빈 문자열을 출력한다.
//
// Usage: node scripts/auto/fetch-og-image.mjs "<기사 URL>"

import { extractOgImage } from "./lib/extractOgImage.mjs";

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node scripts/auto/fetch-og-image.mjs "<기사 URL>"');
    process.exit(1);
  }

  const imageUrl = await extractOgImage(url);
  console.log(imageUrl || "");
}

main().catch((err) => {
  console.error("오류:", err.message);
  process.exit(1);
});
