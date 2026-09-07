export const GATE_STATUS = Object.freeze({ READY: 'READY', WAITING_EXTERNAL: 'WAITING_EXTERNAL', DISABLED: 'DISABLED', FAILED: 'FAILED' });

export const EXTERNAL_GATES = Object.freeze({
  tripAffiliate: { id: 'P1-TRIP-AFFILIATE', owner: 'business', status: GATE_STATUS.WAITING_EXTERNAL, required: ['approved HTTPS tracking URL', 'disclosure copy'] },
  agodaAffiliate: { id: 'P1-AGODA-AFFILIATE', owner: 'business', status: GATE_STATUS.WAITING_EXTERNAL, required: ['approved HTTPS tracking URL', 'disclosure copy'] },
  agodaDemand: { id: 'P2-AGODA-MSE', owner: 'provider', status: GATE_STATUS.WAITING_EXTERNAL, required: ['commercial approval', 'server credential', 'quota', 'permitted-use review'] },
  bookingDemand: { id: 'P3-BOOKING-DEMAND', owner: 'provider', status: GATE_STATUS.WAITING_EXTERNAL, required: ['Managed Affiliate', 'Partner Centre', 'API token/Affiliate ID'] },
  duffelStays: { id: 'P3-DUFFEL-STAYS', owner: 'provider', status: GATE_STATUS.WAITING_EXTERNAL, required: ['access', 'cost cap', 'support/settlement responsibility'] },
  googleStorage: { id: 'P2-GOOGLE-STORAGE', owner: 'product', status: GATE_STATUS.WAITING_EXTERNAL, required: ['OAuth consent', 'server redirect', 'delete/export store'] },
  ads: { id: 'P3-ADS', owner: 'business', status: GATE_STATUS.WAITING_EXTERNAL, required: ['site review', 'CMP', 'slot policy'] },
  android: { id: 'P1-ANDROID-IDLE', owner: 'qa', status: GATE_STATUS.WAITING_EXTERNAL, required: ['one screen-off authorized idle device'] }
});

export function gateSnapshot(overrides = {}) { return Object.fromEntries(Object.entries(EXTERNAL_GATES).map(([key, gate]) => [key, { ...gate, ...(overrides[key] || {}) }])); }
export function canOpenGate(gate, evidence = {}) { return Boolean(gate && gate.status === GATE_STATUS.READY && gate.required.every(key => evidence[key])); }
export function failClosedGate(gate, reason = '외부 승인·증거가 없습니다.') { return { gate: gate?.id || 'UNKNOWN', status: GATE_STATUS.WAITING_EXTERNAL, enabled: false, reason }; }
export function assertNoSecrets(value) { const text = JSON.stringify(value); if (/(api[_-]?key|token|secret|authorization|client_secret|password)/i.test(text)) throw new Error('SECRET_MUST_NOT_ENTER_BROWSER_OR_RECORD'); return true; }
