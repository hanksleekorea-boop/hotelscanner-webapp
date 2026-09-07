export const DATA_STATUS = Object.freeze({
  SAMPLE_ONLY: 'SAMPLE_ONLY', LIVE_VERIFIED: 'LIVE_VERIFIED', STALE: 'STALE',
  PARTIAL: 'PARTIAL', CONDITION_DIFFERENT: 'CONDITION_DIFFERENT',
  COST_UNKNOWN: 'COST_UNKNOWN', WAITING_EXTERNAL: 'WAITING_EXTERNAL', UNAVAILABLE: 'UNAVAILABLE'
});

const asInt = value => Number.isInteger(Number(value)) ? Number(value) : null;

export function validateSearchRequest(raw = {}) {
  const errors = [];
  const destination = String(raw.destination ?? '').trim();
  const checkIn = String(raw.checkIn ?? '');
  const checkOut = String(raw.checkOut ?? '');
  const rooms = asInt(raw.rooms);
  const adults = asInt(raw.adults);
  const children = asInt(raw.children);
  const childAges = Array.isArray(raw.childAges) ? raw.childAges.map(asInt) : [];
  if (!destination) errors.push({ code: 'DESTINATION_REQUIRED', field: 'destination', message: '목적지를 입력하세요.' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || Number.isNaN(Date.parse(checkIn))) errors.push({ code: 'CHECKIN_INVALID', field: 'checkIn', message: '체크인 날짜를 확인하세요.' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkOut) || Number.isNaN(Date.parse(checkOut))) errors.push({ code: 'CHECKOUT_INVALID', field: 'checkOut', message: '체크아웃 날짜를 확인하세요.' });
  if (checkIn && checkOut && Date.parse(checkOut) <= Date.parse(checkIn)) errors.push({ code: 'DATE_ORDER', field: 'checkOut', message: '체크아웃은 체크인 이후여야 합니다.' });
  if (!rooms || rooms < 1 || rooms > 8) errors.push({ code: 'ROOMS_INVALID', field: 'rooms', message: '객실 수는 1~8개입니다.' });
  if (!adults || adults < 1 || adults > 24) errors.push({ code: 'ADULTS_INVALID', field: 'adults', message: '성인은 1명 이상 입력하세요.' });
  if (children == null || children < 0 || children > 12) errors.push({ code: 'CHILDREN_INVALID', field: 'children', message: '아동 수를 확인하세요.' });
  if (children != null && childAges.length !== children) errors.push({ code: 'CHILD_AGE_REQUIRED', field: 'childAges', message: '모든 아동의 나이를 입력하세요.' });
  if (childAges.some(age => age == null || age < 0 || age > 17)) errors.push({ code: 'CHILD_AGE_INVALID', field: 'childAges', message: '아동 나이는 0~17세입니다.' });
  const nights = checkIn && checkOut && Date.parse(checkOut) > Date.parse(checkIn) ? Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000) : 0;
  return { ok: errors.length === 0, errors, value: { destination, checkIn, checkOut, nights, rooms, adults, children, childAges, currency: raw.currency || 'KRW', purpose: raw.purpose || 'GENERAL' } };
}

export function priceLedger(offer) {
  const p = offer.price || {};
  const requiredUnknown = Boolean(p.unknownRequiredFees);
  const known = [p.base, p.taxes, p.mandatoryFees, p.resortOrLocalFees, p.requiredAddOns].map(v => Number(v || 0));
  const total = known.reduce((a, b) => a + b, 0);
  return { ...p, knownTotal: total, total: requiredUnknown ? null : total, totalStatus: requiredUnknown ? 'UNKNOWN' : 'KNOWN' };
}

export function validateOffer(raw = {}) {
  const errors = [];
  for (const field of ['providerId', 'observedAt', 'dataStatus', 'checkIn', 'checkOut', 'currency', 'paymentTiming', 'ratePlanFingerprint']) if (!raw[field]) errors.push(`MISSING_${field.toUpperCase()}`);
  if (!raw.canonicalPropertyId && !raw.providerPropertyId) errors.push('MISSING_PROPERTY_ID');
  if (!raw.rooms || !raw.guests) errors.push('MISSING_STAY_GUESTS');
  const ledger = priceLedger(raw);
  if (raw.dataStatus === DATA_STATUS.LIVE_VERIFIED && ledger.totalStatus !== 'KNOWN') errors.push('LIVE_REQUIRES_KNOWN_TOTAL');
  if (raw.dataStatus === DATA_STATUS.SAMPLE_ONLY && raw.source !== 'SAMPLE') errors.push('SAMPLE_SOURCE_REQUIRED');
  if (raw.seller?.allowedHttpsUrl && !/^https:\/\//i.test(raw.seller.allowedHttpsUrl)) errors.push('HTTPS_REQUIRED');
  return { ok: errors.length === 0, errors, value: { ...raw, price: ledger } };
}

export function directlyComparable(a, b) {
  const keys = ['canonicalPropertyId', 'checkIn', 'checkOut', 'rooms', 'currency', 'roomType', 'bedType', 'breakfast', 'cancellation', 'paymentTiming'];
  return keys.every(key => JSON.stringify(a?.[key]) === JSON.stringify(b?.[key])) && !a?.price?.unknownRequiredFees && !b?.price?.unknownRequiredFees;
}

export function formatMoney(amount, currency = 'KRW') {
  if (amount == null) return '필수 비용 확인 필요';
  try { return new Intl.NumberFormat('ko-KR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount); } catch { return `${Number(amount).toLocaleString('ko-KR')} ${currency}`; }
}

export function safeAffiliateUrl(config = {}, providerId) {
  if (!config.approved || !config.provider || config.provider !== providerId || !config.url || !/^https:\/\//i.test(config.url)) return null;
  try { const url = new URL(config.url); if (!config.allowedHosts?.includes(url.host)) return null; return url.toString(); } catch { return null; }
}
