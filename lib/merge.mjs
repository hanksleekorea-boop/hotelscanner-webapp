import { DATA_STATUS, directlyComparable, priceLedger } from './contracts.mjs';

export function mergeProviderOffers(providerOffers = []) {
  const groups = [];
  for (const offer of providerOffers) {
    const group = groups.find(candidate => candidate[0]?.canonicalPropertyId === offer.canonicalPropertyId && candidate.some(item => directlyComparable(item, offer)));
    if (group) group.push(offer); else groups.push([offer]);
  }
  return groups.map(group => { const comparable = group.length > 1; const totals = group.map(item => priceLedger(item).total).filter(total => total != null); const lowest = totals.length ? Math.min(...totals) : null; return { canonicalPropertyId: group[0].canonicalPropertyId, offers: group.map(item => ({ ...item, comparisonStatus: comparable ? 'DIRECTLY_COMPARABLE' : DATA_STATUS.CONDITION_DIFFERENT })), lowestKnownTotal: comparable ? lowest : null, sourceIds: [...new Set(group.map(item => item.providerId))], status: comparable ? 'DIRECTLY_COMPARABLE' : DATA_STATUS.CONDITION_DIFFERENT }; });
}

export function providerHealth(results = []) { const total = results.length; const failed = results.filter(result => result.dataStatus === DATA_STATUS.UNAVAILABLE || result.dataStatus === DATA_STATUS.WAITING_EXTERNAL).length; return { total, failed, status: failed === total && total > 0 ? DATA_STATUS.UNAVAILABLE : failed ? DATA_STATUS.PARTIAL : 'HEALTHY' }; }
