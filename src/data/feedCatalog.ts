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

const GLASTONBURY = {
  state: "CT",
  county: "Hartford",
  lat: 41.7123,
  lon: -72.6081,
  agency: "Glastonbury Fire & EMS",
} as const;

const streamUrl = (id: string) => `https://feeds.toneout.app/stream/${id}`;

export const feedCatalog: FeedCatalog = {
  version: 1,
  feeds: [
    {
      id: "glastonbury-dispatch",
      name: "Glastonbury Dispatch",
      agency: GLASTONBURY.agency,
      service: "fire",
      state: GLASTONBURY.state,
      county: GLASTONBURY.county,
      lat: GLASTONBURY.lat,
      lon: GLASTONBURY.lon,
      stream_url: streamUrl("glastonbury-dispatch"),
      frequency_mhz: 452.445,
      modulation: "FM",
      tone: { type: "ctcss", value: "192.8" },
      kind: "live",
    },
    {
      id: "glastonbury-ems",
      name: "Glastonbury EMS",
      agency: GLASTONBURY.agency,
      service: "ems",
      state: GLASTONBURY.state,
      county: GLASTONBURY.county,
      lat: GLASTONBURY.lat,
      lon: GLASTONBURY.lon,
      stream_url: streamUrl("glastonbury-ems"),
      frequency_mhz: 453.075,
      modulation: "FM",
      tone: { type: "none", value: "" },
      kind: "live",
    },
    {
      id: "glastonbury-fire-ems",
      name: "Glastonbury Fire/EMS",
      agency: GLASTONBURY.agency,
      service: "fire",
      state: GLASTONBURY.state,
      county: GLASTONBURY.county,
      lat: GLASTONBURY.lat,
      lon: GLASTONBURY.lon,
      stream_url: streamUrl("glastonbury-fire-ems"),
      frequency_mhz: 0,
      modulation: "FM",
      tone: { type: "none", value: "" },
      kind: "live",
    },
    {
      id: "toneout-test",
      name: "TEST — Continuous Loop",
      agency: GLASTONBURY.agency,
      service: "fire",
      state: GLASTONBURY.state,
      county: GLASTONBURY.county,
      lat: GLASTONBURY.lat,
      lon: GLASTONBURY.lon,
      stream_url: streamUrl("toneout-test"),
      frequency_mhz: 0,
      modulation: "FM",
      tone: { type: "none", value: "" },
      kind: "live",
    },
  ],
};

export const expectedFeedIds: ReadonlyArray<string> = feedCatalog.feeds.map(
  (f) => f.id,
);