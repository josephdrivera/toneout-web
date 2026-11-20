import { XMLParser } from "fast-xml-parser";
import { stripHtml } from "./text";

export type NormalizedItem = {
  guid: string;
  link: string;
  title: string;
  summary: string;
  publishedAt: number;
};

const SUMMARY_MAX_CHARS = 600;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  // Municipal feeds mix namespaces (content:encoded, dc:date); keep prefixes intact.
  removeNSPrefix: false,
  trimValues: true,
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

/** fast-xml-parser yields strings, numbers, or {#text, @_attr} objects for text nodes. */
function textOf(node: unknown): string {
  if (node === undefined || node === null) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (typeof node === "object") {
    const text = (node as Record<string, unknown>)["#text"];
    if (typeof text === "string") return text;
    if (typeof text === "number") return String(text);
    // CDATA nodes can land under __cdata depending on options; be permissive.
    const cdata = (node as Record<string, unknown>)["__cdata"];
    if (typeof cdata === "string") return cdata;
  }
  return "";
}

function parseDate(value: string): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function cleanSummary(raw: string): string {
  return stripHtml(raw).slice(0, SUMMARY_MAX_CHARS);
}

type RawRecord = Record<string, unknown>;

function parseRssItems(channel: RawRecord, now: number): NormalizedItem[] {
  const items: NormalizedItem[] = [];
  for (const item of asArray(channel.item as RawRecord | RawRecord[])) {
    const title = stripHtml(textOf(item.title));
    const link = textOf(item.link).trim();
    const guid = textOf(item.guid).trim() || link;
    if (!title || !(link || guid)) continue;
    const summary = cleanSummary(
      textOf(item.description) || textOf(item["content:encoded"]),
    );
    const publishedAt =
      parseDate(textOf(item.pubDate)) ??
      parseDate(textOf(item["dc:date"])) ??
      now;
    items.push({ guid, link: link || guid, title, summary, publishedAt });
  }
  return items;
}

function atomLink(entry: RawRecord): string {
  const links = asArray(entry.link as RawRecord | RawRecord[]);
  let fallback = "";
  for (const link of links) {
    if (typeof link === "string") {
      if (!fallback) fallback = link;
      continue;
    }
    const href = textOf(link["@_href"]) || "";
    const rel = textOf(link["@_rel"]);
    if (href && (rel === "alternate" || rel === "")) return href;
    if (href && !fallback) fallback = href;
  }
  return fallback;
}

function parseAtomEntries(feed: RawRecord, now: number): NormalizedItem[] {
  const items: NormalizedItem[] = [];
  for (const entry of asArray(feed.entry as RawRecord | RawRecord[])) {
    const title = stripHtml(textOf(entry.title));
    const link = atomLink(entry).trim();
    const guid = textOf(entry.id).trim() || link;
    if (!title || !(link || guid)) continue;
    const summary = cleanSummary(
      textOf(entry.summary) || textOf(entry.content),
    );
    const publishedAt =
      parseDate(textOf(entry.published)) ??
      parseDate(textOf(entry.updated)) ??
      now;
    items.push({ guid, link: link || guid, title, summary, publishedAt });
  }
  return items;
}

/**
 * Parse an RSS 2.0 or Atom document into normalized items, newest first.
 * Throws on unparseable XML or an unrecognized feed shape.
 */
export function parseFeed(xml: string, now: number = Date.now()): NormalizedItem[] {
  const doc = parser.parse(xml) as RawRecord;

  const rss = doc.rss as RawRecord | undefined;
  const channel = rss?.channel as RawRecord | undefined;
  if (channel) {
    return parseRssItems(channel, now).sort(
      (a, b) => b.publishedAt - a.publishedAt,
    );
  }

  // RDF (RSS 1.0) puts items beside the channel.
  const rdf = (doc["rdf:RDF"] ?? doc.RDF) as RawRecord | undefined;
  if (rdf?.item) {
    return parseRssItems(rdf, now).sort((a, b) => b.publishedAt - a.publishedAt);
  }

  const feed = doc.feed as RawRecord | undefined;
  if (feed) {
    return parseAtomEntries(feed, now).sort(
      (a, b) => b.publishedAt - a.publishedAt,
    );
  }

  throw new Error("Unrecognized feed format (expected RSS 2.0, RSS 1.0, or Atom)");
}
