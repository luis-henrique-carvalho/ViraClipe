import { describe, it, expect } from "vitest";
import fs from "node:fs";
import { analyzeCardWithGemini } from "./vision.service";

describe("vision.service live integration", () => {
  it("extrai dados reais do card da Favorita Modas usando Gemini", async () => {
    const imgPath = "/home/luis/.gemini/antigravity/brain/319838d8-fee9-4837-9552-d560dc1bb416/.user_uploaded/media_1793805561302_5f32268f.jpg";
    if (!fs.existsSync(imgPath)) {
      console.warn("Imagem não encontrada no ambiente de teste, pulando teste real");
      return;
    }

    const imgBuffer = fs.readFileSync(imgPath);
    const dataUrl = `data:image/jpeg;base64,${imgBuffer.toString("base64")}`;

    const result = await analyzeCardWithGemini({
      imageDataUrl: dataUrl,
      caption: "Aviso importante de pedidos da Favorita Modas",
    });

    console.log("Resultado da Análise Real pelo Gemini 3.8 Flash:", result);

    expect(result.brandName.toLowerCase()).toContain("favorita");
    expect(result.scenes.length).toBeGreaterThanOrEqual(3);
    expect(result.voiceoverScript.length).toBeGreaterThan(20);
    expect(result.palette.primary).toBeDefined();
  }, 30000); // 30s timeout para chamada real de rede
});
