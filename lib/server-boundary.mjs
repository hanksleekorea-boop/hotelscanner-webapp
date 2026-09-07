import { DATA_STATUS, validateOffer } from './contracts.mjs';
import { GATE_STATUS, failClosedGate, assertNoSecrets } from './gates.mjs';

export function createServerBoundary({ gate, adapter, clock = () => new Date() } = {}) {
  return {
    async search(request, context = {}) {
      assertNoSecrets({ request, context: { requestId: context.requestId, locale: context.locale } });
      if (!gate || gate.status !== GATE_STATUS.READY || !adapter) return { dataStatus: DATA_STATUS.WAITING_EXTERNAL, offers: [], gate: failClosedGate(gate) };
      return adapter.search(request, { ...context, now: clock() });
    },
    async recheck(reference, context = {}) {
      if (!gate || gate.status !== GATE_STATUS.READY || !adapter?.recheck) return { status: DATA_STATUS.WAITING_EXTERNAL, gate: failClosedGate(gate) };
      return adapter.recheck(reference, { ...context, now: clock() });
    }
  };
}

export function normalizeProviderOffer(raw, providerId, request) {
  const offer = { ...raw, providerId, source: providerId, dataStatus: raw.dataStatus || DATA_STATUS.LIVE_VERIFIED, checkIn: request.checkIn, checkOut: request.checkOut, rooms: request.rooms, guests: { adults: request.adults, children: request.children }, currency: request.currency || raw.currency || 'KRW' };
  const checked = validateOffer(offer);
  if (!checked.ok) return { ok: false, errors: checked.errors, offer: { ...offer, dataStatus: DATA_STATUS.COST_UNKNOWN } };
  return { ok: true, offer: checked.value };
}
