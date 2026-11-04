import { z } from "zod";

export const sceneBeatSchema = z.object({
  id: z.number(),
  durationSec: z.number().default(3.75),
  textOverlay: z.string().min(1, "Texto principal da cena é obrigatório"),
  subtext: z.string().optional(),
  icon: z.enum(["hanger", "calendar", "discount", "check", "star", "sparkles", "arrow_up", "shield"]).default("sparkles"),
  focusKeyword: z.string().optional(),
});

export type SceneBeat = z.infer<typeof sceneBeatSchema>;

export const cardAnalysisResultSchema = z.object({
  brandName: z.string().default("Marca"),
  niche: z.string().default("Varejo e Serviços"),
  aesthetic: z.string().default("Elegante e moderno"),
  palette: z.object({
    primary: z.string().default("#111111"),
    secondary: z.string().default("#FF5A1F"),
    accent: z.string().default("#C5A880"),
    background: z.string().default("#F6F4EF"),
    cardSurface: z.string().default("rgba(255, 255, 255, 0.85)"),
    textColor: z.string().default("#111111"),
  }),
  hook: z.string().min(1, "Gancho do anúncio é obrigatório"),
  scenes: z.array(sceneBeatSchema).min(3).max(5),
  voiceoverScript: z.string().min(10, "Roteiro de narração é obrigatório"),
  ctaText: z.string().default("Garanta o seu look!"),
  ctaSubtext: z.string().default("Toque no link da bio"),
});

export type CardAnalysisResult = z.infer<typeof cardAnalysisResultSchema>;

export const analyzeCardInputSchema = z.object({
  imageDataUrl: z.string().min(1, "Imagem em base64 ou Data URL é obrigatória"),
  caption: z.string().optional(),
  tone: z.enum(["persuasive", "direct", "elegant", "upbeat"]).optional().default("persuasive"),
});

export type AnalyzeCardInput = z.input<typeof analyzeCardInputSchema>;
export type AnalyzeCardParsedInput = z.infer<typeof analyzeCardInputSchema>;
