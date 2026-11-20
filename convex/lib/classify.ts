import { Category } from "./taxonomy";
import { TOWNS_BY_STATE } from "./towns";

/**
 * Keyword rules checked in order — first hit wins, so put the most
 * specific categories first (e.g. water rescue before generic rescue).
 */
const CATEGORY_RULES: Array<{ category: Category; patterns: RegExp[] }> = [
  {
    category: "water-rescue",
    patterns: [
      /\bwater rescue\b/,
      /\bice rescue\b/,
      /\bswift ?water\b/,
      /\bdrown/,
      /\bboat(er)? (rescue|accident|emergency)\b/,
      /\bdive team\b/,
    ],
  },
  {
    category: "hazmat",
    patterns: [
      /\bhazmat\b/,
      /\bhazardous material/,
      /\bchemical (spill|leak|release)\b/,
      /\bgas leak\b/,
      /\bcarbon monoxide\b/,
      /\bfuel spill\b/,
      /\bdecon(tamination)?\b/,
    ],
  },
  {
    category: "brush-fire",
    patterns: [
      /\bbrush ?fire/,
      /\bwild(land )?fire/,
      /\bforest fire/,
      /\bgrass fire/,
      /\bwoods fire/,
      /\bred flag warning\b/,
      /\bburn ban\b/,
      /\bfire danger\b/,
    ],
  },
  {
    category: "structure-fire",
    patterns: [
      /\bstructure fire/,
      /\bhouse fire/,
      /\bbuilding fire/,
      /\bapartment fire/,
      /\bgarage fire/,
      /\bbarn fire/,
      /\bchimney fire/,
      /\bkitchen fire/,
      /\bworking fire/,
      /\b(2|3|4|two|three|four)[- ]alarm/,
      /\bfully involved\b/,
      /\bfire (destroy|damage|guts|rip|tear)/,
      /\bblaze\b/,
    ],
  },
  {
    category: "mva-rescue",
    patterns: [
      /\bmva\b/,
      /\bmotor vehicle (accident|crash|collision)\b/,
      /\b(car|truck|vehicle|motorcycle|tractor[- ]trailer) (crash|accident|collision|rollover|fire)\b/,
      /\bextricat/,
      /\bjaws of life\b/,
      /\brollover\b/,
      /\bhead[- ]on\b/,
      /\btechnical rescue\b/,
      /\bconfined space\b/,
      /\brope rescue\b/,
    ],
  },
  {
    category: "training",
    patterns: [
      /\btraining\b/,
      /\bdrill\b/,
      /\bacademy\b/,
      /\bcertification\b/,
      /\bfirefighter (1|2|i|ii) class\b/,
      /\bcourse (offering|enrollment|registration)\b/,
      /\blive burn\b/,
    ],
  },
  {
    category: "personnel",
    patterns: [
      /\bpromot(ed|ion)/,
      /\bretire(s|d|ment)/,
      /\bswear(ing|s)?[- ]in\b/,
      /\bsworn in\b/,
      /\bnew (fire )?chief\b/,
      /\brecruit(s|ment|ing)?\b/,
      /\bhiring\b/,
      /\bnow accepting applications\b/,
      /\bjoin (our|the) (department|fire)/,
      /\bbadge (pinning|ceremony)\b/,
      /\bgraduat(es?|ion)\b/,
      /\bappoint(ed|ment)/,
    ],
  },
  {
    category: "apparatus",
    patterns: [
      /\bapparatus\b/,
      /\bnew (engine|ladder|truck|tanker|tender|rescue|ambulance|pumper|quint)\b/,
      /\b(engine|ladder|tower|quint|tanker) \d+\b/,
      /\bwetdown\b/,
      /\bpush[- ]in ceremony\b/,
      /\bfleet\b/,
    ],
  },
  {
    category: "station",
    patterns: [
      /\bfirehouse\b/,
      /\bfire station\b/,
      /\bstation (renovation|construction|project|opening|groundbreaking)\b/,
      /\bgroundbreaking\b/,
      /\bribbon[- ]cutting\b/,
      /\bnew headquarters\b/,
    ],
  },
  {
    category: "grants-legislation",
    patterns: [
      /\bgrant(s|ed)?\b/,
      /\bafg\b/,
      /\bsafer grant\b/,
      /\bfunding\b/,
      /\blegislat/,
      /\bbill\b/,
      /\bordinance\b/,
      /\bbudget\b/,
      /\bbond(ing)?\b/,
      /\breferendum\b/,
      /\bstatute\b/,
    ],
  },
  {
    category: "memorial",
    patterns: [
      /\bline of duty\b/,
      /\blodd\b/,
      /\bmemorial\b/,
      /\bfallen firefighter/,
      /\bpassed away\b/,
      /\bobituary\b/,
      /\bin memoriam\b/,
      /\blast alarm\b/,
      /\bfuneral\b/,
      /\bprocession\b/,
    ],
  },
  {
    category: "ems",
    patterns: [
      /\bems\b/,
      /\bambulance\b/,
      /\bparamedic/,
      /\bemt\b/,
      /\bmedical (call|emergency)\b/,
      /\bcardiac\b/,
      /\boverdose\b/,
      /\bnarcan\b/,
      /\bmass casualty\b/,
      /\bmci\b/,
    ],
  },
  {
    category: "community",
    patterns: [
      /\bopen house\b/,
      /\bfire prevention\b/,
      /\bsmoke (detector|alarm)s?\b/,
      /\bsafety (tips|reminder|education)\b/,
      /\bfundraiser\b/,
      /\bpancake breakfast\b/,
      /\bcar seat\b/,
      /\bsanta\b/,
      /\btouch[- ]a[- ]truck\b/,
      /\bcommunity (event|day)\b/,
    ],
  },
];

export function classifyCategory(title: string, summary: string): Category {
  const text = `${title} ${summary}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      return rule.category;
    }
  }
  return "other";
}

type TownMatchers = Array<{ town: string; pattern: RegExp }>;
const matcherCache = new Map<string, TownMatchers>();

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Longest-first so compound names win over their substrings
 * ("East Windsor" before "Windsor", "New London" before "London").
 */
function matchersForState(state: string): TownMatchers {
  const cached = matcherCache.get(state);
  if (cached) return cached;
  const towns = TOWNS_BY_STATE[state] ?? [];
  const matchers = [...towns]
    .sort((a, b) => b.length - a.length)
    .map((town) => ({
      town,
      pattern: new RegExp(`\\b${escapeRegExp(town)}\\b`, "i"),
    }));
  matcherCache.set(state, matchers);
  return matchers;
}

export function matchTown(text: string, state: string): string | null {
  for (const { town, pattern } of matchersForState(state)) {
    if (pattern.test(text)) return town;
  }
  return null;
}
