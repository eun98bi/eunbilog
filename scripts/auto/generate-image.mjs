#!/usr/bin/env node
// 원본 사진이 없는 경우에만 쓰는 최후 수단: Gemini 이미지 생성 모델로 이미지를 만들어
// Supabase Storage의 공개 버킷(post-images)에 올리고 공개 URL을 출력한다.
// 뉴스 og:image, 쿠팡 상품사진, 마이리얼트립 사진이 있으면 이 스크립트를 쓰지 않는다.
//
// 사전 준비: Supabase 대시보드 -> Storage -> New bucket -> 이름 "post-images", Public 체크
//
// Usage: node scripts/auto/generate-image.mjs "<프롬프트>" <slug>

import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadEnvLocal } from "./lib/env.mjs";
import { generateContentWithRetry } from "./lib/geminiRetry.mjs";
import { getSupabaseClient } from "./lib/upsertPost.mjs";

const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.0-flash-preview-image-generation";
const BUCKET = "post-images";

async function generateImageBytes(prompt) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
  });

  const result = await generateContentWithRetry(model, prompt);
  const parts = result.response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData);
  if (!imagePart) throw new Error("Gemini가 이미지를 생성하지 않았습니다.");
  return imagePart.inlineData;
}

async function main() {
  const prompt = process.argv[2];
  const slug = process.argv[3];
  if (!prompt || !slug) {
    console.error('Usage: node scripts/auto/generate-image.mjs "<프롬프트>" <slug>');
    process.exit(1);
  }

  loadEnvLocal();
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY가 .env.local에 설정되어 있지 않습니다.");
    process.exit(1);
  }

  const { data, mimeType } = await generateImageBytes(prompt);
  const ext = mimeType?.includes("png") ? "png" : "jpg";
  const path = `${slug}-${Date.now()}.${ext}`;

  const supabase = getSupabaseClient();
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, Buffer.from(data, "base64"), { contentType: mimeType, upsert: true });

  if (uploadError) {
    throw new Error(
      `Storage 업로드 실패: ${uploadError.message} ("${BUCKET}" 공개 버킷이 Supabase에 있는지 확인)`
    );
  }

  const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  console.log(publicUrlData.publicUrl);
}

main().catch((err) => {
  console.error("오류:", err.message);
  process.exit(1);
});
