const ENDPOINT = "https://openapi.naver.com/v1/search/news.json";

function stripTags(text) {
  return text.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
}

/** 네이버 뉴스검색 API로 카테고리/키워드의 최신 뉴스 헤드라인을 가져온다(최신순). */
export async function searchNews(query, display = 20) {
  const clientId = process.env.NAVER_SEARCH_CLIENT_ID;
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "NAVER_SEARCH_CLIENT_ID/NAVER_SEARCH_CLIENT_SECRET이 .env.local에 설정되어 있지 않습니다. (developers.naver.com에서 발급)"
    );
  }

  const url = `${ENDPOINT}?query=${encodeURIComponent(query)}&display=${display}&sort=date`;
  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json) {
    throw new Error(`네이버 뉴스검색 API 오류 (HTTP ${res.status}): ${json?.errorMessage || res.statusText}`);
  }

  const items = json.items || [];
  if (items.length === 0) {
    throw new Error(`"${query}" 뉴스 검색 결과가 없습니다.`);
  }
  return items.map((item) => ({
    title: stripTags(item.title),
    description: stripTags(item.description),
    link: item.originallink || item.link,
    pubDate: item.pubDate,
  }));
}
