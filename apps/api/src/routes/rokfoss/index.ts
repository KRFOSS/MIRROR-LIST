import Elysia from 'elysia';
import { parse, HTMLElement } from 'node-html-parser';

// only arch dsync2.krfoss.org

// --- (이전과 동일) HTML을 가져오는 함수 ---
export async function fetchRokfossMirrors(): Promise<string[]> {
    const URL = 'https://http.krfoss.org/';
    const ID_PREFIX = 'mirror-modal-';
    const response = await fetch(URL);
    if (!response.ok) throw new Error(`HTTP 요청 실패! 상태: ${response.status}`);
    const html = await response.text();
    const root = parse(html);
    const selector = `[id^="${ID_PREFIX}"]`;
    const elements = root.querySelectorAll(selector);
    return elements.map(el => el.outerHTML);
}

/**
 * 미러 상세정보 HTML 한 조각을 파싱해서 JSON 객체로 변환합니다.
 * @param htmlString - 파싱할 HTML 문자열
 * @returns {object} - 구조화된 JSON 객체
 */
function parseMirrorHtmlToJson(htmlString: string): object {
    const root = parse(htmlString);

    const result: { [key: string]: any } = {};

    // 1. 고유 ID 추출 (예: 'mirror-modal-daxnet1' -> 'daxnet1')
    const id = root.querySelector('[id^="mirror-modal-"]')?.id.split('-').pop() || '';
    result.id = id;

    // 2. 테이블의 각 행(tr)을 순회하며 정보 추출
    const rows = root.querySelectorAll('.mirror-detail-table tr');
    rows.forEach(row => {
        const key = row.querySelector('td:first-child')?.textContent.trim().replace(':', '');
        const valueCell = row.querySelector('td:last-child');

        if (!key || !valueCell) return;

        if (id === 'tefexia') {
            result.region = 'JP';
        } else {
            result.region = 'KR';
        }

        result.bandwidth = 'NaN';
        result.score = -1; // 기본값 설정

        switch (key) {
            case '위치':
                result.location = valueCell.textContent.trim();
                break;
            case '네트워크':
                result.network = valueCell.textContent.trim();
                break;
            case '주소':
                result.address = valueCell.querySelector('a')?.getAttribute('href') || '';
                result.host = result.address.split('/')[2] || ''; // 주소에서 호스트 추출
                break;
            case '상태':
                result.status = valueCell.textContent.trim() === '정상' ? true : false;
                break;
            case '제공 리포지토리':
                // 각 span 태그의 텍스트를 배열로 저장
                result.repositories = valueCell.querySelectorAll('.repo-badge')
                    .map(span => span.textContent.trim());
                break;
        }
    });

    return result;
}

const rokfoss = new Elysia({ prefix: '/rokfoss' })
    .get('/', async () => {
        const mirrorHtmlList = await fetchRokfossMirrors();
        const mirrors = mirrorHtmlList.map(html => parseMirrorHtmlToJson(html));
        return mirrors;
    }, {
        detail: {
            summary: 'Fetch ROKFOSS Mirrors',
            description: 'Fetches the list of ROKFOSS mirrors from the official ROKFOSS website.',
            tags: ['ROKFOSS'],
        }
    });

export default rokfoss;