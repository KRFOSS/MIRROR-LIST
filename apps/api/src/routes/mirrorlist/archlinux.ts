import { Elysia } from "elysia";
import { fetchMirrorList } from "../../lib/fetch";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 10; // 10분

const archlinux = new Elysia({ prefix: "/archlinux" })
    .get("/", async () => {
        const now = Date.now();

        const cached = cache.get("archlinux-status");
        if (cached && now - cached.timestamp < CACHE_TTL) {
            return cached.data;
        }

        const json = await fetchMirrorList("archlinux", true);

        const mirrorsByCountry: Record<string, any[]> = {};

        for (const mirror of json.urls) {
            const urlObj = new URL(mirror.url);
            const host = urlObj.hostname;
            const country = mirror.country || "Unknown";

            if (!mirrorsByCountry[country]) {
                mirrorsByCountry[country] = [];
            }

            // 같은 host가 있는지 확인
            let existing = mirrorsByCountry[country].find(m => m.host === host);
            if (!existing) {
                existing = {
                    host,
                    protocols: {}
                };
                mirrorsByCountry[country].push(existing);
            }

            existing.protocols[mirror.protocol] = {
                url: mirror.url,
                last_sync: mirror.last_sync,
                score: mirror.score,
                active: mirror.active
            };
        }

        cache.set("archlinux-status", { data: mirrorsByCountry, timestamp: now });
        return mirrorsByCountry;
    });

export default archlinux;
