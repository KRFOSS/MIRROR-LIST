import { JSDOM } from 'jsdom';

// Bun에서 jsdom을 사용하려면 설치가 필요합니다: bun add jsdom

export async function CDMirror() {
    const url = 'https://launchpad.net/ubuntu/+cdmirrors';
    let htmlContent;

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; MirrorListFetcher/1.0; +https://list.krfoss.org, support+mirrorlistfetcher@imnya.ng)"
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        htmlContent = await response.text();
    } catch (error) {
        console.error('HTML 내용을 가져오는 데 실패했습니다:', error);
        return {}; // 실패 시 빈 객체 반환
    }

    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    const mirrorsListTable = document.getElementById('mirrors_list');
    if (!mirrorsListTable) {
        console.error('`mirrors_list` 테이블을 찾을 수 없습니다.');
        return {}; // 테이블을 찾을 수 없으면 빈 객체 반환
    }

    const organizedMirrorData: { [country: string]: any[] } = {};
    let currentCountry = '';

    const rows = mirrorsListTable.querySelectorAll('tbody > tr');

    for (const row of rows) {
        // 섹션 헤더 (국가 정보) 처리
        if (row.classList.contains('head')) {
            const countryNameElement = row.querySelector('th:nth-child(1)');
            if (countryNameElement) {
                currentCountry = countryNameElement.textContent?.trim() || 'Unknown';
                if (!organizedMirrorData[currentCountry]) {
                    organizedMirrorData[currentCountry] = [];
                }
            }
        }
        // 미러 상세 정보 처리 (section-break 제외)
        else if (!row.classList.contains('section-break')) {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
                const nameElement = cells[0]?.querySelector('a');
                const name = nameElement ? nameElement.textContent?.trim() : '';

                const links = cells[1]?.querySelectorAll('a');
                const protocols: { [key: string]: { url: string } } = {};
                let host = '';

                if (links && links.length > 0) {
                    // 호스트 추출 (첫 번째 링크의 호스트를 사용)
                    try {
                        const firstUrl = new URL(links[0].href);
                        host = firstUrl.hostname;
                    } catch (e) {
                        host = ''; // 유효하지 않은 URL인 경우
                    }

                    for (const link of links) {
                        const protocolType = link.textContent?.trim().toLowerCase();
                        if (protocolType) {
                            protocols[protocolType] = { url: link.href.trim() };
                        }
                    }
                }

                const bandwidth = cells[2]?.textContent?.trim();

                if (currentCountry && name && bandwidth) {
                    organizedMirrorData[currentCountry].push({
                        name: name,
                        host: host,
                        bandwidth: bandwidth,
                        protocols: protocols
                    });
                }
            }
        }
    }

    return organizedMirrorData;
}

export async function APTMIrror() {
    const url = 'https://launchpad.net/ubuntu/+archivemirrors';
    let htmlContent;

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; MirrorListFetcher/1.0; +https://list.krfoss.org, support+mirrorlistfetcher@imnya.ng)"
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        htmlContent = await response.text();
    } catch (error) {
        console.error('HTML 내용을 가져오는 데 실패했습니다:', error);
        return {}; // 실패 시 빈 객체 반환
    }

    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    const mirrorsListTable = document.getElementById('mirrors_list');
    if (!mirrorsListTable) {
        console.error('`mirrors_list` 테이블을 찾을 수 없습니다.');
        return {}; // 테이블을 찾을 수 없으면 빈 객체 반환
    }

    const organizedMirrorData: { [country: string]: any[] } = {};
    let currentCountry = '';

    const rows = mirrorsListTable.querySelectorAll('tbody > tr');

    for (const row of rows) {
        // 섹션 헤더 (국가 정보) 처리
        if (row.classList.contains('head')) {
            const countryNameElement = row.querySelector('th:nth-child(1)');
            if (countryNameElement) {
                currentCountry = countryNameElement.textContent?.trim() || 'Unknown';
                if (!organizedMirrorData[currentCountry]) {
                    organizedMirrorData[currentCountry] = [];
                }
            }
        }
        // 미러 상세 정보 처리 (section-break 제외)
        else if (!row.classList.contains('section-break')) {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
                const nameElement = cells[0]?.querySelector('a');
                const name = nameElement ? nameElement.textContent?.trim() : '';

                const links = cells[1]?.querySelectorAll('a');
                const protocols: { [key: string]: { url: string } } = {};
                let host = '';

                if (links && links.length > 0) {
                    // 호스트 추출 (첫 번째 링크의 호스트를 사용)
                    try {
                        const firstUrl = new URL(links[0].href);
                        host = firstUrl.hostname;
                    } catch (e) {
                        host = ''; // 유효하지 않은 URL인 경우
                    }

                    for (const link of links) {
                        const protocolType = link.textContent?.trim().toLowerCase();
                        if (protocolType) {
                            protocols[protocolType] = { url: link.href.trim() };
                        }
                    }
                }

                const bandwidth = cells[2]?.textContent?.trim();

                const lastUpdated = cells[3]?.textContent?.trim();

                if (currentCountry && name && bandwidth) {
                    organizedMirrorData[currentCountry].push({
                        name: name,
                        host: host,
                        bandwidth: bandwidth,
                        protocols: protocols,
                        last_sync: lastUpdated
                    });
                }
            }
        }
    }

    return organizedMirrorData;
}
