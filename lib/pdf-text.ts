import type { PDFFont } from "pdf-lib";

/**
 * Divide texto en líneas que caben en `maxWidth` (puntos PDF) usando el ancho real del glifo.
 */
export function wrapTextToLines(
  text: string,
  maxWidth: number,
  font: PDFFont,
  fontSize: number,
): string[] {
  const raw = String(text ?? "").replace(/\r\n/g, "\n");
  if (!raw.trim()) return [""];

  const lines: string[] = [];
  const paragraphs = raw.split("\n");

  for (const paragraph of paragraphs) {
    const p = paragraph.replace(/\s+/g, " ").trim();
    if (!p) {
      lines.push("");
      continue;
    }
    const words = p.split(" ");
    let current = "";
    for (const word of words) {
      const trial = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(trial, fontSize) <= maxWidth) {
        current = trial;
        continue;
      }
      if (current) {
        lines.push(current);
        current = "";
      }
      if (font.widthOfTextAtSize(word, fontSize) <= maxWidth) {
        current = word;
        continue;
      }
      let chunk = "";
      for (const ch of word) {
        const next = chunk + ch;
        if (font.widthOfTextAtSize(next, fontSize) <= maxWidth) {
          chunk = next;
        } else {
          if (chunk) lines.push(chunk);
          chunk = ch;
        }
      }
      current = chunk;
    }
    if (current) lines.push(current);
  }
  return lines.length ? lines : [""];
}
