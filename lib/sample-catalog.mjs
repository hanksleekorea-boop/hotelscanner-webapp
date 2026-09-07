import { DATA_STATUS, validateOffer } from './contracts.mjs';

const base = {
  providerId: 'sample-catalog', source: 'SAMPLE', dataStatus: DATA_STATUS.SAMPLE_ONLY,
  observedAt: '2026-09-01T00:00:00Z', expiresAt: '2026-12-31T00:00:00Z', checkIn: '2026-10-10', checkOut: '2026-10-12',
  rooms: 1, guests: { adults: 2, children: 0 }, currency: 'KRW', paymentTiming: 'PREPAID',
  ratePlanFingerprint: 'sample-flex-v1', breakfast: 'INCLUDED', cancellation: 'FREE_BEFORE_DEADLINE',
  roomType: '스탠더드 더블', bedType: '더블 1개', propertyType: '호텔', stars: 4, reviewScore: 4.6,
  seller: { allowedHttpsUrl: null, label: '표본 데이터' }
};

const rows = [
  ['서울 시청 라이트 호텔', '서울', 154000, 14000, 0, 0, 0, '도심·업무'],
  ['서울 시청 라이트 호텔', '서울', 132000, 18000, 0, 0, 0, '도심·업무'],
  ['서울 강남 그린스테이', '서울', 178000, 16000, 0, 0, 0, '쇼핑·식사'],
  ['서울 강남 그린스테이', '서울', 145000, 24000, 0, 0, 0, '쇼핑·식사'],
  ['부산 해운대 파도호텔', '부산', 196000, 19000, 0, 0, 0, '해변·휴식'],
  ['부산 해운대 파도호텔', '부산', 164000, 25000, 0, 0, 0, '해변·휴식'],
  ['제주 바람정원 스테이', '제주', 218000, 21000, 12000, 0, 0, '자연·휴식'],
  ['제주 바람정원 스테이', '제주', 187000, 23000, 0, 0, 0, '자연·휴식'],
  ['도쿄 아사쿠사 리버인', '도쿄', 128000, 14000, 0, 0, 0, '문화·도보'],
  ['도쿄 아사쿠사 리버인', '도쿄', 110000, 19000, 0, 0, 0, '문화·도보'],
  ['방콕 리버사이드 메트로', '방콕', 99000, 9000, 0, 0, 0, '야간·도심'],
  ['방콕 리버사이드 메트로', '방콕', 82000, 12000, 0, 0, 0, '야간·도심']
];

export const SAMPLE_OFFERS = rows.map(([name, city, basePrice, taxes, local, mandatory, addOns, purpose], index) => {
  const canonical = `sample-${city}-${name}`;
  const offer = { ...base, id: `sample-offer-${index + 1}`, canonicalPropertyId: canonical, propertyName: name, destination: city, purpose,
    price: { base: basePrice, taxes, mandatoryFees: mandatory, resortOrLocalFees: local, requiredAddOns: addOns, unknownRequiredFees: index % 5 === 0 },
    roomType: index % 3 === 0 ? '스탠더드 더블' : '디럭스 더블',
    cancellation: index % 4 === 0 ? 'NON_REFUNDABLE' : 'FREE_BEFORE_DEADLINE'
  };
  return validateOffer(offer).value;
});

export function searchSampleOffers(request) {
  const city = String(request.destination || '').trim().toLowerCase();
  const found = SAMPLE_OFFERS.filter(o => o.destination.toLowerCase().includes(city) || o.propertyName.toLowerCase().includes(city) || city.includes(o.destination.toLowerCase()));
  return found.length ? found : SAMPLE_OFFERS.filter(o => o.destination === '서울');
}
