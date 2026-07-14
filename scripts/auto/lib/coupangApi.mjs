import crypto from "node:crypto";

const DOMAIN = "https://api-gateway.coupang.com";

/** 쿠팡 Open API가 요구하는 signed-date 형식: yyMMdd'T'HHmmss'Z' (UTC) */
function getSignedDate() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const yy = String(d.getUTCFullYear()).slice(2);
  return `${yy}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
    d.getUTCMinutes()
  )}${pad(d.getUTCSeconds())}Z`;
}

/** Authorization 헤더: CEA algorithm=HmacSHA256, access-key=..., signed-date=..., signature=... */
function buildAuthorization(method, pathWithQuery) {
  const accessKey = process.env.COUPANG_ACCESS_KEY;
  const secretKey = process.env.COUPANG_SECRET_KEY;
  if (!accessKey || !secretKey) {
    throw new Error("COUPANG_ACCESS_KEY/COUPANG_SECRET_KEY가 .env.local에 설정되어 있지 않습니다.");
  }

  const signedDate = getSignedDate();
  // 쿠팡 서명 메시지는 path와 query를 "?" 없이 그대로 이어붙인다(실제 요청 URL에는 "?"가 들어가지만 서명 대상 문자열에는 없음).
  const [path, query = ""] = pathWithQuery.split("?");
  const message = `${signedDate}${method}${path}${query}`;
  const signature = crypto.createHmac("sha256", secretKey).update(message).digest("hex");

  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${signedDate}, signature=${signature}`;
}

async function request(method, pathWithQuery, body) {
  const res = await fetch(`${DOMAIN}${pathWithQuery}`, {
    method,
    headers: {
      Authorization: buildAuthorization(method, pathWithQuery),
      "Content-Type": "application/json;charset=UTF-8",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json || json.rCode !== "0") {
    throw new Error(
      `쿠팡 파트너스 API 오류 (HTTP ${res.status}): ${json?.rMessage || res.statusText}`
    );
  }
  return json.data;
}

/** 키워드로 상품을 검색한다. 검색 결과 상위 항목 배열을 그대로 반환한다(랭킹 순서 유지). */
export async function searchProducts(keyword, limit = 5) {
  const path = `/v2/providers/affiliate_open_api/apis/openapi/products/search?keyword=${encodeURIComponent(
    keyword
  )}&limit=${limit}`;
  const data = await request("GET", path);
  const items = data?.productData || [];
  if (items.length === 0) {
    throw new Error(`"${keyword}" 검색 결과가 없습니다.`);
  }
  return items;
}

/** 카테고리의 베스트(인기) 상품을 조회한다. 검색어 없이 인기 상품을 자동으로 고를 때 사용한다. */
export async function getBestProducts(categoryId, limit = 10) {
  const path = `/v2/providers/affiliate_open_api/apis/openapi/products/bestcategories/${categoryId}?limit=${limit}`;
  const data = await request("GET", path);
  const items = Array.isArray(data) ? data : data?.productData || [];
  if (items.length === 0) {
    throw new Error(`카테고리(${categoryId})의 베스트 상품을 찾을 수 없습니다.`);
  }
  return items;
}
