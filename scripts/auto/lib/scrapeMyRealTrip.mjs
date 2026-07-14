const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    throw new Error(`페이지 요청 실패: ${res.status} ${res.statusText} (${url})`);
  }
  return { html: await res.text(), finalUrl: res.url };
}

/**
 * myrealt.rip 단축링크는 HTTP 리다이렉트가 아니라
 * "/bridge/marketing/?return_url=..." 중간 페이지로 끝난다.
 * 그 안의 return_url 쿼리에 진짜 상품 URL이 들어있다.
 */
function extractBridgeReturnUrl(finalUrl) {
  const u = new URL(finalUrl);
  if (!u.pathname.includes("/bridge/marketing")) return null;
  const returnUrl = u.searchParams.get("return_url");
  return returnUrl ? decodeURIComponent(returnUrl) : null;
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 구버전 상품 페이지 (www.myrealtrip.com/offers/{id}).
 * React on Rails로 서버 렌더링되며, 상품 데이터가
 * <script data-component-name="Offer" type="application/json"> 안에 그대로 들어있다.
 */
function parseLegacyOfferPage(html, url) {
  const match = html.match(
    /data-component-name="Offer"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!match) return null;

  const data = JSON.parse(match[1]);
  const offer = data.offerInfo;

  return {
    url,
    title: offer.title,
    subtitle: offer.subtitle,
    cityName: data.cityName,
    introduction: offer.introduction || "",
    attention: offer.attention || "",
    price: data.price?.changedPrice ?? data.price?.mainPrice ?? null,
    includingService: offer.including_service || "",
    excludingService: offer.excluding_service || "",
    durationSize: offer.duration_size,
    durationUnit: offer.duration_unit,
    tags: (offer.tag_list || []).filter(Boolean),
    photos: Array.isArray(data.photos) ? data.photos : [],
    isDomestic: data.countryInfo?.iso_code === "KR",
  };
}

/**
 * 신버전 상품 페이지 (experiences.myrealtrip.com/products/{id}).
 * Next.js로 렌더링되며, 데이터는 <script id="__NEXT_DATA__">의
 * props.pageProps.dehydratedState.queries 안의 react-query 캐시에 들어있다.
 */
function parseExperienceProductPage(html, url) {
  const match = html.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!match) return null;

  const nextData = JSON.parse(match[1]);
  const queries = nextData.props?.pageProps?.dehydratedState?.queries || [];

  const headerQuery = queries.find((q) => q.queryKey?.includes("header"));
  const itemQuery = queries.find((q) => q.queryKey?.includes("item"));
  if (!headerQuery || !itemQuery) return null;

  const header = headerQuery.state.data.data;
  const partitions = itemQuery.state.data.data.partitions || [];

  const findPartition = (key) => partitions.find((p) => p.key === key);

  const introHtml = findPartition("INTRODUCTION")?.partitionData?.introduction || "";
  const includeExclude = findPartition("INCLUDE_EXCLUDE")?.partitionData?.items || [];
  const usage = findPartition("USAGE")?.partitionData?.items || [];
  const essentials = findPartition("ESSENTIALS")?.partitionData?.items || [];
  const refund = findPartition("REFUND")?.partitionData?.items || [];

  const joinDescriptions = (items) =>
    items
      .flatMap((item) => item.descriptions || [])
      .map((d) => d.description)
      .filter(Boolean)
      .join("\n");

  const includesText = joinDescriptions(
    includeExclude.filter((i) => i.key === "INCLUDES")
  );
  const excludesText = joinDescriptions(
    includeExclude.filter((i) => i.key === "EXCLUDES")
  );
  const attention = [joinDescriptions(essentials), joinDescriptions(refund)]
    .filter(Boolean)
    .join("\n\n");

  const priceText = header.ctaButton?.price?.salePrice || "";
  const priceDigits = priceText.replace(/[^0-9]/g, "");

  const nonReviewImages = (header.images || [])
    .filter((img) => img.type !== "REVIEW")
    .map((img) => img.url);

  return {
    url,
    title: header.title,
    subtitle: "",
    cityName: (header.region || []).join(" "),
    introduction: [stripHtml(introHtml), joinDescriptions(usage)]
      .filter(Boolean)
      .join("\n\n"),
    attention,
    price: priceDigits ? Number(priceDigits) : null,
    includingService: includesText,
    excludingService: excludesText,
    durationSize: null,
    durationUnit: null,
    tags: (header.displayTags || []).map((t) => t.name).filter(Boolean),
    photos: nonReviewImages.length ? nonReviewImages : (header.images || []).map((i) => i.url),
    isDomestic: Boolean(header.isDomestic),
  };
}

export async function scrapeMyRealTrip(url) {
  let { html, finalUrl } = await fetchHtml(url);

  const bridgeTarget = extractBridgeReturnUrl(finalUrl);
  if (bridgeTarget) {
    ({ html, finalUrl } = await fetchHtml(bridgeTarget));
  }

  const offer =
    parseLegacyOfferPage(html, finalUrl) ||
    parseExperienceProductPage(html, finalUrl);

  if (!offer) {
    throw new Error(
      "페이지에서 상품 데이터를 찾지 못했습니다. 알려지지 않은 페이지 구조일 수 있습니다."
    );
  }

  return offer;
}
