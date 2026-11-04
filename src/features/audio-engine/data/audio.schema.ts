import { z } from "zod";

export const generateVoiceoverInputSchema = z.object({
  text: z.string().min(5, "Texto para narração é obrigatório"),
  voice: z.enum([
    "pt-BR-FranciscaNeural",
    "pt-BR-AntonioNeural",
    "pt-BR-ThalitaMultilingualNeural",
  ]).default("pt-BR-FranciscaNeural"),
  rate: z.string().default("+0%"),
});

export type GenerateVoiceoverInput = z.infer<typeof generateVoiceoverInputSchema>;

export const generateAudioResultSchema = z.object({
  audioUrl: z.string(),
  durationSec: z.number().positive(),
  hasSoundtrack: z.boolean().default(false),
});

export type GenerateAudioResult = z.infer<typeof generateAudioResultSchema>;
