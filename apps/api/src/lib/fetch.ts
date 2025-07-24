const urls = {
    "archlinux": "https://archlinux.org/mirrors/status/json/",
    
}

export async function fetchMirrorList(mirror: keyof typeof urls, json: boolean = false): Promise<any> {
    const url = urls[mirror];
    if (!url) {
        throw new Error(`No URL found for mirror: ${mirror}`);
    }

    const response = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; MirrorListFetcher/1.0; +https://list.krfoss.org, support+mirrorlistfetcher@imnya.ng)"
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch mirror list: ${response.statusText}`);
    }

    let result = null;
    if (json) {
        result = await response.json();
    } else {
        result = await response.text();
    }
    return result;
}