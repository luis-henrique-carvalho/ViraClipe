import { describe, it, expect } from "vitest";
import {
  parseDataUrl,
  generateFallbackAnalysis,
  analyzeCardWithGemini,
} from "./vision.service";

describe("vision.service", () => {
  it("converte data URL corretamente", () => {
    const dataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
    const parsed = parseDataUrl(dataUrl);
    expect(parsed).not.toBeNull();
    expect(parsed?.mimeType).toBe("image/png");
    expect(parsed?.base64Data).toContain("iVBORw0KGgo");
  });

  it("rejeita strings que não são data URL válidas", () => {
    expect(parseDataUrl("http://example.com/pic.png")).toBeNull();
    expect(parseDataUrl("invalid-string")).toBeNull();
  });

  it("gera análise heurística de fallback estruturada e válida", () => {
    const result = generateFallbackAnalysis({
      imageDataUrl: "data:image/jpeg;base64,12345",
      caption: "Aviso de look e pedido",
    });

    expect(result.brandName).toBe("Favorita Modas");
    expect(result.scenes.length).toBe(4);
    expect(result.palette.primary).toBe("#6A2B3B");
    expect(result.voiceoverScript.length).toBeGreaterThan(20);
  });
});
