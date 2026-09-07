import { directlyComparable, priceLedger } from './contracts.mjs';

export function rankOffers(offers, { sort = 'total', breakfast = 'ANY', refundable = false, purpose = 'ANY' } = {}) {
  const filtered = offers.filter(o => (breakfast === 'ANY' || o.breakfast === breakfast) && (!refundable || o.cancellation !== 'NON_REFUNDABLE') && (purpose === 'ANY' || o.purpose.includes(purpose)));
  const directGroups = [];
  for (const offer of filtered) { const group = directGroups.find(g => directlyComparable(g[0], offer)); if (group) group.push(offer); else directGroups.push([offer]); }
  const score = o => { const ledger = priceLedger(o); if (sort === 'refund') return o.cancellation === 'FREE_BEFORE_DEADLINE' ? 0 : 1; if (sort === 'purpose') return o.purpose; return ledger.total ?? Number.MAX_SAFE_INTEGER; };
  return filtered.slice().sort((a, b) => String(score(a)).localeCompare(String(score(b)), 'ko', { numeric: true })).map((offer, index) => ({ ...offer, rank: index + 1, directlyComparable: directGroups.some(g => g.length > 1 && g[0].id === offer.id), whyRanked: sort === 'total' ? (priceLedger(offer).total == null ? '필수 비용 확인 필요' : '알려진 총액 오름차순') : sort === 'refund' ? '환불 조건 우선' : '여행 목적 일치' }));
}
