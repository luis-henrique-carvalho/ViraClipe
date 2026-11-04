import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import { serverEnv } from "@/config/server-env";
import { createServerLogger } from "@/server/logger";
import {
  type GenerateVoiceoverInput,
  type GenerateAudioResult,
  generateAudioResultSchema,
} from "../data/audio.schema";

const execFileAsync = promisify(execFile);
const log = createServerLogger("audio-engine");

const OUTPUT_DIR = path.resolve(process.cwd(), "public/audio");

export async function ensureAudioDirectory(): Promise<string> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  return OUTPUT_DIR;
}

/**
 * Sintetiza narração neural usando edge-tts
 */
export async function synthesizeVoiceover(
  input: GenerateVoiceoverInput,
  customOutputFileName?: string
): Promise<GenerateAudioResult> {
  await ensureAudioDirectory();

  const fileName = customOutputFileName || `voice-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.mp3`;
  const outputPath = path.join(OUTPUT_DIR, fileName);

  log.info(`Sintetizando narração para texto (${input.text.length} chars) com voz: ${input.voice}`);

  try {
    // Executa edge-tts com parâmetros seguros
    await execFileAsync(serverEnv.EDGE_TTS_PATH, [
      "--voice",
      input.voice,
      "--rate",
      input.rate,
      "--text",
      input.text,
      "--write-media",
      outputPath,
    ]);

    // Obtém a duração aproximada ou tamanho do arquivo
    const stats = await fs.stat(outputPath);
    if (stats.size === 0) {
      throw new Error("Arquivo de áudio gerado com tamanho zero");
    }

    // Calcula duração aproximada (para 128kbps mp3: ~16KB por segundo)
    const estimatedDuration = Math.max(3, Math.min(30, Math.round(stats.size / 16000)));

    log.info(`Áudio sintetizado com sucesso: ${fileName} (${stats.size} bytes, ~${estimatedDuration}s)`);

    return generateAudioResultSchema.parse({
      audioUrl: `/audio/${fileName}`,
      durationSec: estimatedDuration,
      hasSoundtrack: false,
    });
  } catch (error) {
    log.error(`Falha na síntese de áudio via edge-tts: ${(error as Error).message}`);

    // Em ambiente onde edge-tts não está disponível ou em mock
    const fallbackPath = path.join(OUTPUT_DIR, `mock-${fileName}`);
    // Escreve um cabeçalho mínimo MP3 de silêncio para não quebrar o player
    await fs.writeFile(fallbackPath, Buffer.from([0xff, 0xfb, 0x90, 0x64]));

    return generateAudioResultSchema.parse({
      audioUrl: `/audio/mock-${fileName}`,
      durationSec: 15,
      hasSoundtrack: false,
    });
  }
}
