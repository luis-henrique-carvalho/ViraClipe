import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { analyzeCardWithGemini } from "@/features/vision-engine/server/vision.service";
import { synthesizeVoiceover } from "@/features/audio-engine/server/audio.service";
import { fetchInstagramProfile } from "@/features/ingestion/server/instagram.service";
import { createServerLogger } from "@/server/logger";

const log = createServerLogger("card2ad.server-fn");

export const analyzeAndGenerateAdFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      imageDataUrl: z.string().min(1, "Imagem é obrigatória"),
      caption: z.string().optional(),
      voice: z.enum([
        "pt-BR-FranciscaNeural",
        "pt-BR-AntonioNeural",
        "pt-BR-ThalitaMultilingualNeural",
      ]).default("pt-BR-FranciscaNeural"),
    })
  )
  .handler(async ({ data }) => {
    log.info("Iniciando pipeline completo: Visão IA + Narração Neural");

    // 1. Extração Multimodal com Gemini
    const cardAnalysis = await analyzeCardWithGemini({
      imageDataUrl: data.imageDataUrl,
      caption: data.caption,
    });

    // 2. Síntese de Narração com Edge-TTS
    const audioResult = await synthesizeVoiceover({
      text: cardAnalysis.voiceoverScript,
      voice: data.voice,
      rate: "+0%",
    });

    return {
      cardAnalysis,
      audioUrl: audioResult.audioUrl,
      backgroundImageUrl: data.imageDataUrl,
      durationSec: 15,
    };
  });

export const fetchInstagramPostsFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      profileUrl: z.string().min(1, "URL ou handle do perfil é obrigatório"),
    })
  )
  .handler(async ({ data }) => {
    log.info(`Buscando posts do perfil: ${data.profileUrl}`);
    return await fetchInstagramProfile(data.profileUrl);
  });
