import { createClient } from "@supabase/supabase-js";

export const CATEGORIES = [
  "app-dev",
  "baseball",
  "tooltoolz",
  "affiliate",
  "gov-info",
  "side-hustle",
  "ai-news",
  "travel",
];

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 .env.local에 없습니다.");
  }
  return createClient(supabaseUrl, serviceKey);
}

export function toRow(post) {
  if (!post.category || !CATEGORIES.includes(post.category)) {
    throw new Error(`유효하지 않은 카테고리: ${post.category} (slug: ${post.slug})`);
  }
  return {
    title: post.title,
    slug: post.slug,
    category: post.category,
    date: post.date,
    tags: post.tags ?? [],
    excerpt: post.excerpt,
    cover_image: post.coverImage ?? null,
    published: post.published ?? false,
    content: post.content,
    affiliate: post.affiliate ?? null,
    seo: post.seo ?? null,
  };
}

/** 여러 건을 그대로 upsert한다. 같은 (category, slug)는 의도적으로 덮어쓴다 (scripts/post.mjs의 기존 동작). */
export async function upsertPostsRaw(posts) {
  const supabase = getSupabaseClient();
  const rows = posts.map(toRow);
  const { data, error } = await supabase
    .from("posts")
    .upsert(rows, { onConflict: "category,slug" })
    .select("title, category, slug, published");

  if (error) throw new Error(`업로드 실패: ${error.message}`);
  return data;
}

/** post.slug가 카테고리 내 "다른 글"과 이미 겹치면 -2, -3 ...을 붙여 회피한다. */
async function resolveFreeSlug(supabase, category, slug, title) {
  let candidate = slug;
  for (let n = 2; n < 50; n++) {
    const { data } = await supabase
      .from("posts")
      .select("title")
      .eq("category", category)
      .eq("slug", candidate)
      .maybeSingle();

    if (!data || data.title === title) return candidate;
    candidate = `${slug}-${n}`;
  }
  return candidate;
}

/**
 * 자동 생성 스크립트(scripts/auto/*.mjs) 전용: Gemini가 고른 제목에서 만든 slug가
 * 카테고리 내 무관한 다른 글과 우연히 겹치면 자동으로 회피해 실수로 덮어쓰지 않는다.
 * (같은 topic을 다시 실행해 같은 title이 나온 경우는 정상적으로 덮어쓴다.)
 */
export async function upsertPostWithSlugGuard(post) {
  const supabase = getSupabaseClient();
  const slug = await resolveFreeSlug(supabase, post.category, post.slug, post.title);
  const row = toRow({ ...post, slug });

  const { data, error } = await supabase
    .from("posts")
    .upsert(row, { onConflict: "category,slug" })
    .select("title, category, slug, published")
    .single();

  if (error) throw new Error(`업로드 실패 (${post.slug}): ${error.message}`);
  return data;
}
