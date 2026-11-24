export function hashString(value) {
  const text = String(value ?? "");
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0x5bd1e995);
  hash ^= hash >>> 15;
  return hash >>> 0;
}

export function normalizeSeed(seed) {
  if (typeof seed === "number" && Number.isFinite(seed)) {
    return seed >>> 0 || 1;
  }
  const text = String(seed ?? "").trim();
  return text ? hashString(text) : 1;
}

export function mulberry32(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Rng {
  constructor(seed) {
    this.seed = normalizeSeed(seed);
    this._next = mulberry32(this.seed);
  }

  float(low = 0, high = 1) {
    return low + this._next() * (high - low);
  }

  int(low, high) {
    return Math.floor(this.float(low, high + 1));
  }

  chance(probability) {
    return this._next() < probability;
  }

  pick(list) {
    if (!list || !list.length) return undefined;
    return list[this.int(0, list.length - 1)];
  }

  weighted(list) {
    const total = list.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
    if (total <= 0) return list[0]?.value;
    let roll = this.float(0, total);
    for (const item of list) {
      roll -= Math.max(0, item.weight);
      if (roll <= 0) return item.value;
    }
    return list[list.length - 1].value;
  }

  shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = this.int(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  fork(label) {
    return new Rng(`${this.seed}:${label}`);
  }
}
