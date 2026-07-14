const MAX_RETRIES = Number(process.env.GEMINI_RETRY_MAX) || 6;
const BASE_DELAY_MS = Number(process.env.GEMINI_RETRY_BASE_DELAY_MS) || 15_000;
const MAX_DELAY_MS = 120_000;

function isOverloadedError(err) {
  return err?.status === 503 || /503|overloaded|UNAVAILABLE/i.test(err?.message || "");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 매 시도마다 대기 시간을 2배씩 늘리고(지수 백오프), ±20% 지터를 섞어 동시 재시도가 한꺼번에 몰리는 것을 피한다. */
function backoffDelay(attempt) {
  const delay = Math.min(BASE_DELAY_MS * 2 ** (attempt - 1), MAX_DELAY_MS);
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return Math.round(delay + jitter);
}

/** Gemini가 503(과부하)을 반환하면 지수 백오프로 대기 후 재시도한다. */
export async function generateContentWithRetry(model, prompt) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      if (!isOverloadedError(err) || attempt === MAX_RETRIES) throw err;
      const delay = backoffDelay(attempt);
      console.warn(
        `Gemini API 503(과부하) 오류 발생. ${Math.round(delay / 1000)}초 후 재시도합니다. (${attempt}/${MAX_RETRIES})`
      );
      await sleep(delay);
    }
  }
}
