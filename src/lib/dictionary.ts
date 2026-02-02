let wordSet: Set<string> | null = null;
let loadPromise: Promise<Set<string>> | null = null;

async function loadDictionary(): Promise<Set<string>> {
  if (wordSet) return wordSet;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    const wordsRaw = await import("../assets/words.txt?raw");
    const words = wordsRaw.default.split("\n").filter(Boolean);
    wordSet = new Set(words.map((w) => w.toUpperCase()));
    return wordSet;
  })();

  return loadPromise;
}

export async function ensureDictionaryLoaded(): Promise<void> {
  await loadDictionary();
}

export function isValidWord(word: string): boolean {
  if (!wordSet) return false;
  return word.length >= 3 && wordSet.has(word.toUpperCase());
}

export function getWordCount(): number {
  return wordSet?.size ?? 0;
}
