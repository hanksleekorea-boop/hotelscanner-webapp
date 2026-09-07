import { gateSnapshot } from './gates.mjs';
export const PHASE_CARDS = Object.freeze({ H1: 15, H2: 10, H3: 5 });
export function releaseMatrix() { const gates = gateSnapshot(); return { build: 'hotelscanner-h1-h2-h3-internal-v1', phases: { H1: { cards: 15, status: 'COMPLETE_INTERNAL' }, H2: { cards: 10, status: 'COMPLETE_INTERNAL_EXTERNAL_WAITING' }, H3: { cards: 5, status: 'COMPLETE_INTERNAL_EXTERNAL_WAITING' } }, gates, publicClaims: { livePrice: false, lowestPriceGuarantee: false, booking: false, payment: false, ads: false } }; }
