import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { analyzeCardWithGemini } from "@/features/vision-engine/server/vision.service";
import { synthesizeVoiceover } from "@/features/audio-engine/server/audio.service";
import { compileHypitVideo } from "@/features/video-engine/server/hypit.service";
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
    log.info("Iniciando pipeline completo: Direção Criativa Gemini + Narração Neural + Hypit MP4");

    // 1. Direção Criativa Multimodal com Gemini (Roteiro, Cenas, Enquadramentos e Paleta)
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

    // 3. Compilação do Vídeo Real em MP4 via Hypit Engine
    let videoUrl: string | undefined;
    try {
      const hypitResult = await compileHypitVideo({
        imageDataUrl: data.imageDataUrl,
        audioUrl: audioResult.audioUrl,
        cardAnalysis,
      });
      videoUrl = hypitResult.videoUrl;
    } catch (err) {
      log.error(`Erro ao compilar vídeo no Hypit: ${(err as Error).message}`);
      // Fallback para player dinâmico caso falte algum binário em ambiente leve
    }

    return {
      cardAnalysis,
      audioUrl: audioResult.audioUrl,
      backgroundImageUrl: data.imageDataUrl,
      videoUrl,
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
