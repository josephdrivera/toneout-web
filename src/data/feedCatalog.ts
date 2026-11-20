export type Service = "fire" | "law" | "ems";
export type Modulation = "FM" | "AM" | "NFM" | "DMR" | "P25";
export type ToneType = "ctcss" | "dpl" | "none";
export type FeedKind = "live" | "archive";

export type Tone = {
  type: ToneType;
  value: string;
};

export type Feed = {
  id: string;
  name: string;
  agency: string;
  service: Service;
  state: string;
  county: string;
  lat: number;
  lon: number;
  stream_url: string;
  frequency_mhz: number;
  modulation: Modulation;
  tone: Tone;
  kind: FeedKind;
};

export type FeedCatalog = {
  version: number;
  feeds: Feed[];
};

type Locale = {
  state: string;
  county: string;
  lat: number;
  lon: number;
  agency: string;
};

const GLASTONBURY: Locale = {
  state: "CT",
  county: "Hartford",
  lat: 41.7123,
  lon: -72.6081,
  agency: "Glastonbury Fire & EMS",
};

const GLASTONBURY_PD: Locale = {
  state: "CT",
  county: "Hartford",
  lat: 41.7123,
  lon: -72.6081,
  agency: "Glastonbury Police Department",
};

const MANCHESTER: Locale = {
  state: "CT",
  county: "Hartford",
  lat: 41.7759,
  lon: -72.5215,
  agency: "Manchester Fire Rescue EMS",
};

const SOUTH_WINDSOR: Locale = {
  state: "CT",
  county: "Hartford",
  lat: 41.849,
  lon: -72.5718,
  agency: "South Windsor Fire Department",
};

const ROCKY_HILL: Locale = {
  state: "CT",
  county: "Hartford",
  lat: 41.6645,
  lon: -72.6393,
  agency: "Rocky Hill Fire Department",
};

const WETHERSFIELD: Locale = {
  state: "CT",
  county: "Hartford",
  lat: 41.7143,
  lon: -72.6526,
  agency: "Wethersfield Volunteer Ambulance",
};

const MARLBOROUGH: Locale = {
  state: "CT",
  county: "Hartford",
  lat: 41.6315,
  lon: -72.4593,
  agency: "Marlborough Volunteer Fire Department",
};

const EAST_HARTFORD: Locale = {
  state: "CT",
  county: "Hartford",
  lat: 41.7623,
  lon: -72.612,
  agency: "East Hartford Fire Department",
};

const CAPITOL_REGION: Locale = {
  state: "CT",
  county: "Hartford",
  lat: 41.7658,
  lon: -72.6734,
  agency: "Capitol Region Mutual Aid",
};

// Where a feed's audio is served from. Node 01 serves its own channels; feeds
// carried by the cloud hub use the hub's address.
const NODE_01_STREAMS = "https://feeds.toneout.app/stream";
const HUB_STREAMS = "https://hub.toneout.app/stream";

const TONEOUT_NETWORK: Locale = {
  state: "CT",
  county: "Hartford",
  lat: 41.7658,
  lon: -72.6734,
  agency: "ToneOut Network",
};

const feed = (
  id: string,
  name: string,
  locale: Locale,
  service: Service,
  frequency_mhz: number,
  tone: Tone,
  streamBase: string = NODE_01_STREAMS,
): Feed => ({
  id,
  name,
  agency: locale.agency,
  service,
  state: locale.state,
  county: locale.county,
  lat: locale.lat,
  lon: locale.lon,
  stream_url: `${streamBase}/${id}`,
  frequency_mhz,
  modulation: "FM",
  tone,
  kind: "live",
});

const NO_TONE: Tone = { type: "none", value: "" };

export const feedCatalog: FeedCatalog = {
  version: 2,
  feeds: [
    feed("glastonbury-dispatch", "Glastonbury Dispatch Fire", GLASTONBURY, "fire", 452.445, {
      type: "ctcss",
      value: "192.8",
    }),
    feed("glastonbury-ems", "Glastonbury EMS", GLASTONBURY, "ems", 453.075, NO_TONE),
    feed("glastonbury-fire-ems", "Glastonbury Fire/EMS", GLASTONBURY, "fire", 0, NO_TONE),
    feed("glastonbury-fire-police", "Glastonbury Fire Police", GLASTONBURY, "fire", 452.1875, {
      type: "ctcss",
      value: "203.5",
    }),
    // Wired receiver feeding the node directly (not an SDR channel), so no frequency is listed.
    feed("glastonbury-pd", "Glastonbury PD", GLASTONBURY_PD, "law", 0, NO_TONE),
    feed("manchester-fire-1", "Manchester Fire 1", MANCHESTER, "fire", 452.775, {
      type: "ctcss",
      value: "107.2",
    }),
    feed("manchester-fire-2", "Manchester Fire 2 / 8th District", MANCHESTER, "fire", 453.4625, NO_TONE),
    feed("south-windsor-fire", "South Windsor Fire", SOUTH_WINDSOR, "fire", 453.2375, {
      type: "ctcss",
      value: "100.0",
    }),
    feed("rocky-hill-fire", "Rocky Hill Fire", ROCKY_HILL, "fire", 453.575, NO_TONE),
    feed("rocky-hill-ems", "Rocky Hill EMS", ROCKY_HILL, "ems", 453.275, NO_TONE),
    feed("wethersfield-ems", "Wethersfield EMS", WETHERSFIELD, "ems", 453.025, {
      type: "ctcss",
      value: "136.5",
    }),
    feed("marlborough-fire", "Marlborough Fire Ops", MARLBOROUGH, "fire", 453.3125, {
      type: "ctcss",
      value: "151.4",
    }),
    feed("east-hartford-fire-admin", "East Hartford Fire Admin", EAST_HARTFORD, "fire", 453.85, {
      type: "ctcss",
      value: "82.5",
    }),
    feed("crcog-intercity-fire", "CRCOG Intercity Fire", CAPITOL_REGION, "fire", 452.1375, {
      type: "ctcss",
      value: "167.9",
    }),
    feed("ucall40", "UCALL40 Mutual Aid", CAPITOL_REGION, "fire", 453.2125, {
      type: "ctcss",
      value: "156.7",
    }),
    // Always-on repeating test message served by the cloud hub, so anyone can
    // check that streaming works. Not a radio channel, so no frequency.
    feed("toneout-test", "ToneOut Test Channel", TONEOUT_NETWORK, "fire", 0, NO_TONE, HUB_STREAMS),
  ],
};

/**
 * Feeds the network-status check expects to find on Node 01's stream server.
 * Hub-served feeds are left out: they are not on that server.
 */
export const expectedFeedIds: ReadonlyArray<string> = feedCatalog.feeds
  .filter((f) => f.stream_url.startsWith(NODE_01_STREAMS))
  .map((f) => f.id);
