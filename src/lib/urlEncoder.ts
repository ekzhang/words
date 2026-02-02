import pako from "pako";
import type { LetterDistribution } from "./board";

export interface GameConfig {
  letters: string[][];
  shapeId: string;
  timeLimit: number;
  distribution?: LetterDistribution;
}

function toBase64Url(data: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...data));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
}

export function encodeGameConfig(config: GameConfig): string {
  const json = JSON.stringify(config);
  const compressed = pako.deflate(json);
  return toBase64Url(compressed);
}

export function decodeGameConfig(encoded: string): GameConfig | null {
  try {
    const compressed = fromBase64Url(encoded);
    const json = pako.inflate(compressed, { to: "string" });
    return JSON.parse(json) as GameConfig;
  } catch {
    return null;
  }
}
