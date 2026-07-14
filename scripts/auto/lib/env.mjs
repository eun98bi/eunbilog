import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/** .env.local을 수동 파싱해서 process.env에 채운다 (이미 설정된 값은 덮어쓰지 않음). */
export function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !(match[1] in process.env)) {
      process.env[match[1]] = match[2].trim();
    }
  }
}
