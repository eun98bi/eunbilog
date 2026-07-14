#!/usr/bin/env node
// 카테고리의 최근 글 제목/태그/날짜를 조회한다 (자동 생성 시 중복 주제 방지용 참고 자료).
//
// Usage: node scripts/auto/list-recent-posts.mjs <category> [limit]

import { loadEnvLocal } from "./lib/env.mjs";
import { getSupabaseClient, CATEGORIES } from "./lib/upsertPost.mjs";

async function main() {
  const category = process.argv[2];
  const limit = Number(process.argv[3]) || 20;
  if (!category || !CATEGORIES.includes(category)) {
    console.error(`Usage: node scripts/auto/list-recent-posts.mjs <category> [limit]\n사용 가능한 카테고리: ${CATEGORIES.join(", ")}`);
    process.exit(1);
  }

  loadEnvLocal();

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("posts")
    .select("title, tags, date, published")
    .eq("category", category)
    .order("date", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  console.log(JSON.stringify(data, null, 2));
}

main().catch((err) => {
  console.error("오류:", err.message);
  process.exit(1);
});
