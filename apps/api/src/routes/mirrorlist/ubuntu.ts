import { Elysia } from "elysia";
import { fetchMirrorList } from "../../lib/fetch";
import { APTMIrror, CDMirror } from "../../lib/ubuntu";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 10; // 10분

const ubuntu = new Elysia({ prefix: "/ubuntu" })
    .get("/cd", async () => {
        const now = Date.now();

        const cached = cache.get("ubuntu-cd-mirror");
        if (cached && now - cached.timestamp < CACHE_TTL) {
            return cached.data;
        }

        const mirrorList = await CDMirror();

        cache.set("ubuntu-cd-mirror", { data: mirrorList, timestamp: now });
        return mirrorList;
    }, {
        detail: {
            "summary": "Fetch Ubuntu CD Mirrors",
            "description": "Fetches the list of Ubuntu APT mirrors from Launchpad.",
            "tags": ["Ubuntu"],
        }
    })
    .get("/apt", async () => {
        const now = Date.now();
        const cached = cache.get("ubuntu-apt-mirror");
        if (cached && now - cached.timestamp < CACHE_TTL) {
            return cached.data;
        }

        const mirrorList = await APTMIrror();

        cache.set("ubuntu-apt-mirror", { data: mirrorList, timestamp: now });
        return mirrorList;
    }, {
        detail: {
            "summary": "Fetch Ubuntu APT Mirrors",
            "description": "Fetches the list of Ubuntu APT mirrors from Launchpad.",
            "tags": ["Ubuntu"],
        }
    });

export default ubuntu;