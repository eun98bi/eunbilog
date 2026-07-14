/** 뉴스 기사 URL의 og:image 메타태그를 읽어 대표 이미지 URL을 추출한다. 실패하면 null. */
export async function extractOgImage(articleUrl) {
  try {
    const res = await fetch(articleUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (!match) return null;

    return match[1].replace(/&amp;/g, "&");
  } catch {
    return null;
  }
}
