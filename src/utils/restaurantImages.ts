import type { RestaurantImage } from "../types/restaurant";

function toWords(value: string): string[] {
  return value
    .split(/[^a-z0-9]+/i)
    .map((part) => part.trim())
    .filter(Boolean);
}

function looksDescriptive(words: string[]): boolean {
  if (words.length === 0) return false;

  const joined = words.join("");
  if (joined.length < 4) return false;

  const hasLetters = /[a-z]/i.test(joined);
  const isMostlyNumeric = /^[0-9]+$/.test(joined);
  const looksRandomId = /^[a-f0-9]{8,}$/i.test(joined);

  return hasLetters && !isMostlyNumeric && !looksRandomId;
}

function readDescriptiveLabel(image: RestaurantImage): string | null {
  const candidates = [image.path, image.url];

  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      const value = candidate.startsWith("http") ? new URL(candidate).pathname : candidate;
      const lastSegment = decodeURIComponent(value.split("/").filter(Boolean).pop() ?? "");
      const withoutExtension = lastSegment.replace(/\.[a-z0-9]+$/i, "");
      const words = toWords(withoutExtension);

      if (!looksDescriptive(words)) continue;
      return words.join(" ");
    } catch {
      const words = toWords(candidate);
      if (looksDescriptive(words)) return words.join(" ");
    }
  }

  return null;
}

function toSentenceCase(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function getRestaurantImageAlt(
  restaurantName: string,
  image?: RestaurantImage,
  index?: number,
): string {
  if (!image) return `Placeholder image for ${restaurantName}`;

  const label = readDescriptiveLabel(image);
  if (label) return `${toSentenceCase(label)} at ${restaurantName}`;

  if (typeof index === "number") return `Photo ${index + 1} of ${restaurantName}`;
  return `Photo of ${restaurantName}`;
}
