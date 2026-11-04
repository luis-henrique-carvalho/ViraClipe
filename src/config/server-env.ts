import { z } from "zod";

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash"),
  EDGE_TTS_VOICE: z.string().default("pt-BR-FranciscaNeural"),
  EDGE_TTS_PATH: z.string().default("edge-tts"),
  STORAGE_DIR: z.string().default("./public/uploads"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function validateServerEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}

export const serverEnv = validateServerEnv();
