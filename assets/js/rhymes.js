// A small, original English rhyme bank for the on-device songwriter.
// Each group is a set of words that share a final sound. No corpus is
// sampled and nothing is fetched: this is a hand-written hint list.

export const RHYME_GROUPS = {
  ight: ["light", "night", "bright", "right", "sight", "tight", "flight", "delight", "tonight", "ignite"],
  ay: ["day", "way", "say", "play", "stay", "away", "today", "okay", "sway", "pray", "gray"],
  ov: ["love", "above", "dove", "glove", "shove"],
  ain: ["rain", "pain", "gain", "main", "chain", "plane", "again", "remain", "explain"],
  am: ["name", "flame", "game", "same", "came", "frame", "claim", "shame"],
  ind: ["mind", "find", "kind", "behind", "blind", "grind"],
  old: ["gold", "cold", "hold", "bold", "told", "fold", "old"],
  art: ["heart", "part", "start", "apart", "chart", "smart"],
  ir: ["fire", "wire", "desire", "inspire", "entire", "higher"],
  eam: ["dream", "stream", "beam", "team", "seem", "scheme", "extreme"],
  own: ["down", "town", "crown", "brown", "drown", "frown", "gown"],
  ound: ["sound", "ground", "around", "found", "bound", "pound", "profound"],
  ee: ["free", "see", "tree", "three", "agree", "degree", "decree"],
  ime: ["time", "rhyme", "climb", "crime", "prime", "sublime", "chime"],
  ing: ["sing", "ring", "bring", "spring", "thing", "wing", "king", "string"],
  ong: ["song", "long", "strong", "wrong", "along", "belong"],
  or: ["more", "before", "shore", "store", "explore", "adore"],
  orn: ["born", "worn", "torn", "sworn", "forlorn"],
  ide: ["ride", "side", "tide", "wide", "guide", "inside", "hide", "pride"],
  ow: ["slow", "glow", "show", "flow", "grow", "know", "below"],
  all: ["all", "call", "fall", "small", "wall", "tall", "ball", "hall"],
  eel: ["feel", "wheel", "steel", "heal", "deal", "seal"],
  ue: ["blue", "true", "new", "through", "view", "few", "grew"],
  air: ["air", "fair", "hair", "chair", "stair", "repair"],
  ear: ["near", "clear", "fear", "hear", "year", "appear", "sincere"],
  ust: ["trust", "must", "dust", "just", "rust", "adjust"],
  est: ["rest", "best", "test", "chest", "guest", "request", "nest"],
  end: ["end", "friend", "send", "spend", "bend", "defend", "pretend"],
  and: ["hand", "land", "stand", "grand", "sand", "understand"],
  oud: ["cloud", "loud", "proud", "crowd", "aloud"]
};

export const RHYME_WORDS = Object.values(RHYME_GROUPS).flat();

const WORD_TO_GROUP = new Map();
for (const [key, words] of Object.entries(RHYME_GROUPS)) {
  for (const word of words) {
    if (!WORD_TO_GROUP.has(word)) WORD_TO_GROUP.set(word, key);
  }
}

export function normalizeWord(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z']/g, "")
    .replace(/^'+|'+$/g, "");
}

function phoneticKey(text) {
  let word = text.replace(/'/g, "");
  if (!word) return "";
  if (word.length > 3 && word.endsWith("e") && !/[aeiouy]e$/.test(word)) {
    word = word.slice(0, -1);
  }
  const match = word.match(/([aeiouy]+[^aeiouy]*)$/);
  return match ? match[1] : word;
}

export function rhymeKey(value) {
  const word = normalizeWord(value);
  if (!word) return "";
  if (WORD_TO_GROUP.has(word)) return WORD_TO_GROUP.get(word);
  return phoneticKey(word);
}

export function suggestRhymes(value, limit = 6) {
  const word = normalizeWord(value);
  if (!word) return [];
  const max = Math.max(0, Math.floor(Number(limit) || 0));
  if (!max) return [];

  const key = rhymeKey(word);
  const found = new Set();

  for (const [groupKey, words] of Object.entries(RHYME_GROUPS)) {
    if (groupKey === key || words.includes(word)) {
      for (const candidate of words) found.add(candidate);
    }
  }

  if (!found.size && key) {
    for (const candidate of RHYME_WORDS) {
      if (phoneticKey(candidate) === key) found.add(candidate);
    }
  }

  found.delete(word);
  return [...found].slice(0, max);
}
