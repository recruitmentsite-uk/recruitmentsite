/** Normalize company names for fuzzy matching. */
export function normalizeName(name) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(
      /\b(limited|ltd|llp|plc|the|uk|and|at|in|of|care|home|homes|nursing|residential|services|service|group|holdings|house|court|lodge|manor|view)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

/** @param {string} a @param {string} b */
export function namesMatch(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length >= 4 && nb.includes(na)) return true;
  if (nb.length >= 4 && na.includes(nb)) return true;

  const ta = new Set(na.split(" ").filter((t) => t.length > 2));
  const tb = new Set(nb.split(" ").filter((t) => t.length > 2));
  if (!ta.size || !tb.size) return false;

  let overlap = 0;
  for (const t of ta) {
    if (tb.has(t)) overlap++;
  }
  const minSize = Math.min(ta.size, tb.size);
  return overlap >= 2 && overlap / minSize >= 0.6;
}

/** @param {object[]} prospects */
export function buildProspectIndex(prospects) {
  return prospects.map((p, index) => ({
    index,
    key: p.cqcLocationId ?? `${p.companyName}|${p.city}`.toLowerCase(),
    names: [p.companyName, p.providerName].filter(Boolean),
    city: (p.city ?? "").toLowerCase(),
  }));
}

/** @param {string} employerName @param {ReturnType<typeof buildProspectIndex>} index @param {string} [location] */
export function matchProspect(employerName, index, location) {
  const loc = (location ?? "").toLowerCase();
  let best = null;

  for (const entry of index) {
    for (const name of entry.names) {
      if (!namesMatch(name, employerName)) continue;
      let score = 10;
      if (loc && entry.city && loc.includes(entry.city)) score += 5;
      if (!best || score > best.score) best = { index: entry.index, score };
    }
  }

  return best?.index;
}
