import { DATA_STATUS, safeAffiliateUrl } from '../contracts.mjs';
import { GATE_STATUS, failClosedGate, assertNoSecrets } from '../gates.mjs';
import { normalizeProviderOffer } from '../server-boundary.mjs';

export function createAgodaAdapter({ gate, redirectConfig = null, now = () => new Date() } = {}) {
  return {
    getCapabilities() { return { providerId: 'agoda-demand-mse', search: true, recheck: true, redirect: Boolean(redirectConfig), booking: false, status: gate?.status || GATE_STATUS.WAITING_EXTERNAL }; },
    async search(request, context = {}) {
      if (!gate || gate.status !== GATE_STATUS.READY) return { dataStatus: DATA_STATUS.WAITING_EXTERNAL, offers: [], gate: failClosedGate(gate, 'Agoda 상업 승인·서버 키 대기') };
      assertNoSecrets(context); return { dataStatus: DATA_STATUS.WAITING_EXTERNAL, offers: [], reason: 'NETWORK_ADAPTER_REQUIRES_SERVER_RUNTIME' };
    },
    normalize(raw, request) { return (raw?.offers || []).map(item => normalizeProviderOffer(item, 'agoda-demand-mse', request)).filter(item => item.ok).map(item => item.offer); },
    async recheck(reference) { if (!gate || gate.status !== GATE_STATUS.READY) return { dataStatus: DATA_STATUS.WAITING_EXTERNAL, gate: failClosedGate(gate) }; return { dataStatus: DATA_STATUS.WAITING_EXTERNAL, reference, reason: 'NETWORK_ADAPTER_REQUIRES_SERVER_RUNTIME' }; },
    buildAllowedRedirect(reference) { const url = safeAffiliateUrl(redirectConfig || {}, 'agoda'); return url ? { url, reference } : { status: DATA_STATUS.WAITING_EXTERNAL, reason: 'APPROVED_HTTPS_REDIRECT_REQUIRED' }; },
    observedAt() { return now().toISOString(); }
  };
}
