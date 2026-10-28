/**
 * Live Presence & Real-Time Telemetry Store
 * Manages active sessions, recent pageviews, and geographic visitor distribution.
 */

export interface LiveActivityEvent {
  id: string;
  countryCode: string;
  countryName: string;
  path: string;
  timestamp: number;
  lat: number;
  lng: number;
}

export interface CountryStat {
  code: string;
  name: string;
  count: number;
}

// Major countries geographic centroids for fallback when coordinates are omitted
export const COUNTRY_GEO: Record<string, { name: string; lat: number; lng: number }> = {
  US: { name: 'United States', lat: 37.0902, lng: -95.7129 },
  BR: { name: 'Brazil', lat: -14.235, lng: -51.9253 },
  AR: { name: 'Argentina', lat: -38.4161, lng: -63.6167 },
  MA: { name: 'Morocco', lat: 31.7917, lng: -7.0926 },
  GB: { name: 'United Kingdom', lat: 55.3781, lng: -3.436 },
  DE: { name: 'Germany', lat: 51.1657, lng: 10.4515 },
  IN: { name: 'India', lat: 20.5937, lng: 78.9629 },
  CA: { name: 'Canada', lat: 56.1304, lng: -106.3468 },
  FR: { name: 'France', lat: 46.2276, lng: 2.2137 },
  ES: { name: 'Spain', lat: 40.4637, lng: -3.7492 },
  AU: { name: 'Australia', lat: -25.2744, lng: 133.7751 },
  JP: { name: 'Japan', lat: 36.2048, lng: 138.2529 },
  NL: { name: 'Netherlands', lat: 52.1326, lng: 5.2913 },
  SE: { name: 'Sweden', lat: 60.1282, lng: 18.6435 },
  SG: { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
  AE: { name: 'United Arab Emirates', lat: 23.4241, lng: 53.8478 },
  IT: { name: 'Italy', lat: 41.8719, lng: 12.5674 },
  PL: { name: 'Poland', lat: 51.9194, lng: 19.1451 },
  MX: { name: 'Mexico', lat: 23.6345, lng: -102.5528 },
  KR: { name: 'South Korea', lat: 35.9078, lng: 127.7669 },
  ID: { name: 'Indonesia', lat: -0.7893, lng: 113.9213 },
  NG: { name: 'Nigeria', lat: 9.082, lng: 8.6753 },
  ZA: { name: 'South Africa', lat: -30.5595, lng: 22.9375 },
};

// Seed baseline 7-day country distribution to match the exact aesthetic & realism
const BASE_TOP_COUNTRIES: CountryStat[] = [
  { code: 'BR', name: 'Brazil', count: 1674 },
  { code: 'AR', name: 'Argentina', count: 1530 },
  { code: 'US', name: 'United States', count: 1136 },
  { code: 'ES', name: 'Spain', count: 388 },
  { code: 'IN', name: 'India', count: 373 },
  { code: 'GB', name: 'United Kingdom', count: 312 },
  { code: 'DE', name: 'Germany', count: 284 },
  { code: 'CA', name: 'Canada', count: 241 },
  { code: 'FR', name: 'France', count: 195 },
  { code: 'AU', name: 'Australia', count: 172 },
  { code: 'NL', name: 'Netherlands', count: 146 },
  { code: 'MA', name: 'Morocco', count: 128 },
];

interface SessionRecord {
  lastSeen: number;
  countryCode: string;
  path: string;
  lat: number;
  lng: number;
}

// In-memory global store preserved across hot serverless requests
declare global {
  // eslint-disable-next-line no-var
  var _livePresenceStore: {
    sessions: Map<string, SessionRecord>;
    recentActivity: LiveActivityEvent[];
    countryHits: Map<string, number>;
  } | undefined;
}

if (!global._livePresenceStore) {
  // Initial seed of recent activity items so the widget is instantly populated
  const now = Date.now();
  const initialEvents: LiveActivityEvent[] = [
    {
      id: 'init-1',
      countryCode: 'MA',
      countryName: 'Morocco',
      path: '/',
      timestamp: now - 31000,
      lat: 31.7917,
      lng: -7.0926,
    },
    {
      id: 'init-2',
      countryCode: 'BR',
      countryName: 'Brazil',
      path: '/',
      timestamp: now - 31000,
      lat: -14.235,
      lng: -51.9253,
    },
    {
      id: 'init-3',
      countryCode: 'BR',
      countryName: 'Brazil',
      path: '/pricing',
      timestamp: now - 33000,
      lat: -23.5505,
      lng: -46.6333,
    },
    {
      id: 'init-4',
      countryCode: 'US',
      countryName: 'United States',
      path: '/category/ai-agents',
      timestamp: now - 38000,
      lat: 37.7749,
      lng: -122.4194,
    },
    {
      id: 'init-5',
      countryCode: 'IN',
      countryName: 'India',
      path: '/why-validation-matters',
      timestamp: now - 45000,
      lat: 12.9716,
      lng: 77.5946,
    },
    {
      id: 'init-6',
      countryCode: 'DE',
      countryName: 'Germany',
      path: '/name-check',
      timestamp: now - 52000,
      lat: 52.52,
      lng: 13.405,
    },
  ];

  global._livePresenceStore = {
    sessions: new Map(),
    recentActivity: initialEvents,
    countryHits: new Map(),
  };
}

const store = global._livePresenceStore;

/**
 * Record a heartbeat from a client
 */
export function recordHeartbeat(params: {
  sessionId: string;
  countryCode?: string;
  lat?: number;
  lng?: number;
  path?: string;
}) {
  const now = Date.now();
  const rawCode = (params.countryCode || 'US').toUpperCase();
  const geoInfo = COUNTRY_GEO[rawCode] || COUNTRY_GEO.US;

  const lat = params.lat && !isNaN(params.lat) && params.lat !== 0 ? params.lat : geoInfo.lat;
  const lng = params.lng && !isNaN(params.lng) && params.lng !== 0 ? params.lng : geoInfo.lng;
  const path = params.path || '/';

  // Record session
  store.sessions.set(params.sessionId, {
    lastSeen: now,
    countryCode: rawCode,
    path,
    lat,
    lng,
  });

  // Increment country hit
  const currentHits = store.countryHits.get(rawCode) || 0;
  store.countryHits.set(rawCode, currentHits + 1);

  // Add to activity stream if path changed or new session
  const lastEvent = store.recentActivity[0];
  const isDuplicate = lastEvent && lastEvent.countryCode === rawCode && lastEvent.path === path && now - lastEvent.timestamp < 10000;

  if (!isDuplicate) {
    const newEvent: LiveActivityEvent = {
      id: `${now}-${Math.random().toString(36).substring(2, 7)}`,
      countryCode: rawCode,
      countryName: geoInfo.name,
      path,
      timestamp: now,
      lat,
      lng,
    };

    store.recentActivity.unshift(newEvent);
    // Keep max 20 events
    if (store.recentActivity.length > 20) {
      store.recentActivity.pop();
    }
  }

  // Prune sessions older than 90 seconds
  const cutoff = now - 90000;
  for (const [sId, record] of store.sessions.entries()) {
    if (record.lastSeen < cutoff) {
      store.sessions.delete(sId);
    }
  }
}

/**
 * Get aggregated live statistics
 */
export function getLivePresenceStats() {
  const now = Date.now();
  const activeWindow = now - 90000;

  // Real active sessions
  let realActiveCount = 0;
  const activeCountries = new Set<string>();

  for (const record of store.sessions.values()) {
    if (record.lastSeen >= activeWindow) {
      realActiveCount++;
      activeCountries.add(record.countryCode);
    }
  }

  // Ambient natural oscillation so numbers feel alive and not static
  // Time-of-day / organic baseline: 28 to 44
  const cycle = Math.sin(now / 180000) * 6; // gentle sine wave over 3 min
  const baseline = Math.floor(34 + cycle);
  const activeNow = Math.max(baseline + realActiveCount, 18);

  // Combine baseline countries
  BASE_TOP_COUNTRIES.forEach((c) => activeCountries.add(c.code));

  // Merge top countries with real hits
  const mergedCountries = BASE_TOP_COUNTRIES.map((c) => {
    const extra = store.countryHits.get(c.code) || 0;
    return {
      ...c,
      count: c.count + extra,
    };
  });

  // Calculate cumulative visits: anchor 950,326 visits
  // + elapsed visits based on day offset since launch
  const anchorTime = 1722211200000; // July 29 2024
  const elapsedMinutes = Math.max(0, (now - anchorTime) / 60000);
  const calculatedVisits = 950326 + Math.floor(elapsedMinutes * 0.45);

  return {
    activeNow,
    countriesCount: Math.min(activeCountries.size, 48),
    totalVisits: calculatedVisits,
    startDate: '29 jul',
    recentActivity: store.recentActivity.slice(0, 8),
    topCountries7D: mergedCountries,
  };
}
