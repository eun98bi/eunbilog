#!/usr/bin/env node
// 쿠팡 파트너스 베스트(인기) 상품을 JSON으로 출력한다 (글은 쓰지 않음).
//
// Usage: node scripts/auto/fetch-coupang-best.mjs [categoryId] [limit]
// categoryId를 생략하면 COUPANG_BEST_CATEGORY_IDS(.env.local) 또는 기본 목록 중 무작위로 고른다.

import { loadEnvLocal } from "./lib/env.mjs";
import { getBestProducts } from "./lib/coupangApi.mjs";

const DEFAULT_BEST_CATEGORY_IDS = [
  "1001", "1002", "1003", "1004", "1005", "1006", "1007", "1008",
  "1009", "1010", "1011", "1012", "1013", "1014", "1015", "1016",
  "1017", "1019", "1020", "1024",
];

function pickCategoryId() {
  const configured = (process.env.COUPANG_BEST_CATEGORY_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const pool = configured.length ? configured : DEFAULT_BEST_CATEGORY_IDS;
  return pool[Math.floor(Math.random() * pool.length)];
}

async function main() {
  loadEnvLocal();

  const categoryId = process.argv[2] || pickCategoryId();
  const limit = Number(process.argv[3]) || 10;

  const items = await getBestProducts(categoryId, limit);
  console.log(JSON.stringify({ categoryId, items }, null, 2));
}

main().catch((err) => {
  console.error("오류:", err.message);
  process.exit(1);
});
