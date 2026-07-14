const BASE_URL = "https://partner-ext-api.myrealtrip.com";

function authHeader() {
  const apiKey = process.env.MRT_API_KEY;
  if (!apiKey) throw new Error("MRT_API_KEY가 .env.local에 설정되어 있지 않습니다.");
  return { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
}

async function postApi(pathname, body) {
  const res = await fetch(`${BASE_URL}${pathname}`, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || json.result?.status !== 200) {
    throw new Error(`마이리얼트립 API 오류 (${pathname}): ${json.result?.message || res.statusText}`);
  }
  return json.data;
}

/** 키워드로 투어/티켓 상품을 인기순(판매량순)으로 검색한다. */
export async function searchPopularTna(keyword, size) {
  const data = await postApi("/v1/products/tna/search", {
    keyword,
    sort: "selling_count_desc",
    page: 1,
    size,
  });
  return data.items;
}

/** 마이리얼트립 상품 URL을 단축 제휴링크(myrealt.rip)로 변환한다. */
export async function createAffiliateLink(targetUrl) {
  const data = await postApi("/v1/mylink", { targetUrl });
  return data.mylink;
}
