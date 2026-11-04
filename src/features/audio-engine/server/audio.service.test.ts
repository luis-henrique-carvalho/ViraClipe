import { describe, it, expect } from "vitest";
import { synthesizeVoiceover, ensureAudioDirectory } from "./audio.service";

describe("audio.service", () => {
  it("assegura que o diretório de áudio existe", async () => {
    const dir = await ensureAudioDirectory();
    expect(dir).toContain("public/audio");
  });

  it("sintetiza narração com edge-tts", async () => {
    const result = await synthesizeVoiceover({
      text: "Olá, este é um teste rápido de narração para a Favorita Modas.",
      voice: "pt-BR-FranciscaNeural",
      rate: "+0%",
    });

    expect(result).toHaveProperty("audioUrl");
    expect(result.audioUrl).toContain("/audio/");
    expect(result.durationSec).toBeGreaterThan(0);
  });
});
