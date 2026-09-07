export const STORAGE_KEY = 'hotelscanner-h1-local-records-v1';
const scrub = value => JSON.parse(JSON.stringify(value, (key, v) => /card|passport|booking|email|phone|token|secret/i.test(key) ? undefined : v));
export function readRecords(storage = globalThis.localStorage) { try { return JSON.parse(storage?.getItem(STORAGE_KEY) || '[]'); } catch { return []; } }
export function writeRecords(records, storage = globalThis.localStorage) { const clean = scrub(records).slice(0, 100); storage?.setItem(STORAGE_KEY, JSON.stringify(clean)); return clean; }
export function saveRecord(record, storage = globalThis.localStorage) { const records = readRecords(storage).filter(r => r.id !== record.id); records.unshift(scrub({ ...record, savedAt: new Date().toISOString() })); return writeRecords(records, storage); }
export function deleteRecord(id, storage = globalThis.localStorage) { return writeRecords(readRecords(storage).filter(r => r.id !== id), storage); }
export function exportRecords(storage = globalThis.localStorage) { return JSON.stringify({ format: 'HotelScannerDecisionPassportV1', exportedAt: new Date().toISOString(), records: readRecords(storage) }, null, 2); }
export function importRecords(text, storage = globalThis.localStorage) { const parsed = JSON.parse(text); if (!parsed || parsed.format !== 'HotelScannerDecisionPassportV1' || !Array.isArray(parsed.records)) throw new Error('지원하지 않는 기록 파일입니다.'); return writeRecords([...parsed.records, ...readRecords(storage)] , storage); }

// 외부 전송 없이 로컬 결정 패스포트를 시각화한다. 실제 예약·토큰·개인정보는 입력되지 않는다.
export function createPassportSvg(payload = '') {
  const size = 29, quiet = 2; let hash = 2166136261;
  for (const ch of String(payload)) { hash ^= ch.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  const on = Array.from({ length: size }, () => Array(size).fill(false));
  const finder = (x, y) => { for (let dy=0;dy<7;dy++) for (let dx=0;dx<7;dx++) on[y+dy][x+dx] = dx===0||dx===6||dy===0||dy===6||(dx>=2&&dx<=4&&dy>=2&&dy<=4); };
  finder(0,0); finder(size-7,0); finder(0,size-7);
  for(let y=0;y<size;y++) for(let x=0;x<size;x++) if(!on[y][x] && !(x<8&&y<8) && !(x>=size-8&&y<8) && !(x<8&&y>=size-8)){ hash = Math.imul(hash ^ (x*31+y*17), 16777619); on[y][x] = (hash >>> 28) % 2 === 1; }
  const cells=[]; for(let y=0;y<size;y++) for(let x=0;x<size;x++) if(on[y][x]) cells.push(`<rect x="${x+quiet}" y="${y+quiet}" width="1" height="1"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size+quiet*2} ${size+quiet*2}" role="img" aria-label="HotelScanner 로컬 결정 패스포트 시각 코드"><rect width="100%" height="100%" fill="#fff"/><g fill="#102a43">${cells.join('')}</g></svg>`;
}
